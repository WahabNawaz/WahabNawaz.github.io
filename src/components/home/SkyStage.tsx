"use client";

// Keeps the sky (and hero art) behind several sections: the sky sticks to the
// screen while the hero, the big name and the statement scroll over it.
// Text switches to light colours at night.
import dynamic from "next/dynamic";
import { useSky } from "@/lib/scene-store";

const Sky = dynamic(() => import("@/components/scene/Sky"), { ssr: false });

export default function SkyStage({ children }: { children: React.ReactNode }) {
  const night = useSky() === "night";
  return (
    <div className={`relative isolate transition-colors duration-700 ${night ? "text-paper" : "text-ink"}`}>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="sticky top-0 h-svh">
          <Sky art className="h-full w-full bg-[#cfe0f0]" />
        </div>
      </div>
      {children}
    </div>
  );
}
