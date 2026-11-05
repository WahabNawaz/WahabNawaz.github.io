"use client";

// Big heading whose letters drop in with a bounce, and hop when hovered.
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { onIntroDone } from "@/lib/intro";

gsap.registerPlugin(useGSAP);

export default function BouncyLetters({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const letters = gsap.utils.toArray<HTMLElement>("[data-l]", ref.current);
      const tl = gsap.timeline({ paused: true });
      tl.from(letters, { yPercent: -140, rotation: () => gsap.utils.random(-25, 25), duration: 1.1, stagger: 0.07, ease: "bounce.out" });

      const hop = (e: Event) => {
        const el = e.currentTarget as HTMLElement;
        if (gsap.isTweening(el)) return;
        gsap.fromTo(el, { y: 0 }, { y: "-12%", duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" });
      };
      letters.forEach((l) => l.addEventListener("mouseenter", hop));
      const off = onIntroDone(() => tl.play());
      return () => {
        off();
        letters.forEach((l) => l.removeEventListener("mouseenter", hop));
      };
    },
    { scope: ref },
  );

  return (
    <h1 ref={ref} className={className} aria-label={text}>
      {text.split("").map((c, i) => (
        <span key={i} data-l aria-hidden className="inline-block whitespace-pre">
          {c}
        </span>
      ))}
    </h1>
  );
}
