"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav, site } from "@/content/site";

export default function Header() {
  const pathname = usePathname();
  // The menu remembers the page it was opened on, so it closes by itself
  // as soon as you navigate somewhere else.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;
  const setOpen = (v: boolean | ((prev: boolean) => boolean)) => {
    const next = typeof v === "function" ? v(open) : v;
    setOpenedOn(next ? pathname : null);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenedOn(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.replace(/\/$/, ""));

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-4 mix-blend-difference text-white md:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label={`${site.name}, home`}>
          <span className="grid size-9 place-items-center rounded-full border border-white font-mono text-xs">
            {site.shortName}
          </span>
          <span className="hidden font-display text-sm font-semibold tracking-tight sm:block">
            {site.name}
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="site-menu"
          className="font-mono text-xs uppercase tracking-widest"
        >
          {open ? "Close" : "Menu"}
        </button>
      </header>

      <div
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`fixed inset-0 z-40 flex flex-col justify-between bg-ink px-5 pb-8 pt-24 text-paper transition-[clip-path] duration-700 ease-[cubic-bezier(.76,0,.24,1)] md:px-8 ${
          open ? "[clip-path:inset(0_0_0_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]"
        }`}
        data-lenis-prevent
      >
        <nav>
          <ul className="space-y-1">
            {nav.map((item, i) => (
              <li key={item.href} className="overflow-hidden">
                <Link
                  href={item.href}
                  tabIndex={open ? 0 : -1}
                  className={`group flex items-baseline gap-4 font-display text-5xl font-semibold uppercase leading-[1.05] tracking-tight transition-transform duration-700 md:text-7xl ${
                    open ? "translate-y-0" : "translate-y-full"
                  }`}
                  style={{ transitionDelay: open ? `${120 + i * 50}ms` : "0ms" }}
                >
                  <span className="font-mono text-xs text-accent">0{i + 1}</span>
                  <span className={isActive(item.href) ? "text-accent" : "group-hover:text-accent"}>
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-wrap items-end justify-between gap-4 font-mono text-xs uppercase tracking-widest">
          <a href={`mailto:${site.email}`} tabIndex={open ? 0 : -1} className="hover:text-accent">
            {site.email}
          </a>
          <div className="flex gap-4">
            {site.socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" tabIndex={open ? 0 : -1} className="hover:text-accent">
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
