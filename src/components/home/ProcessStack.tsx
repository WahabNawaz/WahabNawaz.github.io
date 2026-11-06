"use client";

// "How a project runs", like the reference: each step is a short text on one
// side and a picture on the other (they swap sides every step), joined by a
// thin curving line that draws itself as you scroll (stroke-dashoffset, GSAP
// scrub). Pictures are the placeholder covers until real ones are added.
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Cover } from "@/components/ui";
import { process, projects } from "@/content/data";
import { lorem } from "@/content/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// a loose S-curve down the gap between text and pictures (viewBox 100 x 1000, stretched)
const PATH = "M 50 0 C 50 90, 54 160, 54 250 S 46 400, 46 500 S 54 650, 54 750 S 50 920, 50 1000";

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
        <h2 className="max-w-xl font-display text-5xl font-normal leading-[0.95] tracking-tight md:text-6xl">How a project runs</h2>
        <p className="max-w-xs text-right text-xs leading-relaxed text-ink/70">{lorem.sentence}</p>
      </div>

      <div data-steps className="relative mt-20">
        <svg aria-hidden className="pointer-events-none absolute inset-0 hidden h-full w-full md:block" viewBox="0 0 100 1000" preserveAspectRatio="none">
          <path ref={line} data-process-path d={PATH} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" className="text-ink/70" />
        </svg>
        <ol className="relative grid gap-24 md:gap-0">
          {process.map((p, i) => (
            <li key={p.step} data-step className="grid items-center gap-8 md:min-h-[72svh] md:grid-cols-2 md:gap-[10%] md:px-[4%]">
              <div className={`max-w-sm ${i % 2 ? "md:order-2" : "md:justify-self-end md:text-right"}`}>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                  Step {p.step} · {p.title}
                </span>
                <h3 className="mt-3 font-display text-4xl font-normal leading-tight tracking-tight">{lorem.short}</h3>
                <p className="mt-3 text-xs leading-relaxed text-ink/70">{p.text}</p>
              </div>
              <Cover project={projects[i % projects.length]} className={`aspect-[4/3] w-full rounded-sm shadow-xl ${i % 2 ? "md:order-1" : ""}`} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
