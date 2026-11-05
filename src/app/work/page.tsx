import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import { PageIntro, ProjectCard } from "@/components/ui";
import { projects } from "@/content/data";
import { lorem } from "@/content/site";

export const metadata: Metadata = {
  title: "Work",
  description: lorem.sentence,
};

export default function WorkPage() {
  return (
    <>
      <PageIntro label="Selected work" title="Lorem ipsum dolor sit amet." text={lorem.sentence} />
      <section className="grid gap-x-6 gap-y-20 px-5 pb-40 md:grid-cols-2 md:px-8 md:pr-[22%]">
        {projects.map((p, i) => (
          <Reveal key={p.slug} delay={(i % 2) * 0.1} className={i % 2 ? "md:mt-28" : ""}>
            <ProjectCard project={p} index={i} />
          </Reveal>
        ))}
      </section>
    </>
  );
}
