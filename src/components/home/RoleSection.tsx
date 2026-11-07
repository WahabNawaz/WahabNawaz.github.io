"use client";

// Role, like the reference: a tall section (140svh) whose screen-high inner
// part stays pinned. The role in one huge line across the middle, ending in a
// round full stop; a short note top-left, the services small on the right and
// a meta row at the bottom; faint column guides that grow down the screen as
// the 3D character jumps over from the desk and lands, big, in front of the
// title. Once the text is in, the full stop drops out as a bouncing ball
// (full-stop.ts). When the section scrolls away he jumps down into the band.
import { useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { services } from "@/content/data";
import { lorem, site } from "@/content/site";
import { clamp01, follow, roleTrip } from "@/lib/role-trip";
import { startFullStop } from "./full-stop";

gsap.registerPlugin(SplitText, useGSAP);

export default function RoleSection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = root.current;
      const pin = section?.querySelector<HTMLElement>("[data-role-pin]");
      const titleLine = section?.querySelector<HTMLElement>("[data-title-line]");
      const titleMask = titleLine?.parentElement;
      const period = section?.querySelector<HTMLElement>("[data-period]");
      const ball = section?.querySelector<HTMLElement>("[data-ball]");
      if (!section || !pin || !titleLine || !titleMask || !period || !ball) return;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const guides = gsap.utils.toArray<HTMLElement>("[data-guide]", section);
      const grow = gsap.parseEase("power2.inOut");

      // the text: every line slides up out of its own mask, in reading order
      let isIn = false;
      const splits = reduce
        ? []
        : gsap.utils.toArray<HTMLElement>("[data-reveal]", section).map((el) =>
            SplitText.create(el, {
              type: "lines",
              mask: "lines",
              autoSplit: true,
              onSplit(self) {
                gsap.set(self.lines, { yPercent: isIn ? 0 : 115 });
              },
            }),
          );
      const lines = () => [titleLine, ...splits.flatMap((s) => s.lines)];
      if (!reduce) gsap.set(titleLine, { yPercent: 115 });
      const show = () =>
        lines().forEach((el, i) =>
          gsap.to(el, { yPercent: 0, duration: 1, delay: Math.min(0.6, 0.04 * i), ease: "power4.out", overwrite: true }),
        );
      const hide = () => gsap.to(lines(), { yPercent: 115, duration: 0.5, ease: "power2.in", overwrite: true });

      // Every frame: how far the section has come in (h) and gone again (v).
      // The character's trip follows h until the section is 90% in, then
      // completes by itself; he only jumps away once he has stood for a moment
      // (or the visitor scrolls on well past).
      let latched = false;
      let standingSince = -1;
      let lastP = -1;
      const tick = (_t: number, deltaMs: number) => {
        const dt = Math.min(0.05, deltaMs / 1000);
        const H = window.innerHeight || 1;
        const top = pin.getBoundingClientRect().top;
        const f = window.innerWidth < 768 ? 0.85 : 1;
        const h = clamp01((f * H - top) / (f * H));
        if (latched && h < 0.5) latched = false;
        else if (!latched && h > 0.9) latched = true;
        roleTrip.p = reduce ? +(h >= 0.5) : follow(roleTrip.p, latched ? 1 : h, dt, 0.3);

        if (Math.abs(roleTrip.p - lastP) > 1e-4) {
          lastP = roleTrip.p;
          guides.forEach((g, i) => (g.style.transform = `scaleY(${grow(clamp01((lastP - 0.07 * i) / 0.72)).toFixed(4)})`));
        }

        const want = isIn ? h > 0.4 : h > 0.7;
        if (want !== isIn) {
          isIn = want;
          if (!reduce) (isIn ? show : hide)();
        }

        const standing = roleTrip.p >= 0.999;
        if (standing && standingSince < 0) standingSince = performance.now();
        if (!standing) standingSince = -1;
        const v = clamp01(-top / (0.6 * H));
        const go = (standing && (performance.now() - standingSince > 2200 || v > 0.35)) || roleTrip.out > 0 ? v : 0;
        roleTrip.out = reduce ? v : follow(roleTrip.out, go, dt, 0.12);
        roleTrip.shift = Math.min(0, top / H);
      };
      gsap.ticker.add(tick);

      const stopBall = reduce ? () => {} : startFullStop({ pin, period, titleLine, titleMask, ball, isIn: () => isIn });

      return () => {
        gsap.ticker.remove(tick);
        stopBall();
        splits.forEach((s) => s.revert());
        roleTrip.p = 0;
        roleTrip.out = 0;
        roleTrip.shift = 0;
      };
    },
    { scope: root },
  );

  const [first, ...rest] = site.role.split(" ");

  return (
    <section ref={root} data-pose="role" aria-label={site.role} className="relative h-[140svh] bg-paper text-ink">
      <div data-role-pin className="sticky top-0 h-svh overflow-hidden bg-paper">
        {/* column guides: three on phones, five from 7.5% on wider screens */}
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-5 right-0 grid grid-cols-3 md:left-[7.5%] md:grid-cols-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <i key={i} data-guide className={`origin-top border-l border-ink/[0.08] ${i > 2 ? "hidden md:block" : ""}`} style={{ transform: "scaleY(0)" }} />
          ))}
        </div>

        <h2 className="absolute inset-x-0 top-[46svh] -translate-y-1/2 whitespace-nowrap text-center font-display text-[11vw] font-medium capitalize leading-none tracking-[-0.05em] md:top-1/2 md:text-[8.4vw]">
          <span className="-mb-[0.2em] block overflow-hidden pb-[0.2em]">
            <span data-title-line className="block">
              <span className="inline-block">{first}</span>{" "}
              <span className="inline-block">
                {rest.join(" ")}
                <i data-period aria-hidden className="ml-[0.03em] inline-block size-[0.15em] rounded-full bg-ink" />
              </span>
            </span>
          </span>
        </h2>

        <div className="absolute left-5 right-5 top-[8.5rem] md:left-[7.5%] md:right-auto md:top-[clamp(6rem,14svh,9rem)] md:w-[min(36rem,34vw)] md:pl-[clamp(0.5rem,0.8vw,1rem)]">
          <p data-reveal className="text-[15px] font-semibold leading-[1.4] md:text-base">
            {lorem.paragraph}
          </p>
        </div>

        <ol className="absolute bottom-[clamp(4.5rem,12svh,7rem)] left-[63%] right-8 hidden pl-[clamp(0.5rem,0.8vw,1rem)] md:block">
          {services.map((s) => (
            <li key={s.id} className="grid py-[0.4rem] text-right text-base font-semibold leading-[1.4]">
              <span data-reveal>{s.title}</span>
              <span data-reveal>{s.kicker}</span>
            </li>
          ))}
        </ol>

        <p className="absolute inset-x-5 bottom-[1.1rem] flex justify-between font-mono text-[10px] font-bold uppercase tracking-[0.06em] md:inset-x-8 md:bottom-[1.6rem] md:text-[13px]">
          <span data-reveal>Independent</span>
          <span data-reveal>{site.location} based</span>
          <span data-reveal>Working worldwide</span>
        </p>
      </div>

      {/* the full stop once it has dropped out of the title (full-stop.ts) */}
      <div
        data-ball
        aria-hidden
        className="pointer-events-none invisible fixed left-0 top-0 z-[29] origin-bottom rounded-full"
        style={{ background: "radial-gradient(circle at 34% 30%, #8a8a8f 0%, #2b2b2f 36%, #111114 68%)" }}
      />
    </section>
  );
}
