"use client";

// Big role title with the services listed beside it and a meta row below
// (independent · city · worldwide). Words rise in as the section scrolls in.
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
        scrollTrigger: { trigger: root.current, start: "top 65%", once: true },
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
    <section ref={root} data-pose="role" className="relative flex min-h-svh flex-col justify-between gap-12 px-5 py-28 md:px-8">
      <p className="max-w-sm text-base leading-relaxed text-ink/75">{lorem.paragraph}</p>

      <div className="grid items-end gap-10 md:grid-cols-[1fr_auto]">
        <h2 className="font-display text-[19vw] font-semibold uppercase leading-[0.85] tracking-tighter md:text-[11vw]">
          {site.role.split(" ").map((w) => (
            <span key={w} className="block overflow-hidden">
              <span data-word className="block">
                {w}
              </span>
            </span>
          ))}
        </h2>
        <ul data-side className="space-y-3 md:text-right">
          {services.map((s) => (
            <li key={s.id}>
              <span className="font-display text-xl font-semibold tracking-tight">{s.title}</span>
              <span className="block font-mono text-[11px] uppercase tracking-widest text-muted">{s.kicker}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-3 border-t border-line pt-4 font-mono text-[11px] uppercase tracking-widest">
        <span>Independent</span>
        <span className="text-center">{site.location} based</span>
        <span className="text-right">Working worldwide</span>
      </div>
    </section>
  );
}
