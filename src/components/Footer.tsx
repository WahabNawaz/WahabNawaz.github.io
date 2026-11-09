"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { nav, site } from "@/content/site";
import { sceneStore } from "@/lib/scene-store";
import RollText from "./RollText";

const Sky = dynamic(() => import("./scene/Sky"), { ssr: false });

gsap.registerPlugin(ScrollTrigger, useGSAP);

function LocalTime() {
  const [time, setTime] = useState<string>("--:--");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: site.timeZone,
    });
    const update = () => setTime(fmt.format(new Date()));
    update();
    const id = setInterval(update, 15_000);
    return () => clearInterval(id);
  }, []);
  return <span suppressHydrationWarning>{time}</span>;
}

export default function Footer() {
  const lenis = useLenis();
  const ref = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const home = (pathname.replace(/\/$/, "") || "/") === "/";

  // Home page, like the reference: the footer slides up over the end of the
  // page at 40% of the scroll speed (its body starts 60% of its height higher
  // and settles as the page reaches the bottom). The 3D character is told as soon as the
  // body shows at the bottom of the screen; it stands on the right and rises
  // with it (poses.ts footerPose). Other pages keep a still footer, so it
  // never covers buttons near the end of the page.
  useGSAP(
    () => {
      const el = ref.current;
      const body = el?.querySelector<HTMLElement>("[data-footer-body]");
      if (!el || !body) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // where the footer starts on the page; on short pages the lift is smaller,
      // so the footer never shows (or covers content) before you scroll
      const docTop = () => el.getBoundingClientRect().top + window.scrollY;
      const lift = () => (reduce || !home ? 0 : Math.min(body.offsetHeight * 0.6, Math.max(0, docTop() - window.innerHeight)));
      if (!reduce && home) {
        gsap.fromTo(
          body,
          { y: () => -lift() },
          {
            y: 0,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom bottom", scrub: true, invalidateOnRefresh: true },
          },
        );
      }
      ScrollTrigger.create({
        trigger: el,
        // when the footer's top (as seen, lifted) reaches 92% of the screen
        start: () => docTop() - lift() - window.innerHeight * 0.92,
        end: "bottom top",
        invalidateOnRefresh: true,
        onToggle: (self) => sceneStore.setFooter(self.isActive),
        onRefresh: (self) => sceneStore.setFooter(self.isActive),
      });
      return () => sceneStore.setFooter(false);
    },
    { dependencies: [home], revertOnUpdate: true },
  );

  return (
    <footer ref={ref} data-site-footer className="relative isolate z-10 text-ink">
      <div data-footer-body className="relative overflow-hidden px-5 pb-6 pt-16 md:flex md:min-h-[70svh] md:flex-col md:px-8 md:pt-[11svh]">
        {/* a bright day sky with soft clouds, like the reference, whatever the
            hero's sky is set to; the character stands on the right (poses.ts
            footerPose) */}
        <Sky mode="day" className="absolute inset-0 -z-10 bg-[#b9c9e4]" />
        <p className="text-sm font-semibold opacity-80 md:text-[11px] md:font-normal md:opacity-70">Lorem ipsum? Good sign.</p>
        {/* phones, like the reference: the heading big on the left, the email
            block under it on the right */}
        <div className="mt-2 grid gap-12 md:mt-1 md:grid-cols-[42%_1fr] md:gap-8 md:pr-[22%]">
          <h2 className="font-display text-[12.5vw] font-normal leading-[1.02] tracking-tight md:text-[4.4vw]">
            Got something
            <br />
            worth building?
          </h2>
          <div className="text-right md:pt-[4.4vw] md:text-left">
            <p className="text-xs">Email me</p>
            <a href={`mailto:${site.email}`} className="mt-1 inline-block font-display text-3xl tracking-tight hover:text-accent md:text-[3.3vw]">
              {site.email}
            </a>
            <p className="mt-2 text-xs">Lorem ipsum within a day.</p>
          </div>
        </div>

        {/* pushes the columns to the bottom of the footer */}
        <div aria-hidden className="hidden md:block md:min-h-14 md:flex-1" />
        <div className="mt-14 grid grid-cols-2 gap-8 border-t border-current/25 pt-5 text-sm md:mr-[31%] md:mt-0 md:grid-cols-4">
          <div>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-widest opacity-60">Pages</p>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-1">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="hover:text-accent">
                    <RollText text={n.label} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* (on phones the character stands to the right of this column) */}
          <div data-footer-stand>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-widest opacity-60">Social</p>
            <ul className="space-y-1">
              {site.socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer" className="hover:text-accent">
                    <RollText text={s.label} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-widest opacity-60">Local time</p>
            <p>
              <LocalTime /> · {site.location}
            </p>
          </div>
          <div>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-widest opacity-60">Status</p>
            <p className="flex items-center gap-2">
              <span className="size-2 animate-pulse rounded-full bg-accent" /> {site.status}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest opacity-60 md:mr-[31%]">
          <span>© {site.year} {site.name}</span>
          <button type="button" onClick={() => lenis?.scrollTo(0)} className="hover:text-accent">
            Back to top ↑
          </button>
        </div>
      </div>
    </footer>
  );
}
