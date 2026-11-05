"use client";

import { useId, useState } from "react";

export default function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();

  return (
    <ul className="border-t border-line">
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${base}-panel-${i}`;
        return (
          <li key={item.q} className="border-b border-line">
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center gap-6 py-6 text-left"
              >
                <span className="font-mono text-xs text-muted">0{i + 1}</span>
                <span className="flex-1 font-display text-xl font-medium tracking-tight md:text-2xl">{item.q}</span>
                <span
                  aria-hidden
                  className={`grid size-8 place-items-center rounded-full border border-line transition-transform duration-300 ${isOpen ? "rotate-45 bg-ink text-paper" : ""}`}
                >
                  +
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              className={`grid transition-[grid-template-rows] duration-500 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="overflow-hidden">
                <p className="max-w-2xl pb-6 pl-12 leading-relaxed text-ink/75">{item.a}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
