// Your 3D character. While `enabled` is false the site shows the built-in
// placeholder (made of simple shapes) and every animation still works.
//
// To use your own avatar:
// 1. Make it at avaturn.me (from a selfie) and download the GLB.
// 2. Upload it to mixamo.com, let it auto-rig, then download each animation
//    below as FBX ("In Place" ticked for jumps/walks).
// 3. Convert to GLB (see README) into /public/models/ with these file names.
// 4. Set `enabled: true`.
//
// Each animation file holds one clip; `clip` picks a named clip if a file has several.

export type AnimState = "idle" | "typing" | "jump" | "wave" | "sit" | "push" | "dance1" | "dance2";

export const avatar: {
  enabled: boolean;
  model: string;
  clips: Partial<Record<AnimState, { file: string; clip?: string }>>;
} = {
  enabled: false,
  model: "/models/avatar.glb",
  clips: {
    idle: { file: "/models/anim/idle.glb" },
    typing: { file: "/models/anim/typing.glb" },
    jump: { file: "/models/anim/jump.glb" },
    wave: { file: "/models/anim/wave.glb" },
    sit: { file: "/models/anim/sit.glb" },
    push: { file: "/models/anim/push.glb" },
    dance1: { file: "/models/anim/dance1.glb" },
    dance2: { file: "/models/anim/dance2.glb" },
  },
};
