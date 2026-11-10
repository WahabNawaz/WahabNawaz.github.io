"use client";

// Hero: centred headline, the 3D character sitting on the bronze hand with a
// laptop (drawn by the 3D layer, pose "hero"), a hand-drawn note pointing at
// it, the sky switch and a short intro along the bottom.
// When the hero scrolls away, the note and the switch leave in steps (scrubbed,
// so scrolling back up builds them again): the arrow rubs itself out and the
// words slide up into their lines; the switch's icons sink one by one, its
// thumb and knob shrink, the track draws back and the glass capsule closes.
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { site } from "@/content/site";
import { onHeroReady } from "@/lib/intro";
import SkyToggle from "@/components/SkyToggle";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Hero() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    (_context, contextSafe) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const q = gsap.utils.selector(ref);

      // leaving on scroll: over the first half screen of scrolling
      const buildOut = contextSafe!(() => {
        const out = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: ref.current,
            start: "top top",
            end: () => `+=${Math.round(window.innerHeight * 0.5)}`,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });
        // the note: a little faster than the page, the arrow rubbed out from
        // its tip back to the words (path length 1), the words up into their lines
        out
          .fromTo(q("[data-note]"), { y: 0 }, { y: () => -window.innerHeight * 0.06, duration: 1 }, 0)
          .fromTo(q("[data-arrow-head]"), { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.12 }, 0)
          .fromTo(q("[data-arrow-line]"), { strokeDashoffset: 0 }, { strokeDashoffset: 1, duration: 0.5, ease: "power1.in" }, 0.04)
          .fromTo(q("[data-note-line]"), { yPercent: 0 }, { yPercent: -112, duration: 0.42, stagger: 0.09, ease: "power3.in" }, 0.12)
          // the sky switch
          .fromTo(q("[data-sky-name]"), { yPercent: 0 }, { yPercent: 110, duration: 0.25, ease: "power2.in" }, 0.05)
          .fromTo(q("[data-sky-knob]"), { scale: 1 }, { scale: 0, duration: 0.2, ease: "power2.in" }, 0.1)
          .fromTo(q("[data-sky-track]"), { scaleX: 1 }, { scaleX: 0, duration: 0.35, ease: "power2.inOut" }, 0.12)
          .fromTo(
            q("[data-sky-icon]"),
            { y: 0, autoAlpha: 1, filter: "blur(0px)" },
            { y: 12, autoAlpha: 0, filter: "blur(4px)", duration: 0.3, stagger: { each: 0.07, from: "end" }, ease: "power2.in" },
            0.18,
          )
          .fromTo(q("[data-sky-thumb]"), { scale: 1 }, { scale: 0.2, duration: 0.3, ease: "back.in(2)" }, 0.3)
          .fromTo(
            q("[data-sky-capsule]"),
            { clipPath: "inset(0% 0% 0% 0% round 999px)" },
            { clipPath: "inset(0% 100% 0% 0% round 999px)", duration: 0.35, ease: "power3.inOut" },
            0.45,
          )
          // the intro on the right fades up and out
          .fromTo(
            q("[data-intro-text]"),
            { y: 0, autoAlpha: 1, filter: "blur(0px)" },
            { y: -24, autoAlpha: 0, filter: "blur(6px)", duration: 0.45, ease: "power2.in" },
            0.15,
          );
      });

      // built paused, plays once the opening is over: like the reference, the
      // headline and the rest come after the character has sat down
      const tl = gsap.timeline({ paused: true, onComplete: buildOut });
      tl.from("[data-line]", { yPercent: 110, duration: 1.1, stagger: 0.08, ease: "power4.out" })
        .from("[data-fade]", { autoAlpha: 0, y: 16, duration: 0.9, stagger: 0.1 }, 0.45)
        .from("[data-sky-thumb]", { scale: 0, duration: 0.8, ease: "back.out(2.2)" }, 0.8)
        .from("[data-sky-track]", { scaleX: 0, duration: 0.9, ease: "power3.out" }, 0.8)
        .from("[data-arrow-line]", { strokeDashoffset: 1, duration: 1.1, ease: "power2.out" }, 0.9)
        .from("[data-arrow-head]", { autoAlpha: 0, duration: 0.3 }, 1.7);
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
          right of his laptop); the arrow has a little loop, like a pen's */}
      <div data-fade className="absolute left-[60%] top-[55%] md:left-[70%] md:top-[61%] lg:landscape:left-[46%] lg:landscape:top-[66%]">
        <div data-note className="flex items-start gap-1.5 md:gap-3">
          <svg viewBox="0 0 76 56" className="mt-[-26px] h-10 w-11 shrink-0 md:mt-[-32px] md:h-14 md:w-[4.75rem]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path
              data-arrow-line
              d="M72 47 C 58 51, 44 50, 38 42 C 33 35, 40 29, 45 34 C 50 40, 38 47, 29 41 C 20 35, 15 23, 12 9"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset="0"
            />
            <path data-arrow-head d="M6 16 L12 7 L18.5 14.5" />
          </svg>
          <p className="font-display text-[15px] font-semibold leading-snug md:text-base md:font-medium">
            <span className="block overflow-hidden pb-[0.08em]">
              <span data-note-line className="block">
                That&apos;s me,
              </span>
            </span>
            <span className="-mt-[0.08em] block overflow-hidden pb-[0.08em]">
              <span data-note-line className="block">
                lorem ipsum dolor.
              </span>
            </span>
          </p>
        </div>
      </div>

      {/* bottom row: sky switch (bottom-left on phones, centred on wider
          screens), intro on the right (not on phones, like the reference) */}
      <div className="absolute inset-x-5 bottom-[max(2rem,4svh)] flex flex-col items-start gap-6 md:inset-x-8 md:bottom-8 md:flex-row md:items-end md:justify-between">
        <span className="hidden w-80 lg:block" />
        <div data-fade>
          <SkyToggle />
        </div>
        <p data-fade className="hidden max-w-xs text-sm font-medium leading-relaxed md:block md:w-72 md:text-right md:text-base lg:w-80">
          <span data-intro-text className="block">
            {site.name}, {site.role.toLowerCase()}. {site.tagline}
          </span>
        </p>
      </div>
    </section>
  );
}
