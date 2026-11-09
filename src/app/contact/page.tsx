import type { Metadata } from "next";
import CopyEmail from "@/components/CopyEmail";
import BouncyLetters from "@/components/BouncyLetters";
import ContactForm from "@/components/ContactForm";
import { Label } from "@/components/ui";
import { lorem, site } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: lorem.sentence,
};

// Big bouncing "Say hi", then the contact form on the left and direct
// contact details on the right. The 3D character waves from the right (on
// phones he stands on the "Say hi").
export default function ContactPage() {
  return (
    <section className="px-5 pb-24 pt-32 md:px-8">
      <Label>{site.status}</Label>
      {/* on phones the character stands on it, between the two words */}
      <div data-avatar-stand data-stand-s="0.42">
        <BouncyLetters
          text="Say hi"
          className="mt-4 text-center font-display text-[22vw] font-semibold uppercase leading-[0.8] tracking-tighter md:text-[17vw]"
        />
      </div>

      <div className="mt-20 grid gap-16 md:grid-cols-[1.2fr_1fr] md:pr-[18%]">
        <div>
          <p className="mb-8 max-w-md text-lg leading-relaxed">{lorem.sentence}</p>
          <ContactForm />
        </div>

        <aside className="space-y-8">
          <div>
            <Label>Write to me</Label>
            <a href={`mailto:${site.email}`} className="mt-2 inline-block font-display text-2xl underline decoration-accent decoration-2 underline-offset-8 md:text-3xl">
              {site.email}
            </a>
            <div className="mt-4">
              <CopyEmail />
            </div>
          </div>
          <div>
            <Label>Elsewhere</Label>
            <ul className="mt-2 flex flex-wrap gap-4 font-mono text-xs uppercase tracking-widest">
              {site.socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer" className="hover:text-accent">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
