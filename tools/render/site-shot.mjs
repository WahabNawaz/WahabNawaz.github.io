// Screenshot of the running site (dev server or /out server) once the character
// has settled. Usage:
//   node tools/render/site-shot.mjs <url> <out.png> [width] [height] [state] [scrollY] [mouseX,mouseY]
// state = value of <html data-avatar> to wait for (default "typing"; "-" = do not wait)
import { chromium } from "playwright";

const [, , url, out, w = "1440", h = "900", state = "typing", scrollY = "0", mouse = ""] = process.argv;
const browser = await chromium.launch({ channel: "msedge", args: ["--ignore-gpu-blocklist", "--disable-audio-output"] });
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(h) } });
page.on("pageerror", (e) => console.error("pageerror:", String(e)));
page.on("console", (m) => m.type() === "error" && console.error("console:", m.text().slice(0, 300)));
await page.goto(url);
if (state !== "-")
  await page.waitForFunction((s) => document.documentElement.dataset.avatar === s, state, { timeout: 90_000 });
if (mouse) {
  const [mx, my] = mouse.split(",").map(Number);
  await page.mouse.move(mx, my, { steps: 8 });
}
if (Number(scrollY)) {
  await page.mouse.wheel(0, Number(scrollY));
}
await page.waitForTimeout(2500);
await page.screenshot({ path: out });
console.log("saved", out, await page.evaluate(() => document.documentElement.dataset.avatar));
await browser.close();
