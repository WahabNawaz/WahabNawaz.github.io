// Screenshots of the home page at a few scroll positions (in screen heights),
// to compare the opening sequence. Usage:
//   node tools/render/home-shots.mjs [url] [outDir] [width] [height] [positions...]
import { chromium } from "playwright";

const [, , url = "http://localhost:3000/", out = ".", w = "1440", h = "900", ...rest] = process.argv;
const stops = rest.length ? rest.map(Number) : [0, 1.2, 1.8, 2.6, 3.4];
const browser = await chromium.launch({ channel: "msedge", args: ["--ignore-gpu-blocklist", "--disable-audio-output"] });
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(h) } });
page.on("pageerror", (e) => console.error("pageerror:", String(e)));
await page.addInitScript(() => sessionStorage.setItem("intro-seen", "1"));
await page.goto(url);
await page.waitForFunction(() => document.documentElement.dataset.avatar === "typing", null, { timeout: 120_000 });
await page.mouse.move(Number(w) * 0.6, Number(h) * 0.4, { steps: 5 });
await page.waitForTimeout(2500);
for (const s of stops) {
  await page.evaluate((y) => window.scrollTo(0, y < 0 ? document.documentElement.scrollHeight + y : y), s * Number(h));
  await page.waitForTimeout(2600);
  const name = `${out}/home-${String(s).replace(".", "_")}.png`;
  await page.screenshot({ path: name });
  console.log(name, await page.evaluate(() => document.documentElement.dataset.avatar));
}
await browser.close();
