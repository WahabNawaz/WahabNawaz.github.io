"use client";

// Role: a short note top-left, the role in one big line across the middle
// (the 3D character stands in front of it, on its own shadow), the services
// listed small on the right and a meta row at the bottom. Faint column lines
// run down the whole section, like the reference.
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { services } from "@/content/data";
import { lorem, site } from "@/content/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function RoleSection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.from("[data-word]", {
        yPercent: 110,
        duration: 1,
        stagger: 0.08,
        ease: "power4.out",
        scrollTrigger: { trigger: root.current, start: "top 55%", once: true },
      });
      gsap.from("[data-side] > *", {
        x: 30,
        autoAlpha: 0,
        stagger: 0.06,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-side]", start: "top 85%", once: true },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} data-pose="role" className="relative min-h-[115svh] overflow-hidden bg-paper px-5 pb-10 pt-28 md:px-8">
      {/* column lines */}
      <div aria-hidden className="pointer-events-none absolute inset-0 grid grid-cols-5 px-5 md:px-8">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={`border-line/70 ${i ? "border-l" : ""}`} />
        ))}
      </div>

      <div className="relative flex min-h-[calc(115svh-9.5rem)] flex-col justify-between gap-12">
        <p className="max-w-xs text-xs leading-relaxed text-ink/75">{lorem.paragraph}</p>

        <div className="relative">
          <h2 className="text-center font-display text-[13vw] font-normal leading-none tracking-tight md:text-[6.4vw]">
            {site.role.split(" ").map((w) => (
              <span key={w} className="mx-[0.12em] inline-block overflow-hidden align-bottom">
                <span data-word className="inline-block">
                  {w}
                </span>
              </span>
            ))}
          </h2>
          <ul data-side className="mt-10 space-y-3 text-right md:absolute md:right-0 md:top-full md:mt-12">
            {services.map((s) => (
              <li key={s.id} className="text-[11px] leading-tight">
                <span className="font-semibold">{s.title}</span>
                <span className="block text-ink/60">{s.kicker}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-3 pt-4 font-mono text-[10px] uppercase tracking-widest">
          <span>Independent</span>
          <span className="text-center">{site.location} based</span>
          <span className="text-right">Working worldwide</span>
        </div>
      </div>
    </section>
  );
}
