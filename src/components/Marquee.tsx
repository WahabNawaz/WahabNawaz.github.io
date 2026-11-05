"use client";

// Endless marquee (GSAP). Scrolling speeds it up and flips its direction.
// Pass `items` for big words, or `children` for any custom row (rendered twice).
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Props = {
  items?: string[];
  children?: React.ReactNode;
  className?: string;
  duration?: number;
  reverse?: boolean;
  scrollBoost?: boolean;
};

export default function Marquee({ items = [], children, className = "", duration = 30, reverse = false, scrollBoost = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const base = reverse ? -1 : 1;
      const loop = gsap.to("[data-track]", { xPercent: -50, duration, ease: "none", repeat: -1 });
      loop.timeScale(base);
      // start deep inside the repeats so it can also run backwards for a long time
      loop.totalTime(loop.duration() * 500);
      if (!scrollBoost) return;
      let dir = 1;
      ScrollTrigger.create({
        trigger: ref.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate(self) {
          if (self.direction !== dir) dir = self.direction;
          const boost = gsap.utils.clamp(1, 6, 1 + Math.abs(self.getVelocity()) / 400);
          gsap.to(loop, { timeScale: base * dir * boost, duration: 0.2, overwrite: true });
          gsap.to(loop, { timeScale: base * dir, duration: 1.2, delay: 0.25, ease: "power2.out" });
        },
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <div data-track className="flex w-max">
        {[0, 1].map((copy) => (
          <div key={copy} aria-hidden={copy === 1} className="flex shrink-0">
            {children ??
              items.map((t) => (
                <span key={t} className="flex items-center gap-6 px-6 font-display text-4xl font-semibold uppercase tracking-tight md:text-6xl">
                  {t}
                  <span className="text-accent">✦</span>
                </span>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
