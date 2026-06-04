// Automates the manual accessibility checks from ACCESSIBILITY.md.
// Requires a production build in dist/client/. Run `npm run build` before `npm run test:e2e`.

import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Representative routes covering each major layout type:
// home, adventure listing, adventure landing, level detail, challenge tag.
const PAGES = [
  "/",
  "/challenges",
  "/adventures/blind-by-design",
  "/adventures/blind-by-design/levels/beginner",
  "/challenges/opentelemetry",
];

// ---------------------------------------------------------------------------
// Windows High Contrast Mode (forced colors)
// Activates the CSS `forced-colors: active` media feature so that
// @media (forced-colors: active) overrides in src/index.css are exercised.
// Verifies no axe rules are violated under this rendering mode, catching
// components that rely solely on background-color to communicate state.
// ---------------------------------------------------------------------------

test.describe("Windows High Contrast Mode — forced colors", () => {
  for (const path of PAGES) {
    test(path, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      // color-contrast is excluded: under Playwright's forced-colors emulation
      // the CSS media query fires but computed colors are not remapped to system
      // values, producing false positives. Real forced-colors rendering handles
      // contrast automatically via the system color palette.
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
        .disableRules(["color-contrast"])
        .analyze();
      expect(results.violations, `forced-colors axe violations on ${path}`).toEqual([]);
    });
  }
});

// ---------------------------------------------------------------------------
// Touch target minimum size (WCAG 2.5.8)
// Every interactive element visible in the viewport must have a bounding box
// of at least 24×24 CSS pixels. Skips elements fully outside the viewport
// (e.g. below-fold cards) since they are not currently reachable by touch.
// ---------------------------------------------------------------------------

test.describe("touch target minimum size (WCAG 2.5.8)", () => {
  for (const path of PAGES) {
    test(path, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const violations = await page.evaluate((): string[] => {
        const MIN = 24;
        return Array.from(
          document.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [role="button"], [role="link"]',
          ),
        )
          .filter((el) => {
            // WCAG 2.5.8 exempts inline targets within sentences whose size is
            // constrained by the surrounding line-height of non-target text.
            // display:inline is always an inline text run.
            if (window.getComputedStyle(el).display === "inline") return false;

            // Exempt links inside block-level prose containers.
            if (el.closest("p, td, th, dd, blockquote, figcaption")) return false;

            // Exempt links whose immediate parent has non-whitespace text node
            // siblings — the link is inline within a sentence and its size is
            // constrained by the surrounding line-height. This covers both the
            // <p>text <a>...</a> text</p> pattern and the
            // <span class="md-inline">text <a>...</a></span> pattern used when
            // Markdown prose is wrapped in a span for CSS scoping.
            const parent = el.parentElement;
            if (parent) {
              const hasTextSiblings = Array.from(parent.childNodes).some(
                (n) =>
                  n.nodeType === Node.TEXT_NODE &&
                  (n.textContent ?? "").trim().length > 0,
              );
              if (hasTextSiblings) return false;
            }

            const r = el.getBoundingClientRect();
            const inViewport =
              r.bottom > 0 &&
              r.top < window.innerHeight &&
              r.right > 0 &&
              r.left < window.innerWidth;
            return inViewport && r.width > 0 && r.height > 0 && (r.width < MIN || r.height < MIN);
          })
          .map((el) => {
            const { width, height } = el.getBoundingClientRect();
            return `${Math.round(width)}×${Math.round(height)}px — ${el.outerHTML.slice(0, 100)}`;
          });
      });

      expect(
        violations,
        `Interactive elements below 24×24px (WCAG 2.5.8) on ${path}`,
      ).toHaveLength(0);
    });
  }
});

// ---------------------------------------------------------------------------
// Focus ring visibility
// Tabs through all keyboard-reachable elements and asserts that each one has
// a visible focus indicator. The pattern in this codebase is Tailwind ring
// utilities, which produce a box-shadow; outline-width > 0 is also accepted
// for browser-default or custom outline styles. Stops when focus cycles back
// to the first focused element (full traversal complete).
// Runs in both dark and light mode because ring colors differ between modes.
// ---------------------------------------------------------------------------

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

      return {
        key,
        hasFocusRing: hasBoxShadow || hasOutline,
        html: el.outerHTML.slice(0, 120),
      };
    });

    if (!result) break;

    if (firstKey === null) {
      firstKey = result.key;
    } else if (result.key === firstKey) {
      break; // Completed a full cycle.
    }

    if (!result.hasFocusRing) {
      violations.push(result.html);
    }
  }

  return violations;
}

test.describe("focus ring visibility — dark mode", () => {
  for (const path of PAGES) {
    test(path, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const violations = await collectFocusViolations(page);
      expect(violations, `Elements missing focus ring on ${path} (dark)`).toHaveLength(0);
    });
  }
});

test.describe("focus ring visibility — light mode", () => {
  for (const path of PAGES) {
    test(path, async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem("theme", "light"));
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const violations = await collectFocusViolations(page);
      expect(violations, `Elements missing focus ring on ${path} (light)`).toHaveLength(0);
    });
  }
});

// ---------------------------------------------------------------------------
// Keyboard focus trap detection
// Tabs through the page and fails if the same element receives keyboard focus
// on two consecutive keypresses — the signature of a focus trap where Tab
// cannot move focus forward. Normal focus cycling (returning to the first
// element after the last) is not a trap and is detected by the key change.
// ---------------------------------------------------------------------------

test.describe("keyboard focus trap detection", () => {
  for (const path of PAGES) {
    test(path, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      let previousKey: string | null = null;

      for (let i = 0; i < MAX_TABS; i++) {
        await page.keyboard.press("Tab");

        const key = await page.evaluate((): string | null => {
          const el = document.activeElement as HTMLElement;
          if (!el || el.tagName === "BODY") return null;
          return [
            el.tagName,
            el.id ?? "",
            el.getAttribute("href") ?? "",
            el.getAttribute("aria-label") ?? "",
            (el.textContent ?? "").trim().slice(0, 40),
          ].join("|");
        });

        if (!key) break;

        expect(
          key,
          `Focus trap on ${path}: Tab did not move focus away from "${key}"`,
        ).not.toBe(previousKey);

        previousKey = key;
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 200% zoom — no horizontal overflow
// A 384px viewport approximates the layout effect of 200% browser zoom on a
// 768px screen (the tablet breakpoint). Horizontal scrollbar presence at
// this width means content overflows its container and will clip or require
// sideways scrolling at high zoom levels.
// ---------------------------------------------------------------------------

test.describe("200% zoom — no horizontal overflow", () => {
  for (const path of PAGES) {
    test(path, async ({ page }) => {
      await page.setViewportSize({ width: 384, height: 768 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const hasOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );

      expect(
        hasOverflow,
        `Horizontal overflow at 384px viewport (200% zoom equivalent) on ${path}`,
      ).toBe(false);
    });
  }
});
