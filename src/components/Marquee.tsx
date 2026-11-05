"use client";

// Endless marquee (GSAP). Scrolling speeds it up and flips its direction.
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Marquee({ items, className = "" }: { items: string[]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const loop = gsap.to("[data-track]", { xPercent: -50, duration: 30, ease: "none", repeat: -1 });
      let dir = 1;
      ScrollTrigger.create({
        trigger: ref.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate(self) {
          if (self.direction !== dir) dir = self.direction;
          const boost = gsap.utils.clamp(1, 6, 1 + Math.abs(self.getVelocity()) / 400);
          gsap.to(loop, { timeScale: dir * boost, duration: 0.2, overwrite: true });
          gsap.to(loop, { timeScale: dir, duration: 1.2, delay: 0.25, ease: "power2.out" });
        },
      });
      // start deep inside the repeats so it can also run backwards for a long time
      loop.totalTime(loop.duration() * 500);
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <div data-track className="flex w-max">
        {[0, 1].map((copy) => (
          <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0">
            {items.map((t) => (
              <li key={t} className="flex items-center gap-6 px-6 font-display text-4xl font-semibold uppercase tracking-tight md:text-6xl">
                {t}
                <span className="text-accent">✦</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
