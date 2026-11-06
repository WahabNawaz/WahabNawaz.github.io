// Frames of the home opening (the character dropping onto the hand), then a
// still of the settled hero. Usage:
//   node tools/render/entrance-shots.mjs [url] [outDir] [width] [height]
import { chromium } from "playwright";

const [, , url = "http://localhost:3000/", out = ".", w = "1440", h = "900"] = process.argv;
const browser = await chromium.launch({ channel: "msedge", args: ["--ignore-gpu-blocklist", "--disable-audio-output"] });
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(h) } });
page.on("pageerror", (e) => console.error("pageerror:", String(e)));
await page.addInitScript(() => sessionStorage.setItem("intro-seen", "1"));
await page.goto(url);
// wait until the model has loaded (the character waits above the screen)
await page.waitForFunction(() => !!document.documentElement.dataset.avatar, null, { timeout: 120_000 });
for (let i = 0; i < 14; i++) {
  await page.screenshot({ path: `${out}/enter-${String(i).padStart(2, "0")}.jpg`, type: "jpeg", quality: 70 });
  console.log(i, await page.evaluate(() => document.documentElement.dataset.avatar));
  await page.waitForTimeout(330);
}
await page.waitForFunction(() => document.documentElement.dataset.avatar === "typing", null, { timeout: 60_000 });
await page.waitForTimeout(2500);
await page.screenshot({ path: `${out}/enter-settled.png` });
await browser.close();
