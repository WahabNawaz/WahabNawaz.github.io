// Small shared building blocks (server-safe, no hooks).
import Link from "next/link";
import type { Project } from "@/content/data";
import RollText from "./RollText";

export function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`font-mono text-xs uppercase tracking-widest text-muted ${className}`}>{children}</p>;
}

export function PageIntro({ label, title, text }: { label: string; title: string; text?: string }) {
  return (
    <header className="px-5 pb-16 pt-36 md:px-8 md:pt-44">
      <Label>{label}</Label>
      <h1 className="mt-4 max-w-5xl font-display text-6xl font-semibold leading-[0.92] tracking-tight md:text-[8.5vw]">
        {title}
      </h1>
      {text && <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink/80">{text}</p>}
    </header>
  );
}

/** Placeholder cover until real screenshots exist: a generated gradient. */
export function Cover({ project, className = "" }: { project: Project; className?: string }) {
  const [a, b] = project.colors;
  return (
    <div
      role="img"
      aria-label={`${project.title} cover (placeholder)`}
      className={`relative overflow-hidden ${className}`}
      style={{ background: `radial-gradient(120% 90% at 20% 10%, ${b} 0%, ${a} 55%, #111114 120%)` }}
    >
      <span className="absolute bottom-4 left-4 font-mono text-[11px] uppercase tracking-widest text-white/80">
        {project.title}
      </span>
    </div>
  );
}

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <Link href={`/work/${project.slug}/`} className="group block">
      <div className="overflow-hidden rounded-2xl">
        <Cover
          project={project}
          className="aspect-[4/3] transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3 className="font-display text-2xl font-semibold tracking-tight">
          <span className="mr-3 font-mono text-xs text-muted">0{index + 1}</span>
          {project.title}
        </h3>
        <span className="font-mono text-xs text-muted">{project.year}</span>
      </div>
      <p className="mt-1 text-ink/70">{project.summary}</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {project.tags.map((t) => (
          <li key={t} className="rounded-full border border-line px-3 py-1 font-mono text-[11px] uppercase tracking-wider">
            {t}
          </li>
        ))}
      </ul>
    </Link>
  );
}

export function ArrowLink({ href, children, dark = false }: { href: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-3 rounded-full px-5 py-3 font-mono text-xs uppercase tracking-widest transition-colors ${
        dark ? "bg-paper text-ink hover:bg-accent" : "bg-ink text-paper hover:bg-accent hover:text-ink"
      }`}
    >
      {typeof children === "string" ? <RollText text={children} /> : children} <span aria-hidden>↗</span>
    </Link>
  );
}
