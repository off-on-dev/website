import { defineConfig, devices } from "@playwright/test";

// Config for visual regression tests only. Kept separate because playwright.config.ts
// has testIgnore: ["**/visual.spec.ts"] to prevent the suite running in CI or during
// the standard `npm run test:e2e` pass.
export default defineConfig({
  testDir: "e2e",
  testMatch: ["**/visual.spec.ts"],
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:4321",
    trace: "on-first-retry",
    colorScheme: "dark",
  },
  snapshotDir: "e2e/snapshots",
  snapshotPathTemplate: "{snapshotDir}/{arg}{ext}",
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node e2e/static-server.mjs",
    url: "http://localhost:4321/",
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
