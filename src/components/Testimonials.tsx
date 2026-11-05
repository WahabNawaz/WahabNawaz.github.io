"use client";

import { useState } from "react";
import { testimonials } from "@/content/data";

export default function Testimonials() {
  const [i, setI] = useState(0);
  const n = testimonials.length;
  const t = testimonials[i];
  const go = (d: number) => setI((v) => (v + d + n) % n);

  return (
    <div className="rounded-3xl border border-line bg-white/60 p-8 backdrop-blur md:p-12">
      <div className="flex items-center justify-between font-mono text-xs uppercase tracking-widest text-muted">
        <span>What clients say</span>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => go(-1)} aria-label="Previous review" className="size-9 rounded-full border border-line hover:bg-ink hover:text-paper">
            ←
          </button>
          <span aria-live="polite">
            {String(i + 1).padStart(2, "0")}/{String(n).padStart(2, "0")}
          </span>
          <button type="button" onClick={() => go(1)} aria-label="Next review" className="size-9 rounded-full border border-line hover:bg-ink hover:text-paper">
            →
          </button>
        </div>
      </div>
      <blockquote key={i} className="mt-10 animate-[fadeIn_.5s_ease]">
        <p className="font-display text-3xl font-medium leading-tight tracking-tight md:text-4xl">“{t.quote}”</p>
        <footer className="mt-6 font-mono text-xs uppercase tracking-widest">
          {t.name} · <span className="text-muted">{t.company}</span> · ★ 5.0
        </footer>
      </blockquote>
    </div>
  );
}
