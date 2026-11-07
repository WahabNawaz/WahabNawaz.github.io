// The character's trip into the home "role" section and out of it again,
// shared between the section (RoleSection.tsx measures the scroll) and the
// 3D character (Avatar.tsx / poses.ts rolePose):
// - p:     0..1, how far he has come in (the jump over from the desk);
// - out:   0..1, how far he has gone again (the jump down into the band);
// - shift: how far the pinned part has scrolled up, in screen heights
//          (0 while it is pinned, negative after), so he moves with it.
export const roleTrip = { p: 0, out: 0, shift: 0 };

/** Eases `cur` towards `target` with time constant `tau` (seconds). */
export function follow(cur: number, target: number, dt: number, tau: number) {
  const next = cur + (target - cur) * (1 - Math.exp(-dt / tau));
  return Math.abs(target - next) < 1e-4 ? target : next;
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
