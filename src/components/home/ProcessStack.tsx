"use client";

// "How a project runs", like the reference. One step per screen: the step's
// picture sits at the edge of the screen, small (60%), grows to full size as
// the step reaches the middle of the screen, stays there for a while (the
// step block is sticky), then shrinks back as it moves on; the text slides
// along with the picture's inner edge. A thin line links the steps: from the
// inner bottom corner of one picture to the inner top corner of the next, an
// S-curve redrawn every frame (the corners move), drawn in as the next step
// comes up from the bottom of the screen.
// Pictures are the placeholder covers until real ones (or videos) are added.
// The 3D character jumps in at step 03 (poses.ts processPose).
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Cover } from "@/components/ui";
import { process, projects } from "@/content/data";
import { lorem } from "@/content/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const MEDIA = 0.49; // picture width at full size, share of the screen width
const SMALL = 0.6; // picture size while it is not the current step
const SPAN = 0.555; // how far (share of the screen height) it takes to grow or shrink
// The text keeps a clear gap (3vw) from the picture's inner edge. Its box is
// set from the same container edges as the picture (not from the screen
// width), so a visible scrollbar cannot push the two together.
const ease = (k: number) => (k < 0.5 ? 2 * k * k : 1 - 2 * (1 - k) * (1 - k)); // power2.inOut
const clamp = (v: number) => Math.min(1, Math.max(0, v));

export default function ProcessStack() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const steps = gsap.utils.toArray<HTMLElement>("[data-step]", el);
      const inners = steps.map((s) => s.querySelector<HTMLElement>("[data-step-inner]")!);
      const figs = steps.map((s) => s.querySelector<HTMLElement>("[data-step-media]")!);
      const copies = steps.map((s) => s.querySelector<HTMLElement>("[data-step-text]")!);
      const svg = el.querySelector<SVGSVGElement>("[data-step-links]");
      const links = gsap.utils.toArray<SVGPathElement>("[data-process-path]", el);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const wide = window.matchMedia("(min-width: 768px)");

      // text: the lines slide up out of their masks as the step comes in
      steps.forEach((s) => {
        gsap.from(s.querySelectorAll("[data-line]"), {
          yPercent: 110,
          duration: 0.9,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: s, start: "top 78%", once: true },
        });
      });

      const frame = () => {
        if (!wide.matches || !svg) {
          figs.forEach((f, i) => gsap.set([f, copies[i]], { clearProps: "transform" }));
          return;
        }
        const W = innerWidth;
        const H = innerHeight;
        const box = svg.getBoundingClientRect();
        // where each picture is now (corners on screen)
        const shapes = inners.map((inner, i) => {
          const r = inner.getBoundingClientRect();
          const sticky = (H - r.height) / 2;
          const a = reduce ? 1 : ease(clamp(1 - Math.abs(r.top - sticky) / (H * SPAN)));
          const s = SMALL + (1 - SMALL) * a;
          const left = i % 2 === 1; // pictures alternate: right, left, right, left
          const w = W * MEDIA;
          const shift = (1 - a) * (1 - SMALL) * w * (left ? -1 : 1);
          gsap.set(figs[i], { scale: s, transformOrigin: left ? "0% 50%" : "100% 50%" });
          gsap.set(copies[i], { x: shift });
          const h = r.height * s;
          // the picture's inner edge, measured from the container's own edges
          // (with a visible scrollbar the container is narrower than the screen)
          return { x: left ? box.left + w * s : box.right - w * s, top: r.top + (r.height - h) / 2, bottom: r.top + (r.height + h) / 2, innerTop: r.top };
        });
        // the links: inner bottom corner of one picture -> inner top corner of the next
        links.forEach((p, i) => {
          const a = shapes[i];
          const b = shapes[i + 1];
          if (!a || !b) return;
          const x1 = a.x - box.left;
          const y1 = a.bottom - box.top;
          const x2 = b.x - box.left;
          const y2 = b.top - box.top;
          const dy = (y2 - y1) * 0.8;
          p.setAttribute("d", `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${x1.toFixed(1)} ${(y1 + dy).toFixed(1)} ${x2.toFixed(1)} ${(y2 - dy).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`);
          // drawn while the next step's block rises from the bottom of the screen to 40%
          const drawn = reduce ? 1 : clamp((H - b.innerTop) / (H * 0.6));
          p.style.strokeDashoffset = String(1 - drawn);
        });
      };

      // only while the section is near the screen
      let on = false;
      const start = () => {
        if (!on) gsap.ticker.add(frame);
        on = true;
      };
      const stop = () => {
        if (on) gsap.ticker.remove(frame);
        on = false;
      };
      ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? start() : stop()),
        onRefresh: (self) => {
          frame();
          if (self.isActive) start();
        },
      });
      frame();
      return () => stop();
    },
    { scope: root },
  );

  return (
    <section ref={root} data-pose="process" className="px-5 pb-24 pt-32 md:px-8 md:pb-[6svh]">
      <div className="flex flex-wrap items-start justify-between gap-8">
        <h2 className="font-display text-5xl font-normal leading-[1.05] tracking-tight md:text-[3.9vw]">How a project runs</h2>
        <p className="max-w-[20rem] text-xs font-medium leading-snug md:text-right">{lorem.sentence}</p>
      </div>

      {/* full-bleed, so the pictures meet the screen edges */}
      <div className="relative mt-16 md:-mx-8 md:mt-[6svh]">
        <svg data-step-links aria-hidden className="pointer-events-none absolute inset-0 z-10 hidden h-full w-full overflow-visible md:block">
          {process.slice(1).map((p) => (
            <path
              key={p.step}
              data-process-path
              d="M 0 0"
              pathLength={1}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeDasharray={1}
              strokeDashoffset={1}
              className="text-ink"
            />
          ))}
        </svg>
        <ol className="relative grid gap-20 md:block">
          {process.map((p, i) => {
            const mediaLeft = i % 2 === 1;
            return (
              <li key={p.step} data-step className="md:mb-[3svh] md:h-[calc(27.56vw_+_70svh)] md:last:mb-0">
                {/* sticky in the middle of the screen while the step is current */}
                <div data-step-inner className="grid gap-8 md:sticky md:top-[calc(50svh_-_13.78vw)] md:block md:h-[27.56vw]">
                  <div
                    data-step-text
                    className={`md:absolute md:inset-y-0 md:flex md:flex-col md:justify-center ${
                      mediaLeft ? "md:left-[52vw] md:right-[3.4vw]" : "md:left-[3.4vw] md:right-[52vw] md:items-end md:text-right"
                    }`}
                  >
                    <span className="block overflow-hidden">
                      <span data-line className="block font-mono text-[10px] uppercase tracking-widest">
                        Step {p.step} · {p.title}
                      </span>
                    </span>
                    <h3 className="mt-3 overflow-hidden font-display text-5xl font-normal leading-[1.1] tracking-tight md:text-[4.4vw]">
                      <span data-line className="block">
                        {lorem.short}
                      </span>
                    </h3>
                    <span className="mt-4 block overflow-hidden">
                      <span data-line className="block max-w-[23rem] text-[13px] font-medium leading-snug md:max-w-[33vw]">
                        {p.text}
                      </span>
                    </span>
                  </div>
                  {/* at the screen edge; grows from 60% to full size around the middle */}
                  <div
                    data-step-media
                    className={`overflow-hidden md:absolute md:top-0 md:w-[49vw] ${mediaLeft ? "md:left-0" : "md:right-0"}`}
                  >
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
