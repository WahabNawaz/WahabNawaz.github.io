import Link from "next/link";
import Hero from "@/components/home/Hero";
import NameScroll from "@/components/home/NameScroll";
import Pitch from "@/components/home/Pitch";
import ProcessStack from "@/components/home/ProcessStack";
import Marquee from "@/components/Marquee";
import PoseScope from "@/components/PoseScope";
import Reveal from "@/components/Reveal";
import ScrubText from "@/components/ScrubText";
import { ArrowLink, Label, ProjectCard } from "@/components/ui";
import { clients, projects, services } from "@/content/data";
import { lorem } from "@/content/site";

// Section order follows the reference: hero → big name → statement → pitch
// + reviews → marquee → work → clients → services → process → footer.
// data-pose tells the 3D character where to stand (src/components/scene/poses.ts).
export default function Home() {
  return (
    <PoseScope>
      <Hero />

      <NameScroll />

      {/* Statement */}
      <section data-pose="right" className="px-5 py-32 md:px-8 md:py-44 md:pr-[30%]">
        <Label>Lorem ipsum</Label>
        <ScrubText
          text={`${lorem.paragraph} ${lorem.sentence}`}
          className="mt-8 font-display text-3xl font-medium leading-[1.15] tracking-tight md:text-5xl"
        />
      </section>

      <Pitch />

      {/* Marquee band */}
      <section aria-label="Services" className="bg-ink py-6 text-paper">
        <Marquee items={services.map((s) => s.title)} />
      </section>

      {/* Selected work */}
      <section data-pose="right" className="px-5 py-32 md:px-8 md:pr-[26%]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Label>Selected work</Label>
            <h2 className="mt-4 font-display text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl">
              Lorem ipsum dolor.
            </h2>
          </div>
          <ArrowLink href="/work/">See all work</ArrowLink>
        </div>
        <div className="mt-16 grid gap-x-6 gap-y-16 md:grid-cols-2">
          {projects.slice(0, 4).map((p, i) => (
            <Reveal key={p.slug} delay={(i % 2) * 0.1} className={i % 2 ? "md:mt-24" : ""}>
              <ProjectCard project={p} index={i} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Clients */}
      <section data-pose="left" className="px-5 py-32 md:px-8 md:pl-[26%]">
        <Label>Trusted by</Label>
        <h2 className="mt-4 font-display text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl">In good company.</h2>
        <ul className="mt-10 grid grid-cols-2 border-l border-t border-line md:grid-cols-4">
          {clients.map((c) => (
            <li key={c} className="grid h-28 place-items-center border-b border-r border-line font-display text-2xl font-semibold tracking-tight text-ink/60">
              {c}
            </li>
          ))}
        </ul>
      </section>

      {/* Services overview */}
      <section data-pose="right" className="px-5 py-32 md:px-8 md:pr-[26%]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="max-w-2xl font-display text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl">
            Five platforms, one developer.
          </h2>
          <ArrowLink href="/services/">All services</ArrowLink>
        </div>
        <div className="mt-16 grid gap-4 md:grid-cols-2">
          {services.map((s, i) => (
            <Reveal
              key={s.id}
              delay={(i % 2) * 0.05}
              // odd count: the last card spans the full row
              className={services.length % 2 && i === services.length - 1 ? "md:col-span-2" : ""}
            >
              <Link
                href={`/services/#${s.id}`}
                className="group flex h-full flex-col justify-between gap-10 rounded-3xl border border-line p-8 transition-colors hover:bg-ink hover:text-paper"
              >
                <span className="font-mono text-xs text-muted group-hover:text-paper/60">{s.number}</span>
                <div>
                  <h3 className="font-display text-3xl font-semibold tracking-tight">{s.title}</h3>
                  <p className="mt-3 text-ink/70 group-hover:text-paper/70">{lorem.sentence}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <ProcessStack />
    </PoseScope>
  );
}
