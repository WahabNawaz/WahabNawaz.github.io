"use client";

// Watches children with data-pose="..." and tells the 3D character which
// pose to take. The active section is the last one whose top has passed
// 55% of the screen height, so even a very fast scroll lands on the right pose.
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { sceneStore } from "@/lib/scene-store";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function PoseScope({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const sections = gsap.utils.toArray<HTMLElement>("[data-pose]", ref.current);
      if (!sections.length) return;

      // Before the first posed section is reached, no section pose applies
      // (the page's own pose from poses.ts is used).
      const update = () => {
        const line = window.innerHeight * 0.55;
        let active: HTMLElement | null = null;
        for (const el of sections) {
          if (el.getBoundingClientRect().top <= line) active = el;
        }
        sceneStore.setSection(active?.dataset.pose ?? null);
      };

      ScrollTrigger.create({
        trigger: ref.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: update,
        onRefresh: update,
        onLeave: update,
        onLeaveBack: update,
      });
      update();

      return () => sceneStore.setSection(null);
    },
    { scope: ref },
  );

  return <div ref={ref}>{children}</div>;
}
