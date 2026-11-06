"use client";

// "In good company": dark section with three rows of client names drifting
// in alternating directions (swap the names for logo images later). The 3D
// character walks in among them and trips on the section's bottom edge:
// "Oops!" pops up by the edge while he tumbles over it (poses.ts edgePose).
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Marquee from "@/components/Marquee";
import { clients } from "@/content/data";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// a different typeface feel per name, so the row reads like a wall of logos
const STYLES = [
  "font-display font-light tracking-[0.2em] uppercase",
  "font-mono text-xl uppercase tracking-widest",
  "font-display font-semibold tracking-tight",
  "font-display italic tracking-tight",
  "font-display font-normal uppercase tracking-[0.08em]",
];

function Row({ offset }: { offset: number }) {
  const list = [...clients.slice(offset), ...clients.slice(0, offset)];
  return (
    <>
      {list.map((c, i) => (
        <span key={c} className={`mx-[3vw] grid h-20 shrink-0 place-items-center text-3xl text-paper/80 md:h-24 ${STYLES[(i + offset) % STYLES.length]}`}>
          {c}
        </span>
      ))}
    </>
  );
}

export default function ClientsBand() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      // matches edgePose in poses.ts: pops when he stumbles (the edge is at
      // 80% of the screen), fades once he hangs at the top
      const oops = "[data-oops]";
      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: "bottom 80%", end: "bottom 12%", scrub: 0.3 } })
        .fromTo(oops, { autoAlpha: 0, scale: 0.4, rotate: -14 }, { autoAlpha: 1, scale: 1, rotate: -4, duration: 0.12, ease: "back.out(3)" }, 0)
        .to(oops, { y: -20, duration: 0.7, ease: "none" }, 0.12)
        .to(oops, { autoAlpha: 0, duration: 0.15 }, 0.85);
    },
    { scope: root },
  );

  return (
    <section ref={root} data-pose="clients" className="relative overflow-hidden bg-ink pb-[45svh] pt-28 text-paper">
      <div className="px-5 md:px-8">
        <h2 className="font-display text-5xl font-normal leading-[0.95] tracking-tight md:text-6xl">In good company.</h2>
        <p className="mt-4 max-w-sm text-xs leading-relaxed text-paper/60">Lorem ipsum brands from dolor to amet who trusted me with how they look online, and how they sell.</p>
      </div>
      <div className="mt-12 space-y-2">
        <Marquee duration={40} scrollBoost={false}>
          <Row offset={0} />
        </Marquee>
        <Marquee duration={46} reverse scrollBoost={false}>
          <Row offset={3} />
        </Marquee>
        <Marquee duration={52} scrollBoost={false}>
          <Row offset={5} />
        </Marquee>
      </div>
      <p
        data-oops
        aria-hidden
        className="invisible absolute bottom-[16svh] left-[42%] font-display text-6xl font-normal tracking-tight text-paper md:text-7xl"
      >
        Oops!
      </p>
    </section>
  );
}
