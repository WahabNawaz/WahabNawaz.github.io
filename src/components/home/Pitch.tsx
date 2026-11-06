"use client";

// Three-word pitch that lights up line by line, three proof points and reviews.
// The section comes up over the sky like a page whose top-left corner is still
// folded over: the fold opens as it scrolls into place (clip-path + a shaded
// flap, scrubbed with the scroll).
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Testimonials from "@/components/Testimonials";
import { lorem } from "@/content/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const LINES = ["Lorem ipsum.", "Dolor sit.", "Amet elit."];
const POINTS = ["Lorem ipsum dolor sit", "Consectetur adipiscing elit", "Sed do eiusmod tempor"];

export default function Pitch() {
  const root = useRef<HTMLElement>(null);
  const flap = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(flap.current, { display: "none" });
        return;
      }
      // the folded corner: c = fold size in px, from big to nothing
      const fold = { c: 0 };
      const big = () => Math.min(window.innerWidth, window.innerHeight) * 0.75;
      const draw = () => {
        const c = fold.c;
        if (root.current) root.current.style.clipPath = c > 0.5 ? `polygon(${c}px 0, 100% 0, 100% 100%, 0 100%, 0 ${c}px)` : "none";
        if (flap.current) {
          flap.current.style.width = flap.current.style.height = `${c}px`;
          flap.current.style.opacity = c > 0.5 ? "1" : "0";
        }
      };
      gsap.fromTo(
        fold,
        { c: big },
        {
          c: 0,
          ease: "power1.inOut",
          onUpdate: draw,
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "top 15%", scrub: 0.4, invalidateOnRefresh: true },
        },
      );
      gsap.fromTo(
        "[data-pitch]",
        { opacity: 0.12 },
        {
          opacity: 1,
          stagger: 0.5,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top 70%", end: "center 45%", scrub: true },
        },
      );
      gsap.from("[data-point]", {
        x: -24,
        autoAlpha: 0,
        stagger: 0.12,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-points]", start: "top 85%", once: true },
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      data-pose="desk"
      className="relative z-10 -mt-[100svh] min-h-[112svh] bg-paper px-5 py-28 md:px-8"
    >
      {/* the folded-over corner (back of the page), lit from the top left */}
      <div
        ref={flap}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-20"
        style={{ filter: "drop-shadow(6px 8px 14px rgba(0,0,0,0.25))" }}
      >
        <div
          className="size-full [clip-path:polygon(100%_0,0_100%,100%_100%)]"
          style={{ background: "linear-gradient(135deg, #ffffff 0%, #f1ece2 45%, #d9d1c2 75%, #b9b0a1 100%)" }}
        />
      </div>
      {/* laid out like the reference: headline top left over the desk scene, a
          note pointing at the character, reviews on the right, proof points
          bottom left, a closing line bottom right (all placeholder copy) */}
      <h2 className="relative z-10 font-display text-5xl font-semibold leading-[0.95] tracking-tight md:absolute md:left-8 md:top-24 md:max-w-[36rem] md:text-6xl lg:text-7xl">
        {LINES.map((l) => (
          <span key={l} data-pitch className="block">
            {l}
          </span>
        ))}
      </h2>
      <div aria-hidden className="pointer-events-none absolute left-[40%] top-[17%] hidden items-start gap-2 md:flex">
        <svg width="70" height="56" viewBox="0 0 70 56" fill="none" className="mt-3 text-ink">
          <path d="M66 6C46 4 22 14 10 44" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M4 36l6 10 8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="max-w-[11rem] text-sm leading-snug">
          Me, lorem ipsum
          <br />
          dolor sit amet.
        </p>
      </div>
      <div className="relative z-10 mt-12 md:absolute md:right-8 md:top-[16%] md:mt-0 md:w-[30%]">
        <Testimonials plain />
      </div>
      <ul data-points className="relative z-10 mt-12 space-y-2 md:absolute md:bottom-14 md:left-8 md:mt-0">
        {POINTS.map((pt) => (
          <li key={pt} data-point className="flex items-center gap-3 text-sm">
            <span className="size-1.5 rounded-full bg-accent" /> {pt}
          </li>
        ))}
      </ul>
      <p className="relative z-10 mt-8 max-w-xs text-sm leading-relaxed text-ink/70 md:absolute md:bottom-14 md:right-8 md:mt-0">
        {lorem.sentence}
      </p>
    </section>
  );
}
