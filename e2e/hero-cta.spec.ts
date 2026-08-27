// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

// The hero's primary CTA is an in-page jump to the adventure grid, which is why
// its icon is a down arrow. It had been changed to navigate to /challenges/
// while keeping the arrow, so the icon contradicted the behaviour.

import { test, expect } from "@playwright/test";

test("Start a Challenge scrolls to the adventure grid without navigating", async ({ page }) => {
  await page.goto("/");
  const cta = page.getByRole("link", { name: /Start a Challenge/ });
  await expect(cta).toHaveAttribute("href", "#challenges");

  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await cta.click();

  await expect(page).toHaveURL(/#challenges$/);
  await page.waitForFunction(() => window.scrollY > 0);

  // The target sits below the fixed navbar, not under it.
  const top = await page.locator("#challenges").evaluate((el) => el.getBoundingClientRect().top);
  expect(top).toBeGreaterThanOrEqual(0);
  expect(top).toBeLessThan(200);
});

test("the target section exists on the only page that renders the hero", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#challenges")).toHaveCount(1);
});
