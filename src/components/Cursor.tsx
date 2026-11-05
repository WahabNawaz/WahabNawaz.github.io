"use client";

// Custom cursor: a small dot that follows the mouse exactly and a ring that
// trails behind (GSAP quickTo). The ring grows over links and buttons.
// Only on devices with a fine pointer (not phones/tablets).
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function Cursor() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      const dot = root.current?.querySelector<HTMLElement>("[data-dot]");
      const ring = root.current?.querySelector<HTMLElement>("[data-ring]");
      if (!dot || !ring) return;
      document.documentElement.classList.add("has-cursor");

      const dx = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power3" });
      const dy = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power3" });
      const rx = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3" });
      const ry = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3" });

      const move = (e: PointerEvent) => {
        dx(e.clientX);
        dy(e.clientY);
        rx(e.clientX);
        ry(e.clientY);
        gsap.to([dot, ring], { autoAlpha: 1, duration: 0.2, overwrite: "auto" });
      };
      const over = (e: PointerEvent) => {
        const hit = (e.target as HTMLElement).closest("a, button, [role=tab], input, label");
        gsap.to(ring, { scale: hit ? 1.9 : 1, duration: 0.3, ease: "power3.out" });
        gsap.to(dot, { scale: hit ? 0 : 1, duration: 0.2 });
      };
      const leave = () => gsap.to([dot, ring], { autoAlpha: 0, duration: 0.2 });

      window.addEventListener("pointermove", move, { passive: true });
      window.addEventListener("pointerover", over, { passive: true });
      document.documentElement.addEventListener("pointerleave", leave);
      return () => {
        document.documentElement.classList.remove("has-cursor");
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerover", over);
        document.documentElement.removeEventListener("pointerleave", leave);
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} aria-hidden className="pointer-events-none fixed inset-0 z-[90] mix-blend-difference">
      <span data-ring className="invisible absolute left-0 top-0 -ml-5 -mt-5 block size-10 rounded-full border border-white opacity-0" />
      <span data-dot className="invisible absolute left-0 top-0 -ml-1 -mt-1 block size-2 rounded-full bg-white opacity-0" />
    </div>
  );
}
