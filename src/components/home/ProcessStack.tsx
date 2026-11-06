"use client";

// "How a project runs": the steps sit left and right of a thin curving line
// that draws itself as you scroll (stroke-dashoffset, GSAP scrub). The 3D
// character runs along the same line (Avatar.tsx reads [data-process-path]).
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { process } from "@/content/data";
import { lorem } from "@/content/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// a loose S-curve down the whole section (viewBox 100 x 1000, stretched)
const PATH = "M 50 0 C 50 60, 82 90, 80 160 S 22 300, 24 380 S 78 520, 76 610 S 24 760, 26 840 S 52 960, 50 1000";

export default function ProcessStack() {
  const root = useRef<HTMLElement>(null);
  const line = useRef<SVGPathElement>(null);

  useGSAP(
    () => {
      const path = line.current;
      if (!path) return;
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(path, { strokeDashoffset: 0 });
        return;
      }
      gsap.to(path, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: { trigger: "[data-steps]", start: "top 70%", end: "bottom 60%", scrub: 0.5 },
      });
      gsap.utils.toArray<HTMLElement>("[data-step]", root.current).forEach((el) => {
        gsap.from(el, {
          y: 40,
          autoAlpha: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 80%", once: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} data-pose="process" className="px-5 py-32 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-8">
        <h2 className="max-w-xl font-display text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl">How a project runs</h2>
        <p className="max-w-xs text-sm leading-relaxed text-ink/70">{lorem.sentence}</p>
      </div>

      <div data-steps className="relative mt-20">
        <svg aria-hidden className="pointer-events-none absolute inset-0 hidden h-full w-full md:block" viewBox="0 0 100 1000" preserveAspectRatio="none">
          <path ref={line} data-process-path d={PATH} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" className="text-ink/70" />
        </svg>
        <ol className="relative grid gap-24 md:gap-0">
          {process.map((p, i) => (
            <li
              key={p.step}
              data-step
              className={`md:flex md:min-h-[62svh] md:items-center ${i % 2 ? "md:justify-end md:pr-[8%]" : "md:justify-start md:pl-[8%]"}`}
            >
              <div className="max-w-sm">
                <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
                  Step {p.step} · {p.title}
                </span>
                <h3 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight">{lorem.short}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/70">{p.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
