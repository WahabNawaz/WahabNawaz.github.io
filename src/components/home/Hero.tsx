"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { site } from "@/content/site";
import { useSky } from "@/lib/scene-store";
import { onIntroDone } from "@/lib/intro";
import SkyToggle from "@/components/SkyToggle";

gsap.registerPlugin(useGSAP);

const Sky = dynamic(() => import("@/components/scene/Sky"), { ssr: false });

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const night = useSky() === "night";

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      // built paused, plays when the preloader lifts (or at once on later visits)
      const tl = gsap.timeline({ paused: true });
      tl.from("[data-line]", { yPercent: 110, duration: 1.1, stagger: 0.08, ease: "power4.out" }).from(
        "[data-fade]",
        { autoAlpha: 0, y: 16, duration: 0.9, stagger: 0.1 },
        0.45,
      );
      return onIntroDone(() => tl.play());
    },
    { scope: ref },
  );

  const lines = ["Lorem ipsum", "dolor sit amet,", "consectetur."];

  return (
    <section
      ref={ref}
      data-pose="hero"
      className={`relative isolate flex h-svh min-h-[640px] flex-col justify-between overflow-hidden px-5 pb-6 pt-28 transition-colors duration-700 md:px-8 ${
        night ? "text-paper" : "text-ink"
      }`}
    >
      <Sky className="absolute inset-0 -z-10 bg-[#cfe0f0]" />

      <div className="max-w-[56rem]">
        <p data-fade className="mb-6 font-mono text-xs uppercase tracking-widest">
          {site.name} · {site.role}
        </p>
        <h1 className="font-display text-[13vw] font-semibold leading-[0.92] tracking-tight md:text-[7.5vw]">
          {lines.map((l) => (
            <span key={l} className="block overflow-hidden pb-[0.06em]">
              <span data-line className="block">
                {l}
              </span>
            </span>
          ))}
        </h1>
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div data-fade className="max-w-sm space-y-5">
          <p className="text-base leading-relaxed md:text-lg">{site.tagline}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/work/" className="rounded-full bg-ink px-5 py-3 font-mono text-xs uppercase tracking-widest text-paper hover:bg-accent hover:text-ink">
              View work
            </Link>
            <Link href="/contact/" className="rounded-full border border-current px-5 py-3 font-mono text-xs uppercase tracking-widest hover:bg-current/10">
              Get in touch
            </Link>
          </div>
        </div>
        <div data-fade className="flex items-center gap-4">
          <SkyToggle />
          <span className="hidden font-mono text-[11px] uppercase tracking-widest md:block">Scroll ↓</span>
        </div>
      </div>
    </section>
  );
}
