"use client";

// First-visit intro, like the reference: a pale, cloudless sky (the hero's
// sky before its clouds roll in) with the name and role small at the bottom
// left and a 000 → 100 counter at the bottom right that follows the real
// loading of the 3D files (the digits roll like a meter). At 100 the text
// slips away and the sky fades into the live one, where the 3D opening plays
// (HeroHands.tsx, Avatar.tsx). Shown once per browser session.
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "lenis/react";
import { site } from "@/content/site";
import { markIntroDone, onIntroDone } from "@/lib/intro";
import { loadState } from "@/lib/load-progress";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const KEY = "intro-seen";
const MIN = 1.4; // seconds the loader stays at least
const MAX = 14; // ...and at most, whatever is still loading
const IDLE = 1.2; // the 3D layer is up but nothing started loading by then: count up anyway

/** One digit of the meter: a 0-9 strip that rolls to `data-digit`. */
function Digit() {
  return (
    <span className="relative inline-block h-[1em] overflow-hidden leading-none">
      <span data-roll className="block">
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="block h-[1em]">
            {i}
          </span>
        ))}
      </span>
    </span>
  );
}

export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  // No scrolling until the loader goes. Stopping Lenis hides the scrollbar,
  // so pinned sections are re-measured once it is back.
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

      const rolls = gsap.utils.toArray<HTMLElement>("[data-roll]", el);
      const show = (n: number) => {
        const s = String(Math.min(100, Math.round(n))).padStart(3, "0");
        rolls.forEach((r, i) => gsap.to(r, { yPercent: -10 * Number(s[i]), duration: 0.35, ease: "power2.out", overwrite: true }));
      };

      // the meter eases towards the real progress; it finishes once loading
      // is over (or nothing ever started, or it takes too long)
      let shown = 0;
      let last = -1;
      let leaving = false;
      const t0 = performance.now();
      const tick = () => {
        const t = (performance.now() - t0) / 1000;
        // everything that goes through three.js loaders (GLB models, textures)
        const l = loadState;
        const up = l.scene ? (performance.now() - l.scene) / 1000 : 0;
        const finished = (l.started && !l.active && l.progress >= 100) || (l.scene > 0 && !l.started && up > IDLE) || t > MAX;
        const target = finished ? 100 : Math.min(99, l.progress);
        shown += (target - shown) * (finished ? 0.12 : 0.06);
        if (target - shown < 0.5) shown = target;
        const n = Math.floor(shown);
        if (n !== last) {
          last = n;
          show(n);
        }
        if (!leaving && finished && shown >= 100 && t > MIN) {
          leaving = true;
          gsap.ticker.remove(tick);
          leave();
        }
      };
      gsap.ticker.add(tick);

      const leave = () =>
        gsap
          .timeline({
            onComplete() {
              gsap.set(el, { display: "none" });
              try {
                sessionStorage.setItem(KEY, "1");
              } catch {
                // ignore
              }
            },
          })
          // the text slips down out of sight, then the plain sky fades into
          // the live one
          .to("[data-text]", { yPercent: 120, duration: 0.5, stagger: 0.06, ease: "power3.in" }, 0.25)
          .add(markIntroDone, 0.7)
          .to(el, { autoAlpha: 0, duration: 0.9, ease: "power1.inOut" }, 0.7);

      return () => gsap.ticker.remove(tick);
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      aria-hidden
      className="preloader fixed inset-0 z-[100] flex items-end justify-between px-5 pb-5 text-ink md:px-8 md:pb-6"
      style={{
        background:
          "radial-gradient(ellipse 75% 70% at 50% 45%, transparent 55%, rgba(70, 80, 115, 0.2) 100%), linear-gradient(180deg, #9cb4df 0%, #bccbe9 38%, #dfe0ef 72%, #ece7f1 100%)",
      }}
    >
      <span className="overflow-hidden">
        <span data-text className="block font-mono text-[10px] font-medium uppercase tracking-[0.2em]">
          {site.name} · {site.role}
        </span>
      </span>
      <span className="overflow-hidden">
        <span data-text className="block font-mono text-sm font-semibold tabular-nums">
          <Digit />
          <Digit />
          <Digit />
        </span>
      </span>
    </div>
  );
}
