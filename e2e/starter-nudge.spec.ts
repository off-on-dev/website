// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

// Starter nudge: appears for new visitors, stays gone once dismissed.
//
// It points at the easiest level of the most recent adventure, and is not gated
// on whether that adventure is still live. Gating on live meant the pointer
// vanished entirely once every deadline had passed, which is exactly when a new
// visitor still needs somewhere to start.

import { test, expect, type Page } from "@playwright/test";

const NUDGE = "[data-starter-nudge]";
const DISMISS = "[data-starter-nudge-dismiss]";
const KEY = "starter_nudge_dismissed";

/** The adventure slug the /adventures/ grid lists first, i.e. the most recent. */
async function latestAdventureSlug(page: Page): Promise<string> {
  await page.goto("/adventures/");
  await page.waitForLoadState("load");
  const href = await page
    .locator('a[href*="/adventures/"]')
    .filter({ hasNot: page.locator("[data-starter-nudge]") })
    .first()
    .getAttribute("href");
  return href!.split("/adventures/")[1].split("/")[0];
}

test("renders regardless of whether any adventure is live", async ({ page }) => {
  const anyLive = (await page.getByText("Live", { exact: true }).count()) > 0;

  await page.goto("/");
  await page.waitForLoadState("load");

  await expect(
    page.locator(NUDGE),
    `nudge must render whether or not an adventure is live (live: ${anyLive})`,
  ).toBeVisible();
});

test("points at the most recent adventure", async ({ page }) => {
  const latest = await latestAdventureSlug(page);

  await page.goto("/");
  const href = await page.locator(`${NUDGE} a`).getAttribute("href");
  expect(href).toContain(`/adventures/${latest}/`);
});

test("points at the easiest level of that adventure", async ({ page }) => {
  await page.goto("/");
  const href = await page.locator(`${NUDGE} a`).getAttribute("href");
  expect(href).toMatch(/\/levels\/beginner\/$/);
});

test.describe("behaviour", () => {
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
