// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

// Starter nudge: appears for new visitors, stays gone once dismissed.
//
// It only renders when some adventure is live, i.e. has a rewards or level
// deadline still in the future. With every deadline passed there is no starter
// challenge to point at, so the correct output is nothing at all. The first test
// pins that rule; the behavioural ones skip themselves when there is no live
// adventure, and say so, rather than passing vacuously.

import { test, expect, type Page } from "@playwright/test";

const NUDGE = "[data-starter-nudge]";
const DISMISS = "[data-starter-nudge-dismiss]";
const KEY = "starter_nudge_dismissed";

/** True when the build has at least one live adventure, per the Live pill. */
async function hasLiveAdventure(page: Page): Promise<boolean> {
  await page.goto("/adventures/");
  await page.waitForLoadState("load");
  return (await page.getByText("Live", { exact: true }).count()) > 0;
}

test("renders only when an adventure is live", async ({ page }) => {
  const live = await hasLiveAdventure(page);

  await page.goto("/");
  await page.waitForLoadState("load");
  const present = (await page.locator(NUDGE).count()) > 0;

  expect(
    present,
    live
      ? "an adventure is live, so the nudge should be rendered"
      : "no adventure is live, so the nudge should not be rendered at all",
  ).toBe(live);
});

test.describe("when a starter challenge exists", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!(await hasLiveAdventure(page)), "no live adventure in this build");
  });

  for (const path of ["/", "/challenges/"]) {
    test(`${path}: shows for a new visitor and links to the starter level`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator(NUDGE)).toBeVisible();
      await expect(page.locator(`${NUDGE} a`)).toHaveAttribute(
        "href",
        /\/adventures\/.+\/levels\/.+\//,
      );
    });

    test(`${path}: stays hidden once dismissed`, async ({ page }) => {
      await page.addInitScript((k) => localStorage.setItem(k, "1"), KEY);
      await page.goto(path);
      await page.waitForLoadState("load");
      await expect(page.locator(NUDGE)).toBeHidden();
    });
  }

  test("dismissing hides it and persists across a reload", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(NUDGE)).toBeVisible();

    await page.locator(DISMISS).click();
    await expect(page.locator(NUDGE)).toBeHidden();
    expect(await page.evaluate((k) => localStorage.getItem(k), KEY)).toBe("1");

    await page.reload();
    await page.waitForLoadState("load");
    await expect(page.locator(NUDGE)).toBeHidden();
  });

  test("is inside an atomic live region so it is announced on reveal", async ({ page }) => {
    await page.goto("/");
    const live = page.locator('[aria-live="polite"]').filter({ has: page.locator(NUDGE) });
    await expect(live).toHaveAttribute("aria-atomic", "true");
  });

  test("survives a client-side navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(NUDGE)).toBeVisible();
    await page.getByRole("link", { name: "Challenges", exact: true }).first().click();
    await page.waitForURL("**/challenges/");
    await expect(page.locator(NUDGE)).toBeVisible();
  });
});
