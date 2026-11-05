import type { Metadata } from "next";
import Gallery, { type Photo } from "@/components/photography/Gallery";
import { PageIntro } from "@/components/ui";
import { lorem } from "@/content/site";

export const metadata: Metadata = {
  title: "Photography",
  description: lorem.sentence,
};

// Placeholder photos (gradients). Replace with your own pictures later.
const PALETTE: [string, string][] = [
  ["#ff6a3d", "#ffd1a8"], ["#3d5aff", "#b8c4ff"], ["#1f9d74", "#bfeedd"], ["#9b3dff", "#e2c8ff"],
  ["#e0a100", "#fff0b3"], ["#d6336c", "#ffc2d6"], ["#0b7285", "#a5e9f2"], ["#495057", "#dee2e6"],
];
const RATIOS = ["3 / 2", "4 / 5", "16 / 9", "1 / 1"];
const TITLES = ["Golden hour", "Up close", "Before the rain", "Street", "Blue hour", "Siesta", "Horizon", "Doorway", "Dusk", "Morning", "Shadow play", "Last light"];

const photos: Photo[] = TITLES.map((title, i) => ({
  id: `photo-${i + 1}`,
  title,
  caption: lorem.sentence,
  colors: PALETTE[i % PALETTE.length],
  ratio: RATIOS[i % RATIOS.length],
}));

export default function PhotographyPage() {
  return (
    <>
      <PageIntro label="Off the screen" title="Photography" text={lorem.sentence} />
      <Gallery photos={photos} />
    </>
  );
}
