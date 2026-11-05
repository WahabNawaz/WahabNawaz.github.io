"use client";

// Photo gallery: one photo per row with a caption, and a sticky thumbnail rail
// that highlights the photo in view. Click a thumbnail to jump to it.
// Placeholders are gradients: put real photos in /public/photos and swap them in.
import { useRef, useState } from "react";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type Photo = { id: string; title: string; caption: string; colors: [string, string]; ratio: string };

export default function Gallery({ photos }: { photos: Photo[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
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
                className={`block h-12 w-full rounded-md outline-offset-2 transition-all duration-300 ${
                  active === i ? "scale-105 outline outline-2 outline-ink" : "opacity-50 hover:opacity-100"
                }`}
                style={{ background: `linear-gradient(135deg, ${p.colors[0]}, ${p.colors[1]})` }}
              />
            </li>
          ))}
        </ul>
      </nav>

      <ol className="space-y-24">
        {photos.map((p, i) => (
          <li key={p.id} data-photo className="grid items-end gap-6 md:grid-cols-[1.6fr_1fr]">
            <div
              data-img
              role="img"
              aria-label={`${p.title} (placeholder)`}
              className="w-full overflow-hidden rounded-xl"
              style={{ aspectRatio: p.ratio, background: `radial-gradient(120% 100% at 30% 20%, ${p.colors[1]}, ${p.colors[0]} 60%, #111114)` }}
            />
            <div>
              <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">{p.title}</h2>
              <p className="mt-2 text-ink/70">{p.caption}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
