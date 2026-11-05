"use client";

// Work reel: the section pins and scrolling flips through projects one by one
// (cards shuffle in a 3D stack). "Mix" rearranges the layout with GSAP Flip.
import { useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";
import { projects } from "@/content/data";
import { Cover } from "@/components/ui";
import RollText from "@/components/RollText";

gsap.registerPlugin(ScrollTrigger, Flip, useGSAP);

// Three arrangements of the same blocks (desktop). Mix cycles through them.
const LAYOUTS = [
  { cols: "1fr 1.7fr 1fr", areas: `"heading heading counter" "meta stage desc" "mix stage ."` },
  { cols: "1fr 1.7fr 1fr", areas: `"counter heading heading" "desc stage meta" ". stage mix"` },
  { cols: "1.2fr 1fr 1.2fr", areas: `"meta heading heading" "stage stage desc" "stage stage counter"` },
];

export default function WorkReel() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [layout, setLayout] = useState(0);
  const activeRef = useRef(0);
  const flipState = useRef<Flip.FlipState | null>(null);
  const n = projects.length;
  const project = projects[active];

  // Pin the section; scroll progress picks the project.
  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: () => `+=${(n - 1) * window.innerHeight * 0.75}`,
        pin: true,
        snap: { snapTo: 1 / (n - 1), duration: { min: 0.2, max: 0.6 }, ease: "power1.inOut" },
        onUpdate(self) {
          const i = Math.round(self.progress * (n - 1));
          if (i !== activeRef.current) {
            activeRef.current = i;
            setActive(i);
          }
        },
      });
    },
    { scope: root },
  );

  // Move every card to its place in the stack whenever the project changes.
  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]", root.current);
      cards.forEach((card, i) => {
        const k = (i - active + n) % n; // 0 = front
        gsap.to(card, {
          xPercent: k * 3,
          yPercent: -k * 7,
          scale: 1 - k * 0.07,
          rotation: k === 0 ? 0 : (k % 2 ? 3 : -3) * k,
          opacity: k > 2 ? 0 : 1 - k * 0.15,
          zIndex: n - k,
          duration: 0.9,
          ease: "power3.inOut",
          overwrite: true,
        });
      });
      // new text slides up
      gsap.fromTo(
        "[data-swap]",
        { yPercent: 100, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.6, stagger: 0.04, ease: "power3.out" },
      );
    },
    { dependencies: [active], scope: root },
  );

  // Animate the layout change captured by mix().
  useGSAP(
    () => {
      if (!flipState.current) return;
      Flip.from(flipState.current, { duration: 0.9, ease: "power3.inOut", absolute: true, stagger: 0.03 });
      flipState.current = null;
    },
    { dependencies: [layout], scope: root },
  );

  const mix = () => {
    flipState.current = Flip.getState(gsap.utils.toArray("[data-flip]", root.current));
    setLayout((l) => (l + 1) % LAYOUTS.length);
  };

  const L = LAYOUTS[layout];

  return (
    <section ref={root} aria-label="Selected work" className="relative h-svh overflow-hidden px-5 pb-6 pt-24 md:px-8">
      <div
        className="grid h-full grid-cols-1 gap-6 md:[grid-template-columns:var(--cols)] md:[grid-template-areas:var(--areas)] md:[grid-template-rows:auto_1fr_auto]"
        style={{ "--cols": L.cols, "--areas": L.areas } as React.CSSProperties}
      >
        <h1 data-flip className="font-display text-6xl font-semibold uppercase leading-[0.85] tracking-tight md:text-[7vw] md:[grid-area:heading]">
          Selected work
        </h1>

        <div data-flip className="relative self-center md:[grid-area:stage]">
          <div className="relative mx-auto aspect-[16/10] w-full max-w-3xl">
            {projects.map((p) => (
              <div key={p.slug} data-card className="absolute inset-0 overflow-hidden rounded-2xl shadow-2xl will-change-transform">
                <Cover project={p} className="h-full w-full" />
              </div>
            ))}
          </div>
        </div>

        <dl data-flip className="relative z-10 grid grid-cols-2 content-start gap-4 font-mono text-xs uppercase tracking-widest md:grid-cols-1 md:self-center md:[grid-area:meta]">
          {[
            ["Role", project.role],
            ["Client", project.client],
            ["Services", project.tags.join(", ")],
            ["Year", project.year],
          ].map(([k, v]) => (
            <div key={`${active}-${k}`} className="overflow-hidden">
              <dt className="text-muted">{k}</dt>
              <dd data-swap className="mt-1 normal-case tracking-normal">
                {v}
              </dd>
            </div>
          ))}
        </dl>

        <div data-flip className="relative z-10 flex flex-col justify-center gap-5 md:[grid-area:desc]">
          <div className="overflow-hidden">
            <h2 key={`t-${active}`} data-swap className="font-display text-3xl font-semibold uppercase tracking-tight">
              {project.title}
            </h2>
          </div>
          <div className="overflow-hidden">
            <p key={`s-${active}`} data-swap className="text-ink/75">
              {project.summary}
            </p>
          </div>
          <Link
            href={`/work/${project.slug}/`}
            className="inline-flex w-fit items-center gap-2 border-b border-ink pb-1 font-mono text-xs uppercase tracking-widest"
          >
            <RollText text="View project" /> <span aria-hidden>↗</span>
          </Link>
        </div>

        <div data-flip className="flex items-end gap-4 font-mono text-xs uppercase tracking-widest md:[grid-area:counter] md:justify-end">
          <span>
            {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>
          <span className="h-px w-24 bg-line">
            <span className="block h-full origin-left bg-ink transition-transform duration-500" style={{ transform: `scaleX(${(active + 1) / n})` }} />
          </span>
        </div>

        <div data-flip className="hidden items-end md:flex md:[grid-area:mix]">
          <button
            type="button"
            onClick={mix}
            className="rounded-full bg-ink px-5 py-3 font-mono text-xs uppercase tracking-widest text-paper hover:bg-accent hover:text-ink"
          >
            ↻ <RollText text="Mix" />
          </button>
        </div>
      </div>

      <p className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 font-mono text-[11px] uppercase tracking-widest text-muted md:block">
        Scroll to browse
      </p>
    </section>
  );
}
