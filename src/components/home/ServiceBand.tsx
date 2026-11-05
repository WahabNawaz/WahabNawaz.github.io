// Moving band of service cards, each with an "Open for projects" badge.
import Marquee from "@/components/Marquee";
import { services } from "@/content/data";

export default function ServiceBand() {
  return (
    <section aria-label="Services" className="bg-[#e8e3d6] py-10 text-ink">
      <div className="mb-6 flex items-center justify-between px-5 font-mono text-[11px] uppercase tracking-widest md:px-8">
        <span className="flex items-center gap-2">
          Live <span className="size-2 animate-pulse rounded-full bg-accent" />
        </span>
        <span className="text-ink/50">Services</span>
      </div>
      <Marquee duration={45}>
        {services.map((s) => (
          <article key={s.id} className="mx-3 flex w-[78vw] max-w-md shrink-0 flex-col justify-between gap-10 rounded-3xl bg-white/70 p-7 shadow-sm md:w-[30vw]">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-ink/50">{s.kicker} —</p>
              <h3 className="mt-3 font-display text-3xl font-semibold tracking-tight">
                <span className="mr-2 font-mono text-sm text-accent">{s.number}</span>
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-ink/60">{s.tools.slice(0, 3).join(", ")}.</p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-ink/20 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest">
              <span className="size-1.5 rounded-full bg-accent" /> Open for projects
            </span>
          </article>
        ))}
      </Marquee>
    </section>
  );
}
