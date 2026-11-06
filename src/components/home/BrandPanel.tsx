"use client";

// Brand panel: a big orange tile with the AW monogram on the left and a loose
// collage of project covers on the right, which drift at different speeds as
// you scroll (parallax). Covers are the placeholder gradients from ui.tsx.
import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Cover } from "@/components/ui";
import { projects } from "@/content/data";
import { site } from "@/content/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const TILES = [
  { cls: "left-[4%] top-[6%] w-[46%] rotate-[-4deg]", speed: -60 },
  { cls: "right-[2%] top-[0%] w-[40%] rotate-[3deg]", speed: 40 },
  { cls: "left-[10%] bottom-[4%] w-[42%] rotate-[2deg]", speed: 80 },
  { cls: "right-[6%] bottom-[10%] w-[44%] rotate-[-3deg]", speed: -30 },
];

export default function BrandPanel() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const st = { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true };
      gsap.fromTo("[data-mark]", { rotate: -8, scale: 0.92 }, { rotate: 6, scale: 1.04, ease: "none", scrollTrigger: st });
      gsap.utils.toArray<HTMLElement>("[data-tile]", root.current).forEach((el) => {
        gsap.fromTo(el, { y: Number(el.dataset.speed) }, { y: -Number(el.dataset.speed), ease: "none", scrollTrigger: st });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} data-pose="brand" aria-label="Selected work" className="grid gap-6 px-5 py-24 md:grid-cols-2 md:px-8">
      <div className="relative grid aspect-square place-items-center overflow-hidden rounded-[2rem] bg-[radial-gradient(120%_100%_at_30%_20%,#ff9a5c_0%,#ff6a3d_45%,#c2410c_100%)]">
        <span
          data-mark
          aria-hidden
          className="select-none font-display text-[38vw] font-semibold leading-none tracking-tighter text-white/95 md:text-[19vw]"
          style={{ textShadow: "0 2px 0 #f1f1f1, 0 6px 0 #e3e3e3, 0 14px 30px rgba(80,20,0,0.45)" }}
        >
          {site.shortName}
        </span>
        <span className="absolute bottom-6 left-6 font-mono text-[11px] uppercase tracking-widest text-white/80">{site.name} — {site.year}</span>
      </div>
      <div className="relative aspect-square">
        {TILES.map((t, i) => {
          const p = projects[i % projects.length];
          return (
            <Link
              key={t.cls}
              href={`/work/${p.slug}/`}
              data-tile
              data-speed={t.speed}
              className={`absolute block overflow-hidden rounded-2xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.45)] transition-transform duration-500 hover:scale-[1.03] ${t.cls}`}
            >
              <Cover project={p} className="aspect-[4/3] w-full" />
              <span className="absolute bottom-3 left-3 rounded-full bg-paper/90 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-ink">
                {p.title}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
