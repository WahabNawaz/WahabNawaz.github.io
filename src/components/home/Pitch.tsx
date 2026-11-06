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
      className="relative z-10 -mt-[100svh] grid min-h-svh gap-12 bg-paper px-5 py-32 md:grid-cols-[1.1fr_1fr] md:px-8 md:pl-[34%]"
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
      <div>
        <h2 className="font-display text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl">
          {LINES.map((l) => (
            <span key={l} data-pitch className="block">
              {l}
            </span>
          ))}
        </h2>
        <ul data-points className="mt-10 space-y-3">
          {POINTS.map((p) => (
            <li key={p} data-point className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest">
              <span className="size-2 rounded-full bg-accent" /> {p}
            </li>
          ))}
        </ul>
      </div>
      <div className="self-end">
        <Testimonials />
      </div>
    </section>
  );
}
