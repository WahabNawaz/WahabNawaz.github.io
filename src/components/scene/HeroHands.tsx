"use client";

// Two huge sculpted hands in the home hero, in the spirit of Michelangelo's
// "Creation of Adam" (public domain), made in 3D for this site (no photos):
// - <SeatHand>: a left hand coming in from the lower left, palm down, index
//   finger reaching right. The character sits on its knuckles. It is placed
//   from the hero seat spot (heroSeat.ts), so it holds still while the
//   character walks over to it, rises in after the preloader and sinks away
//   when the page scrolls on.
// - <ReachingHand>: a right hand coming down from the top right, index finger
//   reaching towards the character and turning a little towards the mouse.
// Look: dark old bronze with a green patina on the upper surfaces, and ivy
// wound round the forearms. The fingers "breathe" slowly.
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
import { heroSeat } from "./heroSeat";

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

// relaxed, palm down, index finger out a little further than the rest
const RESTING: HandPose = {
  thumb: [6, 12, 14],
  index: [4, 14, 10],
  middle: [28, 38, 22],
  ring: [38, 42, 26],
  pinky: [44, 46, 28],
};
// reaching down: index finger out, the others gently folded
const REACHING: HandPose = {
  thumb: [8, 18, 20],
  index: [2, 8, 6],
  middle: [30, 45, 25],
  ring: [40, 50, 30],
  pinky: [48, 55, 32],
};

type Rig = {
  root: THREE.Object3D;
  bones: Record<string, THREE.Object3D>;
  rest: Map<THREE.Object3D, THREE.Quaternion>;
  knuckles: THREE.Vector3; // back of the hand by the knuckles, in the file's units
  wrist: THREE.Vector3;
  patina: { value: number }; // model units per world unit, for the patina noise
};

const D = Math.PI / 180;

/**
 * Dark bronze. A green patina gathers on the upward-facing surfaces, broken up
 * by noise; it is rougher and duller than the metal.
 */
function makeBronze(scale: { value: number }) {
  const m = new THREE.MeshPhysicalMaterial({
    color: "#3d3a33",
    metalness: 0.55,
    roughness: 0.42,
    clearcoat: 0.25,
    clearcoatRoughness: 0.5,
  });
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uPatinaScale = scale;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vPatPos;\nvarying vec3 vPatN;")
      .replace(
        "#include <worldpos_vertex>",
        `#include <worldpos_vertex>
        vPatPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
        vPatN = normalize(mat3(modelMatrix) * objectNormal);`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        varying vec3 vPatPos;
        varying vec3 vPatN;
        uniform float uPatinaScale;
        float pHash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
        float pNoise(vec3 p) {
          vec3 i = floor(p), f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(mix(mix(pHash(i), pHash(i + vec3(1,0,0)), f.x), mix(pHash(i + vec3(0,1,0)), pHash(i + vec3(1,1,0)), f.x), f.y),
                     mix(mix(pHash(i + vec3(0,0,1)), pHash(i + vec3(1,0,1)), f.x), mix(pHash(i + vec3(0,1,1)), pHash(i + vec3(1,1,1)), f.x), f.y), f.z);
        }
        float patinaAmount() {
          vec3 p = vPatPos * uPatinaScale;
          float n = pNoise(p * 70.0) * 0.55 + pNoise(p * 160.0) * 0.3 + pNoise(p * 420.0) * 0.15;
          float up = smoothstep(-0.1, 0.75, normalize(vPatN).y);
          return smoothstep(0.5, 0.78, n * (0.5 + 0.55 * up));
        }`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        float pat = patinaAmount();
        vec3 verdigris = mix(vec3(0.11, 0.17, 0.10), vec3(0.24, 0.33, 0.20), pNoise(vPatPos * uPatinaScale * 240.0));
        diffuseColor.rgb = mix(diffuseColor.rgb, verdigris, pat * 0.8);`,
      )
      .replace(
        "#include <roughnessmap_fragment>",
        `#include <roughnessmap_fragment>
        roughnessFactor = mix(roughnessFactor, 0.85, patinaAmount());`,
      )
      .replace(
        "#include <metalnessmap_fragment>",
        `#include <metalnessmap_fragment>
        metalnessFactor = mix(metalnessFactor, 0.05, patinaAmount());`,
      );
  };
  return m;
}

/** An ivy leaf, about 1 unit long, pointing along +Y. */
function leafGeometry() {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(0.45, 0.15, 0.6, 0.55, 0.32, 0.72);
  s.bezierCurveTo(0.22, 0.8, 0.1, 0.9, 0, 1);
  s.bezierCurveTo(-0.1, 0.9, -0.22, 0.8, -0.32, 0.72);
  s.bezierCurveTo(-0.6, 0.55, -0.45, 0.15, 0, 0);
  const g = new THREE.ShapeGeometry(s, 6);
  // a slight fold along the middle vein
  const pos = g.getAttribute("position");
  for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.abs(pos.getX(i)) * 0.35);
  g.computeVertexNormals();
  return g;
}

/**
 * The model stops at the wrist. Add a forearm (a tapered tube) that continues
 * from the cut, measured on the mesh, so the arm can run off screen. Ivy winds
 * round it: a thin stem in a spiral with leaves along it.
 */
function addForearm(root: THREE.Object3D, wrist: THREE.Object3D | undefined, material: THREE.Material, seed: number) {
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
  const z0 = maxZ - 0.016;
  const geo = new THREE.CylinderGeometry(1.35, 0.96, length, 40, 6, true);
  geo.rotateX(Math.PI / 2); // along +Z, the wide end far from the hand
  geo.translate(0, 0, length / 2 + z0);
  geo.scale(ex, ey, 1);
  geo.translate(cx, cy, 0);
  const arm = new THREE.Mesh(geo, material);
  arm.frustumCulled = false;
  wrist.add(arm);

  // ivy: stem spiralling round the arm from just behind the hand
  let r = seed;
  const rand = () => ((r = (r * 16807) % 2147483647) / 2147483647);
  const widen = (z: number) => 0.96 + (1.35 - 0.96) * ((z - z0) / length);
  const at = (t: number, out = 0.0016) => {
    const z = z0 - 0.01 + t * 0.32;
    const a = seed * 0.7 + t * Math.PI * 2 * 2.3;
    const k = widen(z);
    return new THREE.Vector3(cx + Math.cos(a) * (ex * k + out), cy + Math.sin(a) * (ey * k + out), z);
  };
  const curve = new THREE.CatmullRomCurve3(Array.from({ length: 40 }, (_, i) => at(i / 39)));
  const stemMat = new THREE.MeshStandardMaterial({ color: "#3a4a2a", roughness: 0.9 });
  const stem = new THREE.Mesh(new THREE.TubeGeometry(curve, 160, 0.0014, 6), stemMat);
  stem.frustumCulled = false;
  wrist.add(stem);

  const leafMat = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.7, side: THREE.DoubleSide });
  const COUNT = 90;
  const leaves = new THREE.InstancedMesh(leafGeometry(), leafMat, COUNT);
  leaves.frustumCulled = false;
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), up = new THREE.Vector3();
  const color = new THREE.Color();
  for (let i = 0; i < COUNT; i++) {
    const t = Math.min(1, (i + rand() * 0.8) / COUNT);
    const p = at(t, 0.0022);
    // face away from the arm's axis, tilted along the stem, a random twist
    const out = new THREE.Vector3(p.x - cx, p.y - cy, 0).normalize();
    up.set(0, 0, 1).applyAxisAngle(out, (rand() - 0.5) * 2.4);
    const look = new THREE.Matrix4().lookAt(new THREE.Vector3(), out, up);
    // the leaf lies on the arm (its normal along the radius), lifted a little
    q.setFromRotationMatrix(look).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), (rand() - 0.5) * 0.9));
    const size = 0.0045 + rand() * 0.004;
    s.set(size, size, size);
    m.compose(p, q, s);
    leaves.setMatrixAt(i, m);
    leaves.setColorAt(i, color.setHSL(0.25 + rand() * 0.07, 0.35 + rand() * 0.2, 0.1 + rand() * 0.1));
  }
  wrist.add(leaves);
}

/** Copy of the hand with its joints chained (the file has them flat) so a bend
 *  carries the rest of the finger along. */
function buildRig(src: THREE.Object3D, seed: number): Rig {
  const patina = { value: 1 };
  const material = makeBronze(patina);
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
  addForearm(root, bones.wrist, material, seed);
  const at = (n: string) => (bones[n] ? root.worldToLocal(bones[n].getWorldPosition(new THREE.Vector3())) : new THREE.Vector3());
  const wrist = at("wrist");
  const knuckles = wrist.clone().lerp(at("middle-finger-phalanx-proximal"), 0.72);
  return { root, bones, rest, knuckles, wrist, patina };
}

/** Rest pose, then the bends. `breathe` (0..1) adds a slow finger movement. */
function poseRig(rig: Rig, pose: HandPose, t: number, breathe: number) {
  rig.rest.forEach((q, b) => b.quaternion.copy(q));
  (Object.keys(CHAINS) as Finger[]).forEach((f, fi) => {
    const a = pose[f];
    if (!a) return;
    const chain = CHAINS[f];
    const joints = f === "thumb" ? chain.slice(0, 3) : chain.slice(1, 4);
    const wave = Math.sin(t * 1.1 - fi * 0.45) * 5 * breathe;
    joints.forEach((n, i) => rig.bones[n]?.rotateX(-((a[i] ?? 0) + wave * (i === 0 ? 0.6 : 1)) * D));
  });
}

const _s = new THREE.Vector3();
/** Keep the patina noise the same size on screen whatever the hand's scale. */
function updatePatina(rig: Rig) {
  rig.root.getWorldScale(_s);
  rig.patina.value = 1 / Math.max(_s.x, 1e-6);
}

function useHand(side: "left" | "right") {
  const { scene } = useGLTF(asset(FILES[side]));
  return useMemo(() => buildRig(scene, side === "left" ? 7 : 3), [scene, side]);
}

/** Hand size next to the 2-unit-tall character (the file is ~0.22 long). */
export const SEAT_SCALE = 9.5;

const _seat = new THREE.Vector3();

/** Left hand the character sits on, in the home hero. */
export function SeatHand() {
  const rig = useHand("left");
  const turn = useRef<THREE.Group>(null);
  const shown = useRef(0);

  useFrame(({ clock, viewport }, dt) => {
    const g = turn.current;
    if (!g) return;
    const on = heroSeat.active && isIntroDone() ? 1 : 0;
    shown.current += (on - shown.current) * (1 - Math.exp(-dt * (on ? 1.8 : 4)));
    const r = shown.current;
    g.visible = r > 0.005;
    if (!g.visible) return;
    poseRig(rig, RESTING, clock.elapsedTime, 1);
    updatePatina(rig);
    // under the seated hips: the seat offset turned with the character's
    // seated facing, scaled like the character; rises up from below
    const { x, y, s, ry, hipY, hipZ } = heroSeat;
    _seat.set(0, hipY - 0.25, hipZ - 0.42).applyAxisAngle(THREE.Object3D.DEFAULT_UP, ry).multiplyScalar(s);
    g.position.set(x + _seat.x - 0.5 * s, y + _seat.y - (1 - r) * viewport.height * 0.6, _seat.z);
    g.scale.setScalar(s);
  });

  // palm down, fingers to the right and a little up, the arm leaving the frame
  // on the lower left; the origin is the back of the hand by the knuckles
  return (
    <group ref={turn} visible={false}>
      <group rotation={[0, 0, 14 * D]}>
        <group rotation={[0, -24 * D, 0]}>
          <group rotation={[0, 180 * D, 0]}>
            <group rotation={[0, 0, -90 * D]} scale={SEAT_SCALE}>
              <primitive object={rig.root} position={rig.knuckles.clone().negate()} />
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

const _wrist = new THREE.Vector3();
const TILT = 0.62; // radians below horizontal (the hand points down-left)
const REACH_SIZE = 0.66; // hand length as a share of the screen height

/** Right hand coming down from the top right, reaching towards the character. */
export function ReachingHand() {
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
    const ready = since.current !== null && t - since.current > 1.2;
    const target = wide && onHero && ready ? 1 : 0;
    shown.current += (target - shown.current) * (1 - Math.exp(-dt * (target ? 1.4 : 4)));
    const s = shown.current;
    g.visible = s > 0.005;
    const state = s > 0.5 ? "shown" : "hidden";
    if (document.documentElement.dataset.hands !== state) document.documentElement.dataset.hands = state;
    if (!g.visible) return;

    poseRig(rig, REACHING, t, 0.6);
    updatePatina(rig);
    const h = viewport.height;
    const w = viewport.width;
    // wrist just past the top-right corner; slides in along its own arm
    g.scale.setScalar(h);
    const back = (1 - s) * h * 0.8;
    g.position.set(
      w / 2 + h * 0.06 + back * Math.cos(TILT) + pointer.x * 0.12,
      h / 2 + h * 0.02 + back * Math.sin(TILT) + Math.sin(t * 0.6) * h * 0.008 + pointer.y * 0.08,
      0.5,
    );
    // the finger turns a little towards the mouse
    a.getWorldPosition(_wrist).project(camera);
    const ang = Math.atan2(pointer.y - _wrist.y, (pointer.x - _wrist.x) * viewport.aspect);
    let d = ang - Math.PI;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    const want = TILT + THREE.MathUtils.clamp(d - TILT, -0.18, 0.18);
    a.rotation.z += (want - a.rotation.z) * (1 - Math.exp(-dt * 3));
  });

  // palm down, index finger pointing left; TILT turns it down-left
  return (
    <group ref={group} visible={false}>
      <group ref={aim} rotation={[0, 0, TILT]}>
        <group rotation={[-20 * D, 0, 0]}>
          <group rotation={[180 * D, 0, -90 * D]} scale={REACH_SIZE / 0.22}>
            <primitive object={rig.root} position={rig.wrist.clone().negate()} />
          </group>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload(asset(FILES.left));
useGLTF.preload(asset(FILES.right));
