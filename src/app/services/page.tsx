import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import PoseScope from "@/components/PoseScope";
import ToolsOrbit from "@/components/services/ToolsOrbit";
import ServiceArt from "@/components/ServiceArt";
import { Label, PageIntro } from "@/components/ui";
import { services } from "@/content/data";
import { lorem } from "@/content/site";

export const metadata: Metadata = {
  title: "Services",
  description: lorem.sentence,
};

export default function ServicesPage() {
  return (
    <PoseScope>
      <PageIntro label="Services" title="What I can build for you." text={lorem.sentence} />

      {/* Sticky jump bar */}
      <nav aria-label="Services" className="sticky top-16 z-20 px-5 md:px-8">
        <ul className="flex gap-2 overflow-x-auto rounded-full border border-line bg-paper/85 p-1 backdrop-blur [scrollbar-width:none] md:inline-flex">
          {services.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="block whitespace-nowrap rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-widest hover:bg-ink hover:text-paper">
                {s.number} {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {services.map((s, i) => (
        <section key={s.id} id={s.id} className="scroll-mt-28 border-b border-line px-5 py-28 md:px-8 md:pr-[22%]">
          <div className="grid gap-10 md:grid-cols-[1fr_1.3fr]">
            <div>
              <span className="font-mono text-xs text-accent">{s.number}</span>
              <h2 className="mt-3 font-display text-5xl font-semibold leading-[0.95] tracking-tight md:text-6xl">{s.title}</h2>
              <Label className="mt-4">{s.kicker}</Label>
              <Reveal>
                <ServiceArt id={s.id} delay={i * 1.3} sizes="(min-width: 768px) 34vw, 90vw" className="mt-8 w-full max-w-[460px]" />
              </Reveal>
            </div>
            <div>
              <p className="text-lg leading-relaxed text-ink/80">{s.intro}</p>
              <Label className="mt-8">Built with</Label>
              <ul className="mt-3 flex flex-wrap gap-2">
                {s.tools.map((t) => (
                  <li key={t} className="rounded-full bg-ink px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-paper">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Label className="mt-16">What&apos;s included</Label>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {s.includes.map((inc, i) => (
              <Reveal as="li" key={inc.title} delay={(i % 3) * 0.06} className="rounded-3xl bg-white/70 p-7">
                <span className="font-mono text-xs text-muted">0{i + 1}</span>
                <h3 className="mt-6 font-display text-xl font-semibold tracking-tight">{inc.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{inc.text}</p>
              </Reveal>
            ))}
          </ul>
        </section>
      ))}
      <ToolsOrbit />
    </PoseScope>
  );
}
