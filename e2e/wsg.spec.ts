// Web Sustainability Guidelines (WSG) automated checks.
// Requires a production build in dist/client/. Run `npm run build` before `npm run test:e2e`.

import { test, expect } from "@playwright/test";

const PAGES = [
  "/",
  "/adventures",
  "/challenges",
  // Representative detail pages — catch weight/media regressions on content-heavy routes.
  "/adventures/blind-by-design/levels/beginner",
  "/challenges/opentelemetry",
];

// Total compressed bytes transferred on first load (no cache).
// Adjust after running: look for "transferred X KB" in failure output.
const PAGE_WEIGHT_BUDGET_KB = 750;

// ---------------------------------------------------------------------------
// Page weight (WSG 2.3, 2.5)
// ---------------------------------------------------------------------------

test.describe("WSG — page weight", () => {
  for (const path of PAGES) {
    test(`${path} total transfer < ${PAGE_WEIGHT_BUDGET_KB} KB`, async ({ page, context }) => {
      const client = await context.newCDPSession(page);
      await client.send("Network.enable");

      let totalBytes = 0;
      client.on("Network.loadingFinished", (event) => {
        totalBytes += event.encodedDataLength;
      });

      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const kb = Math.round(totalBytes / 1024);
      expect(
        totalBytes,
        `${path} transferred ${kb} KB — over ${PAGE_WEIGHT_BUDGET_KB} KB budget`,
      ).toBeLessThan(PAGE_WEIGHT_BUDGET_KB * 1024);
    });
  }
});

// ---------------------------------------------------------------------------
// Third-party requests (WSG 5.14, 5.15)
// No analytics or tracking requests without consent.
// Community avatar hosts (community.offon.dev, discourse-cdn.com) are
// allowlisted — they serve first-party content, not tracking scripts.
// ---------------------------------------------------------------------------

// Hosts that are permitted to receive requests on every page load.
// Add only hosts that serve first-party content, not analytics or ads.
const ALLOWED_EXTERNAL_HOSTS = [
  "community.offon.dev",
  "avatars.discourse-cdn.com",
  "sea2.discourse-cdn.com",
];

function isAllowedHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    ALLOWED_EXTERNAL_HOSTS.some((h) => hostname === h || hostname.endsWith(`.${h}`))
  );
}

test.describe("WSG — third-party requests", () => {
  for (const path of PAGES) {
    test(`${path} makes no tracking/analytics requests without consent`, async ({ page }) => {
      const unexpected: string[] = [];

      page.on("request", (request) => {
        try {
          const { hostname } = new URL(request.url());
          if (!isAllowedHost(hostname)) {
            unexpected.push(request.url());
          }
        } catch {
          // ignore non-http requests (e.g. data:)
        }
      });

      await page.goto(path);
      await page.waitForLoadState("networkidle");

      expect(unexpected, `${path} made unexpected third-party requests`).toHaveLength(0);
    });
  }
});

// ---------------------------------------------------------------------------
// Image optimisation (WSG 2.9)
// ---------------------------------------------------------------------------

test.describe("WSG — image optimisation", () => {
  for (const path of PAGES) {
    test(`${path} — all images have explicit width and height`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const violations = await page.evaluate((): string[] =>
        Array.from(document.querySelectorAll("img"))
          .filter((img) => !img.hasAttribute("width") || !img.hasAttribute("height"))
          .map((img) => img.outerHTML.slice(0, 120)),
      );

      expect(violations, "Images missing explicit width/height (causes CLS)").toHaveLength(0);
    });

    test(`${path} — below-fold images use loading="lazy"`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const violations = await page.evaluate((): string[] =>
        Array.from(document.querySelectorAll("img"))
          .filter((img) => {
            const belowFold = img.getBoundingClientRect().top >= window.innerHeight;
            return belowFold && img.loading !== "lazy";
          })
          .map((img) => img.outerHTML.slice(0, 120)),
      );

      expect(violations, "Below-fold images missing loading='lazy'").toHaveLength(0);
    });
  }
});

// ---------------------------------------------------------------------------
// Media (WSG 2.14)
// Autoplaying media wastes bandwidth and energy without user intent.
// ---------------------------------------------------------------------------

test.describe("WSG — media", () => {
  for (const path of PAGES) {
    test(`${path} — no autoplaying media without muted`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const violations = await page.evaluate((): string[] =>
        Array.from(document.querySelectorAll("video[autoplay], audio[autoplay]"))
          .filter((el) => !el.hasAttribute("muted"))
          .map((el) => el.outerHTML.slice(0, 120)),
      );

      expect(violations, "Autoplaying media without muted attribute").toHaveLength(0);
    });
  }
});
