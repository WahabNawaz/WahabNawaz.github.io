"use client";

// Your name, huge, sliding sideways while the section is pinned.
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { site } from "@/content/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function NameScroll() {
  const root = useRef<HTMLElement>(null);
  const text = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const el = text.current;
      if (!el) return;
      const distance = () => el.scrollWidth - window.innerWidth + 64;
      gsap.to(el, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} data-pose="name" aria-label={site.name} className="relative flex h-svh items-center overflow-hidden">
      <h2
        ref={text}
        aria-hidden
        className="whitespace-nowrap pl-8 font-display text-[28vw] font-semibold uppercase leading-none tracking-tighter md:text-[22vw]"
      >
        {site.name}
        <span className="text-accent">.</span>
      </h2>
    </section>
  );
}
