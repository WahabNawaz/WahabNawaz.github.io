"use client";

// Showreel button + full-screen modal with a video. Set `site.showreel` to a
// video path in /public (e.g. "/video/showreel.mp4") to fill it.
import { useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { site } from "@/content/site";
import { asset } from "@/lib/scene-store";

export default function Showreel() {
  const [open, setOpen] = useState(false);
  const close = useRef<HTMLButtonElement>(null);
  const lenis = useLenis();

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    close.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
    };
  }, [open, lenis]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-ink px-5 py-3 font-mono text-xs uppercase tracking-widest text-paper hover:bg-accent hover:text-ink"
      >
        ▶ Showreel
      </button>

      {open && (
        <div role="dialog" aria-modal="true" aria-label="Showreel" className="fixed inset-0 z-[60] grid place-items-center bg-ink/90 p-5" data-lenis-prevent>
          <div className="w-full max-w-5xl">
            {site.showreel ? (
              <video src={asset(site.showreel)} className="aspect-video w-full rounded-2xl bg-black" controls autoPlay playsInline />
            ) : (
              <div className="grid aspect-video w-full place-items-center rounded-2xl bg-gradient-to-br from-accent to-ink font-mono text-xs uppercase tracking-widest text-paper/80">
                Your showreel video goes here (site.showreel)
              </div>
            )}
            <div className="mt-4 text-center">
              <button ref={close} type="button" onClick={() => setOpen(false)} className="rounded-full bg-paper px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-ink">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
