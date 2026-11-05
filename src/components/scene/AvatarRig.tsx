"use client";

// Your rigged GLB avatar + its animation clips. Clips cross-fade when the
// wanted animation changes; dance clips follow the song position. "typing" and
// "sit" are seated: the legs (and arms for typing) are bent in code on top of
// the clip, so any avatar can sit even without a sitting animation.
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { asset, sceneStore } from "@/lib/scene-store";
import { avatar, type AnimState } from "@/content/avatar";
import type { AnimRef } from "./Avatar";
import { applySit, bindQuats, findSitBones } from "./sitPose";

const ENTRIES = Object.entries(avatar.clips) as [AnimState, { file: string; clip?: string }][];
const SEATED: AnimState[] = ["typing", "sit"];

// Plain helpers (outside the component) that drive three.js objects.
function switchClip(actions: Record<string, THREE.AnimationAction | null>, from: string | null, to: string) {
  const next = actions[to];
  if (!next) return false;
  next.reset().setEffectiveWeight(1).fadeIn(0.4).play();
  if (from && actions[from]) actions[from]!.fadeOut(0.4);
  return true;
}

function followSong(action: THREE.AnimationAction | null, playing: boolean, time: number) {
  if (!action) return;
  action.paused = !playing;
  action.time = time % action.getClip().duration;
}

export type Seat = { w: number; hipY: number };

export default function AvatarRig({ anim, onSeat }: { anim: AnimRef; onSeat: (seat: Seat) => void }) {
  const group = useRef<THREE.Group>(null);
  const current = useRef<string | null>(null);
  const sitW = useRef(0);
  const typeW = useRef(0);
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
  const { actions } = useAnimations(clips, group);

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

  // Normalise any avatar to ~2 units tall with its feet where the placeholder's are.
  const fit = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const height = box.max.y - box.min.y || 1;
    const s = 2.0 / height;
    const y = -box.min.y * s - 1.05;
    // hip height (top of the thighs) in avatar units, for seats and laps
    const thigh = findSitBones(scene).upperLegL;
    const p = new THREE.Vector3();
    if (thigh) {
      scene.updateMatrixWorld(true);
      thigh.getWorldPosition(p);
    }
    return { s, y, hipY: thigh ? p.y * s + y : -0.1 };
  }, [scene]);

  useFrame(({ clock }, dt) => {
    const want = actions[anim.current] ? anim.current : "idle";
    if (want !== current.current && switchClip(actions, current.current, want)) current.current = want;
    if (want === "dance1" || want === "dance2") {
      const d = sceneStore.get().dance;
      followSong(actions[want], d.playing, d.time);
    }

    // seated poses, eased in and out
    const k = 1 - Math.exp(-dt * 6);
    sitW.current += ((SEATED.includes(anim.current) ? 1 : 0) - sitW.current) * k;
    typeW.current += ((anim.current === "typing" ? 1 : 0) - typeW.current) * k;
    onSeat({ w: sitW.current, hipY: fit.hipY });
    if (group.current) {
      applySit(sit.bones, sit.binds, animatedBy.get(want) ?? new Set(), group.current, sitW.current, typeW.current, clock.elapsedTime);
    }
  });

  return (
    <group ref={group} position={[0, fit.y, 0]} scale={fit.s}>
      <primitive object={scene} />
    </group>
  );
}
