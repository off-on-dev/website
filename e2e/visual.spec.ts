// Visual regression tests. Run `npm run build` before `npm run test:visual`.
// First run generates baseline screenshots in e2e/__screenshots__/.
// Subsequent runs compare against baselines and fail if diffs exceed threshold.
// Thresholds are set globally in playwright.config.ts.
//
// These tests are intentionally local-only. They are not run in CI or on PR
// previews because screenshot rendering differs between macOS and Linux, making
// cross-platform comparison unreliable. Run them manually before and after any
// major layout or design change to catch visual regressions on your own machine.

import { test, expect, type Page } from "@playwright/test";

type VisualRoute = {
  path: string;
  name: string;
  maskSelectors?: string[];
};

const VISUAL_ROUTES: VisualRoute[] = [
  { path: "/", name: "home" },
  { path: "/adventures", name: "adventures" },
  { path: "/adventures/blind-by-design", name: "adventure-detail" },
  {
    path: "/adventures/blind-by-design/levels/beginner",
    name: "challenge-detail",
    maskSelectors: [".timestamp", "[data-discussion-posts]"],
  },
  { path: "/challenges", name: "challenges-grid" },
  { path: "/about", name: "about" },
  { path: "/404", name: "404" },
];

// CSS that hides the floating cookie preferences button, which renders whenever
// consent is non-null. We keep the button out of screenshots because it is a
// fixed overlay whose position is unrelated to page content.
// The selector mirrors the button's aria-label, which is also asserted in
// smoke.spec.ts; any rename will surface in both places simultaneously.
const CONSENT_BUTTON_CSS = `[aria-label="Change cookie preferences"] { display: none !important; }`;

// Registers a script to run before React mounts on each navigation.
// Pre-denying consent means useConsent restores "denied" from localStorage,
// so the banner never renders. The floating button still renders (consent !=
// null) and is hidden via CONSENT_BUTTON_CSS after navigation.
//
// "analytics_consent" is CONSENT_STORAGE_KEY from src/data/constants.ts.
// Hardcoded here because addInitScript runs in browser context without imports.
async function denyConsent(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem(
      "analytics_consent",
      JSON.stringify({ value: "denied", timestamp: Date.now() }),
    );
  });
}

test.describe("visual regression (dark mode)", () => {
  for (const { path, name, maskSelectors } of VISUAL_ROUTES) {
    test(name, async ({ page }) => {
      await denyConsent(page);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await page.addStyleTag({ content: CONSENT_BUTTON_CSS });

      const mask = maskSelectors?.map((s) => page.locator(s)) ?? [];

      await expect(page).toHaveScreenshot(`${name}-dark.png`, {
        fullPage: true,
        mask,
      });
    });
  }
});

test.describe("visual regression (light mode)", () => {
  for (const { path, name, maskSelectors } of VISUAL_ROUTES) {
    test(name, async ({ page }) => {
      await denyConsent(page);
      await page.addInitScript(() => localStorage.setItem("theme", "light"));
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await expect(page.locator("html")).toHaveClass(/light/);
      await page.addStyleTag({ content: CONSENT_BUTTON_CSS });

      const mask = maskSelectors?.map((s) => page.locator(s)) ?? [];

      await expect(page).toHaveScreenshot(`${name}-light.png`, {
        fullPage: true,
        mask,
      });
    });
  }
});

// Dedicated consent banner regression. No consent is pre-set so the banner
// renders in its natural state. Viewport-only (fullPage: false) so the banner
// is clearly visible at the bottom of the frame rather than lost at the bottom
// of a multi-screen full-page capture.
test.describe("visual regression — consent banner", () => {
  test("consent banner (dark mode)", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByRole("region", { name: "This site uses analytics cookies" }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot("consent-banner-dark.png", {
      fullPage: false,
    });
  });

  test("consent banner (light mode)", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("theme", "light"));
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("html")).toHaveClass(/light/);
    await expect(
      page.getByRole("region", { name: "This site uses analytics cookies" }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot("consent-banner-light.png", {
      fullPage: false,
    });
  });
});
