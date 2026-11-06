"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
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
    <footer
      ref={ref}
      className="relative isolate z-10 flex min-h-svh flex-col overflow-hidden px-5 pb-8 pt-24 text-ink md:px-8 md:pt-[34svh]"
    >
      {/* always a bright day sky with soft clouds down here, like the
          reference, whatever the hero's sky is set to; the character stands
          on the right (poses.ts FOOTER) */}
      <Sky mode="day" className="absolute inset-0 -z-10 bg-[#b9c9e4]" />
      <p className="text-xs opacity-70">Lorem ipsum? Good sign.</p>
      <div className="mb-24 mt-4 flex flex-wrap items-end gap-x-12 gap-y-8 md:pr-[22%]">
        <h2 className="max-w-xl font-display text-5xl font-normal leading-[1] tracking-tight md:text-6xl">
          Got something
          <br />
          worth building?
        </h2>
        <div>
          <p className="text-[11px] opacity-70">Email me</p>
          <a href={`mailto:${site.email}`} className="mt-1 inline-block font-display text-2xl hover:text-accent md:text-4xl">
            {site.email}
          </a>
          <p className="mt-2 text-[11px] opacity-70">Lorem ipsum within a day.</p>
        </div>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-8 border-t border-current/15 pt-8 font-mono text-[11px] uppercase tracking-widest md:mr-[24%] md:grid-cols-4">
        <div>
          <p className="mb-3 opacity-50">Pages</p>
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
          <p className="mb-3 opacity-50">Social</p>
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
          <p className="mb-3 opacity-50">Local time</p>
          <p>
            <LocalTime /> · {site.location}
          </p>
        </div>
        <div>
          <p className="mb-3 opacity-50">Status</p>
          <p className="flex items-center gap-2">
            <span className="size-2 animate-pulse rounded-full bg-accent" /> {site.status}
          </p>
        </div>
      </div>

      <div className="mt-16 flex items-center justify-between font-mono text-[11px] uppercase tracking-widest opacity-60 md:mr-[24%]">
        <span>© {site.year} {site.name}</span>
        <button type="button" onClick={() => lenis?.scrollTo(0)} className="hover:text-accent">
          Back to top ↑
        </button>
      </div>
    </footer>
  );
}
