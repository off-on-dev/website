// Accessibility audit for the Astro build. Ported from the React app's
// e2e/a11y.spec.ts + smoke.spec.ts axe audit. Requires a production build in
// dist/ (the webServer runs `astro preview`).
//
// Uses waitForLoadState("load") rather than "networkidle": prefetchAll keeps the
// network busy after load, so networkidle can hang.

import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

// Representative routes across every layout type + all static pages.
const PAGES = [
  "/",
  "/adventures/",
  "/challenges/",
  "/adventures/blind-by-design/",
  "/adventures/blind-by-design/levels/beginner/",
  "/adventures/echoes-lost-in-orbit/levels/beginner/solution/",
  "/challenges/opentelemetry/",
  "/about/",
  "/contribute/",
  "/handbook/",
  "/privacy/",
  "/accessibility/",
  "/sponsors/",
  "/brand/",
  "/presentation-templates/",
];

test.describe("axe: dark mode", () => {
  for (const path of PAGES) {
    test(path, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      await page.waitForLoadState("load");
      const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
      expect(results.violations, `axe violations on ${path} (dark)`).toEqual([]);
    });
  }
});

test.describe("axe: light mode", () => {
  for (const path of PAGES) {
    test(path, async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem("theme", "light"));
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      await page.waitForLoadState("load");
      const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
      expect(results.violations, `axe violations on ${path} (light)`).toEqual([]);
    });
  }
});

test.describe("axe: forced colors (Windows High Contrast)", () => {
  for (const path of PAGES) {
    test(path, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
      await page.goto(path);
      await page.waitForLoadState("load");
      // color-contrast excluded: forced-colors emulation fires the media query
      // but doesn't remap computed colors, producing false positives.
      const results = await new AxeBuilder({ page })
        .withTags(AXE_TAGS)
        .disableRules(["color-contrast"])
        .analyze();
      expect(results.violations, `forced-colors axe violations on ${path}`).toEqual([]);
    });
  }
});

test.describe("touch target minimum size (WCAG 2.5.8)", () => {
  for (const path of PAGES) {
    test(path, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("load");
      const violations = await page.evaluate((): string[] => {
        const MIN = 24;
        return Array.from(
          document.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [role="button"], [role="link"]',
          ),
        )
          .filter((el) => {
            if (window.getComputedStyle(el).display === "inline") return false;
            if (el.closest("p, td, th, dd, blockquote, figcaption")) return false;
            const parent = el.parentElement;
            if (parent) {
              const hasTextSiblings = Array.from(parent.childNodes).some(
                (n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? "").trim().length > 0,
              );
              if (hasTextSiblings) return false;
            }
            const r = el.getBoundingClientRect();
            const inViewport =
              r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
            return inViewport && r.width > 0 && r.height > 0 && (r.width < MIN || r.height < MIN);
          })
          .map((el) => {
            const { width, height } = el.getBoundingClientRect();
            return `${Math.round(width)}×${Math.round(height)}px: ${el.outerHTML.slice(0, 100)}`;
          });
      });
      expect(violations, `Interactive elements below 24×24px on ${path}`).toHaveLength(0);
    });
  }
});

const MAX_TABS = 200;

async function collectFocusViolations(page: Page): Promise<string[]> {
  let firstKey: string | null = null;
  const violations: string[] = [];
  for (let i = 0; i < MAX_TABS; i++) {
    await page.keyboard.press("Tab");
    const result = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      if (!el || el.tagName === "BODY" || el === document.documentElement) return null;
      const cs = window.getComputedStyle(el);
      const hasBoxShadow = cs.boxShadow !== "none" && cs.boxShadow !== "";
      const hasOutline = parseFloat(cs.outlineWidth) > 0 && cs.outlineStyle !== "none";
      const key = [
        el.tagName,
        el.id ?? "",
        el.getAttribute("href") ?? "",
        el.getAttribute("aria-label") ?? "",
        (el.textContent ?? "").trim().slice(0, 40),
      ].join("|");
      return { key, hasFocusRing: hasBoxShadow || hasOutline, html: el.outerHTML.slice(0, 120) };
    });
    if (!result) break;
    if (firstKey === null) firstKey = result.key;
    else if (result.key === firstKey) break;
    if (!result.hasFocusRing) violations.push(result.html);
  }
  return violations;
}

test.describe("focus ring visibility: dark mode", () => {
  for (const path of PAGES) {
    test(path, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      await page.waitForLoadState("load");
      const violations = await collectFocusViolations(page);
      expect(violations, `Elements missing focus ring on ${path} (dark)`).toHaveLength(0);
    });
  }
});

test.describe("focus ring visibility: light mode", () => {
  for (const path of PAGES) {
    test(path, async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem("theme", "light"));
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      await page.waitForLoadState("load");
      const violations = await collectFocusViolations(page);
      expect(violations, `Elements missing focus ring on ${path} (light)`).toHaveLength(0);
    });
  }
});

test.describe("200% zoom: no horizontal overflow", () => {
  for (const path of PAGES) {
    test(path, async ({ page }) => {
      await page.setViewportSize({ width: 384, height: 768 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      await page.waitForLoadState("load");
      const hasOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      expect(hasOverflow, `Horizontal overflow at 384px viewport on ${path}`).toBe(false);
    });
  }
});
