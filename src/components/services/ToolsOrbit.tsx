"use client";

// "What it's built with": tabs per service, a numbered tool list, and every
// tool orbiting the 3D character on two rings. The rings spin slowly by
// themselves; drag (or swipe) round the ring to spin them, and they coast
// and slow down after you let go. The section pins while in view so the
// rings stay centred on the character.
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
      // one angle drives both rings (outer turns the other way, a bit slower);
      // chips turn back by the same amount so their text stays upright
      const set = [1, -1].map((dir) => ({
        dir,
        ring: gsap.quickSetter(`[data-ring="${dir}"]`, "rotation", "deg"),
        chips: gsap.quickSetter(`[data-chip="${dir}"]`, "rotation", "deg"),
      }));
      let angle = 0;
      let vel = 0; // degrees per second, while coasting
      let dragging = false;
      const draw = () =>
        set.forEach(({ dir, ring, chips }) => {
          const a = dir === 1 ? angle : -angle * 0.75;
          ring(a);
          chips(-a);
        });
      const tick = (_t: number, ms: number) => {
        const dt = ms / 1000;
        if (!dragging) {
          if (Math.abs(vel) > 3) {
            angle += vel * dt;
            vel *= Math.exp(-dt * 2.2); // friction
          } else {
            vel = 0;
            if (!reduce) angle += dt * 6; // slow spin on its own
          }
        }
        draw();
      };
      gsap.ticker.add(tick);

      // Drag round the ring: the angle of the pointer around the ring's centre
      // (measured on screen, so pinning and scrolling do not matter).
      const area = root.current?.querySelector<HTMLElement>("[data-spin]");
      let last = 0;
      let lastT = 0;
      const angleAt = (e: PointerEvent) => {
        const r = area!.getBoundingClientRect();
        return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
      };
      const down = (e: PointerEvent) => {
        dragging = true;
        vel = 0;
        last = angleAt(e);
        lastT = performance.now();
        area!.setPointerCapture(e.pointerId);
        area!.dataset.dragging = "";
      };
      const move = (e: PointerEvent) => {
        if (!dragging) return;
        const now = performance.now();
        let d = angleAt(e) - last;
        if (d > 180) d -= 360;
        if (d < -180) d += 360;
        angle += d;
        vel = vel * 0.4 + (d / Math.max(0.008, (now - lastT) / 1000)) * 0.6;
        last += d;
        lastT = now;
      };
      const up = () => {
        if (!dragging) return;
        dragging = false;
        if (performance.now() - lastT > 120) vel = 0; // held still before letting go
        vel = gsap.utils.clamp(-720, 720, vel);
        delete area!.dataset.dragging;
      };
      area?.addEventListener("pointerdown", down);
      area?.addEventListener("pointermove", move);
      area?.addEventListener("pointerup", up);
      area?.addEventListener("pointercancel", up);
      const cleanup = () => {
        gsap.ticker.remove(tick);
        area?.removeEventListener("pointerdown", down);
        area?.removeEventListener("pointermove", move);
        area?.removeEventListener("pointerup", up);
        area?.removeEventListener("pointercancel", up);
      };

      // pin only on large screens, where the rings are shown
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        ScrollTrigger.create({ trigger: root.current, start: "top top", end: "+=80%", pin: true });
      });
      return cleanup;
    },
    { scope: root },
  );

  return (
    <section ref={root} data-pose="orbit" className="relative overflow-hidden px-5 py-24 md:px-8 lg:h-svh lg:py-0">
      <div className="relative z-10 flex h-full flex-col justify-center lg:w-[42%]">
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
      <div aria-hidden className="absolute left-[72.5%] top-[58%] hidden size-0 lg:block">
        {/* drag surface: the whole outer ring */}
        <div
          data-spin
          className="group absolute -left-[34vh] -top-[34vh] size-[68vh] cursor-grab select-none rounded-full active:cursor-grabbing data-[dragging]:cursor-grabbing"
          style={{ touchAction: "pan-y" }}
        >
          <span className="pointer-events-none absolute bottom-[6%] left-1/2 -translate-x-1/2 rounded-full bg-ink px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-paper opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            Drag to spin
          </span>
        </div>
        <div className="pointer-events-none absolute -left-[22vh] -top-[22vh] size-[44vh] rounded-full border border-dashed border-line" />
        <div className="pointer-events-none absolute -left-[34vh] -top-[34vh] size-[68vh] rounded-full border border-dashed border-line" />
        <div className="pointer-events-none absolute -left-[22vh] -top-[22vh] size-[44vh]">
          <Ring tools={INNER} radius="22vh" active={active} dir={1} />
        </div>
        <div className="pointer-events-none absolute -left-[34vh] -top-[34vh] size-[68vh]">
          <Ring tools={OUTER} radius="34vh" active={active} dir={-1} />
        </div>
      </div>
    </section>
  );
}
