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
  desk: { x: -0.36, y: -0.2, ry: 0.8, s: 1.15 },
  left: { x: -0.66, y: -0.3, ry: 0.65, s: 0.72 },
  right: { x: 0.66, y: -0.3, ry: -0.65, s: 0.72 },
  "right-high": { x: 0.68, y: 0.15, ry: -0.7, s: 0.6 },
  center: { x: 0.0, y: -0.45, ry: 0.0, s: 0.9 },
  // pushing a floating shelf with a PC across the sky, in front of the big name
  name: { x: -0.42, y: -0.28, ry: 1.2, s: 0.78 },
  // the night-sky statement: he runs off the right edge and is gone
  statement: { x: 1.6, y: -0.45, ry: 1.2, s: 0.6 },
  // work / clients: these two are moved by the scroll (see scrollPose below);
  // these are only the resting spots
  work: { x: 0.7, y: -0.4, ry: -0.5, s: 0.6 },
  band: { x: 0.3, y: -0.4, ry: 1.2, s: 0.66 },
  // services list and the showcase after it: hanging from the top-left edge
  // of the screen, only his legs show, swinging a little (Avatar.tsx)
  services: { x: -0.74, y: 1.0, ry: 0.35, s: 0.9 },
  brand: { x: -0.74, y: 1.0, ry: 0.35, s: 0.9 },
  // process: he has climbed out of sight (back for the footer)
  process: { x: -0.74, y: 2.2, ry: 0.35, s: 0.9 },
  clients: { x: 0.6, y: -0.4, ry: -0.5, s: 0.6 },
  // standing in the middle of the big role title, on its own shadow
  role: { x: 0.02, y: -0.12, ry: -0.15, s: 0.72 },
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

// Footer text sits on the left, so the character stands on the right, big,
// feet near the bottom of the screen (like the reference).
const FOOTER: Pose = { x: 0.74, y: -0.5, ry: -0.35, s: 1.1 };

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
  role: "idle",
  work: "jump",
  clients: "jump",
  band: "jump",
  services: "idle",
  brand: "idle",
  process: "idle",
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
  if (footer) return "idle";
  if (section && SECTION_ANIM[section]) return SECTION_ANIM[section];
  if (PAGE_ANIM[path]) return PAGE_ANIM[path];
  return "idle";
}

/**
 * Sections where the scroll position moves the character (0..1 = the section
 * entering at the bottom .. leaving at the top; "work" uses its pinned intro),
 * like the reference:
 * - name: walks off left, pushes the floating desk across, jumps off;
 * - band: dives off the role title down past the band;
 * - work: out of sight while the black circle opens, then dives over the
 *   pinned WORK title from left to right and is gone again for the projects;
 * - clients: walks in among the logos, trips ("Oops!") and falls.
 * roll turns him in the screen plane (+ = anticlockwise); hide = not drawn
 * (he jumps there at once instead of flying across the screen).
 */
export function scrollPose(section: string | null, p: number): (Pose & { roll: number; anim?: AnimState; hide?: boolean }) | null {
  const c = Math.min(1, Math.max(0, p));
  if (section === "name") {
    // walks off to the left, comes back pushing the floating desk across while
    // the name types in, then jumps off the bottom right
    if (c < 0.12) return { x: -0.3 - (c / 0.12) * 0.6, y: -0.35, ry: -1.3, s: 0.78, roll: 0, anim: "walk" };
    if (c < 0.86) {
      const k = (c - 0.12) / 0.74;
      return { x: -0.82 + k * 1.2, y: -0.3, ry: 1.25, s: 0.78, roll: 0, anim: "push" };
    }
    const k = (c - 0.86) / 0.14;
    return { x: 0.38 + k * 0.9, y: -0.3 - k * k * 1.2, ry: 1.0, s: 0.78, roll: -k * 0.6, anim: "jump" };
  }
  if (section === "band") {
    // head first, down to the right, out of the bottom of the screen
    return { x: 0.02 + c * 0.6, y: 0.1 - c * 1.7, ry: 1.25, s: 0.66, roll: -0.3 - c * 1.0, anim: "jump" };
  }
  if (section === "work") {
    if (c < 0.42) return { x: -1.6, y: 0.3, ry: 1.25, s: 1.0, roll: -1.25, anim: "jump", hide: true };
    if (c < 0.64) {
      const k = (c - 0.42) / 0.22;
      return { x: -1.45 + k * 3.0, y: 0.26 + Math.sin(k * Math.PI) * 0.14, ry: 1.25, s: 1.0, roll: -1.2 - k * 0.4, anim: "jump" };
    }
    return { x: 1.8, y: 0.3, ry: 1.25, s: 1.0, roll: -1.6, anim: "jump", hide: true };
  }
  if (section === "clients") {
    if (c < 0.26) return { x: 1.25, y: -0.52, ry: -0.8, s: 0.62, roll: 0, anim: "walk", hide: true };
    if (c < 0.5) {
      const k = (c - 0.26) / 0.24;
      return { x: 1.15 - k * 0.9, y: -0.52, ry: -0.8, s: 0.62, roll: 0, anim: "walk" };
    }
    if (c < 0.56) {
      // the stumble
      const k = (c - 0.5) / 0.06;
      return { x: 0.25 - k * 0.1, y: -0.52 + k * 0.1, ry: -1.0, s: 0.62, roll: k * 0.55, anim: "jump" };
    }
    // and down he goes, head first to the left
    const k = Math.min(1, (c - 0.56) / 0.18);
    return { x: 0.15 - k * 0.6, y: -0.42 + Math.sin(k * Math.PI) * 0.18 - k * 0.2, ry: -1.1, s: 0.62, roll: 0.55 + k * 1.25, anim: "jump" };
  }
  return null;
}
