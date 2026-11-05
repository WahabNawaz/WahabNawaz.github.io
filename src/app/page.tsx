import Link from "next/link";
import Hero from "@/components/home/Hero";
import PoseScope from "@/components/PoseScope";
import Reveal from "@/components/Reveal";
import ScrubText from "@/components/ScrubText";
import Testimonials from "@/components/Testimonials";
import { ArrowLink, Label, ProjectCard } from "@/components/ui";
import { clients, process, projects, services } from "@/content/data";
import { lorem } from "@/content/site";

// data-pose on each section tells the 3D character where to stand
// (see src/components/scene/poses.ts). Content leaves room on that side.
export default function Home() {
  return (
    <PoseScope>
      <Hero />

      {/* Intro statement */}
      <section data-pose="right" className="px-5 py-32 md:px-8 md:py-44 md:pr-[30%]">
        <Label>Lorem ipsum</Label>
        <ScrubText
          text={`${lorem.paragraph} ${lorem.sentence}`}
          className="mt-8 font-display text-3xl font-medium leading-[1.15] tracking-tight md:text-5xl"
        />
      </section>

      {/* Marquee band */}
      <section aria-label="Services" className="overflow-hidden bg-ink py-6 text-paper">
        <div className="marquee-track flex w-max">
          {[0, 1].map((copy) => (
            <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0">
              {services.map((s) => (
                <li key={s.id} className="flex items-center gap-6 px-6 font-display text-4xl font-semibold uppercase tracking-tight md:text-6xl">
                  {s.title}
                  <span className="text-accent">✦</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </section>

      {/* Services overview */}
      <section data-pose="left" className="px-5 py-32 md:px-8 md:pl-[26%]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="max-w-2xl font-display text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl">
            Four things, done end to end.
          </h2>
          <ArrowLink href="/services/">All services</ArrowLink>
        </div>
        <div className="mt-16 grid gap-4 md:grid-cols-2">
          {services.map((s, i) => (
            <Reveal key={s.id} delay={i * 0.05}>
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

      {/* Clients + testimonials */}
      <section data-pose="left" className="px-5 py-32 md:px-8 md:pl-[26%]">
        <Label>Trusted by</Label>
        <ul className="mt-8 grid grid-cols-2 border-l border-t border-line md:grid-cols-4">
          {clients.map((c) => (
            <li key={c} className="grid h-28 place-items-center border-b border-r border-line font-display text-2xl font-semibold tracking-tight text-ink/60">
              {c}
            </li>
          ))}
        </ul>
        <Reveal className="mt-16">
          <Testimonials />
        </Reveal>
      </section>

      {/* Process */}
      <section data-pose="right" className="px-5 py-32 md:px-8 md:pr-[26%]">
        <Label>How a project runs</Label>
        <h2 className="mt-4 max-w-3xl font-display text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl">
          Four steps, nothing hidden.
        </h2>
        <ol className="mt-16 grid gap-4 md:grid-cols-2">
          {process.map((p, i) => (
            <Reveal as="li" key={p.step} delay={(i % 2) * 0.08} className="rounded-3xl bg-white/70 p-8">
              <span className="font-mono text-xs text-accent">Step {p.step}</span>
              <h3 className="mt-3 font-display text-3xl font-semibold tracking-tight">{p.title}</h3>
              <p className="mt-3 text-ink/70">{p.text}</p>
            </Reveal>
          ))}
        </ol>
      </section>
    </PoseScope>
  );
}
