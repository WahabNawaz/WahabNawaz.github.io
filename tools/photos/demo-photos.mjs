// Downloads the DEMO photos for /photography (Unsplash photos served through
// picsum.photos, Unsplash License) and writes WebP sizes to public/photos/demo/.
// Replace them with your own photos later (see README "Photography").
// Usage: node tools/photos/demo-photos.mjs
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";

// [picsum id, title, ratio w/h]
const PICKS = [
  [116, "Golden hour", [3, 2]],
  [306, "Up close", [4, 5]],
  [353, "Before the rain", [16, 9]],
  [376, "Street", [3, 2]],
  [505, "Blue hour", [16, 9]],
  [625, "Siesta", [3, 2]],
  [849, "Horizon", [16, 9]],
  [494, "Doorway", [4, 5]],
  [884, "Dusk", [3, 2]],
  [767, "Morning", [3, 2]],
  [945, "Shadow play", [4, 5]],
  [896, "Last light", [16, 9]],
];
const OUT = new URL("../../public/photos/demo/", import.meta.url);
await mkdir(OUT, { recursive: true });

const credits = [];
for (const [id, title, [rw, rh]] of PICKS) {
  const info = await (await fetch(`https://picsum.photos/id/${id}/info`)).json();
  const W = 2000;
  const H = Math.round((W * rh) / rw);
  const res = await fetch(`https://picsum.photos/id/${id}/${W}/${H}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const slug = title.toLowerCase().replace(/[^a-z]+/g, "-");
  for (const w of [160, 800, 1600]) {
    await sharp(buf).resize(w).webp({ quality: w === 160 ? 60 : 78, effort: 6 }).toFile(new URL(`${slug}-${w}.webp`, OUT).pathname.replace(/^\/([A-Z]:)/, "$1"));
  }
  credits.push({ id: slug, title, ratio: `${rw} / ${rh}`, author: info.author, source: info.url });
  console.log(title, "—", info.author, info.url);
}
await writeFile(new URL("credits.json", OUT), JSON.stringify(credits, null, 2) + "\n");
