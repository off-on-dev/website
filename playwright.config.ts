import { defineConfig, devices } from "@playwright/test";

// Requires a production build in dist/. Run `npm run build` first.
export default defineConfig({
  testDir: "e2e",
  // visual.spec.ts is local-only — run it explicitly with `npm run test:visual`.
  // It does not run in CI; baselines are macOS-generated and must be regenerated
  // on other platforms before the comparison is meaningful.
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
  // Flat path: e2e/snapshots/<name>.png — no OS suffix. Baselines are
  // macOS-generated; contributors on other platforms must regenerate locally.
  snapshotPathTemplate: "{snapshotDir}/{arg}{ext}",
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // Plain foreground static server; Playwright owns the process and kills
    // it cleanly at end-of-suite. Replaces `astro preview` which always
    // daemonises (parent exits 0), making the keep-alive process the real
    // webServer signal; when that exited mid-suite, Playwright abandoned all
    // queued tests without recording failures.
    command: "node e2e/static-server.mjs",
    url: "http://localhost:4321/",
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
