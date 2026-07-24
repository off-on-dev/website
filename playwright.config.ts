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
  webServer: {
    command: "npm run preview",
    url: "http://localhost:4321/",
    // Always start a fresh preview: reusing a stray `astro dev`/`preview` on
    // 4321 would test the wrong build (e.g. the dev toolbar fails focus-ring).
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
