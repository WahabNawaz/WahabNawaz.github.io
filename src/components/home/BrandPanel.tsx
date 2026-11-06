"use client";

// Showcase, like the reference's run of full-screen project images: one
// cover per screen, each sliding up over the one before (sticky), with the
// project name spaced out across the middle like a brand mark. The cover
// eases from a slight zoom as it arrives. Covers are the placeholder
// gradients from ui.tsx until real images are added.
import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Cover } from "@/components/ui";
import { projects } from "@/content/data";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function BrandPanel() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.utils.toArray<HTMLElement>("[data-show]", root.current).forEach((el) => {
        const st = { trigger: el, start: "top bottom", end: "top top", scrub: true };
        gsap.fromTo(el.querySelector("[data-show-cover]"), { scale: 1.18 }, { scale: 1, ease: "none", scrollTrigger: st });
        gsap.fromTo(el.querySelector("[data-show-name]"), { letterSpacing: "0.6em", autoAlpha: 0 }, { letterSpacing: "0.22em", autoAlpha: 1, ease: "power1.out", scrollTrigger: st });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} data-pose="brand" aria-label="Selected work" className="relative">
      {projects.slice(0, 3).map((p) => (
        <Link key={p.slug} href={`/work/${p.slug}/`} data-show className="sticky top-0 block h-svh overflow-hidden">
          <div data-show-cover className="absolute inset-0">
            <Cover project={p} className="size-full" />
          </div>
          <div className="absolute inset-0 grid place-items-center px-5 text-center text-white">
            <div>
              <p data-show-name className="font-display text-[11vw] font-normal uppercase leading-none tracking-[0.22em] md:text-[6.5vw]">
                {p.title.replace("Project ", "")}
              </p>
              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.5em] text-white/80">
                {p.client} · {p.year}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </section>
  );
}
