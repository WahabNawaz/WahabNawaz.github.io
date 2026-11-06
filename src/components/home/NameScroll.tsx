"use client";

// Your name, typed in letter by letter while the section is pinned. The 3D
// character pushes a floating desk across the screen at the same time: the
// pin's progress goes to the scene store ("name"), Avatar.tsx reads it.
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { site } from "@/content/site";
import { sceneStore } from "@/lib/scene-store";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function NameScroll() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const letters = gsap.utils.toArray<HTMLElement>("[data-letter]", root.current);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;
      gsap.set(letters, { autoAlpha: 0, y: "0.25em" });
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "+=160%",
          pin: true,
          scrub: 0.4,
          onUpdate: (self) => sceneStore.setProgress("name", self.progress),
          onLeave: () => sceneStore.setProgress("name", 1),
          onLeaveBack: () => sceneStore.setProgress("name", 0),
        },
      });
      // the first letters wait for the desk to arrive, the last ones land
      // before he jumps off
      tl.to({}, { duration: 0.3 })
        .to(letters, { autoAlpha: 1, y: 0, duration: 0.05, stagger: 0.045, ease: "power2.out" })
        .to({}, { duration: 0.2 });
    },
    { scope: root },
  );

  return (
    <section ref={root} data-pose="name" aria-label={site.name} className="relative flex h-svh items-center justify-center overflow-hidden px-5">
      <h2 aria-hidden className="whitespace-nowrap text-center font-display text-[13vw] font-normal uppercase leading-none tracking-tight md:text-[7vw]">
        {site.name.split("").map((c, i) => (
          <span key={i} data-letter className="inline-block whitespace-pre">
            {c}
          </span>
        ))}
      </h2>
    </section>
  );
}
