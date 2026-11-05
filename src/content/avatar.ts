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
  // DUMMY for now: "Hoodie Character" by Quaternius (Ultimate Modular Men
  // Pack, Public Domain CC0, via poly.pizza). Its built-in clips stand in
  // for each state. Swap in your Avaturn avatar + Mixamo clips later (README).
  enabled: true,
  model: "/models/avatar.glb",
  clips: {
    idle: { file: "/models/avatar.glb", clip: "CharacterArmature|Idle_Neutral" },
    typing: { file: "/models/avatar.glb", clip: "CharacterArmature|Idle" },
    sit: { file: "/models/avatar.glb", clip: "CharacterArmature|Idle" },
    jump: { file: "/models/avatar.glb", clip: "CharacterArmature|Run" },
    wave: { file: "/models/avatar.glb", clip: "CharacterArmature|Wave" },
    push: { file: "/models/avatar.glb", clip: "CharacterArmature|Interact" },
    dance1: { file: "/models/avatar.glb", clip: "CharacterArmature|Wave" },
    dance2: { file: "/models/avatar.glb", clip: "CharacterArmature|Run" },
  },
  // Your own avatar later, one file per clip:
  // model: "/models/avatar.glb",
  // clips: { idle: { file: "/models/anim/idle.glb" }, typing: { file: "/models/anim/typing.glb" }, ... }
};
