import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";
const out = process.argv[2];
const browser = await chromium.launch({ channel: "msedge", args: ["--ignore-gpu-blocklist", "--disable-audio-output"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const t0 = Date.now();
await page.goto("https://codeofsagar.in/", { waitUntil: "commit", timeout: 90000 });
// load sequence
for (let i = 0; i < 30; i++) {
  await page.screenshot({ path: `${out}/load-${String(i).padStart(2, "0")}.jpg`, type: "jpeg", quality: 60 });
  await page.waitForTimeout(450);
}
console.log("load captured", Date.now() - t0);
await page.waitForTimeout(3000);
// mouse effect
await page.mouse.move(200, 450, { steps: 8 }); await page.waitForTimeout(900);
await page.screenshot({ path: `${out}/mouse-l.jpg`, type: "jpeg", quality: 60 });
await page.mouse.move(1250, 450, { steps: 8 }); await page.waitForTimeout(900);
await page.screenshot({ path: `${out}/mouse-r.jpg`, type: "jpeg", quality: 60 });
await page.mouse.move(720, 120, { steps: 8 }); await page.waitForTimeout(900);
await page.screenshot({ path: `${out}/mouse-t.jpg`, type: "jpeg", quality: 60 });
// structure
const text = await page.evaluate(() => {
  const secs = [...document.querySelectorAll("section, main > div, footer")].map((s) => {
    const r = s.getBoundingClientRect();
    return `${s.tagName}.${(s.className || "").toString().slice(0, 60)} top=${Math.round(r.top + scrollY)} h=${Math.round(r.height)} :: ${(s.innerText || "").replace(/\s+/g, " ").slice(0, 160)}`;
  });
  return secs.join("\n");
});
await writeFile(`${out}/structure.txt`, text);
const H = await page.evaluate(() => document.documentElement.scrollHeight);
console.log("height", H);
// scroll in small wheel steps
for (let i = 0; i < 70; i++) {
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(650);
  if (i % 2 === 1) await page.screenshot({ path: `${out}/scroll-${String(i).padStart(2, "0")}.jpg`, type: "jpeg", quality: 55 });
  const y = await page.evaluate(() => scrollY);
  if (i % 10 === 0) console.log("step", i, "y", y);
}
await browser.close();
