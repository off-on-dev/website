import { defineConfig, devices } from "@playwright/test";

// Requires a production build in dist/. Run `npm run build` first (or the
// webServer's `astro preview` serves whatever is in dist/).
export default defineConfig({
  testDir: "e2e",
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
