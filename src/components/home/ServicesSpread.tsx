"use client";

// Home services, like the reference: the heading stays put on the left (with
// a picture in the bottom-left corner that changes with the service in view)
// while each service scrolls past on the right: title, illustration, a short
// line on the left and what it covers on the right.
// A dark strip sticks under the header through here; the 3D character hangs
// upside down from it at the top-left (poses.ts edgePose).
import { useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Reveal from "@/components/Reveal";
import ServiceArt from "@/components/ServiceArt";
import { ArrowLink, Cover } from "@/components/ui";
import { projects, services } from "@/content/data";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function ServicesSpread() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>("[data-service]", root.current).forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => self.isActive && setActive(i),
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} data-pose="services" className="relative px-5 pb-32 md:px-8">
      {/* continues the dark clients section as a strip under the header (he
          hangs from it; phones too) */}
      <div aria-hidden className="pointer-events-none sticky top-0 z-20 -mx-5 -mt-[68px] block h-[68px] bg-ink md:-mx-8" />

      <div className="grid gap-12 pt-28 md:grid-cols-[0.92fr_1fr] md:pt-0">
        <div className="md:sticky md:top-0 md:h-svh md:self-start">
          <div className="md:pt-[26svh]">
            <h2 className="max-w-md font-display text-4xl font-normal leading-[1.05] tracking-tight md:text-[3.4vw]">
              Five platforms,
              <br />
              one developer.
            </h2>
            <div className="mt-8">
              <ArrowLink href="/services/">All services</ArrowLink>
            </div>
          </div>
          {/* the picture for the service in view, in the bottom-left corner */}
          <div aria-hidden className="absolute bottom-0 -left-8 hidden aspect-[16/9] w-[30vw] overflow-hidden md:block">
            {services.map((s, i) => (
              <div key={s.id} className={`absolute inset-0 transition-opacity duration-700 ${i === active ? "opacity-100" : "opacity-0"}`}>
                <Cover project={projects[i % projects.length]} className="size-full" />
              </div>
            ))}
          </div>
        </div>

        <ol className="md:pt-[14svh]">
          {services.map((s, i) => (
            <li key={s.id} data-service className="border-t border-ink/80 first:border-t-0">
              <Reveal>
                <Link href={`/services/#${s.id}`} className="group block pb-14 pt-10">
                  <h3 className="font-display text-3xl font-normal tracking-tight transition-transform duration-500 group-hover:translate-x-2 md:text-[2.8vw]">
                    {s.title}
                  </h3>
                  <ServiceArt
                    id={s.id}
                    delay={i * 1.3}
                    sizes="(min-width: 768px) 30vw, 70vw"
                    className="mx-auto mt-2 w-[78%] transition-transform duration-700 group-hover:-translate-y-2 md:w-[52%]"
                  />
                  <div className="mt-4 flex items-start justify-between gap-6 text-[13px] font-medium leading-snug">
                    <p>{s.kicker}.</p>
                    <ul className="text-right">
                      {s.tools.slice(0, 6).map((t) => (
                        <li key={t}>• {t}</li>
                      ))}
                    </ul>
                  </div>
                </Link>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
