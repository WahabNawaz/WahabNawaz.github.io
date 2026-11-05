import type { Metadata } from "next";
import Link from "next/link";
import WorkReel from "@/components/work/WorkReel";
import { Label } from "@/components/ui";
import { projects } from "@/content/data";
import { lorem } from "@/content/site";

export const metadata: Metadata = {
  title: "Work",
  description: lorem.sentence,
};

export default function WorkPage() {
  return (
    <>
      <WorkReel />

      {/* Plain index of every project (also helps search engines and screen readers) */}
      <section className="px-5 py-28 md:px-8 md:pr-[24%]">
        <Label>All projects</Label>
        <ul className="mt-6 border-t border-line">
          {projects.map((p, i) => (
            <li key={p.slug} className="border-b border-line">
              <Link href={`/work/${p.slug}/`} className="group flex flex-wrap items-baseline justify-between gap-4 py-6">
                <span className="flex items-baseline gap-5">
                  <span className="font-mono text-xs text-muted">0{i + 1}</span>
                  <span className="font-display text-3xl font-semibold tracking-tight transition-colors group-hover:text-accent md:text-5xl">
                    {p.title}
                  </span>
                </span>
                <span className="font-mono text-xs uppercase tracking-widest text-muted">
                  {p.tags.join(" · ")} — {p.year}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
