import type { Metadata } from "next";
import Accordion from "@/components/Accordion";
import { ArrowLink, PageIntro } from "@/components/ui";
import { faqs } from "@/content/data";
import { lorem } from "@/content/site";

export const metadata: Metadata = {
  title: "FAQ",
  description: lorem.sentence,
};

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageIntro label="FAQ" title="Questions, answered." text="Not here? Just ask." />
      <section className="px-5 pb-40 md:px-8 md:pr-[24%]">
        <Accordion items={faqs} />
        <div className="mt-12">
          <ArrowLink href="/contact/">Ask me</ArrowLink>
        </div>
      </section>
    </>
  );
}
