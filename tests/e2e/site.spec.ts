// End-to-end checks of the exported site, run at five viewport sizes
// (see playwright.config.ts). Screenshots go to tests/screenshots/<viewport>/.
//
// The 3D character reports what it is doing on <html>:
//   data-avatar="typing" | "run" | "wave" | "dance1" | …   (current animation)
//   data-avatar-look="0.3"                                 (head turn, radians)
import { test, expect, type Page, type TestInfo } from "@playwright/test";

const ROUTES = ["/", "/work/", "/services/", "/about/", "/photography/", "/playground/", "/faq/", "/contact/"];

// errors from the GPU driver in headless browsers, not from the site
const BENIGN = [/GPU stall due to ReadPixels/i, /GL Driver Message/i, /WebGL: INVALID_/i];

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error" && !BENIGN.some((r) => r.test(m.text()))) errors.push(`console: ${m.text()}`);
  });
  return errors;
}

async function skipIntro(page: Page) {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("intro-seen", "1");
    } catch {
      // ignore
    }
  });
}

async function shot(page: Page, info: TestInfo, name: string) {
  await page.screenshot({ path: `tests/screenshots/${info.project.name}/${name}.png` });
}

const isPhone = (info: TestInfo) => ["390", "360"].includes(info.project.name);
const isDesktop = (info: TestInfo) => ["1920", "1440"].includes(info.project.name);

async function scrollTo(page: Page, y: number | "bottom") {
  await page.evaluate((to) => window.scrollTo(0, to === "bottom" ? document.documentElement.scrollHeight : to), y);
  await page.waitForTimeout(1200);
}

const avatar = (page: Page) => page.locator("html");

test.describe("site", () => {
  test("1 · home: loader, entrance, cursor, scroll down and up", async ({ page }, info) => {
    const errors = watchErrors(page);
    const model = page.waitForResponse((r) => r.url().endsWith("/models/avatar.glb"));
    const hand = page.waitForResponse((r) => r.url().endsWith("/models/hand-left.glb"));
    await page.goto("/");
    await page.waitForTimeout(500);
    await shot(page, info, "01-loader");
    expect((await model).status()).toBe(200);
    expect((await hand).status()).toBe(200);

    await expect(page.locator(".preloader")).toBeHidden({ timeout: 15_000 });
    // walks in, sits down in the big open hand, types
    await expect(avatar(page)).toHaveAttribute("data-avatar", "typing", { timeout: 15_000 });
    // the pointing hand comes in from the right on landscape screens (hidden on portrait ones)
    const vp0 = page.viewportSize()!;
    if (vp0.width / vp0.height >= 0.8) await expect(avatar(page)).toHaveAttribute("data-hands", "shown", { timeout: 10_000 });
    else await expect(avatar(page)).toHaveAttribute("data-hands", "hidden");
    // the avatar blinks every few seconds
    const blinks = async () => Number((await avatar(page).getAttribute("data-avatar-blinks")) ?? 0);
    const before = await blinks();
    await expect.poll(blinks, { timeout: 12_000 }).toBeGreaterThan(before);
    await page.waitForTimeout(1500);
    await expect(page.locator("h1")).toBeVisible();
    await shot(page, info, "02-hero");

    if (!isPhone(info)) {
      // the head follows the mouse
      const vp = page.viewportSize()!;
      await page.mouse.move(5, vp.height / 2, { steps: 5 });
      await page.waitForTimeout(1500);
      const left = Number(await avatar(page).getAttribute("data-avatar-look"));
      await page.mouse.move(vp.width - 5, vp.height / 2, { steps: 5 });
      await page.waitForTimeout(1500);
      const right = Number(await avatar(page).getAttribute("data-avatar-look"));
      expect(right).toBeGreaterThan(left);
    }

    // scroll choreography: the character runs over to the name, and back
    const h = await page.evaluate(() => innerHeight);
    await scrollTo(page, h * 1.6);
    await page.waitForTimeout(800);
    await shot(page, info, "03-scroll-name");
    await scrollTo(page, h * 3.6);
    await shot(page, info, "04-scroll-more");
    await scrollTo(page, 0);
    await expect(avatar(page)).toHaveAttribute("data-avatar", "typing", { timeout: 10_000 });
    await expect(page.locator("h1")).toBeInViewport();
    expect(errors).toEqual([]);
  });

  test("2 · navigation: menu, focus, Escape, back and forward", async ({ page }, info) => {
    const errors = watchErrors(page);
    await skipIntro(page);
    await page.goto("/");
    const button = page.locator('button[aria-controls="site-menu"]');
    await expect(button).toBeVisible({ timeout: 10_000 });
    await shot(page, info, "05-menu-closed");

    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    const menu = page.locator("#site-menu");
    await expect(menu.locator("a").first()).toBeFocused({ timeout: 3000 });
    await page.waitForTimeout(700);
    await shot(page, info, "06-menu-open");
    // Tab stays inside the menu
    for (let i = 0; i < 14; i++) await page.keyboard.press("Tab");
    const inside = await page.evaluate(() => {
      const a = document.activeElement;
      return !!a && (!!a.closest("#site-menu") || a.getAttribute("aria-controls") === "site-menu");
    });
    expect(inside).toBe(true);
    await page.keyboard.press("Escape");
    await expect(button).toHaveAttribute("aria-expanded", "false");

    await button.click();
    await menu.getByRole("link", { name: /work/i }).click();
    await expect(page).toHaveURL(/\/work\/$/);
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await page.goBack();
    await expect(page).toHaveURL(/:4173\/$/);
    await page.goForward();
    await expect(page).toHaveURL(/\/work\/$/);
    expect(errors).toEqual([]);
  });

  test("3 · work: listing and a project page", async ({ page }, info) => {
    const errors = watchErrors(page);
    await skipIntro(page);
    await page.goto("/work/");
    await page.waitForTimeout(1500);
    await shot(page, info, "07-work");
    const card = page.locator('a[href*="/work/"]:not([href$="/work/"])').filter({ visible: true }).first();
    await card.hover();
    await card.click();
    await expect(page).toHaveURL(/\/work\/[a-z0-9-]+\/$/);
    await expect(page.locator("h1")).toBeVisible();
    await page.waitForTimeout(1000);
    await shot(page, info, "08-work-detail");
    expect(errors).toEqual([]);
  });

  test("4 · services: tabs and the spinning tool rings", async ({ page }, info) => {
    const errors = watchErrors(page);
    await skipIntro(page);
    await page.goto("/services/");
    await page.waitForTimeout(1200);
    await shot(page, info, "09-services");
    // five illustrations, each one loads
    const art = page.locator("img[data-service-art]");
    await expect(art).toHaveCount(5);
    // (they float all the time, so scroll with the DOM: Playwright waits for still elements)
    const reveal = (i: number) => art.nth(i).evaluate((el) => el.scrollIntoView({ block: "center" }));
    for (let i = 0; i < 5; i++) {
      await reveal(i);
      await expect.poll(() => art.nth(i).evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth), { timeout: 10_000 }).toBeGreaterThan(0);
    }
    await reveal(0);
    await page.waitForTimeout(1200);
    await shot(page, info, "09b-services-art");
    const tabs = page.getByRole("tab");
    await tabs.first().scrollIntoViewIfNeeded();
    expect(await tabs.count()).toBeGreaterThanOrEqual(5);
    await tabs.nth(2).click();
    await expect(tabs.nth(2)).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tabpanel")).toBeVisible();

    const area = page.locator("[data-spin]");
    if (await area.isVisible()) {
      await area.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      const angle = () =>
        page.evaluate(() => {
          const m = getComputedStyle(document.querySelector('[data-ring="1"]')!).transform;
          const [a, b] = m.slice(7).split(",").map(Number);
          return (Math.atan2(b, a) * 180) / Math.PI;
        });
      const b = (await area.boundingBox())!;
      const before = await angle();
      const cx = b.x + b.width / 2;
      const y = b.y + b.height * 0.15;
      await page.mouse.move(cx - 120, y);
      await page.mouse.down();
      for (let i = 1; i <= 10; i++) await page.mouse.move(cx - 120 + i * 24, y, { steps: 2 });
      await page.mouse.up();
      const after = await angle();
      expect(Math.abs(after - before)).toBeGreaterThan(20);
      await shot(page, info, "10-services-rings");
    }
    expect(errors).toEqual([]);
  });

  test("5 · about: desk objects and layout controls", async ({ page }, info) => {
    const errors = watchErrors(page);
    await skipIntro(page);
    await page.goto("/about/");
    const group = page.getByRole("group", { name: "Arrange the desk" });
    await group.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);
    const item = page.locator("[data-item]").first();
    const pos = async () => (await item.boundingBox())!;
    const start = await pos();
    await group.getByRole("button", { name: /tidy/i }).click();
    await expect(group.getByRole("button", { name: /tidy/i })).toHaveAttribute("aria-pressed", "true");
    await page.waitForTimeout(1500);
    const tidy = await pos();
    expect(Math.hypot(tidy.x - start.x, tidy.y - start.y)).toBeGreaterThan(5);
    await group.getByRole("button", { name: /stack/i }).click();
    await page.waitForTimeout(1500);
    // drag one object somewhere else
    const b = await pos();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
    await page.mouse.down();
    await page.mouse.move(b.x + b.width / 2 + 60, b.y + b.height / 2 + 30, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(800);
    const moved = await pos();
    expect(Math.hypot(moved.x - b.x, moved.y - b.y)).toBeGreaterThan(10);
    await shot(page, info, "11-about-desk");
    expect(errors).toEqual([]);
  });

  test("6 · photography: lightbox with keys, swipe and focus return", async ({ page }, info) => {
    const errors = watchErrors(page);
    await skipIntro(page);
    await page.goto("/photography/");
    await page.waitForTimeout(1200);
    await shot(page, info, "12-photography");
    const tile = page.locator("button[data-img]").first();
    await tile.scrollIntoViewIfNeeded();
    // real photos (lazy-loaded WebP) with a credit line
    await expect.poll(() => tile.locator("img").evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth), { timeout: 10_000 }).toBeGreaterThan(0);
    await expect(page.getByText(/Demo photo/).first()).toBeVisible();
    await tile.click();
    const dialog = page.getByRole("dialog", { name: /photo 1 of/ });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: /close/i })).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("dialog", { name: /photo 2 of/ })).toBeVisible();
    // swipe left = next
    const vp = page.viewportSize()!;
    await page.mouse.move(vp.width * 0.7, vp.height / 2);
    await page.mouse.down();
    await page.mouse.move(vp.width * 0.3, vp.height / 2, { steps: 6 });
    await page.mouse.up();
    await expect(page.getByRole("dialog", { name: /photo 3 of/ })).toBeVisible();
    const big = page.getByRole("dialog").locator("img");
    await expect.poll(() => big.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth), { timeout: 10_000 }).toBeGreaterThan(0);
    await shot(page, info, "13-lightbox");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: /photo \d+ of/ })).toBeHidden();
    await expect(tile).toBeFocused();
    expect(errors).toEqual([]);
  });

  test("7 · playground: play, dance, pause, resume, seek, switch, stop", async ({ page }, info) => {
    const errors = watchErrors(page);
    await skipIntro(page);
    await page.goto("/playground/");
    await expect(avatar(page)).toHaveAttribute("data-avatar", "idle", { timeout: 15_000 });
    await shot(page, info, "14-playground-idle");

    const first = page.getByRole("button", { name: /^(Play|Pause) Demo beat,/ });
    await first.scrollIntoViewIfNeeded();
    await first.click();
    // the demo beat is generated in the browser first, which can take a moment
    await expect(page.getByText("Now playing")).toBeVisible({ timeout: 20_000 });
    await expect(avatar(page)).toHaveAttribute("data-avatar", "dance1");
    const pos = page.getByRole("slider", { name: "Song position" });
    const value = async () => Number(await pos.inputValue());
    await expect.poll(value, { timeout: 15_000 }).toBeGreaterThan(0.3);
    await shot(page, info, "15-playground-dance");

    await page.getByRole("button", { name: /^Pause Demo beat,/ }).click();
    await expect(page.getByText("Paused")).toBeVisible();
    const paused = await value();
    await page.waitForTimeout(800);
    expect(Math.abs((await value()) - paused)).toBeLessThan(0.05);
    await page.getByRole("button", { name: /^Play Demo beat,/ }).click();
    await expect(page.getByText("Now playing")).toBeVisible();

    // seek to 9 s (the demo beat is ~17 s long; wait until its length is known)
    await expect.poll(async () => Number(await pos.getAttribute("max")), { timeout: 10_000 }).toBeGreaterThan(8);
    await pos.evaluate((el: HTMLInputElement) => {
      const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
      set.call(el, "9");
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await expect.poll(value, { timeout: 10_000 }).toBeGreaterThan(8.5);

    // other track, other dance
    await page.getByRole("button", { name: /^Play Demo beat \(slow\),/ }).click();
    await expect(avatar(page)).toHaveAttribute("data-avatar", "dance2", { timeout: 20_000 });
    await page.getByRole("button", { name: /stop the music/i }).click();
    await expect(page.getByText("Now playing")).toBeHidden();
    await expect(avatar(page)).toHaveAttribute("data-avatar", "idle");
    expect(errors).toEqual([]);
  });

  test("8 · contact: validation and the email fallback", async ({ page }, info) => {
    const errors = watchErrors(page);
    await skipIntro(page);
    await page.goto("/contact/");
    await page.waitForTimeout(1000);
    await shot(page, info, "16-contact");
    const send = page.getByRole("button", { name: "Send message" });
    await send.scrollIntoViewIfNeeded();
    await send.click();
    await expect(page.locator("#cf-name-err")).toBeVisible();
    await expect(page.locator("#cf-email-err")).toBeVisible();
    await expect(page.locator("#cf-message-err")).toBeVisible();
    await expect(page.locator("#cf-name")).toBeFocused();
    await expect(page.locator("#cf-name")).toHaveAttribute("aria-invalid", "true");

    await page.locator("#cf-name").fill("Test Person");
    await page.locator("#cf-email").fill("not-an-email");
    await page.locator("#cf-message").fill("Hello, this is a test message.");
    await send.click();
    await expect(page.locator("#cf-email-err")).toBeVisible();
    await expect(page.locator("#cf-name-err")).toBeHidden();

    await page.locator("#cf-email").fill("test@example.com");
    await expect(page.locator("form[data-form-service]")).toHaveAttribute("data-form-service", "mailto");
    await send.click();
    // no form service configured (site.form is empty) → opens the email app
    await expect(page.locator("#cf-status")).toContainText("email app");
    await shot(page, info, "17-contact-sent");
    expect(errors).toEqual([]);
  });

  test("9 · footer and the waving character", async ({ page }, info) => {
    const errors = watchErrors(page);
    await skipIntro(page);
    await page.goto("/");
    await page.waitForTimeout(2000);
    await scrollTo(page, "bottom");
    await page.waitForTimeout(1500);
    await expect(page.getByRole("contentinfo")).toBeInViewport();
    await expect(avatar(page)).toHaveAttribute("data-avatar", "wave", { timeout: 10_000 });
    await shot(page, info, "18-footer");
    expect(errors).toEqual([]);
  });

  test("10 · every page loads with no sideways scroll", async ({ page }) => {
    const errors = watchErrors(page);
    await skipIntro(page);
    for (const r of [...ROUTES, "/work/project-alpha/"]) {
      const res = await page.goto(r);
      expect(res?.status(), r).toBe(200);
      // let the 3D character finish loading before the next page
      await expect(avatar(page)).toHaveAttribute("data-avatar", /.+/, { timeout: 15_000 });
      const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      expect(over, `horizontal overflow on ${r}`).toBeLessThanOrEqual(1);
    }
    const nf = await page.goto("/no-such-page/");
    expect(nf?.status()).toBe(404);
    expect(errors.filter((e) => !/404|Failed to load resource/.test(e))).toEqual([]);
  });
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("works without animations", async ({ page }, info) => {
    test.skip(!isDesktop(info) && info.project.name !== "390", "one desktop + one phone size is enough");
    const errors = watchErrors(page);
    await page.goto("/");
    await expect(page.locator(".preloader")).toBeHidden({ timeout: 3000 });
    await expect(page.locator("h1")).toBeVisible();
    await expect(avatar(page)).toHaveAttribute("data-avatar", "typing", { timeout: 15_000 });
    const button = page.locator('button[aria-controls="site-menu"]');
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await scrollTo(page, "bottom");
    await expect(page.getByRole("contentinfo")).toBeInViewport();
    await shot(page, info, "19-reduced-motion");
    expect(errors).toEqual([]);
  });
});
