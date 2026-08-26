import { defineConfig, devices } from "@playwright/test";

// Requires a production build in dist/. Run `npm run build` first (or the
// webServer's `astro preview` serves whatever is in dist/).
export default defineConfig({
  testDir: "e2e",
  // visual.spec.ts is local-only — run it explicitly with `npm run test:visual`.
  // It does not run in CI; baselines are committed from a linux Docker environment.
  testIgnore: ["**/visual.spec.ts"],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:4321",
    trace: "on-first-retry",
    // Pin OS color scheme to dark so theme-dependent tests start from the
    // site default regardless of the runner's setting.
    colorScheme: "dark",
  },
  snapshotDir: "e2e/snapshots",
  // Flat path: e2e/snapshots/<name>.png — no OS suffix so baselines are
  // platform-independent. The threshold in visual.spec.ts absorbs the small
  // rendering differences between macOS and Linux Chromium.
  snapshotPathTemplate: "{snapshotDir}/{arg}{ext}",
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Astro 7 preview daemonizes by default (parent exits 0 immediately).
  // Stop any leftover daemon first, start a fresh one with --background, then
  // follow its logs so the webServer process stays alive for Playwright.
  // globalTeardown stops the daemon after the suite finishes.
  globalTeardown: "./e2e/teardown",
  webServer: {
    command:
      "astro preview stop 2>/dev/null; astro preview --background && astro preview logs --follow",
    url: "http://localhost:4321/",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
