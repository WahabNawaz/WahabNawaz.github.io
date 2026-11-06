// Opens a page from the render server in headless Edge, waits for `window.done`,
// and saves a PNG (transparent where the page has no background).
// Usage: node tools/render/shot.mjs <url-path> <out.png> [width] [height]
import { chromium } from "playwright";

const [, , path, out, w = "1200", h = "800"] = process.argv;
const browser = await chromium.launch({ channel: "msedge", args: ["--ignore-gpu-blocklist", "--use-angle=d3d11"] });
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(h) } });
page.on("console", (m) => m.type() === "error" && console.error(m.text()));
page.on("pageerror", (e) => console.error(String(e)));
await page.goto("http://localhost:4300" + path);
await page.waitForFunction(() => window.done === true, null, { timeout: 60_000 });
await page.screenshot({ path: out, omitBackground: true });
console.log(await page.title());
await browser.close();
