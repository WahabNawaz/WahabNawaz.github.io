"use client";

// First-visit intro: a 000 → 100 counter, the name rising letter by letter,
// then the curtain lifts. Shown once per browser session.
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "lenis/react";
import { site } from "@/content/site";
import { markIntroDone, onIntroDone } from "@/lib/intro";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const KEY = "intro-seen";

export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const lenis = useLenis();

  // No scrolling until the curtain starts to lift. Stopping Lenis hides the
  // scrollbar, so pinned sections are re-measured once it is back.
  useEffect(() => {
    if (!lenis) return;
    lenis.stop();
    return onIntroDone(() => {
      lenis.start();
      requestAnimationFrame(() => ScrollTrigger.refresh());
    });
  }, [lenis]);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      let seen = false;
      try {
        seen = sessionStorage.getItem(KEY) === "1";
      } catch {
        // storage blocked: just play it
      }
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (seen || reduce) {
        gsap.set(el, { display: "none" });
        markIntroDone();
        return;
      }

      const value = { n: 0 };
      const tl = gsap.timeline({
        onComplete() {
          gsap.set(el, { display: "none" });
          try {
            sessionStorage.setItem(KEY, "1");
          } catch {
            // ignore
          }
        },
      });

      tl.from("[data-char]", { yPercent: 110, duration: 0.8, stagger: 0.035, ease: "power4.out" })
        .to(
          value,
          {
            n: 100,
            duration: 1.8,
            ease: "power2.inOut",
            onUpdate() {
              if (counter.current) counter.current.textContent = String(Math.round(value.n)).padStart(3, "0");
            },
          },
          0,
        )
        .to("[data-bar]", { scaleX: 1, duration: 1.8, ease: "power2.inOut" }, 0)
        .to("[data-char], [data-count]", { yPercent: -110, duration: 0.6, stagger: 0.015, ease: "power3.in" }, "+=0.15")
        .add(markIntroDone, "-=0.1")
        .to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.9, ease: "power4.inOut" }, "<");
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className="preloader fixed inset-0 z-[100] flex flex-col justify-between bg-ink px-5 py-6 text-paper [clip-path:inset(0%_0%_0%_0%)] md:px-8"
      aria-hidden
    >
      <div className="flex justify-between font-mono text-xs uppercase tracking-widest text-paper/60">
        <span>{site.role}</span>
        <span>Loading</span>
      </div>

      <div className="overflow-hidden">
        <p className="font-display text-[15vw] font-semibold uppercase leading-[0.9] tracking-tight md:text-[10vw]">
          {/* letters are grouped per word, so a narrow screen breaks between words */}
          {site.name.split(" ").map((word, w) => (
            <span key={w} className="inline-block whitespace-nowrap">
              {w > 0 && <span className="inline-block whitespace-pre"> </span>}
              {word.split("").map((c, i) => (
                <span key={i} data-char className="inline-block">
                  {c}
                </span>
              ))}
            </span>
          ))}
        </p>
      </div>

      <div>
        <div className="flex items-end justify-between overflow-hidden">
          <span data-count className="inline-block font-mono text-6xl md:text-8xl">
            <span ref={counter}>000</span>
          </span>
          <span data-count className="inline-block font-mono text-xs uppercase tracking-widest text-paper/60">
            {site.location}
          </span>
        </div>
        <div className="mt-4 h-px w-full bg-paper/15">
          <div data-bar className="h-full origin-left scale-x-0 bg-accent" />
        </div>
      </div>
    </div>
  );
}
