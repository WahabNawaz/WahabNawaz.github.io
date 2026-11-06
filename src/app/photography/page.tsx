import type { Metadata } from "next";
import Gallery, { type Photo } from "@/components/photography/Gallery";
import { PageIntro } from "@/components/ui";
import { lorem } from "@/content/site";
import credits from "../../../public/photos/demo/credits.json";

export const metadata: Metadata = {
  title: "Photography",
  description: lorem.sentence,
};

// DEMO photos from Unsplash (Unsplash License), made by tools/photos/demo-photos.mjs.
// They are NOT photos taken by the site owner. Swap in your own pictures later:
// put WebP files in /public/photos and list them here with demo: false.
const photos: Photo[] = credits.map((c) => ({
  id: c.id,
  title: c.title,
  caption: lorem.sentence,
  ratio: c.ratio,
  src: `/photos/demo/${c.id}`,
  credit: { author: c.author, url: c.source },
  demo: true,
}));

export default function PhotographyPage() {
  return (
    <>
      <PageIntro label="Off the screen" title="Photography" text={lorem.sentence} />
      <p className="-mt-8 mb-14 px-5 font-mono text-[11px] uppercase tracking-widest text-muted md:px-8">
        Demo gallery — photos from Unsplash, credited on each picture. My own photos coming soon.
      </p>
      <Gallery photos={photos} />
    </>
  );
}
