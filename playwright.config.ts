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
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npx serve dist/client",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
