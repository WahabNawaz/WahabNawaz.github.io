"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import { onIntroDone } from "@/lib/intro";
import { nav, site } from "@/content/site";
import RollText from "./RollText";
import SoundToggle from "./SoundToggle";

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

  const lenis = useLenis();
  const menuBtn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLElement>(null);

  // Opening: the bar slides in last, after the character and the headline.
  useEffect(() => {
    const el = bar.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.set(el, { yPercent: -120, autoAlpha: 0 });
    return onIntroDone(() => gsap.to(el, { yPercent: 0, autoAlpha: 1, duration: 0.9, delay: 0.9, ease: "power3.out" }));
  }, []);

  // While open: no page scrolling, focus moves into the menu and Tab stays
  // inside it; Escape closes and focus returns to the Menu button.
  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const links = () => [menuBtn.current, ...(panel.current?.querySelectorAll<HTMLElement>("a") ?? [])].filter(Boolean) as HTMLElement[];
    const t = setTimeout(() => panel.current?.querySelector<HTMLElement>("a")?.focus(), 350);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenedOn(null);
      if (e.key === "Tab") {
        const els = links();
        const i = els.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey && i <= 0) {
          e.preventDefault();
          els[els.length - 1]?.focus();
        } else if (!e.shiftKey && i === els.length - 1) {
          e.preventDefault();
          els[0]?.focus();
        }
      }
    };
    const btn = menuBtn.current;
    const box = panel.current;
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      lenis?.start();
      if (box?.contains(document.activeElement)) btn?.focus();
    };
  }, [open, lenis]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.replace(/\/$/, ""));

  return (
    <>
      <header ref={bar} className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-4 mix-blend-difference text-white md:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label={`${site.name}, home`}>
          <span className="grid size-9 place-items-center rounded-full border border-white font-mono text-xs">
            {site.shortName}
          </span>
          <span className="hidden font-display text-sm font-semibold tracking-tight sm:block">
            {site.name}
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <SoundToggle />
          <button
            ref={menuBtn}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-menu"
            className="font-mono text-xs uppercase tracking-widest"
          >
            <RollText key={open ? "close" : "menu"} text={open ? "Close" : "Menu"} />
          </button>
        </div>
      </header>

      <div
        ref={panel}
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
                    <RollText text={item.label} />
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
