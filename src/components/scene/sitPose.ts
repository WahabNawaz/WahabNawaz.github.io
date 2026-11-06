// Code-driven "sit" and "seated typing" pose, layered on top of whatever clip
// is playing (used when the avatar has no sitting animation of its own), and
// the head turning towards the mouse.
// Rotations are given around the character's own right (X) axis, so they
// work whatever the bone axes of the model are.
import * as THREE from "three";

export type SitBones = {
  upperLegL?: THREE.Bone; upperLegR?: THREE.Bone;
  lowerLegL?: THREE.Bone; lowerLegR?: THREE.Bone;
  upperArmL?: THREE.Bone; upperArmR?: THREE.Bone;
  lowerArmL?: THREE.Bone; lowerArmR?: THREE.Bone;
  neck?: THREE.Bone;
  head?: THREE.Bone;
};

// Bone names differ per rig; first match wins (three.js strips "." and ":").
const NAMES: Record<keyof SitBones, string[]> = {
  upperLegL: ["UpperLegL", "mixamorigLeftUpLeg", "LeftUpLeg", "thigh_l"],
  upperLegR: ["UpperLegR", "mixamorigRightUpLeg", "RightUpLeg", "thigh_r"],
  lowerLegL: ["LowerLegL", "mixamorigLeftLeg", "LeftLeg", "calf_l"],
  lowerLegR: ["LowerLegR", "mixamorigRightLeg", "RightLeg", "calf_r"],
  upperArmL: ["UpperArmL", "mixamorigLeftArm", "LeftArm", "upperarm_l"],
  upperArmR: ["UpperArmR", "mixamorigRightArm", "RightArm", "upperarm_r"],
  lowerArmL: ["LowerArmL", "mixamorigLeftForeArm", "LeftForeArm", "lowerarm_l"],
  lowerArmR: ["LowerArmR", "mixamorigRightForeArm", "RightForeArm", "lowerarm_r"],
  neck: ["Neck", "mixamorigNeck", "neck_01"],
  head: ["Head", "mixamorigHead"],
};

export function findSitBones(root: THREE.Object3D): SitBones {
  const byName = new Map<string, THREE.Bone>();
  root.traverse((o) => {
    if ((o as THREE.Bone).isBone) byName.set(o.name, o as THREE.Bone);
  });
  const out: SitBones = {};
  (Object.keys(NAMES) as (keyof SitBones)[]).forEach((k) => {
    const hit = NAMES[k].map((n) => byName.get(n)).find(Boolean);
    if (hit) out[k] = hit;
  });
  return out;
}

export function bindQuats(bones: SitBones) {
  const m = new Map<THREE.Bone, THREE.Quaternion>();
  Object.values(bones).forEach((b) => b && m.set(b, b.quaternion.clone()));
  return m;
}

const _axis = new THREE.Vector3();
const _pq = new THREE.Quaternion();
const _rot = new THREE.Quaternion();
const _rootQ = new THREE.Quaternion();

/** Rotate a bone by `deg` around the character's right axis (in place). */
function bend(bone: THREE.Bone | undefined, deg: number, root: THREE.Object3D) {
  if (!bone || !bone.parent || deg === 0) return;
  root.getWorldQuaternion(_rootQ);
  _axis.set(1, 0, 0).applyQuaternion(_rootQ).normalize();
  bone.parent.updateWorldMatrix(true, false);
  bone.parent.getWorldQuaternion(_pq);
  _rot.setFromAxisAngle(_axis, THREE.MathUtils.degToRad(deg));
  // delta in the parent's space: P^-1 * R * P
  const delta = _pq.clone().invert().multiply(_rot).multiply(_pq);
  bone.quaternion.premultiply(delta);
}

/**
 * w: 0..1 blend (0 = clip only, 1 = fully seated).
 * typing: 0..1 adds arms-forward typing with a little finger tapping.
 * animated: bones the current clip drives; others are reset to bind pose
 * first so the bend does not pile up frame after frame.
 */
export function applySit(
  bones: SitBones,
  binds: Map<THREE.Bone, THREE.Quaternion>,
  animated: Set<string>,
  root: THREE.Object3D,
  w: number,
  typing: number,
  t: number,
) {
  if (w <= 0.001) return;
  binds.forEach((q, b) => {
    if (!animated.has(b.name)) b.quaternion.copy(q);
  });
  bend(bones.upperLegL, -85 * w, root);
  bend(bones.upperLegR, -85 * w, root);
  bend(bones.lowerLegL, 80 * w, root);
  bend(bones.lowerLegR, 80 * w, root);
  if (typing > 0.001) {
    const tap = Math.sin(t * 18) * 4;
    bend(bones.upperArmL, -35 * typing, root);
    bend(bones.upperArmR, -35 * typing, root);
    bend(bones.lowerArmL, (-55 + tap) * typing, root);
    bend(bones.lowerArmR, (-55 - tap) * typing, root);
    bend(bones.head, 12 * typing, root);
  }
}

const _up = new THREE.Vector3();

/** Small forearm taps, as if typing, on top of a seated clip. */
export function typingTap(bones: SitBones, root: THREE.Object3D, w: number, t: number) {
  if (w <= 0.001) return;
  const tap = Math.sin(t * 17) * 3.5 * w;
  bend(bones.lowerArmL, tap, root);
  bend(bones.lowerArmR, -tap, root);
}

/** Rotate a bone around a world-space axis (in place, after the clip). */
function rotateWorld(bone: THREE.Bone | undefined, axis: THREE.Vector3, rad: number) {
  if (!bone || !bone.parent || rad === 0) return;
  bone.parent.updateWorldMatrix(true, false);
  bone.parent.getWorldQuaternion(_pq);
  _rot.setFromAxisAngle(axis, rad);
  const delta = _pq.clone().invert().multiply(_rot).multiply(_pq);
  bone.quaternion.premultiply(delta);
}

/**
 * Turn neck + head by yaw (left/right, around the character's up axis) and
 * pitch (up/down, around its right axis), split 40/60 between the two bones.
 */
export function lookTowards(bones: SitBones, root: THREE.Object3D, yaw: number, pitch: number) {
  root.getWorldQuaternion(_rootQ);
  _up.set(0, 1, 0).applyQuaternion(_rootQ).normalize();
  _axis.set(1, 0, 0).applyQuaternion(_rootQ).normalize();
  const split: [THREE.Bone | undefined, number][] = bones.neck ? [[bones.neck, 0.4], [bones.head, 0.6]] : [[bones.head, 1]];
  for (const [bone, part] of split) {
    rotateWorld(bone, _axis, pitch * part);
    rotateWorld(bone, _up, yaw * part);
  }
}

const _p0 = new THREE.Vector3();
const _p1 = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _want = new THREE.Vector3();
const _aim = new THREE.Quaternion();
const _wq = new THREE.Quaternion();

/** Swing a bone (in world space) so the line to its child points along `to`, by weight w. */
function aimAt(bone: THREE.Bone | undefined, to: THREE.Vector3, w: number) {
  const child = bone?.children.find((c) => (c as THREE.Bone).isBone);
  if (!bone || !bone.parent || !child || w <= 0.001) return;
  bone.updateWorldMatrix(true, true);
  bone.getWorldPosition(_p0);
  child.getWorldPosition(_p1);
  _dir.subVectors(_p1, _p0).normalize();
  _aim.setFromUnitVectors(_dir, to);
  bone.getWorldQuaternion(_wq);
  bone.parent.getWorldQuaternion(_pq);
  // new local = parentWorld⁻¹ · aim · world
  _rot.copy(_aim).multiply(_wq);
  _pq.invert().multiply(_rot);
  bone.quaternion.slerp(_pq, w);
}

/**
 * Arms hanging straight down with gravity, whatever way up the body is (he
 * hangs upside down from the top of the screen in the services section).
 * `sway` swings them a little left/right.
 */
export function dangleArms(bones: SitBones, w: number, sway: number) {
  if (w <= 0.001) return;
  for (const [upper, lower, side] of [
    [bones.upperArmL, bones.lowerArmL, -1],
    [bones.upperArmR, bones.lowerArmR, 1],
  ] as const) {
    _want.set(side * 0.12 + sway, -1, 0.08).normalize();
    aimAt(upper, _want, w);
    aimAt(lower, _want, w);
  }
}
