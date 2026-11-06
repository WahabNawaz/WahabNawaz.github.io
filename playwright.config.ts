import { defineConfig } from "@playwright/test";

// End-to-end tests against the static export in /out (the same files GitHub
// Pages serves). Build first: `npm run build`, then `npm run test:e2e`.
// Runs in the installed Microsoft Edge (no browser download needed).
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 180_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  workers: 2,
  reporter: [["list"], ["html", { open: "never", outputFolder: "tests/report" }]],
  use: {
    baseURL: "http://localhost:4173",
    channel: "msedge",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: { args: ["--autoplay-policy=no-user-gesture-required", "--disable-audio-output", "--ignore-gpu-blocklist"] },
  },
  webServer: {
    command: "node tests/serve-out.mjs 4173",
    port: 4173,
    reuseExistingServer: true,
  },
  projects: [
    { name: "1920", use: { viewport: { width: 1920, height: 1080 } } },
    { name: "1440", use: { viewport: { width: 1440, height: 900 } } },
    { name: "768", use: { viewport: { width: 768, height: 1024 }, hasTouch: true } },
    { name: "390", use: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } },
    { name: "360", use: { viewport: { width: 360, height: 800 }, hasTouch: true, isMobile: true } },
  ],
});
