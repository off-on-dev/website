// Accessibility audit. Requires a production build in
// dist/ (the webServer runs e2e/static-server.mjs).
//
// Uses waitForLoadState("load") rather than "networkidle": prefetchAll keeps the
// network busy after load, so networkidle can hang.

import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { A11Y_PAGES as PAGES } from "./routes";

const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];


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
  // Count how many times the first-focusable element's key has been seen.
  // We break on the third occurrence (second re-appearance) rather than the
  // second, so that a mid-cycle element sharing firstKey's fingerprint does
  // not cause an early exit that skips everything after it. One extra cycle
  // costs ~N extra Tab presses but ensures every focusable element is visited.
  let firstKeyCount = 0;
  const seenKeys = new Set<string>();
  const violations: string[] = [];
  for (let i = 0; i < MAX_TABS; i++) {
    await page.keyboard.press("Tab");
    const result = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      if (!el || el.tagName === "BODY" || el === document.documentElement) return null;
      const cs = window.getComputedStyle(el);
      const hasBoxShadow = cs.boxShadow !== "none" && cs.boxShadow !== "";
      const hasOutline = parseFloat(cs.outlineWidth) > 0 && cs.outlineStyle !== "none";
      // Include the element's position in the tab order so elements that
      // share a tag, href, aria-label, and text (e.g. two nav links with the
      // same label at different viewport breakpoints) never collide and cause
      // an early exit from the cycle-detection loop.
      const allFocusable = Array.from(
        document.querySelectorAll<HTMLElement>("a, button, [tabindex], [role='button'], [role='link']"),
      );
      const domIdx = allFocusable.indexOf(el);
      const key = [
        el.tagName,
        el.id ?? "",
        el.getAttribute("href") ?? "",
        el.getAttribute("aria-label") ?? "",
        (el.textContent ?? "").trim().slice(0, 40),
        domIdx,
      ].join("|");
      return { key, hasFocusRing: hasBoxShadow || hasOutline, html: el.outerHTML.slice(0, 120) };
    });
    if (!result) break;
    if (firstKey === null) {
      firstKey = result.key;
      firstKeyCount = 1;
    } else if (result.key === firstKey) {
      firstKeyCount++;
      if (firstKeyCount >= 3) break;
    }
    // Deduplicate: seenKeys guards against double-counting violations when
    // elements are revisited during the extra confirmation cycle.
    if (!seenKeys.has(result.key)) {
      seenKeys.add(result.key);
      if (!result.hasFocusRing) violations.push(result.html);
    }
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

// KNOWN FRAGILITY — check free memory before checking your diff.
//
// This block is load-sensitive. On a busy machine it can fail on /, /adventures/
// and /challenges/ with a 2px overflow, then pass cleanly minutes later on the
// same build with nothing rebuilt. Measured on both a feature branch and main
// under comparable load, both sit at exactly scrollWidth === innerWidth === 384,
// so a failure here is more often the runner than the diff.
//
// Two causes, in order of how often they bite:
//
// 1. Memory exhaustion (the common one). The full suite runs 8 workers, each
//    with its own browser. On a developer machine already running an editor,
//    Chrome and a few Electron apps, the OS starts killing processes — usually
//    the static server. Playwright then reports whatever the test was doing at
//    the time, which here is a bogus scrollWidth reading, and elsewhere shows up
//    as `net::ERR_CONNECTION_REFUSED`, an empty `<title>`, or a timeout. The
//    failing set differs run to run, which is the tell. Check `PhysMem` in
//    `top -l 1 -n 0` first; under ~2G free, close things or use `--workers=2`.
//
// 2. Font swap (the theoretical one). Unlike visual.spec.ts this waits only for
//    "load", not `document.fonts.ready`, so self-hosted WOFF2 may still be
//    swapping when the measurement runs. Hardening:
//    `await page.evaluate(() => document.fonts.ready)` after waitForLoadState.
//
// If you see this fail: re-run it in isolation on a quiet machine, and compare
// against a build of main under the same conditions, before changing any CSS.
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

// WCAG 2.4.1 Bypass Blocks. The skip link is the first thing a keyboard user
// meets on every page; if it stops working, every page becomes a full tab
// crawl through the nav. Checked on a representative sample rather than all
// routes, since the link lives in the shared layout.
test.describe("skip link (WCAG 2.4.1)", () => {
  for (const path of ["/", "/adventures/", "/challenges/", "/handbook/"]) {
    test(`${path}: is the first Tab stop and moves focus into main`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("load");

      await page.keyboard.press("Tab");
      await expect(page.locator(":focus")).toContainText("Skip to main content");

      await page.keyboard.press("Enter");
      await expect(page.locator(":focus")).toHaveAttribute("id", "main-content");
    });
  }
});

// WCAG 2.1.2 + 3.2.1 — one keyboard traversal checks both:
//   • keyboard trap: a repeating focus pattern that excludes the page's
//     first focusable element signals focus is stuck inside a subset.
//   • context change on focus: Tab pressing must not trigger navigation.
//
// Both checks share a single traversal to avoid doubling test time.
// Pattern detection covers cycles of length 1–5.

function isRepeatingTrap(recentKeys: string[], firstKey: string): boolean {
  for (let len = 1; len <= 5; len++) {
    if (recentKeys.length < len * 2) continue;
    const tail = recentKeys.slice(-len * 2);
    const half = tail.slice(0, len);
    if (half.join("|||") === tail.slice(len).join("|||") && !half.includes(firstKey)) return true;
  }
  return false;
}

async function runKeyboardSafetyChecks(
  page: Page,
): Promise<{ trap: string | null; contextChange: string | null }> {
  const MAX_STEPS = 150;
  let firstKey: string | null = null;
  let firstKeyCount = 0;
  const recentKeys: string[] = [];

  for (let i = 0; i < MAX_STEPS; i++) {
    const { urlBefore, prevFocusHtml } = await page.evaluate(() => ({
      urlBefore: location.href,
      prevFocusHtml: (document.activeElement as HTMLElement)?.outerHTML?.slice(0, 120) ?? null,
    }));

    await page.keyboard.press("Tab");

    const urlAfter = page.url();
    if (urlAfter !== urlBefore) {
      return {
        trap: null,
        contextChange: `focusing ${prevFocusHtml ?? "unknown"} navigated to ${urlAfter}`,
      };
    }

    const result = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      if (!el || el.tagName === "BODY" || el === document.documentElement) return null;
      const allFocusable = Array.from(
        document.querySelectorAll<HTMLElement>(
          "a, button, [tabindex], [role='button'], [role='link']",
        ),
      );
      const domIdx = allFocusable.indexOf(el);
      const key = [
        el.tagName,
        el.id ?? "",
        el.getAttribute("href") ?? "",
        el.getAttribute("aria-label") ?? "",
        (el.textContent ?? "").trim().slice(0, 40),
        domIdx,
      ].join("\0");
      return { key, html: el.outerHTML.slice(0, 120) };
    });

    if (!result) break;

    if (firstKey === null) {
      firstKey = result.key;
      firstKeyCount = 1;
    } else if (result.key === firstKey) {
      firstKeyCount++;
      if (firstKeyCount >= 3) break;
    }

    recentKeys.push(result.key);
    if (recentKeys.length > 12) recentKeys.shift();

    if (firstKey !== null && recentKeys.length >= 4 && isRepeatingTrap(recentKeys, firstKey)) {
      return { trap: result.html, contextChange: null };
    }
  }

  return { trap: null, contextChange: null };
}

test.describe("keyboard trap + context change (WCAG 2.1.2, 3.2.1)", () => {
  for (const path of PAGES) {
    test(path, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      await page.waitForLoadState("load");
      const { trap, contextChange } = await runKeyboardSafetyChecks(page);
      expect(trap, `Keyboard trap on ${path} (WCAG 2.1.2)`).toBeNull();
      expect(contextChange, `Context change on focus on ${path} (WCAG 3.2.1)`).toBeNull();
    });
  }
});

// WAVE flags text under 10px as "very small text". The gate is set at that line
// rather than at the type scale minimum (text-xs, 12px), because inline <code>
// renders at 11.9px by design and would otherwise fail every prose page.
//
// Hidden elements are included deliberately: the avatar initials chips that
// prompted this are display:none while the image loads and become visible the
// moment it fails, so "currently hidden" is not a defence.
test.describe("no very small text", () => {
  const MIN_PX = 10;

  for (const path of PAGES) {
    test(path, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("load");

      const tooSmall = await page.evaluate((min) => {
        const out: string[] = [];
        document.querySelectorAll<HTMLElement>("body *").forEach((el) => {
          const own = Array.from(el.childNodes)
            .filter((n) => n.nodeType === 3)
            .map((n) => (n.textContent ?? "").trim())
            .join(" ")
            .trim();
          if (!own) return;
          const px = parseFloat(getComputedStyle(el).fontSize);
          if (px < min) {
            out.push(`${px}px <${el.tagName.toLowerCase()}> "${own.slice(0, 30)}"`);
          }
        });
        return [...new Set(out)];
      }, MIN_PX);

      expect(tooSmall, `text below ${MIN_PX}px on ${path}`).toEqual([]);
    });
  }
});
