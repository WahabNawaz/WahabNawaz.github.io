import Link from "next/link";
import Hero from "@/components/home/Hero";
import NameScroll from "@/components/home/NameScroll";
import Pitch from "@/components/home/Pitch";
import ProcessStack from "@/components/home/ProcessStack";
import SkyStage from "@/components/home/SkyStage";
import RoleSection from "@/components/home/RoleSection";
import ServiceBand from "@/components/home/ServiceBand";
import WorkShowcase from "@/components/home/WorkShowcase";
import ClientsBand from "@/components/home/ClientsBand";
import PoseScope from "@/components/PoseScope";
import Reveal from "@/components/Reveal";
import ScrubText from "@/components/ScrubText";
import { ArrowLink } from "@/components/ui";
import { services } from "@/content/data";
import { lorem } from "@/content/site";

// Section order follows the reference: sky opening (hero → big name →
// statement) → pitch at the desk → role → service band → work → clients →
// services → process → footer.
// data-pose tells the 3D character where to stand (src/components/scene/poses.ts).
export default function Home() {
  return (
    <PoseScope>
      {/* the sky stays behind these three, like one continuous opening */}
      <SkyStage>
        <Hero />

        <NameScroll />

        {/* Statement: one short line in the middle of the sky */}
        <section data-pose="right" className="grid min-h-svh place-items-center px-5 py-32 md:px-8">
          <ScrubText
            text="Lorem ipsum, made simple."
            className="max-w-4xl text-center font-display text-5xl font-medium leading-[1.05] tracking-tight md:text-8xl"
          />
        </section>
      </SkyStage>

      <Pitch />

      <RoleSection />

      <ServiceBand />

      <WorkShowcase />

      <ClientsBand />

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
