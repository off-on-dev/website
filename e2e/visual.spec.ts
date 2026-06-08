// Visual regression tests. Run `npm run build` before `npm run test:visual`.
// First run generates baseline screenshots in e2e/__screenshots__/.
// Subsequent runs compare against baselines and fail if diffs exceed threshold.
// Thresholds are set globally in playwright.config.ts.

import { test, expect } from "@playwright/test";

type VisualRoute = {
  path: string;
  name: string;
  maskSelectors?: string[]; // Elements to mask (dates, avatars, dynamic content)
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

// Hide consent banner and floating cookie button; both vary between sessions
// and would produce spurious pixel diffs unrelated to visual changes.
const HIDE_CONSENT_CSS = `
  [role="region"][aria-label*="cookies"],
  [aria-label*="cookie preferences"] {
    display: none !important;
  }
`;

async function hideConsent(page: import("@playwright/test").Page): Promise<void> {
  await page.addStyleTag({ content: HIDE_CONSENT_CSS });
}

test.describe("visual regression (dark mode)", () => {
  for (const { path, name, maskSelectors } of VISUAL_ROUTES) {
    test(name, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await hideConsent(page);

      const mask = maskSelectors?.map((s) => page.locator(s).first()) ?? [];

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
      await page.addInitScript(() => localStorage.setItem("theme", "light"));
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await expect(page.locator("html")).toHaveClass(/light/);
      await hideConsent(page);

      const mask = maskSelectors?.map((s) => page.locator(s).first()) ?? [];

      await expect(page).toHaveScreenshot(`${name}-light.png`, {
        fullPage: true,
        mask,
      });
    });
  }
});
