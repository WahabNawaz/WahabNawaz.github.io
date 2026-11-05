import type { Metadata } from "next";
import DancePlayer from "@/components/playground/DancePlayer";
import Showreel from "@/components/playground/Showreel";
import BouncyLetters from "@/components/BouncyLetters";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Playground",
  description: "Pick a song and watch me dance.",
};

// The 3D character stands in the middle of this page (poses.ts: "/playground").
export default function PlaygroundPage() {
  const first = site.name.split(" ")[0];
  return (
    <section className="relative flex min-h-svh flex-col justify-between gap-8 px-5 pb-8 pt-28 md:px-8">
      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">Dance with</p>
        <BouncyLetters
          text={first}
          className="font-display text-[26vw] font-semibold uppercase leading-[0.8] tracking-tighter md:text-[20vw]"
        />
      </div>

      <div className="mt-[30vh] flex flex-col-reverse items-start justify-between gap-6 md:mt-0 md:flex-row md:items-end">
        <Showreel />
        <DancePlayer />
      </div>
    </section>
  );
}
