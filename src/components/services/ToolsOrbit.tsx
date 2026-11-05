"use client";

// "What it's built with": tabs per service, a numbered tool list, and every
// tool orbiting the 3D character on two rings (GSAP). The section pins while
// in view so the rings stay centred on the character.
import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { services } from "@/content/data";
import { Label } from "@/components/ui";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const ALL = [...new Set(services.flatMap((s) => s.tools))];
const INNER = ALL.filter((_, i) => i % 2 === 0);
const OUTER = ALL.filter((_, i) => i % 2 === 1);

function Ring({ tools, radius, active, dir }: { tools: string[]; radius: string; active: Set<string>; dir: 1 | -1 }) {
  return (
    <div data-ring={dir} className="absolute inset-0">
      {tools.map((t, i) => {
        const angle = (i / tools.length) * 360;
        return (
          <div
            key={t}
            className="absolute left-1/2 top-1/2"
            style={{ transform: `rotate(${angle}deg) translateX(${radius}) rotate(${-angle}deg)` }}
          >
            <span
              data-chip={dir}
              className={`block -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider shadow-sm transition-colors duration-300 ${
                active.has(t) ? "bg-ink text-paper" : "bg-white text-ink/60"
              }`}
            >
              {t}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function ToolsOrbit() {
  const root = useRef<HTMLElement>(null);
  const [tab, setTab] = useState(0);
  const service = services[tab];
  const active = new Set(service.tools);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!reduce) {
        [1, -1].forEach((dir) => {
          const duration = dir === 1 ? 60 : 80;
          gsap.to(`[data-ring="${dir}"]`, { rotation: 360 * dir, duration, ease: "none", repeat: -1 });
          // chips spin back so their text stays upright
          gsap.to(`[data-chip="${dir}"]`, { rotation: -360 * dir, duration, ease: "none", repeat: -1 });
        });
      }
      // pin only on desktop, where the rings are shown
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        ScrollTrigger.create({ trigger: root.current, start: "top top", end: "+=80%", pin: true });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} data-pose="orbit" className="relative overflow-hidden px-5 py-24 md:h-svh md:px-8 md:py-0">
      <div className="relative z-10 flex h-full flex-col justify-center md:w-[42%]">
        <Label>What it&apos;s built with</Label>
        <div role="tablist" aria-label="Services" className="mt-6 flex flex-wrap gap-2">
          {services.map((s, i) => (
            <button
              key={s.id}
              role="tab"
              type="button"
              aria-selected={tab === i}
              onClick={() => setTab(i)}
              className={`rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-widest transition-colors ${
                tab === i ? "bg-ink text-paper" : "bg-white/70 hover:bg-white"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
        <ol key={service.id} role="tabpanel" className="mt-8 grid grid-cols-2 gap-x-6 border-t border-line">
          {service.tools.map((t, i) => (
            <li key={t} className="flex gap-3 border-b border-line py-3 animate-[fadeIn_.4s_ease_both]" style={{ animationDelay: `${i * 40}ms` }}>
              <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
              <span className="font-display text-lg font-semibold tracking-tight">{t}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* rings: centred where the character stands (poses.ts "orbit": x 0.45 → 72.5% of the width) */}
      <div aria-hidden className="pointer-events-none absolute left-[72.5%] top-[58%] hidden size-0 md:block">
        <div className="absolute -left-[22vh] -top-[22vh] size-[44vh] rounded-full border border-dashed border-line" />
        <div className="absolute -left-[34vh] -top-[34vh] size-[68vh] rounded-full border border-dashed border-line" />
        <div className="absolute -left-[22vh] -top-[22vh] size-[44vh]">
          <Ring tools={INNER} radius="22vh" active={active} dir={1} />
        </div>
        <div className="absolute -left-[34vh] -top-[34vh] size-[68vh]">
          <Ring tools={OUTER} radius="34vh" active={active} dir={-1} />
        </div>
      </div>
    </section>
  );
}
