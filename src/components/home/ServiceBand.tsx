"use client";

// Sage band between the role and the work section, like the reference: a
// stepped, slanted top and bottom edge, "Live" with a moving waveform, one
// huge line of text drifting by (a phrase per service with a small caption
// and an "Open for projects" mark) and a dial that turns as you scroll.
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Marquee from "@/components/Marquee";
import { services } from "@/content/data";

// rounded, so the server and the browser print the same numbers (no hydration warning)
const r2 = (v: number) => Math.round(v * 100) / 100;

gsap.registerPlugin(ScrollTrigger, useGSAP);

function Spark() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-[0.55em] shrink-0">
      <path d="M12 0c.9 6.6 4.8 10.6 12 12-7.2 1.4-11.1 5.4-12 12-.9-6.6-4.8-10.6-12-12C7.2 10.6 11.1 6.6 12 0Z" fill="currentColor" />
    </svg>
  );
}

function Arrows() {
  return (
    <svg aria-hidden viewBox="0 0 20 10" className="h-2.5 w-5">
      <path d="M0 5 6 0v10Zm20 0-6 5V0Z" fill="currentColor" />
    </svg>
  );
}

const BARS = 26;

export default function ServiceBand() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(
        "[data-dial]",
        { rotate: -40 },
        { rotate: 50, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } },
      );
      // waveform: every bar breathes at its own pace
      gsap.utils.toArray<HTMLElement>("[data-bar]", root.current).forEach((b, i) => {
        gsap.to(b, { scaleY: 0.25 + ((i * 37) % 10) / 14, duration: 0.35 + ((i * 13) % 7) / 10, repeat: -1, yoyo: true, ease: "sine.inOut" });
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-label="Services"
      data-pose="band"
      className="relative z-10 -my-24 overflow-hidden bg-[#d6e3bf] pb-44 pt-48 text-ink [clip-path:polygon(0_13%,50%_13%,57%_0,100%_0,100%_87%,62%_87%,55%_100%,0_100%)]"
    >
      <div className="absolute right-5 top-[17%] flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest md:right-8">
        <span aria-hidden className="flex h-5 items-center gap-[2px]">
          {Array.from({ length: BARS }, (_, i) => (
            <span key={i} data-bar className="block h-full w-[2px] origin-center rounded-full bg-ink" style={{ transform: `scaleY(${0.3 + ((i * 7) % 5) / 7})` }} />
          ))}
        </span>
        Live
      </div>

      <Marquee duration={50}>
        {services.map((s) => (
          <div key={s.id} className="flex shrink-0 items-start">
            <div className="px-[2vw]">
              <p className="flex items-center gap-[0.35em] whitespace-nowrap font-display text-[13vw] font-normal leading-none tracking-tight md:text-[5.2vw]">
                <Spark />
                {s.kicker} —
              </p>
              <p className="mt-5 pl-[9vw] font-mono text-[10px] uppercase tracking-widest md:pl-[3.4vw]">
                {s.number} {s.title}
              </p>
              <p className="mt-1 max-w-[18rem] pl-[9vw] text-[11px] leading-snug text-ink/60 md:pl-[3.4vw]">{s.tools.slice(0, 3).join(", ")}.</p>
            </div>
            <span className="mt-[1.6vw] flex items-center gap-2 px-[1.5vw] font-mono text-[9px] uppercase leading-tight tracking-widest">
              <Arrows />
              <span>
                Open for
                <br />
                projects
              </span>
            </span>
          </div>
        ))}
      </Marquee>

      {/* the dial: tick marks on an arc, numbered every five */}
      <div aria-hidden className="pointer-events-none absolute bottom-[4%] left-1/2 hidden -translate-x-1/2 md:block">
        <svg data-dial viewBox="-110 -110 220 220" className="size-56 text-ink">
          {Array.from({ length: 21 }, (_, i) => {
            const a = ((-150 + i * 6) * Math.PI) / 180;
            const long = i % 5 === 0;
            const r1 = long ? 78 : 84;
            return (
              <g key={i}>
                <line x1={r2(Math.cos(a) * r1)} y1={r2(Math.sin(a) * r1)} x2={r2(Math.cos(a) * 92)} y2={r2(Math.sin(a) * 92)} stroke="currentColor" strokeWidth={long ? 1.6 : 1} />
                {long && (
                  <text x={r2(Math.cos(a) * 66)} y={r2(Math.sin(a) * 66 + 3)} fontSize="9" textAnchor="middle" fill="currentColor" className="font-mono">
                    {i / 5 + 1}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
