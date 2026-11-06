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

        {/* Statement: one short line on the clouds (northern lights when the sky
            is set to night, see scene/Sky.tsx) */}
        <section data-pose="statement" className="grid min-h-svh place-items-center px-5 py-32 text-paper md:px-8">
          <ScrubText
            text="Lorem ipsum, made simple."
            className="max-w-4xl text-center font-display text-4xl font-normal leading-[1.05] tracking-tight [text-shadow:0_2px_24px_rgba(40,50,90,0.25)] md:text-6xl"
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

      {/* Services, like the reference: the heading stays put on the left while
          each service scrolls past on the right: title, illustration, a short
          line on the left and what it covers on the right. The character hangs
          from the top-left edge of the screen through here (poses.ts). */}
      <section data-pose="services" className="px-5 py-32 md:px-8">
        <div className="grid gap-12 md:grid-cols-[0.9fr_1.1fr]">
          <div className="md:sticky md:top-[26svh] md:self-start">
            <h2 className="max-w-md font-display text-4xl font-normal leading-[1.05] tracking-tight md:text-5xl">
              Five platforms,
              <br />
              one developer.
            </h2>
            <div className="mt-6">
              <ArrowLink href="/services/">All services</ArrowLink>
            </div>
          </div>
          <ol className="divide-y divide-line">
            {services.map((s, i) => (
              <li key={s.id}>
                <Reveal>
                  <Link href={`/services/#${s.id}`} className="group block py-12">
                    <h3 className="font-display text-3xl font-normal tracking-tight transition-transform duration-500 group-hover:translate-x-2">{s.title}</h3>
                    <ServiceArt
                      id={s.id}
                      delay={i * 1.3}
                      sizes="(min-width: 768px) 30vw, 70vw"
                      className="mx-auto mt-2 w-[78%] transition-transform duration-700 group-hover:-translate-y-2 md:w-[58%]"
                    />
                    <div className="mt-4 flex items-end justify-between gap-6 text-[11px] leading-snug">
                      <p className="text-ink/70">{s.kicker}.</p>
                      <ul className="text-right">
                        {s.tools.slice(0, 6).map((t) => (
                          <li key={t}>• {t}</li>
                        ))}
                      </ul>
                    </div>
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
