import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import { Label } from "@/components/ui";
import { experience, hobbies } from "@/content/data";
import { lorem, site } from "@/content/site";

export const metadata: Metadata = {
  title: "About",
  description: lorem.sentence,
};

// Content sits on the right: the 3D character stands on the left here.
export default function AboutPage() {
  return (
    <div className="md:pl-[30%]">
      <header className="px-5 pb-16 pt-36 md:px-8 md:pt-44">
        <Label>About</Label>
        <h1 className="mt-4 font-display text-6xl font-semibold leading-[0.92] tracking-tight md:text-[7vw]">
          {site.name}
        </h1>
        <p className="mt-8 max-w-2xl font-display text-2xl leading-snug tracking-tight md:text-3xl">{lorem.paragraph}</p>
      </header>

      <section className="grid gap-12 px-5 py-20 md:grid-cols-2 md:px-8">
        <Reveal>
          <Label>Bio</Label>
          <p className="mt-4 text-lg leading-relaxed text-ink/80">{lorem.long}</p>
        </Reveal>
        <Reveal delay={0.1}>
          <Label>Experience</Label>
          <ul className="mt-4 border-t border-line">
            {experience.map((e) => (
              <li key={e.period} className="flex items-baseline justify-between gap-4 border-b border-line py-4">
                <span>
                  <span className="font-display text-lg font-semibold">{e.title}</span>
                  <span className="text-ink/60"> · {e.place}</span>
                </span>
                <span className="font-mono text-xs text-muted">{e.period}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section className="px-5 py-20 md:px-8">
        <Label>Off the screen</Label>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {hobbies.map((h, i) => (
            <Reveal as="li" key={h.title} delay={(i % 2) * 0.08} className="rounded-3xl bg-white/70 p-8">
              <span className="font-mono text-xs text-muted">0{i + 1}</span>
              <h3 className="mt-6 font-display text-2xl font-semibold tracking-tight">{h.title}</h3>
              <p className="mt-2 text-ink/70">{h.text}</p>
            </Reveal>
          ))}
        </ul>
      </section>
    </div>
  );
}
