"use client";

// Two big sculpted hands in the home hero, made in 3D (no photos):
// - <PalmSeat> is an open left hand the character sits in (it replaces the
//   floating rock). It lives inside the character's group, so it moves and
//   scales with it, but keeps its own facing when the character turns.
// - <PointingHand> reaches in from the right and points at the character;
//   the finger follows the mouse a little and the fingers "breathe".
// Model: the WebXR generic hand (MIT, © 2019 Amazon, @webxr-input-profiles/assets),
// posed in code with its 25 joints.
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { asset, sceneStore } from "@/lib/scene-store";
import { isIntroDone } from "@/lib/intro";
import { pointer } from "./pointer";

const FILES = { left: "/models/hand-left.glb", right: "/models/hand-right.glb" };

const CHAINS = {
  thumb: ["thumb-metacarpal", "thumb-phalanx-proximal", "thumb-phalanx-distal", "thumb-tip"],
  index: ["index-finger-metacarpal", "index-finger-phalanx-proximal", "index-finger-phalanx-intermediate", "index-finger-phalanx-distal", "index-finger-tip"],
  middle: ["middle-finger-metacarpal", "middle-finger-phalanx-proximal", "middle-finger-phalanx-intermediate", "middle-finger-phalanx-distal", "middle-finger-tip"],
  ring: ["ring-finger-metacarpal", "ring-finger-phalanx-proximal", "ring-finger-phalanx-intermediate", "ring-finger-phalanx-distal", "ring-finger-tip"],
  pinky: ["pinky-finger-metacarpal", "pinky-finger-phalanx-proximal", "pinky-finger-phalanx-intermediate", "pinky-finger-phalanx-distal", "pinky-finger-tip"],
} as const;
type Finger = keyof typeof CHAINS;

/** Bend per finger in degrees, 3 joints each (+ = curl towards the palm). */
export type HandPose = Partial<Record<Finger, [number, number, number]>>;

// open hand, slightly cupped: something sits in it
const CUPPED: HandPose = {
  thumb: [0, 6, 8],
  index: [8, 16, 10],
  middle: [10, 18, 10],
  ring: [13, 20, 12],
  pinky: [17, 24, 14],
};
// index finger out, the rest folded
const POINTING: HandPose = {
  thumb: [10, 30, 30],
  index: [2, 6, 4],
  middle: [70, 90, 45],
  ring: [80, 95, 50],
  pinky: [85, 95, 50],
};

type Rig = {
  root: THREE.Object3D;
  bones: Record<string, THREE.Object3D>;
  rest: Map<THREE.Object3D, THREE.Quaternion>;
  palm: THREE.Vector3; // middle of the palm, in the file's units
  wrist: THREE.Vector3;
};

function makeMaterial() {
  // soft porcelain / clay, so they read as sculpture rather than real skin
  return new THREE.MeshPhysicalMaterial({
    color: "#efe1d5",
    roughness: 0.48,
    sheen: 0.6,
    sheenColor: new THREE.Color("#ffd6c2"),
    sheenRoughness: 0.5,
    clearcoat: 0.12,
    clearcoatRoughness: 0.6,
  });
}

/**
 * The model stops at the wrist. Add a forearm (a tapered tube) that continues
 * from the cut, measured on the mesh, so the arm can run off screen.
 */
function addForearm(root: THREE.Object3D, wrist: THREE.Object3D | undefined, material: THREE.Material) {
  let mesh: THREE.SkinnedMesh | undefined;
  root.traverse((o) => {
    if ((o as THREE.SkinnedMesh).isSkinnedMesh) mesh = o as THREE.SkinnedMesh;
  });
  if (!mesh || !wrist) return;
  const pos = mesh.geometry.getAttribute("position");
  const toWrist = wrist.matrixWorld.clone().invert().multiply(mesh.matrixWorld);
  const v = new THREE.Vector3();
  const pts: THREE.Vector3[] = [];
  let maxZ = -Infinity;
  for (let i = 0; i < pos.count; i++) {
    // skinned position (the compressed file keeps vertices in a packed space)
    mesh.applyBoneTransform(i, v.fromBufferAttribute(pos, i)).applyMatrix4(toWrist);
    pts.push(v.clone());
    maxZ = Math.max(maxZ, v.z); // the arm side is +Z in the wrist's frame
  }
  const ring = pts.filter((p) => p.z > maxZ - 0.014); // the cut is a little slanted
  const cx = ring.reduce((a, p) => a + p.x, 0) / ring.length;
  const cy = ring.reduce((a, p) => a + p.y, 0) / ring.length;
  const ex = Math.max(...ring.map((p) => Math.abs(p.x - cx)));
  const ey = Math.max(...ring.map((p) => Math.abs(p.y - cy)));
  const length = 0.9;
  const geo = new THREE.CylinderGeometry(1.35, 0.96, length, 40, 6, true);
  geo.rotateX(Math.PI / 2); // along +Z, the wide end far from the hand
  geo.translate(0, 0, length / 2 + maxZ - 0.016);
  geo.scale(ex, ey, 1);
  geo.translate(cx, cy, 0);
  const arm = new THREE.Mesh(geo, material);
  arm.frustumCulled = false;
  wrist.add(arm);
}

/** Copy of the hand with its joints chained (the file has them flat) so a bend
 *  carries the rest of the finger along. */
function buildRig(src: THREE.Object3D, material: THREE.Material): Rig {
  const root = cloneSkinned(src);
  const bones: Rig["bones"] = {};
  root.traverse((o) => {
    bones[o.name] = o;
    const m = o as THREE.SkinnedMesh;
    if (m.isMesh) {
      m.material = material;
      m.frustumCulled = false;
    }
  });
  root.updateMatrixWorld(true);
  for (const chain of Object.values(CHAINS)) {
    let parent = bones.wrist;
    for (const name of chain) {
      if (!parent || !bones[name]) break;
      parent.attach(bones[name]);
      parent = bones[name];
    }
  }
  const rest = new Map<THREE.Object3D, THREE.Quaternion>();
  Object.values(bones).forEach((b) => rest.set(b, b.quaternion.clone()));
  addForearm(root, bones.wrist, material);
  const at = (n: string) => (bones[n] ? root.worldToLocal(bones[n].getWorldPosition(new THREE.Vector3())) : new THREE.Vector3());
  const wrist = at("wrist");
  const palm = wrist.clone().lerp(at("middle-finger-phalanx-proximal"), 0.55);
  return { root, bones, rest, palm, wrist };
}

const D = Math.PI / 180;
/** Hand size next to the 2-unit-tall character (the file is ~0.22 long). */
export const PALM_SCALE = 10.5;

/** Rest pose, then the bends. `breathe` (0..1) adds a slow finger movement. */
function poseRig(rig: Rig, pose: HandPose, t: number, breathe: number) {
  rig.rest.forEach((q, b) => b.quaternion.copy(q));
  (Object.keys(CHAINS) as Finger[]).forEach((f, fi) => {
    const a = pose[f];
    if (!a) return;
    const chain = CHAINS[f];
    const joints = f === "thumb" ? chain.slice(0, 3) : chain.slice(1, 4);
    const wave = Math.sin(t * 1.1 - fi * 0.45) * 6 * breathe;
    joints.forEach((n, i) => rig.bones[n]?.rotateX(-((a[i] ?? 0) + wave * (i === 0 ? 0.6 : 1)) * D));
  });
}

function useHand(side: "left" | "right") {
  const { scene } = useGLTF(asset(FILES[side]));
  return useMemo(() => buildRig(scene, makeMaterial()), [scene]);
}

/**
 * Open left hand to sit in. Used by the avatar's seat props: the parent group
 * is placed under the hips. `yaw` = the character's own turn, undone here.
 */
export function PalmSeat({ yaw }: { yaw: { current: number } }) {
  const rig = useHand("left");
  const turn = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    poseRig(rig, CUPPED, clock.elapsedTime, 1);
    // keep facing the camera whichever way the character turns
    if (turn.current) turn.current.rotation.y = -yaw.current;
  });

  // palm up and tipped towards the camera, fingers to the right (a little
  // forward and up), the arm leaving the frame on the left
  return (
    <group ref={turn}>
      <group rotation={[0, 0, 16 * D]}>
        <group rotation={[0, -38 * D, 0]}>
          <group rotation={[16 * D, 0, 0]}>
            <group rotation={[0, 0, 90 * D]} scale={PALM_SCALE}>
              <primitive object={rig.root} position={rig.palm.clone().negate()} />
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

const _wrist = new THREE.Vector3();
const TILT = 0.1; // radians below horizontal
const POINT_SIZE = 0.58; // hand length as a share of the screen height

/** Right hand reaching in from the right and pointing at the character. */
export function PointingHand() {
  const rig = useHand("right");
  const group = useRef<THREE.Group>(null);
  const aim = useRef<THREE.Group>(null);
  const shown = useRef(0);
  const since = useRef<number | null>(null);

  useFrame(({ clock, viewport, camera }, dt) => {
    const g = group.current;
    const a = aim.current;
    if (!g || !a) return;
    const t = clock.elapsedTime;
    const { section } = sceneStore.get();
    const wide = viewport.aspect >= 0.8;
    const onHero = section === "hero";
    // comes in a moment after the preloader lifts
    if (isIntroDone() && since.current === null) since.current = t;
    const ready = since.current !== null && t - since.current > 1.4;
    const target = wide && onHero && ready ? 1 : 0;
    shown.current += (target - shown.current) * (1 - Math.exp(-dt * (target ? 1.6 : 4)));
    const s = shown.current;
    g.visible = s > 0.005;
    const state = s > 0.5 ? "shown" : "hidden";
    if (document.documentElement.dataset.hands !== state) document.documentElement.dataset.hands = state;
    if (!g.visible) return;

    poseRig(rig, POINTING, t, 0.5);
    const h = viewport.height;
    const w = viewport.width;
    // wrist just past the right edge, a little above the middle
    g.scale.setScalar(h);
    g.position.set(
      w / 2 + h * 0.05 + (1 - s) * h * 0.7 + pointer.x * 0.1,
      -h * 0.02 + Math.sin(t * 0.7) * h * 0.01 + pointer.y * 0.06,
      0.5,
    );
    // the finger turns towards the mouse, within limits
    a.getWorldPosition(_wrist).project(camera);
    const ang = Math.atan2(pointer.y - _wrist.y, (pointer.x - _wrist.x) * viewport.aspect);
    let d = ang - Math.PI;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    const want = TILT + THREE.MathUtils.clamp(d - TILT, -0.25, 0.25);
    a.rotation.z += (want - a.rotation.z) * (1 - Math.exp(-dt * 3));
  });

  // palm down, index pointing left and a little down (TILT); size = share of the screen height
  return (
    <group ref={group} visible={false}>
      <group ref={aim} rotation={[0, 0, TILT]}>
        <group rotation={[-35 * D, 0, 0]}>
          <group rotation={[180 * D, 0, -90 * D]} scale={POINT_SIZE / 0.22}>
            <primitive object={rig.root} position={rig.wrist.clone().negate()} />
          </group>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload(asset(FILES.left));
useGLTF.preload(asset(FILES.right));
