"use client";

// Three-word pitch that lights up line by line, three proof points and reviews.
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

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
    <section ref={root} data-pose="left" className="grid gap-12 px-5 py-32 md:grid-cols-[1.1fr_1fr] md:px-8 md:pl-[26%]">
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
