// Smoke check of the published site: hero loads, character sits and blinks,
// the pointing hand shows, no console errors; saves a screenshot.
// Usage: node tools/render/live-check.mjs [base-url] [out.png]
import { chromium } from "playwright";

const [, , base = "https://wahabnawaz.github.io", out = "live-hero.png"] = process.argv;
const browser = await chromium.launch({ channel: "msedge", args: ["--ignore-gpu-blocklist", "--disable-audio-output"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => m.type() === "error" && !/GPU stall|GL Driver|WebGL: INVALID_/i.test(m.text()) && errors.push(m.text().slice(0, 200)));
const glb = page.waitForResponse((r) => r.url().endsWith("/models/avatar.glb"), { timeout: 120_000 });
await page.goto(base + "/");
const res = await glb;
const html = page.locator("html");
await page.waitForFunction(() => document.documentElement.dataset.avatar === "typing", null, { timeout: 90_000 });
await page.mouse.move(1000, 400, { steps: 6 });
await page.waitForFunction(() => document.documentElement.dataset.hands === "shown", null, { timeout: 20_000 });
const b0 = Number(await html.getAttribute("data-avatar-blinks"));
await page.waitForFunction((n) => Number(document.documentElement.dataset.avatarBlinks) > n, b0, { timeout: 15_000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: out });
// footer wave
await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
await page.waitForFunction(() => document.documentElement.dataset.avatar === "wave", null, { timeout: 20_000 });
console.log(JSON.stringify({ glb: res.status(), glbBytes: Number(res.headers()["content-length"] || 0), hero: "typing", hands: "shown", blinked: true, footer: "wave", errors }));
await browser.close();
