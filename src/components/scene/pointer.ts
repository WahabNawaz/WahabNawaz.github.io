// Mouse position in -1..1, tracked on window because the 3D canvas
// ignores pointer events (so the page under it stays clickable).
export const pointer = { x: 0, y: 0 };

let bound = false;
export function trackPointer() {
  if (bound || typeof window === "undefined") return;
  bound = true;
  window.addEventListener(
    "pointermove",
    (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    },
    { passive: true },
  );
}
