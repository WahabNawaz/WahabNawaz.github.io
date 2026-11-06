"use client";

// Three-word pitch that lights up line by line, three proof points and reviews.
// The section turns in over the sky like a page peeled from the bottom-right
// corner: a diagonal edge sweeps up to the top left (clip-path), with a shaded
// curl along the edge, scrubbed with the scroll.
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
      // the peel: p = 0 nothing shown, 1 all of it. The edge is the line
      // x + y = k (in the section's own pixels), starting at the screen's
      // bottom-right corner and sweeping up and left.
      const peel = { p: 0 };
      const draw = () => {
        const el = root.current;
        const curl = flap.current;
        if (!el || !curl) return;
        const r = el.getBoundingClientRect();
        const corner = r.width + (window.innerHeight - r.top);
        const k = corner - peel.p * (window.innerWidth + window.innerHeight) * 1.08;
        if (peel.p >= 0.999 || k <= 0) {
          el.style.clipPath = "none";
          curl.style.opacity = "0";
          return;
        }
        el.style.clipPath = `polygon(${k}px 0px, 99999px 0px, 99999px 99999px, 0px 99999px, 0px ${k}px)`;
        // the curl: a shaded band on the page side of the edge
        const w = 40 + 150 * Math.sin(Math.PI * Math.min(1, peel.p * 1.1));
        const len = (window.innerWidth + window.innerHeight) * 2;
        const n = w / 2 / Math.SQRT2; // half the band's width, along the diagonal
        curl.style.opacity = "1";
        curl.style.width = `${len}px`;
        curl.style.height = `${w}px`;
        curl.style.left = `${k / 2 + n - len / 2}px`;
        curl.style.top = `${k / 2 + n - w / 2}px`;
      };
      gsap.to(peel, {
        p: 1,
        ease: "none",
        onUpdate: draw,
        scrollTrigger: { trigger: root.current, start: "top bottom", end: "top 2%", scrub: 0.3, invalidateOnRefresh: true },
      });
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
      {/* the curl along the peeling edge: a shaded strip, lit at the fold */}
      <div
        ref={flap}
        aria-hidden
        className="pointer-events-none absolute z-20 origin-center -rotate-45 opacity-0"
        style={{
          background:
            "linear-gradient(to bottom, #ffffff 0%, #f6f3ee 22%, #e3ddd2 48%, #c9c1b2 72%, rgba(120,110,95,0.35) 88%, rgba(0,0,0,0) 100%)",
          boxShadow: "0 -10px 30px rgba(0,0,0,0.18)",
        }}
      />
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
