import { defineConfig, devices } from "@playwright/test";

// Requires a production build in dist/client/. Run `npm run build` first.
export default defineConfig({
  testDir: "e2e",
  testIgnore: "**/visual.spec.ts", // Visual tests are manual-only (npm run test:visual)
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
      // Threshold: per-pixel color difference tolerance (0-1)
      // 0.2 allows 20% color variation per pixel (tolerates font anti-aliasing)
      threshold: 0.2,
      // Max diff pixels: absolute count that can differ
      // ~0.1% of a 1280×4689 page (6M pixels) = 6000 pixels
      // Tolerates small UI changes (text updates, badge counts, etc.)
      maxDiffPixels: 6000,
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
