// The full stop of the role title, like the reference: once the title is in,
// its dot drops out as a little ball and keeps bouncing on the floor of the
// section. When the section scrolls away it hops over to the band's dial,
// bounces off it, falls onto the band's bottom edge, and there the black
// circle of the work section opens out of it.
//
// A small hand-made 2D simulation (gravity, a floor, the screen sides and the
// dial as a round obstacle) in screen pixels, stepped at 60 Hz on the GSAP
// ticker. The ball is a fixed element drawn over the page.
import gsap from "gsap";

type State = "rest" | "idle" | "travel" | "dial" | "grow" | "done";

type Parts = {
  pin: HTMLElement; // the pinned, screen-high part of the role section
  period: HTMLElement; // the dot after the title
  titleLine: HTMLElement; // the title's line (slides inside its mask)
  titleMask: HTMLElement;
  ball: HTMLElement;
  isIn: () => boolean; // the section's text is shown
};

const STEP = 1 / 60;
const BOUNCE = 0.72; // floor
const DIAL_BOUNCE = 0.35;
const IDLE_HOP = 0.14; // how high it keeps bouncing, in screen heights
const TRAVEL_HOP = 0.18; // the hops over to the dial
const GROW = 1.9; // seconds for the circle to open by itself

const ease = gsap.parseEase("power2.inOut");
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function startFullStop({ pin, period, titleLine, titleMask, ball, isIn }: Parts) {
  const band = document.querySelector<HTMLElement>('[data-pose="band"]');
  const dialBox = document.querySelector<HTMLElement>("[data-band-dial]");
  const circle = document.querySelector<HTMLElement>("[data-work-circle]");
  if (!band || !circle) return () => {};

  let state: State = "rest";
  let first = true;
  let inSince = -1;
  let x = 0;
  let y = 0;
  let vx = 0;
  let vy = 0;
  let R = 9;
  let squash = 0;
  let acc = 0;
  let shown = false;
  const grow = { t: 0, from: 0, to: 0 };

  const showBall = (on: boolean) => {
    if (on === shown) return;
    shown = on;
    ball.style.visibility = on ? "visible" : "hidden";
  };
  const setCircle = (cx: string, cy: string, rb: number) => {
    circle.style.setProperty("--cx", cx);
    circle.style.setProperty("--cy", cy);
    circle.style.setProperty("--rb", `${rb.toFixed(1)}px`);
  };
  const resetCircle = () => setCircle("56%", "62%", 0);

  const toRest = () => {
    state = "rest";
    inSince = -1;
    showBall(false);
    period.style.visibility = "";
  };

  // the band's bottom edge at x (its right part is 8svh higher, with a
  // 45-degree slope in between; see ServiceBand.tsx)
  const bandEdge = (r: DOMRect, px: number, H: number) => {
    const xb = (parseFloat(getComputedStyle(band).getPropertyValue("--xb")) || 56) / 100;
    const step = 0.08 * H;
    const a = r.left + xb * r.width;
    const k = clamp((px - a) / step, 0, 1);
    return r.bottom - k * step;
  };

  // the dot's spot once the title has slid fully in
  const restSpot = () => {
    const p = period.getBoundingClientRect();
    const off = titleMask.getBoundingClientRect().top - titleLine.getBoundingClientRect().top;
    return { x: p.left + p.width / 2, y: p.top + off + p.height / 2, r: p.width / 2 };
  };

  const land = (W: number, H: number) => {
    const c = circle.getBoundingClientRect();
    grow.t = 0;
    grow.from = R;
    grow.to = 1.15 * Math.hypot(Math.max(x, W - x), Math.max(y, H - y));
    setCircle(`${(x - c.left).toFixed(1)}px`, `${(y - c.top).toFixed(1)}px`, R);
    showBall(false);
    state = "grow";
  };

  const tick = (_time: number, deltaMs: number) => {
    const dt = Math.min(0.05, deltaMs / 1000);
    const W = window.innerWidth;
    const H = window.innerHeight || 1;
    const b = band.getBoundingClientRect();

    if (first) {
      first = false;
      // loaded (or come back) further down the page: the ball has been and gone
      if (b.top < H) state = "done";
    }
    // scrolled back up above the band: everything as before
    if ((state === "done" || state === "grow") && b.top >= H) {
      resetCircle();
      toRest();
    }
    if (state === "done") return;
    if (state === "grow") {
      grow.t = Math.min(1, grow.t + dt / GROW);
      circle.style.setProperty("--rb", `${(grow.from + (grow.to - grow.from) * ease(grow.t)).toFixed(1)}px`);
      // open: the title gets its full stop back (for when you scroll back up)
      if (grow.t >= 1) {
        state = "done";
        period.style.visibility = "";
      }
      return;
    }

    // a very fast scroll: the work section is already well up, skip the ball
    const c = circle.getBoundingClientRect();
    if (state !== "rest" && c.top < 0.5 * H) {
      showBall(false);
      period.style.visibility = "";
      state = "done";
      return;
    }

    const pinTop = pin.getBoundingClientRect().top;
    const textIn = isIn();

    if (state === "rest") {
      period.style.visibility = "";
      if (!textIn) {
        inSince = -1;
        return;
      }
      const now = performance.now();
      if (inSince < 0) inSince = now;
      if (now - inSince < 600) return;
      const s = restSpot();
      if (s.r < 1) return;
      x = s.x;
      y = s.y;
      R = Math.max(3, s.r);
      vx = -0.02 * W;
      vy = 0;
      acc = 0;
      ball.style.width = ball.style.height = `${(2 * R).toFixed(2)}px`;
      period.style.visibility = "hidden";
      state = "idle";
    }
    if (state === "idle" && !textIn) {
      toRest();
      return;
    }

    const g = 3.2 * H; // px/s²
    // the floor: just above the bottom line of the section, rising to 74% of
    // the screen as the section scrolls away
    const low = H - 54.4;
    const floor = low + (0.74 * H - low) * clamp(-pinTop / (0.35 * H), 0, 1);

    const d = dialBox?.getBoundingClientRect();
    const dial = d && d.width > 0 ? { cx: d.left + d.width / 2, cy: d.top + d.height / 2, r: (d.width * 92) / 220 } : null;

    if (state === "idle" && pinTop < 0) state = "travel";
    if (state === "travel" && pinTop >= 0) state = "idle";
    if (state === "travel" && dial && dial.cy - dial.r < floor - R) state = "dial";
    if (state === "dial" && dial && dial.cy - dial.r > floor + R && y < floor) state = "travel";

    const hitFloor = () => {
      squash = 1;
      if (state === "idle") {
        // it keeps bouncing to the same height, slowing down sideways
        const up = Math.sqrt(2 * g * IDLE_HOP * H);
        vy = -Math.max(Math.abs(vy) * BOUNCE, up);
        vx *= 0.9;
      } else {
        // one hop that lands on the dial (or the middle of the screen)
        const up = Math.sqrt(2 * g * TRAVEL_HOP * H);
        const t = (2 * up) / g;
        const to = dial ? dial.cx + 0.3 * dial.r : W / 2;
        vx = clamp((to - x) / t, -1.2 * W, 1.2 * W);
        vy = -up;
      }
    };

    acc = Math.min(acc + dt, 0.1);
    while (acc >= STEP) {
      acc -= STEP;
      vy += g * STEP;
      vx *= 0.998;
      x += vx * STEP;
      y += vy * STEP;
      if (x < R) {
        x = R;
        vx = Math.abs(vx) * BOUNCE;
      } else if (x > W - R) {
        x = W - R;
        vx = -Math.abs(vx) * BOUNCE;
      }
      if (state !== "dial") {
        if (y + R >= floor && vy >= 0) {
          y = floor - R;
          hitFloor();
        } else if (y + R > floor) y = floor - R; // the floor rose into it
      } else if (dial) {
        const dx = x - dial.cx;
        const dy = y - dial.cy;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < dial.r + R) {
          const nx = dx / dist;
          const ny = dy / dist;
          x = dial.cx + nx * (dial.r + R);
          y = dial.cy + ny * (dial.r + R);
          const vn = vx * nx + vy * ny;
          if (vn < 0) {
            if (vn < -60) squash = 1;
            vx -= (1 + DIAL_BOUNCE) * vn * nx;
            vy -= (1 + DIAL_BOUNCE) * vn * ny;
            // a little grip along the surface
            const vt = -vx * ny + vy * nx;
            vx += 0.12 * vt * ny;
            vy -= 0.12 * vt * nx;
          }
        }
      }
    }

    // over the band's bottom edge: the work circle opens from here
    if ((state === "dial" || state === "travel") && y + R >= bandEdge(b, x, H) && b.bottom < H + R) {
      land(W, H);
      return;
    }

    squash = Math.max(0, squash - dt / 0.09);
    ball.style.transform = `translate3d(${(x - R).toFixed(1)}px, ${(y - R).toFixed(1)}px, 0) scale(${(1 + 0.22 * squash).toFixed(3)}, ${(1 - 0.2 * squash).toFixed(3)})`;
    showBall(true);
  };

  gsap.ticker.add(tick);
  return () => {
    gsap.ticker.remove(tick);
    showBall(false);
    period.style.visibility = "";
    resetCircle();
  };
}
