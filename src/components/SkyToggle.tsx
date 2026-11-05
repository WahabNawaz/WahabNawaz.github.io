"use client";

import { sceneStore, useSky, type SkyMode } from "@/lib/scene-store";

const MODES: { id: SkyMode; label: string; icon: string }[] = [
  { id: "day", label: "Day", icon: "☀" },
  { id: "sunset", label: "Sunset", icon: "◐" },
  { id: "night", label: "Night", icon: "☾" },
];

export default function SkyToggle() {
  const sky = useSky();
  return (
    <div role="group" aria-label="Sky" className="inline-flex gap-1 rounded-full border border-current/20 bg-white/30 p-1 backdrop-blur">
      {MODES.map((m) => (
        <button
          key={m.id}
          type="button"
          aria-pressed={sky === m.id}
          onClick={() => sceneStore.setSky(m.id)}
          className={`rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-colors ${
            sky === m.id ? "bg-ink text-paper" : "hover:bg-white/40"
          }`}
        >
          <span aria-hidden className="mr-1">{m.icon}</span>
          {m.label}
        </button>
      ))}
    </div>
  );
}
