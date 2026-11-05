"use client";

// Day / Sunset / Night switch: three round icon buttons and a small track with
// a dot that slides to the chosen mode.
import { sceneStore, useSky, type SkyMode } from "@/lib/scene-store";

const MODES: { id: SkyMode; label: string; icon: React.ReactNode }[] = [
  {
    id: "day",
    label: "Day",
    icon: (
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    ),
  },
  {
    id: "sunset",
    label: "Sunset",
    icon: (
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M7 17a5 5 0 0 1 10 0M3 17h18M12 7v3M5.6 10.6l1.4 1.4M18.4 10.6 17 12" />
      </svg>
    ),
  },
  {
    id: "night",
    label: "Night",
    icon: (
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
      </svg>
    ),
  },
];

export default function SkyToggle() {
  const sky = useSky();
  const index = MODES.findIndex((m) => m.id === sky);

  return (
    <div role="group" aria-label="Sky" className="flex flex-col items-center gap-2">
      <div className="flex gap-3">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            aria-pressed={sky === m.id}
            aria-label={m.label}
            title={m.label}
            onClick={() => sceneStore.setSky(m.id)}
            className={`grid size-11 place-items-center rounded-full transition-all duration-300 ${
              sky === m.id ? "border border-current opacity-100" : "opacity-50 hover:opacity-100"
            }`}
          >
            {m.icon}
          </button>
        ))}
      </div>
      {/* track: the dot sits under the active mode */}
      <div aria-hidden className="relative h-px w-40 bg-current/30">
        {MODES.map((m, i) => (
          <span key={m.id} className="absolute top-1/2 h-2 w-px -translate-y-1/2 bg-current/40" style={{ left: `${(i / (MODES.length - 1)) * 100}%` }} />
        ))}
        <span
          className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current transition-[left] duration-500 ease-out"
          style={{ left: `${(Math.max(0, index) / (MODES.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}
