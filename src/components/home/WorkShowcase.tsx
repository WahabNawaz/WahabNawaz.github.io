"use client";

// Home "Work" section, like the reference: a black circle grows out of the
// page and opens onto a huge, centred WORK title (pinned while the 3D
// character dives over it, see poses.ts), then the projects follow inside
// device frames (monitor / laptop, drawn with CSS) with a one-line pitch above.
import { useRef, type CSSProperties } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Reveal from "@/components/Reveal";
import { ArrowLink, Cover } from "@/components/ui";
import { projects, type Project } from "@/content/data";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function Monitor({ project }: { project: Project }) {
  return (
    <div className="mx-auto w-full">
      <div className="rounded-[14px] bg-[#1b1b20] p-[2.2%] shadow-2xl">
        <Cover project={project} className="aspect-[16/10] w-full rounded-[6px] transition-transform duration-700 group-hover:scale-[1.02]" />
      </div>
      <div className="mx-auto h-8 w-[14%] bg-gradient-to-b from-[#2a2a31] to-[#3a3a42]" />
      <div className="mx-auto h-2 w-[34%] rounded-t-md bg-[#3a3a42]" />
    </div>
  );
}

function Laptop({ project }: { project: Project }) {
  return (
    <div className="mx-auto w-[92%]">
      <div className="rounded-t-[14px] bg-[#1b1b20] p-[2.4%] pb-[3%] shadow-2xl">
        <Cover project={project} className="aspect-[16/10] w-full rounded-[4px] transition-transform duration-700 group-hover:scale-[1.02]" />
      </div>
      <div className="relative -mx-[6%] h-4 rounded-b-[18px] bg-gradient-to-b from-[#d6d6db] to-[#a9a9b1]">
        <span className="absolute left-1/2 top-0 h-1.5 w-[16%] -translate-x-1/2 rounded-b-md bg-[#9a9aa2]" />
      </div>
    </div>
  );
}

export default function WorkShowcase() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // the circle's radius follows the scroll (--r); its centre (--cx, --cy)
      // and a second radius that opens it by itself (--rb) are set by the
      // role title's bouncing full stop when it lands (home/full-stop.ts)
      const circle = "[data-work-circle]";
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(circle, { "--r": "150%" });
        return;
      }
      gsap.fromTo(
        circle,
        { "--r": "0%" },
        {
          "--r": "150%",
          ease: "power1.in",
          scrollTrigger: { trigger: "[data-work-intro]", start: "top 85%", end: "top -15%", scrub: 0.3 },
        },
      );
      gsap.from("[data-work-title]", {
        yPercent: 18,
        scale: 0.86,
        ease: "none",
        scrollTrigger: { trigger: "[data-work-intro]", start: "top 70%", end: "top top", scrub: 0.3 },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} data-pose="work" className="relative text-paper">
      <div data-work-intro className="relative h-[170svh]">
        <div className="sticky top-0 h-svh overflow-hidden">
          <div data-work-circle className="absolute inset-0 flex flex-col bg-ink px-5 pb-12 pt-[18svh] md:px-8" style={{ "--r": "0%", "--rb": "0px", "--cx": "56%", "--cy": "62%", clipPath: "circle(max(var(--r), var(--rb)) at var(--cx) var(--cy))" } as CSSProperties}>
            <h2 data-work-title className="relative mx-auto font-display text-[30vw] font-semibold uppercase leading-[0.8] tracking-tighter md:text-[19vw]">
              Work
              <sup className="absolute -right-[0.9em] top-[0.2em] font-mono text-[11px] font-normal normal-case tracking-widest text-paper/70 md:text-sm">’25–26</sup>
            </h2>
            <p className="mt-auto ml-auto max-w-md text-right font-display text-2xl leading-tight md:text-4xl">
              Lorem sites get seen.
              <br />
              Ipsum sites get remembered.
            </p>
          </div>
        </div>
      </div>

      <div className="relative bg-ink px-5 pb-28 md:px-8 md:pr-[18%]">
        <div className="grid gap-x-10 gap-y-24 md:grid-cols-2">
          {projects.slice(0, 4).map((p, i) => (
            <Reveal key={p.slug} delay={(i % 2) * 0.1} className={i % 2 ? "md:mt-32" : ""}>
              <Link href={`/work/${p.slug}/`} className="group block">
                <p className="mb-5 max-w-xs font-display text-2xl leading-tight">{p.summary}</p>
                {i % 2 === 0 ? <Monitor project={p} /> : <Laptop project={p} />}
                <div className="mt-6 flex items-baseline justify-between font-mono text-xs uppercase tracking-widest">
                  <span className="transition-colors group-hover:text-accent">{p.title}</span>
                  <span className="text-paper/50">{p.year}</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mt-20 flex justify-center">
          <ArrowLink href="/work/" dark>
            See all work
          </ArrowLink>
        </div>
      </div>
    </section>
  );
}
