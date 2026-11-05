import type { Metadata } from "next";
import CopyEmail from "@/components/CopyEmail";
import BouncyLetters from "@/components/BouncyLetters";
import { Label } from "@/components/ui";
import { lorem, site } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: lorem.sentence,
};

// The 3D character stands in the middle of this page (see poses.ts).
export default function ContactPage() {
  return (
    <section className="flex min-h-svh flex-col justify-between px-5 pb-10 pt-32 md:px-8">
      <div>
        <Label>{site.status}</Label>
        <BouncyLetters
          text="Say hi"
          className="mt-4 text-center font-display text-[22vw] font-semibold uppercase leading-[0.8] tracking-tighter md:text-[17vw]"
        />
      </div>

      <div className="mt-[40vh] grid gap-10 md:mt-0 md:grid-cols-2 md:items-end">
        <div className="max-w-sm space-y-5">
          <p className="text-lg leading-relaxed">{lorem.sentence}</p>
          <CopyEmail />
        </div>
        <div className="space-y-6 md:text-right">
          <div>
            <Label>Write to me</Label>
            <a href={`mailto:${site.email}`} className="mt-2 inline-block font-display text-2xl underline decoration-accent decoration-2 underline-offset-8 md:text-3xl">
              {site.email}
            </a>
          </div>
          <div>
            <Label>Elsewhere</Label>
            <ul className="mt-2 flex flex-wrap gap-4 font-mono text-xs uppercase tracking-widest md:justify-end">
              {site.socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer" className="hover:text-accent">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
