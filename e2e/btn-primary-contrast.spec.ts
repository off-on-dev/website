// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

// WCAG 1.4.11 for the primary button, on every surface it appears on.
//
// The amber fill is only ~1.6:1 against the near-white surfaces in light mode,
// so the control is identified by its border there. `.btn-primary` is used
// site-wide, so this walks every route rather than one page.

import { test, expect, type Page } from "@playwright/test";
import { SMOKE_ROUTES } from "./routes";

const MIN_BOUNDARY = 3;
const MIN_LABEL = 4.5;

function lum(rgb: string): number {
  const [r, g, b] = rgb.match(/[\d.]+/g)!.slice(0, 3).map(Number);
  const f = (c: number): number => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function ratio(a: string, b: string): number {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/** Fill, border and the nearest opaque backdrop for every .btn-primary on the page. */
async function samples(page: Page): Promise<{ fill: string; border: string; backdrop: string }[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>(".btn-primary")).map((el) => {
      const cs = getComputedStyle(el);
      // Walk to the nearest ancestor with an opaque background. A translucent
      // one (the consent banner) is skipped: what the eye compares against is
      // the opaque surface behind it.
      let p: HTMLElement | null = el.parentElement;
      let backdrop = getComputedStyle(document.body).backgroundColor;
      while (p) {
        const bg = getComputedStyle(p).backgroundColor;
        if (/^rgb\(/.test(bg)) {
          backdrop = bg;
          break;
        }
        p = p.parentElement;
      }
      return { fill: cs.backgroundColor, border: cs.borderTopColor, backdrop };
    }),
  );
}

for (const theme of ["light", "dark"] as const) {
  test.describe(`${theme} mode`, () => {
    for (const path of Object.keys(SMOKE_ROUTES)) {
      test(`${path}: primary buttons are identifiable`, async ({ page }) => {
        await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
        await page.goto(path);
        await page.waitForLoadState("load");

        const found = await samples(page);
        for (const { fill, border, backdrop } of found) {
          // Either the fill or its border must separate the control from what
          // is behind it.
          const boundary = Math.max(ratio(fill, backdrop), ratio(border, backdrop));
          expect(
            boundary,
            `${path} (${theme}): fill ${fill} / border ${border} on ${backdrop}`,
          ).toBeGreaterThanOrEqual(MIN_BOUNDARY);
        }
      });
    }
  });
}

test("label contrast holds in both themes", async ({ page }) => {
  for (const theme of ["light", "dark"] as const) {
    await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
    await page.goto("/");
    await page.waitForLoadState("load");
    const rows = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>(".btn-primary")).map((el) => {
        const cs = getComputedStyle(el);
        return { fg: cs.color, bg: cs.backgroundColor };
      }),
    );
    for (const { fg, bg } of rows) {
      expect(ratio(fg, bg), `${theme}: label ${fg} on ${bg}`).toBeGreaterThanOrEqual(MIN_LABEL);
    }
  }
});

test("adding the border did not change button height", async ({ page }) => {
  await page.goto("/");
  const heights = await page.evaluate(() =>
    [".btn-primary", ".btn-ghost", ".btn-secondary"].map((sel) => {
      const el = document.querySelector(sel) as HTMLElement | null;
      return el ? Math.round(el.getBoundingClientRect().height) : null;
    }),
  );
  const present = heights.filter((h): h is number => h !== null);
  expect(new Set(present).size, `button heights differ: ${JSON.stringify(heights)}`).toBe(1);
});
