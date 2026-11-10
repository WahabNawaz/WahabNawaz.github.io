"use client";

// Day / Sunset / Night switch: a frosted glass capsule with the three icons; a
// round thumb springs to the chosen one. Under it a hairline track whose knob
// follows, and the mode's name, which rolls to the new one.
// The hero animates its parts on scroll through the data-sky-* hooks.
import { sceneStore, useSky, type SkyMode } from "@/lib/scene-store";

const MODES: { id: SkyMode; label: string; icon: React.ReactNode }[] = [
  {
    id: "day",
    label: "Day",
    icon: (
      <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    ),
  },
  {
    id: "sunset",
    label: "Sunset",
    icon: (
      <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M7 17a5 5 0 0 1 10 0M3 17h18M12 7v3M5.6 10.6l1.4 1.4M18.4 10.6 17 12" />
      </svg>
    ),
  },
  {
    id: "night",
    label: "Night",
    icon: (
      <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
      </svg>
    ),
  },
];

// button 40px + gap 4px
const STEP = 44;
const SPRING = "cubic-bezier(.34,1.56,.64,1)";

export default function SkyToggle() {
  const sky = useSky();
  const index = Math.max(0, MODES.findIndex((m) => m.id === sky));
  const night = sky === "night";

  return (
    <div role="group" aria-label="Sky" className="flex flex-col items-start gap-3">
      <div
        data-sky-capsule
        className={`relative flex gap-1 rounded-full border p-1 backdrop-blur-md transition-colors duration-700 ${
          night
            ? "border-white/15 bg-white/[0.08] shadow-[0_12px_32px_-14px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.12)]"
            : "border-white/50 bg-white/30 shadow-[0_12px_32px_-14px_rgba(30,36,80,0.45),inset_0_1px_0_rgba(255,255,255,0.7)]"
        }`}
      >
        {/* the thumb behind the chosen icon */}
        <span
          aria-hidden
          className="absolute left-1 top-1 size-10 transition-transform duration-700"
          style={{ transform: `translateX(${index * STEP}px)`, transitionTimingFunction: SPRING }}
        >
          <span data-sky-thumb className="block size-full rounded-full bg-current shadow-[0_6px_16px_-6px_rgba(10,12,30,0.55)]" />
        </span>
        {MODES.map((m) => {
          const on = sky === m.id;
          return (
            <button
              key={m.id}
              data-sky-btn
              type="button"
              aria-pressed={on}
              aria-label={m.label}
              title={m.label}
              onClick={() => sceneStore.setSky(m.id)}
              className={`relative grid size-10 place-items-center rounded-full transition-[color,opacity,transform] duration-500 ${
                on ? (night ? "text-ink" : "text-paper") : "opacity-55 hover:scale-110 hover:opacity-100"
              }`}
            >
              <span data-sky-icon className="grid place-items-center">
                {m.icon}
              </span>
            </button>
          );
        })}
      </div>

      {/* hairline track (its ends under the first and last icon) and the name */}
      <div aria-hidden className="flex items-center gap-3 pl-[24px]">
        <div data-sky-track className="relative h-px w-[88px] origin-left bg-current/25">
          {MODES.map((m, i) => (
            <span key={m.id} className="absolute top-1/2 h-1.5 w-px -translate-y-1/2 bg-current/35" style={{ left: `${(i / (MODES.length - 1)) * 100}%` }} />
          ))}
          <span
            className="absolute -left-[5px] top-1/2 size-2.5 transition-transform duration-700"
            style={{ transform: `translate(${index * STEP}px, -50%)`, transitionTimingFunction: SPRING }}
          >
            <span data-sky-knob className="block size-full rounded-full bg-current shadow-[0_0_0_4px_rgba(255,255,255,0.35)]" />
          </span>
        </div>
        <span className="relative block h-4 overflow-hidden font-mono text-[10px] uppercase leading-4 tracking-[0.22em]">
          <span data-sky-name className="block">
            <span className="block transition-transform duration-700" style={{ transform: `translateY(${-index * 16}px)`, transitionTimingFunction: SPRING }}>
              {MODES.map((m) => (
                <span key={m.id} className="block h-4 opacity-70">
                  {m.label}
                </span>
              ))}
            </span>
          </span>
        </span>
      </div>
    </div>
  );
}
