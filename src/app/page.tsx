import Link from "next/link";
import Hero from "@/components/home/Hero";
import NameScroll from "@/components/home/NameScroll";
import Pitch from "@/components/home/Pitch";
import ProcessStack from "@/components/home/ProcessStack";
import BrandPanel from "@/components/home/BrandPanel";
import SkyStage from "@/components/home/SkyStage";
import RoleSection from "@/components/home/RoleSection";
import ServiceBand from "@/components/home/ServiceBand";
import WorkShowcase from "@/components/home/WorkShowcase";
import ClientsBand from "@/components/home/ClientsBand";
import PoseScope from "@/components/PoseScope";
import Reveal from "@/components/Reveal";
import ScrubText from "@/components/ScrubText";
import { ArrowLink } from "@/components/ui";
import ServiceArt from "@/components/ServiceArt";
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

        {/* Statement: one short line under the northern lights (the sky turns
            to night while this is in view, see scene/Sky.tsx) */}
        <section data-pose="statement" className="grid min-h-svh place-items-center px-5 py-32 text-paper md:px-8">
          <ScrubText
            text="Lorem ipsum, made simple."
            className="max-w-4xl text-center font-display text-5xl font-medium leading-[1.05] tracking-tight md:text-8xl"
          />
        </section>
        {/* room for the next section to come up over the sky (page fold) */}
        <div aria-hidden className="h-svh" />
      </SkyStage>

      <Pitch />

      <RoleSection />

      <ServiceBand />

      <WorkShowcase />

      <ClientsBand />

      {/* Services: the heading stays put on the left while each service, with
          its illustration, scrolls past on the right */}
      <section data-pose="services" className="px-5 py-32 md:px-8 md:pr-[22%]">
        <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr]">
          <div className="md:sticky md:top-28 md:self-start">
            <h2 className="max-w-md font-display text-5xl font-semibold leading-[0.95] tracking-tight md:text-6xl">
              Five platforms, one developer.
            </h2>
            <p className="mt-6 max-w-sm text-ink/70">{lorem.sentence}</p>
            <div className="mt-8">
              <ArrowLink href="/services/">All services</ArrowLink>
            </div>
          </div>
          <ol className="divide-y divide-line border-y border-line">
            {services.map((s, i) => (
              <li key={s.id}>
                <Reveal>
                  <Link href={`/services/#${s.id}`} className="group grid items-center gap-6 py-10 sm:grid-cols-[1fr_1.1fr]">
                    <div>
                      <span className="font-mono text-xs text-accent">{s.number}</span>
                      <h3 className="mt-2 font-display text-3xl font-semibold tracking-tight transition-transform duration-500 group-hover:translate-x-2">
                        {s.title}
                      </h3>
                      <p className="mt-3 text-ink/70">{lorem.sentence}</p>
                      <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-muted">{s.tools.slice(0, 4).join(" · ")}</p>
                    </div>
                    <ServiceArt id={s.id} delay={i * 1.3} sizes="(min-width: 768px) 26vw, 90vw" className="transition-transform duration-700 group-hover:-translate-y-2" />
                  </Link>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <BrandPanel />

      <ProcessStack />
    </PoseScope>
  );
}
