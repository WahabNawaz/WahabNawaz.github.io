"use client";

// Letters roll up one by one when the parent link/button is hovered (GSAP).
// Screen readers get the plain text; the doubled letters are hidden from them.
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function RollText({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      const host = el?.closest("a, button") ?? el;
      if (!el || !host) return;
      if (!window.matchMedia("(hover: hover)").matches) return;
      const chars = el.querySelectorAll("[data-c]");
      const enter = () =>
        gsap.to(chars, { yPercent: -100, duration: 0.45, stagger: 0.018, ease: "power3.out", overwrite: true });
      const leave = () =>
        gsap.to(chars, { yPercent: 0, duration: 0.45, stagger: 0.018, ease: "power3.out", overwrite: true });
      host.addEventListener("mouseenter", enter);
      host.addEventListener("mouseleave", leave);
      return () => {
        host.removeEventListener("mouseenter", enter);
        host.removeEventListener("mouseleave", leave);
      };
    },
    { scope: ref },
  );

  return (
    <span ref={ref} className={`relative inline-flex ${className}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="inline-flex overflow-hidden leading-[1.15]">
        {text.split("").map((c, i) => (
          <span key={i} data-c className="relative inline-block whitespace-pre">
            <span className="block">{c}</span>
            <span className="absolute left-0 top-full block">{c}</span>
          </span>
        ))}
      </span>
    </span>
  );
}
