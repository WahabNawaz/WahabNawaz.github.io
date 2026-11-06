"use client";

// Your rigged GLB avatar + its animation clips (src/content/avatar.ts).
// - Clips cross-fade when the wanted animation changes.
// - Standing -> seated plays the sit-down clip first, then the seated loop.
// - Dance clips follow the song position, on the beat.
// - The head turns towards the mouse while it stands or sits.
// - A seated state whose clip is not seated is bent in code (sitPose.ts), so
//   any avatar can sit even without a sitting animation.
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { asset, sceneStore } from "@/lib/scene-store";
import { avatar, type AnimState, type Clip } from "@/content/avatar";
import type { AnimRef } from "./Avatar";
import { pointer } from "./pointer";
import { applySit, bindQuats, findSitBones, lookTowards, typingTap } from "./sitPose";

const ENTRIES = Object.entries(avatar.clips) as [AnimState, Clip][];
const SEATED: AnimState[] = ["typing", "sit"];
const NO_LOOK: AnimState[] = ["walk", "run", "jump", "dance1", "dance2", "sitDown", "push"];

// Plain helpers (outside the component) that drive three.js objects.
type Mix = { mixer: THREE.AnimationMixer; actions: Record<string, THREE.AnimationAction | null> };

/** One mixer + one action per clip. (Our own instead of drei's useAnimations,
 *  whose clean-up leaves un-cached actions behind in React dev Strict Mode.) */
function buildMix(root: THREE.Object3D, clips: THREE.AnimationClip[]): Mix {
  const mixer = new THREE.AnimationMixer(root);
  const actions: Mix["actions"] = {};
  clips.forEach((c) => (actions[c.name] = mixer.clipAction(c)));
  return { mixer, actions };
}
const stopMix = (m: Mix) => m.mixer.stopAllAction();
const tickMix = (m: Mix, dt: number) => m.mixer.update(dt);

/** What the character is doing, on <html data-avatar="…" data-avatar-look="…">,
 *  for tests and debugging. Written only when it changes. */
function report(name: "avatar" | "avatarLook", value: string) {
  const d = document.documentElement.dataset;
  if (d[name] !== value) d[name] = value;
}

/** Put bones back to their rest pose; the clips then set the ones they drive. */
function restBones(binds: Map<THREE.Bone, THREE.Quaternion>) {
  binds.forEach((q, b) => b.quaternion.copy(q));
}

function switchClip(actions: Record<string, THREE.AnimationAction | null>, from: string | null, to: string) {
  const next = actions[to];
  if (!next) return false;
  if (avatar.clips[to as AnimState]?.once) {
    next.setLoop(THREE.LoopOnce, 1);
    next.clampWhenFinished = true;
  }
  next.timeScale = avatar.clips[to as AnimState]?.speed ?? 1;
  next.reset().setEffectiveWeight(1).fadeIn(0.35).play();
  if (from && actions[from]) actions[from]!.fadeOut(0.35);
  return true;
}

function followSong(action: THREE.AnimationAction | null, playing: boolean, time: number, bpm: number, beats?: number) {
  if (!action) return;
  action.paused = !playing;
  const d = action.getClip().duration;
  const loops = beats ? (time * bpm) / 60 / beats : time / d;
  action.time = (loops - Math.floor(loops)) * d;
}

export type Seat = { w: number; hipY: number; hipZ: number; kneeY: number; kneeZ: number };

/** Where the hips and knees are while seated (avatar units), measured on a copy. */
function measureSeat(scene: THREE.Object3D, clip: THREE.AnimationClip | undefined, fit: { s: number; y: number }) {
  const bones = findSitBones(scene);
  const fallback = { hipY: -0.1, hipZ: 0, kneeY: -0.1, kneeZ: 0.4 };
  if (!bones.upperLegL || !bones.lowerLegL) return fallback;
  const copy = cloneSkinned(scene);
  if (clip) {
    const mixer = new THREE.AnimationMixer(copy);
    mixer.clipAction(clip).play();
    mixer.update(0);
  }
  copy.updateMatrixWorld(true);
  const hip = copy.getObjectByName(bones.upperLegL.name)?.getWorldPosition(new THREE.Vector3());
  const knee = copy.getObjectByName(bones.lowerLegL.name)?.getWorldPosition(new THREE.Vector3());
  if (!hip || !knee) return fallback;
  return { hipY: hip.y * fit.s + fit.y, hipZ: hip.z * fit.s, kneeY: knee.y * fit.s + fit.y, kneeZ: knee.z * fit.s };
}

const _ndc = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _f = new THREE.Vector3();

export default function AvatarRig({ anim, onSeat }: { anim: AnimRef; onSeat: (seat: Seat) => void }) {
  const group = useRef<THREE.Group>(null);
  const current = useRef<string | null>(null);
  const sitW = useRef(0);
  const typeW = useRef(0);
  const look = useRef({ w: 0, yaw: 0, pitch: 0 });
  const camera = useThree((s) => s.camera);
  const { scene } = useGLTF(asset(avatar.model));
  const files = useGLTF(ENTRIES.map(([, c]) => asset(c.file)));

  const clips = useMemo(
    () =>
      ENTRIES.flatMap(([state, c], i) => {
        const gltf = files[i];
        const source = c.clip ? gltf.animations.find((a) => a.name === c.clip) : gltf.animations[0];
        if (!source) return [];
        const clip = source.clone();
        clip.name = state;
        return [clip];
      }),
    [files],
  );
  const mix = useMemo(() => buildMix(scene, clips), [scene, clips]);
  const actions = mix.actions;
  useEffect(
    () => () => {
      stopMix(mix);
      current.current = null; // replay the wanted clip if it mounts again
    },
    [mix],
  );

  // bones each clip animates (by node name), and the bones used for sitting
  const animatedBy = useMemo(() => {
    const m = new Map<string, Set<string>>();
    clips.forEach((c) => m.set(c.name, new Set(c.tracks.map((t) => t.name.split(".")[0]))));
    return m;
  }, [clips]);
  const sit = useMemo(() => {
    const bones = findSitBones(scene);
    return { bones, binds: bindQuats(bones) };
  }, [scene]);

  // Normalise any avatar to ~2 units tall with its feet where the placeholder's are,
  // and measure where its lap is when seated (for the rock, laptop and desk).
  const fit = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const height = box.max.y - box.min.y || 1;
    const s = 2.0 / height;
    const y = -box.min.y * s - 1.05;
    const seatedClip = avatar.clips.typing?.seated ? clips.find((c) => c.name === "typing") : undefined;
    return { s, y, ...measureSeat(scene, seatedClip, { s, y }) };
  }, [scene, clips]);

  useFrame(({ clock }, dt) => {
    const req: AnimState = actions[anim.current] ? anim.current : "idle";
    const cur = current.current as AnimState | null;
    let want: AnimState = req;
    const reqSeated = !!avatar.clips[req]?.seated;
    if (reqSeated && cur && !avatar.clips[cur]?.seated && actions.sitDown) want = "sitDown";
    if (reqSeated && cur === "sitDown") {
      const a = actions.sitDown;
      if (a && a.time < a.getClip().duration - 0.3) want = "sitDown";
    }
    if (want !== cur && switchClip(actions, cur, want)) current.current = want;
    report("avatar", want);

    if (want === "dance1" || want === "dance2") {
      const d = sceneStore.get().dance;
      followSong(actions[want], d.playing, d.time, d.bpm, avatar.clips[want]?.beats);
    }
    // rest pose first, so the code-made bends below never pile up on bones
    // the current clip does not drive; then the clips pose the skeleton
    restBones(sit.binds);
    tickMix(mix, dt);

    const k = 1 - Math.exp(-dt * 6);
    const g = group.current;
    if (!g) return;

    // seated poses, eased in and out (props + code-made sitting)
    sitW.current += ((SEATED.includes(req) ? 1 : 0) - sitW.current) * k;
    typeW.current += ((req === "typing" ? 1 : 0) - typeW.current) * k;
    onSeat({ w: sitW.current, hipY: fit.hipY, hipZ: fit.hipZ, kneeY: fit.kneeY, kneeZ: fit.kneeZ });
    if (!avatar.clips[want]?.seated) {
      applySit(sit.bones, sit.binds, animatedBy.get(want) ?? new Set(), g, sitW.current, typeW.current, clock.elapsedTime);
    } else if (want === "typing") typingTap(sit.bones, g, typeW.current, clock.elapsedTime);

    // head follows the mouse: aim from the head's spot on screen
    const L = look.current;
    L.w += ((NO_LOOK.includes(want) ? 0 : 1) - L.w) * k;
    if (sit.bones.head && L.w > 0.01) {
      sit.bones.head.getWorldPosition(_ndc).project(camera);
      g.getWorldQuaternion(_q);
      _f.set(0, 0, 1).applyQuaternion(_q);
      const bodyYaw = Math.atan2(_f.x, _f.z);
      const yaw = THREE.MathUtils.clamp((pointer.x - _ndc.x) * 0.8 - bodyYaw, -0.9, 0.9);
      const pitch = THREE.MathUtils.clamp(-(pointer.y - _ndc.y) * 0.45, -0.35, 0.3);
      L.yaw += (yaw - L.yaw) * k * 0.6;
      L.pitch += (pitch - L.pitch) * k * 0.6;
      lookTowards(sit.bones, g, L.yaw * L.w, L.pitch * L.w);
      report("avatarLook", (L.yaw * L.w).toFixed(1));
    }
  });

  return (
    <group ref={group} position={[0, fit.y, 0]} scale={fit.s}>
      <primitive object={scene} />
    </group>
  );
}
