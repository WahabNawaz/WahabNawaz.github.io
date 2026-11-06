"use client";

// Photo gallery: one photo per row with a caption, and a sticky thumbnail rail
// that highlights the photo in view. Click a thumbnail to jump to it.
// Click a photo to open the lightbox. Images are WebP in 3 widths
// (<src>-160|800|1600.webp), lazy-loaded.
import { useRef, useState } from "react";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lightbox from "./Lightbox";
import { asset } from "@/lib/asset";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type Photo = {
  id: string;
  title: string;
  caption: string;
  ratio: string; // CSS aspect-ratio, e.g. "3 / 2"
  src: string; // path without the "-800.webp" ending
  credit?: { author: string; url: string }; // demo / stock photos
  demo?: boolean;
};

export const photoUrl = (p: Photo, w: 160 | 800 | 1600) => asset(`${p.src}-${w}.webp`);
export const photoSrcSet = (p: Photo) => `${photoUrl(p, 800)} 800w, ${photoUrl(p, 1600)} 1600w`;

export function PhotoCredit({ photo, className = "" }: { photo: Photo; className?: string }) {
  if (!photo.credit) return null;
  return (
    <p className={`font-mono text-[11px] uppercase tracking-widest ${className}`}>
      {photo.demo ? "Demo photo" : "Photo"} ·{" "}
      <a href={photo.credit.url} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
        {photo.credit.author} / Unsplash
      </a>
    </p>
  );
}

export default function Gallery({ photos }: { photos: Photo[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const lenis = useLenis();

  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>("[data-photo]", root.current).forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => self.isActive && setActive(i),
        });
        gsap.from(el.querySelector("[data-img]"), {
          clipPath: "inset(12% 12% 12% 12%)",
          scale: 1.08,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });
    },
    { scope: root },
  );

  const jump = (i: number) => {
    const el = root.current?.querySelectorAll<HTMLElement>("[data-photo]")[i];
    if (el) lenis?.scrollTo(el, { offset: -96 });
  };

  return (
    <div ref={root} className="grid gap-10 px-5 pb-32 md:grid-cols-[72px_1fr] md:px-8 md:pr-[24%]">
      <nav aria-label="Photos" className="hidden md:block">
        <ul className="sticky top-28 space-y-2">
          {photos.map((p, i) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => jump(i)}
                aria-label={`Go to ${p.title}`}
                aria-current={active === i}
                className={`block h-12 w-full overflow-hidden rounded-md bg-line outline-offset-2 transition-all duration-300 ${
                  active === i ? "scale-105 outline outline-2 outline-ink" : "opacity-50 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
                <img src={photoUrl(p, 160)} alt="" loading="lazy" decoding="async" className="size-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <ol className="space-y-24">
        {photos.map((p, i) => (
          <li key={p.id} data-photo className="grid items-end gap-6 md:grid-cols-[1.6fr_1fr]">
            <button
              type="button"
              data-img
              onClick={() => setOpen(i)}
              aria-label={`Open ${p.title}`}
              className="group relative block w-full cursor-zoom-in overflow-hidden rounded-xl bg-line"
              style={{ aspectRatio: p.ratio }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- static export, pre-sized WebP */}
              <img
                src={photoUrl(p, 800)}
                srcSet={photoSrcSet(p)}
                sizes="(min-width: 768px) 50vw, 92vw"
                alt={p.title}
                loading={i < 2 ? "eager" : "lazy"}
                decoding="async"
                className="size-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
              />
              <span className="pointer-events-none absolute bottom-4 right-4 translate-y-2 rounded-full bg-paper/90 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-ink opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                View ↗
              </span>
            </button>
            <div>
              <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">{p.title}</h2>
              <p className="mt-2 text-ink/70">{p.caption}</p>
              <PhotoCredit photo={p} className="mt-4 text-muted" />
            </div>
          </li>
        ))}
      </ol>

      {open !== null && <Lightbox photos={photos} index={open} onChange={setOpen} onClose={() => setOpen(null)} />}
    </div>
  );
}
