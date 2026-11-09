"use client";

// Hero: centred headline, the 3D character sitting on a floating rock with a
// laptop (drawn by the 3D layer, pose "hero"), a hand-drawn note pointing at
// it, the sky switch at the bottom centre and a short intro bottom-right.
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { site } from "@/content/site";
import { onHeroReady } from "@/lib/intro";
import SkyToggle from "@/components/SkyToggle";

gsap.registerPlugin(useGSAP);

export default function Hero() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      // built paused, plays once the opening is over: like the reference, the
      // headline and the rest come after the character has sat down
      const tl = gsap.timeline({ paused: true });
      tl.from("[data-line]", { yPercent: 110, duration: 1.1, stagger: 0.08, ease: "power4.out" })
        .from("[data-fade]", { autoAlpha: 0, y: 16, duration: 0.9, stagger: 0.1 }, 0.45)
        .from("[data-arrow] path", { strokeDashoffset: 120, duration: 1, ease: "power2.out" }, 0.9);
      return onHeroReady(() => tl.play());
    },
    { scope: ref },
  );

  const lines = ["Lorem Ipsum Dolor Sit", "Amet Consectetur Elit."];

  return (
    <section
      ref={ref}
      data-pose="hero"
      className="relative h-svh min-h-[560px] overflow-hidden px-5 pb-8 pt-[18svh] md:px-8 md:pt-[11svh] lg:pt-24"
    >
      {/* centred headline (lower down on phones, like the reference) */}
      <h1 className="text-center font-display text-[8.5vw] font-normal leading-[1.02] tracking-tight md:text-[5.2vw] lg:text-[3.6vw] lg:leading-[1.05]">
        {lines.map((l) => (
          <span key={l} className="block overflow-hidden pb-[0.06em]">
            <span data-line className="block">
              {l}
            </span>
          </span>
        ))}
      </h1>

      {/* hand-drawn note pointing at the character (on phones it sits to the
          right of his legs, like the reference) */}
      <div data-fade className="absolute left-[63%] top-[55%] flex items-start gap-1.5 md:left-[70%] md:top-[61%] md:gap-3 lg:landscape:left-[46%] lg:landscape:top-[66%]">
        <svg data-arrow viewBox="0 0 70 50" className="mt-[-24px] h-9 w-10 shrink-0 md:mt-[-28px] md:h-12 md:w-16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M66 44 C 40 46, 18 36, 10 8" strokeDasharray="120" strokeDashoffset="0" />
          <path d="M4 16 L10 6 L17 14" />
        </svg>
        <p className="font-display text-[15px] font-semibold leading-snug md:text-base md:font-medium">
          That&apos;s me,
          <br />
          lorem ipsum dolor.
        </p>
      </div>

      {/* bottom row: sky switch (bottom-left on phones, centred on wider
          screens), intro on the right (not on phones, like the reference) */}
      <div className="absolute inset-x-5 bottom-[max(2rem,4svh)] flex flex-col items-start gap-6 md:inset-x-8 md:bottom-8 md:flex-row md:items-end md:justify-between">
        <span className="hidden w-80 lg:block" />
        <div data-fade>
          <SkyToggle />
        </div>
        <p data-fade className="hidden max-w-xs text-sm font-medium leading-relaxed md:block md:w-72 md:text-right md:text-base lg:w-80">
          {site.name}, {site.role.toLowerCase()}. {site.tagline}
        </p>
      </div>
    </section>
  );
}
