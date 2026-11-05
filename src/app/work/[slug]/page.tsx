import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import { Cover, Label } from "@/components/ui";
import { projects } from "@/content/data";
import { site } from "@/content/site";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return { title: project.title, description: project.summary };
}

export default async function CaseStudy(props: PageProps<"/work/[slug]">) {
  const { slug } = await props.params;
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();
  const project = projects[index];
  const next = projects[(index + 1) % projects.length];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    url: `${site.url}/work/${project.slug}/`,
    creator: { "@type": "Person", name: site.name },
    dateCreated: project.year,
    keywords: project.tags.join(", "),
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="bg-ink px-5 pb-12 pt-36 text-paper md:px-8 md:pt-44">
        <Link href="/work/" className="font-mono text-xs uppercase tracking-widest text-paper/60 hover:text-accent">
          ← All work
        </Link>
        <h1 className="mt-6 font-display text-6xl font-semibold uppercase leading-[0.9] tracking-tight md:text-[9vw]">
          {project.title}
        </h1>
        <dl className="mt-12 grid grid-cols-2 gap-6 border-t border-paper/15 pt-6 font-mono text-xs uppercase tracking-widest md:grid-cols-4">
          {[
            ["Year", project.year],
            ["Role", project.role],
            ["Client", project.client],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-paper/50">{k}</dt>
              <dd className="mt-2">{v}</dd>
            </div>
          ))}
          <div className="flex items-end md:justify-end">
            <a href={project.url} target="_blank" rel="noreferrer" className="rounded-full bg-paper px-5 py-3 text-ink hover:bg-accent">
              Visit site ↗
            </a>
          </div>
        </dl>
        <ul className="mt-8 flex flex-wrap gap-2">
          {project.tags.map((t) => (
            <li key={t} className="rounded-full border border-paper/25 px-3 py-1 font-mono text-[11px] uppercase tracking-wider">
              {t}
            </li>
          ))}
        </ul>
      </header>

      <Cover project={project} className="aspect-[16/8] w-full" />

      <section className="grid gap-12 px-5 py-24 md:grid-cols-2 md:px-8 md:pr-[20%]">
        <Reveal>
          <Label>Challenge</Label>
          <p className="mt-4 text-xl leading-relaxed">{project.challenge}</p>
        </Reveal>
        <Reveal delay={0.1}>
          <Label>Solution</Label>
          <p className="mt-4 text-xl leading-relaxed">{project.solution}</p>
        </Reveal>
      </section>

      <section className="px-5 pb-24 md:px-8 md:pr-[20%]">
        <Label>Overview</Label>
        <div className="mt-4 max-w-3xl space-y-6 text-lg leading-relaxed text-ink/80">
          {project.overview.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {/* Gallery placeholders: swap for real screenshots */}
      <section className="grid gap-4 px-5 pb-32 md:grid-cols-2 md:px-8">
        {[0, 1, 2, 3].map((i) => (
          <Reveal key={i} className={i === 0 ? "md:col-span-2" : ""}>
            <Cover project={project} className={`rounded-2xl ${i === 0 ? "aspect-[16/7]" : "aspect-[4/3]"}`} />
          </Reveal>
        ))}
      </section>

      <Link href={`/work/${next.slug}/`} className="group block border-t border-line px-5 py-20 md:px-8">
        <Label>Next project</Label>
        <p className="mt-4 font-display text-5xl font-semibold uppercase tracking-tight transition-colors group-hover:text-accent md:text-8xl">
          {next.title} →
        </p>
      </Link>
    </article>
  );
}
