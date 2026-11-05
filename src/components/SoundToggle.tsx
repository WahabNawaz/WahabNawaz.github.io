"use client";

// Header sound switch with animated equaliser bars (GSAP).
// When on: a tick on every link/button click and a whoosh on page change.
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { playClick, playWhoosh, sound, useSoundOn } from "@/lib/sound";

gsap.registerPlugin(useGSAP);

export default function SoundToggle() {
  const on = useSoundOn();
  const bars = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();
  const firstPath = useRef(true);

  useEffect(() => {
    sound.load();
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("a, button")) playClick();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (firstPath.current) {
      firstPath.current = false;
      return;
    }
    playWhoosh();
  }, [pathname]);

  useGSAP(
    () => {
      const els = gsap.utils.toArray<HTMLElement>("[data-bar]", bars.current);
      if (!on) {
        gsap.to(els, { scaleY: 0.2, duration: 0.3, ease: "power2.out" });
        return;
      }
      els.forEach((el, i) => {
        gsap.fromTo(
          el,
          { scaleY: 0.2 },
          { scaleY: () => gsap.utils.random(0.5, 1), duration: 0.35 + i * 0.07, ease: "sine.inOut", repeat: -1, yoyo: true, repeatRefresh: true },
        );
      });
    },
    { dependencies: [on], scope: bars, revertOnUpdate: true },
  );

  return (
    <button
      type="button"
      onClick={() => sound.set(!on)}
      aria-pressed={on}
      aria-label={on ? "Sound on" : "Sound off"}
      className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest"
    >
      <span className="hidden sm:inline">Sound</span>
      <span ref={bars} className="flex h-3 items-end gap-[2px]" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} data-bar className="block h-full w-[2px] origin-bottom scale-y-[0.2] bg-current" />
        ))}
      </span>
    </button>
  );
}
