// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT
// Brand page table-of-contents scrollspy (P14).
//
// The React BrandGuidelines page tracked the section in view with an
// IntersectionObserver and marked the TOC link aria-current="location". The
// Astro port shipped a static TOC with no script and no active state.
import { test, expect } from "@playwright/test";

const current = (page: import("@playwright/test").Page) =>
  page.evaluate(() => {
    const el = document.querySelector('[data-toc-link][aria-current="location"]') as HTMLElement | null;
    return el ? { id: el.dataset.tocLink, hasActiveBorder: el.classList.contains("border-primary") } : null;
  });

test("brand TOC scrollspy tracks the section in view", async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto("/brand/");
  await page.waitForFunction(() => !!document.querySelector("[data-toc]"));

  expect(await current(page)).toEqual({ id: "mission", hasActiveBorder: true });

  for (const id of ["typography", "voice", "accessibility"]) {
    await page.evaluate((i) => document.getElementById(i)!.scrollIntoView({ block: "start" }), id);
    await page.waitForFunction(
      (i) => document.querySelector('[data-toc-link][aria-current="location"]')?.getAttribute("data-toc-link") === i,
      id,
      { timeout: 4000 },
    );
    expect(await current(page)).toEqual({ id, hasActiveBorder: true });
  }

  // Exactly one link is ever marked current.
  const n = await page.locator('[data-toc-link][aria-current="location"]').count();
  expect(n).toBe(1);
});
