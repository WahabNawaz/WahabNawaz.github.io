"use client";

// Hero: centred headline, the 3D character sitting on a floating rock with a
// laptop (drawn by the 3D layer, pose "hero"), a hand-drawn note pointing at
// it, the sky switch at the bottom centre and a short intro bottom-right.
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { site } from "@/content/site";
import { onIntroDone } from "@/lib/intro";
import SkyToggle from "@/components/SkyToggle";

gsap.registerPlugin(useGSAP);

export default function Hero() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      // built paused, plays when the preloader lifts (or at once on later visits)
      const tl = gsap.timeline({ paused: true });
      tl.from("[data-line]", { yPercent: 110, duration: 1.1, stagger: 0.08, ease: "power4.out" })
        .from("[data-fade]", { autoAlpha: 0, y: 16, duration: 0.9, stagger: 0.1 }, 0.45)
        .from("[data-arrow] path", { strokeDashoffset: 120, duration: 1, ease: "power2.out" }, 0.9);
      return onIntroDone(() => tl.play());
    },
    { scope: ref },
  );

  const lines = ["Lorem Ipsum Dolor Sit", "Amet Consectetur Elit."];

  return (
    <section
      ref={ref}
      data-pose="hero"
      className="relative h-svh min-h-[640px] overflow-hidden px-5 pb-8 pt-24 md:px-8"
    >
      {/* centred headline */}
      <h1 className="text-center font-display text-[10vw] font-medium leading-[1.02] tracking-tight md:text-[5.6vw]">
        {lines.map((l) => (
          <span key={l} className="block overflow-hidden pb-[0.06em]">
            <span data-line className="block">
              {l}
            </span>
          </span>
        ))}
      </h1>

      {/* hand-drawn note pointing at the character (desktop) */}
      <div data-fade className="absolute left-[46%] top-[66%] hidden items-start gap-3 md:flex">
        <svg data-arrow viewBox="0 0 70 50" className="mt-[-28px] h-12 w-16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M66 44 C 40 46, 18 36, 10 8" strokeDasharray="120" strokeDashoffset="0" />
          <path d="M4 16 L10 6 L17 14" />
        </svg>
        <p className="font-display text-base font-medium leading-snug">
          That&apos;s me,
          <br />
          lorem ipsum dolor.
        </p>
      </div>

      {/* bottom row: sky switch centred, intro on the right */}
      <div className="absolute inset-x-5 bottom-8 flex flex-col items-center gap-6 md:inset-x-8 md:flex-row md:items-end md:justify-between">
        <span className="hidden w-80 md:block" />
        <div data-fade>
          <SkyToggle />
        </div>
        <p data-fade className="max-w-xs text-center text-sm font-medium leading-relaxed md:w-80 md:text-right md:text-base">
          {site.name}, {site.role.toLowerCase()}. {site.tagline}
        </p>
      </div>
    </section>
  );
}
