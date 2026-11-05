// Code-driven "sit" and "seated typing" pose, layered on top of whatever clip
// is playing. Used when the avatar has no sitting/typing animation of its own.
// Rotations are given around the character's own right (X) axis, so they
// work whatever the bone axes of the model are.
import * as THREE from "three";

export type SitBones = {
  upperLegL?: THREE.Bone; upperLegR?: THREE.Bone;
  lowerLegL?: THREE.Bone; lowerLegR?: THREE.Bone;
  upperArmL?: THREE.Bone; upperArmR?: THREE.Bone;
  lowerArmL?: THREE.Bone; lowerArmR?: THREE.Bone;
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
