"use client";

// Full-screen photo viewer: arrows / ← → keys / swipe to move, Esc or the
// close button to leave. Scrolling is paused while it is open.
import { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import { PhotoCredit, photoSrcSet, photoUrl, type Photo } from "./Gallery";

type Props = { photos: Photo[]; index: number; onChange: (i: number) => void; onClose: () => void };

export default function Lightbox({ photos, index, onChange, onClose }: Props) {
  const lenis = useLenis();
  const closeBtn = useRef<HTMLButtonElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const startX = useRef<number | null>(null);
  const p = photos[index];
  const n = photos.length;

  const go = (d: number) => onChange((index + d + n) % n);

  useEffect(() => {
    lenis?.stop();
    const opener = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus();
    return () => {
      lenis?.start();
      opener?.focus?.();
    };
  }, [lenis]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onChange((index + 1) % n);
      if (e.key === "ArrowLeft") onChange((index - 1 + n) % n);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, n, onChange, onClose]);

  useEffect(() => {
    if (img.current) gsap.fromTo(img.current, { autoAlpha: 0, scale: 0.96 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: "power3.out" });
    // warm up the neighbours so next / previous show at once
    [index + 1, index - 1].forEach((i) => {
      const q = photos[(i + n) % n];
      if (q) new Image().src = photoUrl(q, 1600);
    });
  }, [index, n, photos]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${p.title}, photo ${index + 1} of ${n}`}
      className="fixed inset-0 z-[70] flex flex-col bg-ink/95 p-4 text-paper md:p-8"
      data-lenis-prevent
      onPointerDown={(e) => (startX.current = e.clientX)}
      onPointerUp={(e) => {
        if (startX.current === null) return;
        const dx = e.clientX - startX.current;
        startX.current = null;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }}
    >
      <div className="flex items-center justify-between font-mono text-xs uppercase tracking-widest">
        <span>
          {String(index + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
        </span>
        <button ref={closeBtn} type="button" onClick={onClose} className="rounded-full border border-paper/30 px-4 py-2 hover:bg-paper hover:text-ink">
          Close ✕
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center gap-4 py-6">
        <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="hidden size-12 shrink-0 rounded-full border border-paper/30 hover:bg-paper hover:text-ink md:block">
          ←
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element -- static export, pre-sized WebP */}
        <img
          ref={img}
          key={p.id}
          src={photoUrl(p, 1600)}
          srcSet={photoSrcSet(p)}
          sizes="(min-width: 1024px) 64rem, 100vw"
          alt={p.title}
          draggable={false}
          className="max-h-[70vh] w-auto min-w-0 max-w-full select-none rounded-xl object-contain md:max-w-5xl"
          style={{ aspectRatio: p.ratio }}
        />
        <button type="button" onClick={() => go(1)} aria-label="Next photo" className="hidden size-12 shrink-0 rounded-full border border-paper/30 hover:bg-paper hover:text-ink md:block">
          →
        </button>
      </div>

      <div className="mx-auto max-w-xl text-center">
        <h2 className="font-display text-2xl font-semibold tracking-tight">{p.title}</h2>
        <p className="mt-1 text-paper/70">{p.caption}</p>
        <PhotoCredit photo={p} className="mt-3 text-paper/50" />
        <p className="mt-3 font-mono text-[11px] uppercase tracking-widest text-paper/40 md:hidden">Swipe to browse</p>
      </div>
    </div>
  );
}
