// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

// Starter nudge: appears for new visitors, stays gone once dismissed.
//
// It points at the easiest level of the newest live adventure, or of the most
// recent adventure when nothing is live. Live is a preference, not a gate:
// gating on it meant the pointer vanished entirely once every deadline had
// passed, which is exactly when a new visitor still needs somewhere to start.

import { test, expect, type Page } from "@playwright/test";

const NUDGE = "[data-starter-nudge]";
const DISMISS = "[data-starter-nudge-dismiss]";
const KEY = "starter_nudge_dismissed";

/**
 * The adventure the nudge should point at, derived from the /adventures/ grid:
 * cards are newest-first, so it is the first one carrying a Live pill, else the
 * first card. Computed from the page rather than hardcoded, so the expectation
 * follows the content instead of going stale when a deadline passes.
 */
async function expectedStarterSlug(page: Page): Promise<{ slug: string; live: boolean }> {
  await page.goto("/adventures/");
  await page.waitForLoadState("load");

  // Grid cards only (`.card-glow`), in DOM order, which is newest-first.
  // Liveness comes from the LivePill element, not its text: the label is
  // lowercase in source and uppercased by CSS, and it sits flush against
  // neighbouring words in textContent.
  const cards = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLAnchorElement>('a.card-glow[href*="/adventures/"]'))
      .filter((a) => /\/adventures\/[^/]+\/$/.test(new URL(a.href).pathname))
      .map((a) => ({
        slug: new URL(a.href).pathname.split("/adventures/")[1].replace("/", ""),
        live: !!a.querySelector("[data-live-pill]"),
      })),
  );

  const live = cards.find((c) => c.live);
  return { slug: (live ?? cards[0]).slug, live: !!live };
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

test("points at the newest live adventure, or the most recent when none is live", async ({
  page,
}) => {
  const { slug, live } = await expectedStarterSlug(page);

  await page.goto("/");
  const href = await page.locator(`${NUDGE} a`).getAttribute("href");
  expect(
    href,
    live ? `expected the newest live adventure (${slug})` : `nothing live, expected the most recent (${slug})`,
  ).toContain(`/adventures/${slug}/`);
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
