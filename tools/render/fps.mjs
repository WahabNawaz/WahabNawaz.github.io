// Rough frame-rate probe for the home hero in headless Edge (software GL in CI-like
// conditions). Usage: node tools/render/fps.mjs [url] [width] [height]
import { chromium } from "playwright";

const [, , url = "http://localhost:4173/", w = "1920", h = "1080"] = process.argv;
const browser = await chromium.launch({ channel: "msedge", args: ["--ignore-gpu-blocklist", "--disable-audio-output"] });
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(h) } });
await page.addInitScript(() => sessionStorage.setItem("intro-seen", "1"));
const t0 = Date.now();
await page.goto(url);
await page.waitForFunction(() => document.documentElement.dataset.avatar === "typing", null, { timeout: 120_000 });
const ready = Date.now() - t0;
const fps = await page.evaluate(
  () =>
    new Promise((res) => {
      let n = 0;
      const start = performance.now();
      const tick = () => {
        n++;
        if (performance.now() - start < 3000) requestAnimationFrame(tick);
        else res(n / 3);
      };
      requestAnimationFrame(tick);
    }),
);
const gl = await page.evaluate(() => {
  const c = document.createElement("canvas").getContext("webgl2");
  const d = c?.getExtension("WEBGL_debug_renderer_info");
  return d ? c.getParameter(d.UNMASKED_RENDERER_WEBGL) : "unknown";
});
console.log(JSON.stringify({ url, size: `${w}x${h}`, readyMs: ready, fps: Math.round(fps), gl }));
await browser.close();
