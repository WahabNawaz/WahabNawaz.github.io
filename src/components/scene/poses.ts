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

export type Pose = { x: number; y: number; ry: number; s: number };

export const NAMED: Record<string, Pose> = {
  hero: { x: 0.42, y: -0.2, ry: -0.45, s: 1.2 },
  left: { x: -0.66, y: -0.3, ry: 0.65, s: 0.72 },
  right: { x: 0.66, y: -0.3, ry: -0.65, s: 0.72 },
  "right-high": { x: 0.68, y: 0.15, ry: -0.7, s: 0.6 },
  center: { x: 0.0, y: -0.45, ry: 0.0, s: 0.9 },
};

const PAGES: Record<string, Pose> = {
  "/work": { x: 0.72, y: -0.55, ry: -0.6, s: 0.58 },
  "/services": { x: 0.74, y: -0.55, ry: -0.5, s: 0.52 },
  "/about": { x: -0.7, y: -0.5, ry: 0.6, s: 0.6 },
  "/faq": { x: 0.74, y: -0.55, ry: -0.5, s: 0.52 },
  "/contact": { x: 0.0, y: -0.42, ry: 0.0, s: 0.95 },
};

const CASE_STUDY: Pose = { x: 0.78, y: -0.62, ry: -0.6, s: 0.42 };
const FALLBACK: Pose = { x: 0.0, y: -0.3, ry: 0.0, s: 0.85 };

// Phones: the character stays small in a corner so it never covers text.
const MOBILE_CORNER: Pose = { x: 0.62, y: -0.78, ry: -0.5, s: 0.3 };
// between the headline and the buttons
const MOBILE_HERO: Pose = { x: 0.0, y: -0.3, ry: 0.0, s: 0.56 };

// Footer text sits on the left, so the character moves right when it shows.
const FOOTER: Pose = { x: 0.6, y: -0.35, ry: -0.5, s: 0.8 };

export function poseFor(pathname: string, section: string | null, mobile: boolean, footer = false): Pose {
  const path = pathname.replace(/\/$/, "") || "/";
  if (footer) return mobile ? MOBILE_CORNER : FOOTER;
  if (mobile) {
    if (section === "hero") return MOBILE_HERO;
    if (path === "/contact") return { ...PAGES["/contact"], s: 0.6 };
    return MOBILE_CORNER;
  }
  if (section && NAMED[section]) return NAMED[section];
  if (PAGES[path]) return PAGES[path];
  if (path.startsWith("/work/")) return CASE_STUDY;
  return FALLBACK;
}
