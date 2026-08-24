// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

// Page weight, third-party requests, image hygiene and media autoplay.
// These are the only automated guards against a dependency or an unoptimised
// asset quietly inflating the site, and against anything phoning home before
// the visitor has consented.
//
// Requires a production build in dist/ (the Playwright webServer runs
// `astro preview`).

import { test, expect } from "@playwright/test";

const PAGES = [
  "/",
  "/adventures/",
  "/challenges/",
  // Representative detail pages: content-heavy routes where weight regresses first.
  "/adventures/blind-by-design/levels/beginner/",
  "/challenges/opentelemetry/",
];

// Total compressed bytes transferred on first load, no cache.
// On a failure the message reports the actual figure, so raise this only
// deliberately and with a reason.
const PAGE_WEIGHT_BUDGET_KB = 750;

// Hosts allowed to receive requests on load. First-party content only:
// never analytics, ads or tracking. Kept in step with the CSP img-src in
// Layout.astro.
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

test.describe("page weight", () => {
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
        `${path} transferred ${kb} KB, over the ${PAGE_WEIGHT_BUDGET_KB} KB budget`,
      ).toBeLessThan(PAGE_WEIGHT_BUDGET_KB * 1024);
    });
  }
});

test.describe("third-party requests", () => {
  for (const path of PAGES) {
    test(`${path} contacts no host outside the allowlist before consent`, async ({ page }) => {
      const unexpected: string[] = [];

      page.on("request", (request) => {
        try {
          const { hostname } = new URL(request.url());
          if (!isAllowedHost(hostname)) unexpected.push(request.url());
        } catch {
          // non-http scheme (data:, blob:), not a network request
        }
      });

      await page.goto(path);
      await page.waitForLoadState("networkidle");

      expect(unexpected, `${path} made unexpected third-party requests`).toHaveLength(0);
    });
  }
});

test.describe("image hygiene", () => {
  for (const path of PAGES) {
    test(`${path}: every image declares width and height`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const violations = await page.evaluate((): string[] =>
        Array.from(document.querySelectorAll("img"))
          .filter((img) => !img.hasAttribute("width") || !img.hasAttribute("height"))
          .map((img) => img.outerHTML.slice(0, 120)),
      );

      expect(violations, "images missing explicit width/height (causes CLS)").toHaveLength(0);
    });

    test(`${path}: below-fold images are lazy`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const violations = await page.evaluate((): string[] =>
        Array.from(document.querySelectorAll("img"))
          .filter((img) => img.getBoundingClientRect().top >= window.innerHeight && img.loading !== "lazy")
          .map((img) => img.outerHTML.slice(0, 120)),
      );

      expect(violations, 'below-fold images missing loading="lazy"').toHaveLength(0);
    });

    test(`${path}: no unmuted autoplaying media`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const violations = await page.evaluate((): string[] =>
        Array.from(document.querySelectorAll("video[autoplay], audio[autoplay]"))
          .filter((el) => !el.hasAttribute("muted"))
          .map((el) => el.outerHTML.slice(0, 120)),
      );

      expect(violations, "autoplaying media without muted").toHaveLength(0);
    });
  }
});
