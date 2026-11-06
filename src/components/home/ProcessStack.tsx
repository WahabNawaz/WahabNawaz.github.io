"use client";

// "How a project runs", like the reference: a heading with a short note on
// the right, then one step per screen. Each step has its text on one side,
// next to the middle, and a wide picture on the other side that runs to the
// edge of the screen; they swap sides every step. A thin line snakes down
// through the middle and draws itself as you scroll (stroke-dashoffset,
// GSAP scrub). Pictures are the placeholder covers until real ones (or
// videos) are added. The 3D character stays out of sight here (poses.ts).
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Cover } from "@/components/ui";
import { process, projects } from "@/content/data";
import { lorem } from "@/content/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// down the middle, bending into the text side of each step (viewBox 100 x 1000, stretched)
const PATH = "M 52 0 C 52 60, 40 90, 40 160 S 58 300, 60 380 S 40 520, 40 620 S 60 760, 60 860 S 50 960, 50 1000";

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
        scrollTrigger: { trigger: "[data-steps]", start: "top 60%", end: "bottom 70%", scrub: 0.5 },
      });
      gsap.utils.toArray<HTMLElement>("[data-step]", root.current).forEach((el) => {
        gsap.from(el.querySelector("[data-step-text]"), {
          y: 40,
          autoAlpha: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 65%", once: true },
        });
        // the picture eases out of a slight zoom as it scrolls through
        gsap.fromTo(
          el.querySelector("[data-step-media]"),
          { scale: 1.15 },
          { scale: 1, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
        );
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} data-pose="process" className="overflow-hidden px-5 pb-24 pt-32 md:px-8 md:pb-10">
      <div className="flex flex-wrap items-start justify-between gap-8">
        <h2 className="font-display text-5xl font-normal leading-[1.05] tracking-tight md:text-[3.9vw]">How a project runs</h2>
        <p className="max-w-[20rem] text-xs font-medium leading-snug md:text-right">{lorem.sentence}</p>
      </div>

      <div data-steps className="relative mt-16">
        <svg aria-hidden className="pointer-events-none absolute inset-0 z-10 hidden h-full w-full md:block" viewBox="0 0 100 1000" preserveAspectRatio="none">
          <path ref={line} data-process-path d={PATH} fill="none" stroke="currentColor" strokeWidth="1.2" vectorEffect="non-scaling-stroke" className="text-ink" />
        </svg>
        <ol className="relative grid gap-20 md:gap-0">
          {process.map((p, i) => {
            const mediaLeft = i % 2 === 1;
            return (
              <li key={p.step} data-step className="grid items-center gap-8 md:min-h-[117svh] md:grid-cols-2 md:gap-[2vw] md:last:min-h-[50svh]">
                <div data-step-text className={mediaLeft ? "md:order-2" : "md:justify-self-end md:text-right"}>
                  <span className="font-mono text-[10px] uppercase tracking-widest">
                    Step {p.step} · {p.title}
                  </span>
                  <h3 className="mt-3 font-display text-5xl font-normal leading-[1.05] tracking-tight md:text-[3.9vw]">{lorem.short}</h3>
                  <p className={`mt-4 max-w-[23rem] text-[13px] font-medium leading-snug ${mediaLeft ? "" : "md:ml-auto"}`}>{p.text}</p>
                </div>
                {/* runs to the edge of the screen */}
                <div className={`overflow-hidden ${mediaLeft ? "md:order-1 md:-ml-8" : "md:-mr-8"}`}>
                  <div data-step-media>
                    <Cover project={projects[i % projects.length]} className="aspect-[16/9] w-full" />
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
