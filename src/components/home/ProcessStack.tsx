"use client";

// Process steps as cards that stick and stack on top of each other while you
// scroll; the card underneath shrinks back a little (GSAP scrub).
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { process } from "@/content/data";
import { Label } from "@/components/ui";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const COLORS = ["#ff6a3d", "#3d5aff", "#1f9d74", "#9b3dff"];

export default function ProcessStack() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-step]", root.current);
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        gsap.to(card, {
          scale: 0.92,
          opacity: 0.55,
          ease: "none",
          scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: "top 20%", scrub: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} data-pose="left" className="px-5 py-32 md:px-8 md:pl-[26%]">
      <Label>How a project runs</Label>
      <h2 className="mt-4 max-w-3xl font-display text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl">
        Four steps, nothing hidden.
      </h2>
      <ol className="mt-16">
        {process.map((p, i) => (
          <li key={p.step} data-step className="sticky mb-8 origin-top" style={{ top: `${96 + i * 18}px` }}>
            <div className={`grid gap-6 rounded-3xl bg-white p-6 shadow-sm md:grid-cols-2 md:p-8 ${i % 2 ? "md:[direction:rtl]" : ""}`}>
              {/* media slot: put a short video or image here */}
              <div
                className="grid aspect-video place-items-center rounded-2xl font-mono text-xs uppercase tracking-widest text-white/80 [direction:ltr]"
                style={{ background: `linear-gradient(135deg, ${COLORS[i % COLORS.length]}, #111114)` }}
              >
                Video / image
              </div>
              <div className="flex flex-col justify-center [direction:ltr]">
                <span className="font-mono text-xs text-accent">Step {p.step}</span>
                <h3 className="mt-3 font-display text-4xl font-semibold tracking-tight">{p.title}</h3>
                <p className="mt-3 text-ink/70">{p.text}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
