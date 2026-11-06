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
import ServicesSpread from "@/components/home/ServicesSpread";
import PoseScope from "@/components/PoseScope";
import ScrubText from "@/components/ScrubText";

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

      <ServicesSpread />

      <BrandPanel />

      <ProcessStack />
    </PoseScope>
  );
}
