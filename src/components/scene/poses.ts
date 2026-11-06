// Where the 3D character stands.
// x, y: screen position, -1 (left/bottom) .. 1 (right/top)
// ry:   turn around its vertical axis (radians)
// s:    size, 1 = about 40% of the screen height
//
// Two ways to place it:
// 1. Per page (PAGES below), used when a page has no posed sections.
// 2. Per section: add data-pose="left" (or any NAMED key) to a section inside
//    <PoseScope>. While that section is in the middle of the screen, the
//    character moves to that pose. The home page works this way.

import type { AnimState } from "@/content/avatar";

export type Pose = { x: number; y: number; ry: number; s: number };

export const NAMED: Record<string, Pose> = {
  // sitting on the floating rock, centre-left, under the centred headline
  // sitting on the bronze hand's index finger (the spot comes from the hand,
  // see HeroHands.tsx; x and y here are only used before the hand is ready)
  hero: { x: -0.2, y: -0.2, ry: 0.6, s: 1.1 },
  // seated at the desk (pitch section)
  desk: { x: -0.58, y: -0.2, ry: 0.85, s: 1.05 },
  left: { x: -0.66, y: -0.3, ry: 0.65, s: 0.72 },
  right: { x: 0.66, y: -0.3, ry: -0.65, s: 0.72 },
  "right-high": { x: 0.68, y: 0.15, ry: -0.7, s: 0.6 },
  center: { x: 0.0, y: -0.45, ry: 0.0, s: 0.9 },
  // pushing a floating shelf with a PC across the sky, in front of the big name
  name: { x: -0.42, y: -0.28, ry: 1.2, s: 0.78 },
  // the night-sky statement: off to the right, small
  statement: { x: 0.72, y: -0.5, ry: -0.6, s: 0.55 },
  // standing up on the big role title
  role: { x: 0.12, y: 0.05, ry: -0.25, s: 0.62 },
  // services page: in the middle of the orbiting tool logos
  orbit: { x: 0.45, y: -0.32, ry: -0.2, s: 0.62 },
};

const PAGES: Record<string, Pose> = {
  "/work": { x: 0.8, y: -0.66, ry: -0.6, s: 0.42 },
  "/services": { x: 0.74, y: -0.55, ry: -0.5, s: 0.52 },
  "/about": { x: -0.7, y: -0.5, ry: 0.6, s: 0.6 },
  "/faq": { x: 0.74, y: -0.55, ry: -0.5, s: 0.52 },
  "/photography": { x: 0.74, y: -0.55, ry: -0.5, s: 0.5 },
  "/contact": { x: 0.74, y: -0.5, ry: -0.5, s: 0.62 },
  "/playground": { x: 0.0, y: -0.3, ry: 0.0, s: 1.0 },
};

const CASE_STUDY: Pose = { x: 0.78, y: -0.62, ry: -0.6, s: 0.42 };
const FALLBACK: Pose = { x: 0.0, y: -0.3, ry: 0.0, s: 0.85 };

// Phones: the character stays small in a corner so it never covers text.
const MOBILE_CORNER: Pose = { x: 0.62, y: -0.78, ry: -0.5, s: 0.3 };
// between the headline and the buttons
const MOBILE_HERO: Pose = { x: 0.0, y: -0.3, ry: 0.5, s: 0.56 };

// Footer text sits on the left, so the character moves right when it shows.
const FOOTER: Pose = { x: 0.8, y: -0.3, ry: -0.5, s: 0.7 };

export function poseFor(pathname: string, section: string | null, mobile: boolean, footer = false): Pose {
  const path = pathname.replace(/\/$/, "") || "/";
  if (footer) return mobile ? MOBILE_CORNER : FOOTER;
  if (mobile) {
    if (section === "hero") return MOBILE_HERO;
    if (path === "/contact") return { ...PAGES["/contact"], s: 0.6 };
    // in the gap between the big title and the music player
    if (path === "/playground") return { x: 0, y: 0.14, ry: 0, s: 0.66 };
    return MOBILE_CORNER;
  }
  if (section && NAMED[section]) return NAMED[section];
  if (PAGES[path]) return PAGES[path];
  if (path.startsWith("/work/")) return CASE_STUDY;
  return FALLBACK;
}

// Which animation the character plays where. Names match src/content/avatar.ts.
const SECTION_ANIM: Record<string, AnimState> = {
  hero: "typing",
  desk: "typing",
  name: "push",
  statement: "idle",
  role: "wave",
  orbit: "idle",
};
const PAGE_ANIM: Record<string, AnimState> = {
  "/contact": "wave",
  "/playground": "idle",
  "/about": "talk",
  "/faq": "talk",
};

export function animFor(
  pathname: string,
  section: string | null,
  footer: boolean,
  dance: { active: boolean; clip: AnimState },
): AnimState {
  const path = pathname.replace(/\/$/, "") || "/";
  if (path === "/playground" && dance.active) return dance.clip;
  if (footer) return "wave";
  if (section && SECTION_ANIM[section]) return SECTION_ANIM[section];
  if (PAGE_ANIM[path]) return PAGE_ANIM[path];
  return "idle";
}
