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
  // services: hanging upside down from the top-left edge (the real spot,
  // roll and arms come from edgePose below); showcase: gone up out of sight;
  // process: in at step 03 only (processPose below)
  services: { x: -0.72, y: 1.12, ry: 0.4, s: 1.2 },
  brand: { x: -0.72, y: 2.2, ry: 0.4, s: 1.2 },
  process: { x: 0.7, y: -2.8, ry: -0.25, s: 1.24 },
  clients: { x: 0.6, y: -0.4, ry: -0.5, s: 0.6 },
  // big, in front of the middle of the role title (the real spot and the
  // jumps in and out come from rolePose below)
  role: { x: -0.02, y: -0.1, ry: 0.12, s: 1.9 },
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
// feet near the bottom of the screen (like the reference; footerPose below).
const FOOTER: Pose = { x: 0.7, y: -0.5, ry: -0.25, s: 1.24 };

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
 * - work: out of sight while the black circle opens, then dives over the
 *   pinned WORK title from left to right and is gone again for the projects;
 * (clients, services, showcase, process and footer: see edgePose, risePose,
 * processPose, footerPose)
 * roll turns him in the screen plane (+ = anticlockwise); hide = not drawn
 * (he jumps there at once instead of flying across the screen).
 */
export type ScrollPose = Pose & { roll: number; anim?: AnimState; hide?: boolean; dangle?: number };

export function scrollPose(section: string | null, p: number): ScrollPose | null {
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
  if (section === "work") {
    if (c < 0.42) return { x: -1.6, y: 0.3, ry: 1.25, s: 1.0, roll: -1.25, anim: "jump", hide: true };
    if (c < 0.64) {
      const k = (c - 0.42) / 0.22;
      return { x: -1.45 + k * 3.0, y: 0.26 + Math.sin(k * Math.PI) * 0.14, ry: 1.25, s: 1.0, roll: -1.2 - k * 0.4, anim: "jump" };
    }
    return { x: 1.8, y: 0.3, ry: 1.25, s: 1.0, roll: -1.6, anim: "jump", hide: true };
  }
  return null;
}

const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const smooth = (k: number) => k * k * (3 - 2 * k);
// screen fraction from the top (0 = top edge, 1 = bottom) -> pose y
const yAt = (frac: number) => 1 - 2 * frac;
// hanging upside down from the top-left, just under the header strip
const HANG = { x: -0.72, hips: -0.06, ry: 0.4, s: 1.2, roll: 2.8 };

/**
 * Clients -> services, like the reference. `edge` is where the bottom edge
 * of the dark clients section is on screen (0 = top, 1 = bottom of the
 * screen, more = still below). He walks in among the logos, trips near that
 * edge ("Oops!"), tumbles over it as the white services section scrolls up,
 * and ends up hanging upside down from the top-left, arms dangling.
 */
export function edgePose(edge: number, t: number): ScrollPose {
  if (edge > 1.85) return { x: 1.2, y: yAt(0.5), ry: -0.55, s: 1.15, roll: 0, anim: "walk", hide: true };
  if (edge > 0.8) {
    const k = (1.85 - edge) / 1.05;
    return { x: mix(1.15, 0.1, k), y: yAt(0.5), ry: -0.55, s: 1.15, roll: 0, anim: "walk" };
  }
  if (edge > 0.65) {
    // the stumble: the edge has reached his feet
    const k = (0.8 - edge) / 0.15;
    return { x: mix(0.1, 0.02, k), y: yAt(edge - 0.3), ry: mix(-0.55, -0.9, k), s: 1.15, roll: k * 0.5, anim: "jump" };
  }
  if (edge > 0.16) {
    // over the edge, head first, turning upside down on the way up
    const k = smooth((0.65 - edge) / 0.49);
    return {
      x: mix(0.02, HANG.x, k),
      y: yAt(edge - 0.3 + k * 0.08),
      ry: mix(-0.9, HANG.ry, k),
      s: mix(1.15, HANG.s, k),
      roll: mix(0.5, HANG.roll, k),
      anim: "jump",
      dangle: k,
    };
  }
  return { x: HANG.x, y: yAt(HANG.hips), ry: HANG.ry, s: HANG.s, roll: HANG.roll + Math.sin(t * 1.2) * 0.05, anim: "idle", dangle: 1 };
}

/**
 * Showcase after the services: he lets go upwards and is gone. `top` = the
 * showcase's top edge on screen (0..1 from the top).
 */
export function risePose(top: number): ScrollPose {
  const k = Math.min(1, Math.max(0, (0.5 - top) / 0.5));
  const hidden = top < 0;
  return { x: HANG.x, y: yAt(HANG.hips - k * 0.5), ry: HANG.ry, s: HANG.s, roll: HANG.roll, anim: "idle", dangle: 1, hide: hidden };
}

// Measured on screen: the pose point is at his hips; at size s the soles are
// 0.21 * s screen heights below it and the top of the head 0.18 * s above.
const LEGS = 0.21;
const TORSO = 0.18;
// The footer character: right side, facing the visitor, a little turned
// towards the footer text; about half the screen tall (like the reference).
const FOOT = { x: 0.7, ry: -0.25, s: 1.24 };

/**
 * Role, like the reference (state from lib/role-trip.ts, measured by
 * RoleSection.tsx): he jumps over from the desk (`trip` 0 -> 1, from about
 * halfway; before that the desk section still has him) and lands big in front
 * of the title, his feet near the bottom of the screen; he moves up with the
 * section once it is no longer pinned (`shift`, screen heights). Then
 * (`out` 0 -> 1) he leaps up and drops down through the band, out of sight.
 * On phones he comes in from his corner and stands a little smaller.
 */
export function rolePose(trip: number, out: number, shift: number, mobile: boolean): ScrollPose {
  const stand = mobile ? { x: 0, soles: 0.95, s: 1.45, ry: 0.1 } : { x: -0.02, soles: 0.95, s: 1.9, ry: 0.12 };
  const from = mobile ? { x: 0.62, soles: 0.95, s: 0.3, ry: -0.5 } : { x: -0.36, soles: 0.62, s: 1.15, ry: 0.8 };
  const at = (x: number, soles: number, s: number, ry: number, roll: number, anim: AnimState): ScrollPose => {
    const hips = soles - LEGS * s;
    return { x, y: yAt(hips), ry, s, roll, anim, hide: hips - TORSO * s > 1.02 };
  };
  const base = stand.soles + shift;
  if (out > 0.001) {
    // up (leaning into the leap, highest at a quarter), then quickly down
    // past the bottom of the screen
    const o = Math.min(1, out);
    const lean = Math.sin(Math.PI * Math.min(1, o / 0.5));
    const lift = o < 0.25 ? -0.15 * Math.sin((Math.PI / 2) * (o / 0.25)) : -0.15 + 10 * (o - 0.25) ** 2;
    return at(stand.x + 0.06 * lean, base + lift, stand.s, stand.ry - 0.25 * lean, -0.55 * lean, "jump");
  }
  const t = Math.min(1, Math.max(0, (trip - 0.45) / 0.55));
  if (t >= 1) return at(stand.x, base, stand.s, stand.ry, 0, "idle");
  const e = smooth(t);
  const arc = Math.sin(Math.PI * t);
  return at(
    mix(from.x, stand.x, e),
    mix(from.soles, base, e) - arc * (mobile ? 0.15 : 0.2),
    mix(from.s, stand.s, e),
    mix(from.ry, stand.ry, e),
    -0.2 * arc,
    t > 0.96 ? "idle" : "jump",
  );
}

/**
 * Process, like the reference: at step 03 he jumps up from the bottom of the
 * screen and stands in front of the step's title, his feet 0.67 screen
 * heights below the top of the step's block, so he scrolls with the page,
 * and jumps off the top. `top` = the top of step 03's block on screen (0..1
 * from the top). Before that he waits out of sight where he will come in;
 * after it, out of sight below the footer's right side, so he rises with the
 * footer without flying across the screen.
 */
export function processPose(top: number | null): ScrollPose {
  const below = { ...FOOT, y: yAt(1.9), roll: 0, anim: "idle" as AnimState, hide: true };
  if (top === null) return below;
  const s = 1.15;
  const soles = top + 0.67;
  const hips = soles - LEGS * s;
  const head = hips - TORSO * s;
  const pose = { x: -0.09, y: yAt(hips), ry: 0.5, s, roll: 0 };
  if (soles < -0.02) return below;
  if (head > 1.02) return { ...pose, anim: "jump", hide: true };
  return { ...pose, anim: top > 0.33 || top < -0.3 ? "jump" : "idle" };
}

// In the footer he greets, then stands and chats, round and round:
// wave, stand, talk, stand (seconds since the footer came on screen).
export function footerAnim(since: number): AnimState {
  const c = since % 16;
  return c < 3.4 ? "wave" : c < 8 ? "idle" : c < 12.5 ? "talk" : "idle";
}

/**
 * Footer: standing on the right, feet just above the footer's bottom edge, so
 * he rises with the footer as it scrolls in (`bottom` = the footer's bottom
 * edge on screen, 0..1 from the top). `since` = seconds the footer has been on.
 */
export function footerPose(bottom: number, since: number): ScrollPose {
  return { ...FOOT, y: yAt(bottom - 0.017 - LEGS * FOOT.s), roll: 0, anim: footerAnim(since) };
}
