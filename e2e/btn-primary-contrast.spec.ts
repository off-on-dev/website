// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

// WCAG 1.4.11 for every filled or outlined button class, on every surface it
// appears on. Runs in both light and dark mode across all smoke-test routes.

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

/**
 * Fill, border and the nearest opaque backdrop for every matching button on the page.
 *
 * Colors are resolved through a 1×1 canvas so that semi-transparent and
 * non-rgb formats (oklab, oklch, …) from Tailwind 4 are always returned as
 * opaque rgb() strings that lum() can parse.
 */
async function samples(
  page: Page,
  selector: string,
): Promise<{ fill: string; border: string; backdrop: string }[]> {
  return page.evaluate((sel) => {
    // Composite `color` over `bg` in a 1×1 canvas and return the opaque result.
    function resolve(color: string, bg: string): string {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 1, 1);
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      return `rgb(${d[0]}, ${d[1]}, ${d[2]})`;
    }

    return Array.from(document.querySelectorAll<HTMLElement>(sel)).map((el) => {
      const cs = getComputedStyle(el);
      // Walk to the nearest ancestor with an opaque background. Browsers return
      // solid backgrounds as rgb(); transparent ones as rgba(0,0,0,0) or similar.
      // A translucent ancestor (the consent banner) is intentionally skipped so
      // the comparison is against the opaque surface the eye sees behind it.
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
      return {
        fill: resolve(cs.backgroundColor, backdrop),
        border: resolve(cs.borderTopColor, backdrop),
        backdrop,
      };
    });
  }, selector);
}

const BOUNDARY_BUTTONS = [
  { kind: "primary", selector: ".btn-primary" },
  { kind: "ghost", selector: ".btn-ghost" },
  { kind: "secondary", selector: ".btn-secondary" },
] as const;

for (const { kind, selector } of BOUNDARY_BUTTONS) {
  for (const theme of ["light", "dark"] as const) {
    test.describe(`${theme} mode — ${kind} boundary`, () => {
      for (const path of Object.keys(SMOKE_ROUTES)) {
        test(`${path}: ${kind} buttons are identifiable`, async ({ page }) => {
          await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
          await page.goto(path);
          await page.waitForLoadState("load");

          const found = await samples(page, selector);
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
