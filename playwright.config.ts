import { defineConfig, devices } from "@playwright/test";

// Requires a production build in dist/client/. Run `npm run build` first.
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    // Pin the OS-level color scheme to dark so theme-toggle tests start from
    // the site's default state regardless of the developer's OS setting.
    colorScheme: "dark",
  },
  snapshotPathTemplate: "e2e/__screenshots__/{arg}{ext}",
  expect: {
    toHaveScreenshot: {
      // Font rendering differs slightly across OS/browser versions
      threshold: 0.2,
      maxDiffPixels: 100,
    },
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    // Use preview (not bare serve) so the 404 fallback copy runs before serving.
    command: "npm run preview",
    // Probe a deep prerendered route, not just the root, to confirm the static
    // server is fully ready before tests start.
    url: "http://localhost:3000/challenges/python/",
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
