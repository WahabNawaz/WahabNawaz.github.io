"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { nav, site } from "@/content/site";
import { sceneStore } from "@/lib/scene-store";
import RollText from "./RollText";

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

  // Tell the 3D character when the footer is on screen (it moves aside).
  useGSAP(() => {
    ScrollTrigger.create({
      trigger: ref.current,
      start: "top 60%",
      end: "bottom top",
      onToggle: (self) => sceneStore.setFooter(self.isActive),
      onRefresh: (self) => sceneStore.setFooter(self.isActive),
    });
    return () => sceneStore.setFooter(false);
  });

  return (
    <footer ref={ref} className="relative z-10 bg-ink px-5 pb-8 pt-24 text-paper md:px-8">
      <p className="font-mono text-xs uppercase tracking-widest text-paper/60">Lorem ipsum?</p>
      <h2 className="mt-4 max-w-4xl font-display text-5xl font-semibold leading-[0.95] tracking-tight md:text-8xl">
        Got something worth building?
      </h2>
      <a
        href={`mailto:${site.email}`}
        className="mt-10 inline-block font-display text-2xl underline decoration-accent decoration-2 underline-offset-8 hover:text-accent md:text-4xl"
      >
        {site.email}
      </a>

      <div className="mt-24 grid grid-cols-2 gap-8 border-t border-paper/15 pt-8 font-mono text-xs uppercase tracking-widest md:grid-cols-4">
        <div>
          <p className="mb-3 text-paper/50">Pages</p>
          <ul className="space-y-2">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="hover:text-accent">
                  <RollText text={n.label} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 text-paper/50">Social</p>
          <ul className="space-y-2">
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
          <p className="mb-3 text-paper/50">Local time</p>
          <p>
            <LocalTime /> · {site.location}
          </p>
        </div>
        <div>
          <p className="mb-3 text-paper/50">Status</p>
          <p className="flex items-center gap-2">
            <span className="size-2 animate-pulse rounded-full bg-accent" /> {site.status}
          </p>
        </div>
      </div>

      <div className="mt-16 flex items-center justify-between font-mono text-xs uppercase tracking-widest text-paper/50">
        <span>© {site.year} {site.name}</span>
        <button type="button" onClick={() => lenis?.scrollTo(0)} className="hover:text-accent">
          Back to top ↑
        </button>
      </div>
    </footer>
  );
}
