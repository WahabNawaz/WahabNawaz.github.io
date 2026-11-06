// Your 3D character. While `enabled` is false the site shows the built-in
// placeholder (made of simple shapes) and every animation still works.
//
// To use your own avatar later:
// 1. Make it at avaturn.me (from a selfie) and download the GLB.
// 2. Upload it to mixamo.com, let it auto-rig, then download each animation
//    below as FBX ("In Place" ticked for walks/runs).
// 3. Convert to GLB (see README) into /public/models/ with these file names.
// 4. Point `model` and each clip's `file` at them.
//
// Each animation file holds one clip; `clip` picks a named clip if a file has several.
// seated: the clip itself is sitting, so no code-made sitting is added on top.
// beats:  dance clips only, how many music beats one loop of the clip lasts.
// speed:  playback speed (1 = as made).

export type AnimState =
  | "idle" // standing
  | "talk" // standing, talking with the hands
  | "typing" // seated at the laptop / desk
  | "sit" // seated, relaxed
  | "sitDown" // standing -> seated (played once, automatically)
  | "walk"
  | "run" // jogging, also used while it travels between spots
  | "jump"
  | "wave"
  | "push"
  | "dance1"
  | "dance2";

export type Clip = { file: string; clip?: string; seated?: boolean; once?: boolean; beats?: number; speed?: number };

const MODEL = "/models/avatar.glb";

export const avatar: {
  enabled: boolean;
  model: string;
  clips: Partial<Record<AnimState, Clip>>;
} = {
  // Abdul Wahab's avatar: made with MetaPerson Creator (Avatar SDK) from his own
  // photo, free export = non-commercial licence (see README "Character").
  // Outfit recoloured black; black sunglasses come from scene/glasses.ts.
  // Animations: Quaternius Universal Animation Library (CC0) + the CC0 Wave from
  // Quaternius' Hoodie Character, retargeted with tools/retarget/retarget-std.mjs.
  enabled: true,
  model: MODEL,
  clips: {
    idle: { file: MODEL, clip: "Idle_Loop" },
    talk: { file: MODEL, clip: "Idle_Talking_Loop" },
    typing: { file: MODEL, clip: "Sitting_Idle_Loop", seated: true },
    sit: { file: MODEL, clip: "Sitting_Talking_Loop", seated: true },
    sitDown: { file: MODEL, clip: "Sitting_Enter", seated: true, once: true },
    walk: { file: MODEL, clip: "Walk_Loop", speed: 1.35 },
    run: { file: MODEL, clip: "Jog_Fwd_Loop" },
    jump: { file: MODEL, clip: "Jump_Loop" },
    wave: { file: MODEL, clip: "Wave" },
    push: { file: MODEL, clip: "Push_Loop" },
    dance1: { file: MODEL, clip: "Dance_Loop", beats: 2 },
    dance2: { file: MODEL, clip: "Dance_Loop_Mirror", beats: 2 },
  },
};
