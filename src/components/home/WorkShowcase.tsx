// Home "Work" section: a huge title, then projects shown inside device
// frames (monitor / laptop, drawn with CSS) with a one-line pitch above each.
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { ArrowLink, Cover } from "@/components/ui";
import { projects, type Project } from "@/content/data";

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
  return (
    <section data-pose="work" className="bg-ink px-5 py-28 text-paper md:px-8 md:pr-[24%]">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h2 className="font-display text-[24vw] font-semibold uppercase leading-[0.8] tracking-tighter md:text-[15vw]">
          Work
          <sup className="ml-3 align-top font-mono text-sm tracking-widest text-paper/50">’25–26</sup>
        </h2>
        <p className="max-w-xs text-right font-display text-2xl leading-tight md:text-3xl">
          Lorem sites get seen. Ipsum sites get remembered.
        </p>
      </div>

      <div className="mt-20 grid gap-x-10 gap-y-24 md:grid-cols-2">
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
    </section>
  );
}
