// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

// Behaviours the Vue component's unit tests covered, retargeted at the rendered
// page: SSR-correct filtered state on a tag route, widening past that tag, URL
// reconciliation in both directions, the empty state, and live-region timing.
//
import { test, expect, type Page } from "@playwright/test";
test.use({ viewport: { width: 1400, height: 900 } });

const cards = (p: Page) => p.locator("[data-level-card]:not([hidden])");
const advGrid = (p: Page) => p.locator('[data-results="adventures"]');
const count = (p: Page) => p.locator("[data-count]");
const live = (p: Page) => p.locator("[data-live-count]");
const url = (p: Page) => new URL(p.url()).pathname + new URL(p.url()).search;

test("tag route SSR shows only matching cards, with JS disabled", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const p = await ctx.newPage();
  await p.goto("/challenges/kubernetes/");
  expect(await cards(p).count()).toBe(3);
  await expect(advGrid(p)).toBeHidden();
  await expect(count(p)).toHaveText("3 challenges · Kubernetes");
  await ctx.close();
});

test("widening with All Tools shows everything and drops the path segment", async ({ page }) => {
  await page.goto("/challenges/kubernetes/");
  expect(await cards(page).count()).toBe(3);
  await page.getByRole("button", { name: "All Tools" }).first().click();
  // No filters: the level grid is hidden as a whole and the adventure grid returns.
  await expect(page.locator('[data-results="levels"]')).toBeHidden();
  await expect(advGrid(page)).toBeVisible();
  expect(url(page)).toBe("/challenges/");
});

test("adding a second tag widens and syncs both into ?topics", async ({ page }) => {
  await page.goto("/challenges/kubernetes/");
  const before = await cards(page).count();
  await page.getByRole("button", { name: "Backstage", exact: true }).first().click();
  const after = await cards(page).count();
  expect(after).toBeGreaterThan(before);
  expect(url(page)).toContain("topics=kubernetes%2Cbackstage");
});

test("restores ?topics and ?difficulty on load", async ({ page }) => {
  await page.goto("/challenges/?topics=kubernetes&difficulty=Expert");
  await page.waitForFunction(() => !document.querySelector('[data-results="levels"]')?.hasAttribute("hidden"));
  const shown = await cards(page).count();
  expect(shown).toBeGreaterThan(0);
  for (const c of await cards(page).all()) {
    expect(await c.getAttribute("data-difficulty")).toBe("Expert");
    expect(await c.getAttribute("data-tags")).toContain("kubernetes");
  }
  await expect(count(page)).toHaveText(/Expert/);
});

test("empty state appears when nothing matches", async ({ page }) => {
  await page.goto("/challenges/?topics=kubernetes&difficulty=Beginner");
  await page.waitForLoadState("load");
  const shown = await cards(page).count();
  const empty = page.locator("[data-empty]");
  if (shown === 0) await expect(empty).toBeVisible();
  else await expect(empty).toBeHidden();
  console.log("  kubernetes+Beginner matches:", shown);
});

test("live region is silent on load and speaks after a change", async ({ page }) => {
  await page.goto("/challenges/kubernetes/");
  await expect(live(page)).toHaveText("");
  await page.getByRole("radio", { name: "Expert" }).click();
  await expect(live(page)).toHaveText(/Showing \d+ challenge/);

  // Clearing the tags while a difficulty is still set is not "filters cleared".
  await page.getByRole("button", { name: "All Tools" }).first().click();
  await expect(live(page)).toHaveText(/Showing .*Expert/);

  await page.getByRole("radio", { name: "All Levels" }).click();
  await expect(live(page)).toHaveText(/Filters cleared/);
});

test("difficulty toggles off when reselected", async ({ page }) => {
  await page.goto("/challenges/");
  await page.getByRole("radio", { name: "Expert" }).click();
  expect(url(page)).toContain("difficulty=Expert");
  await page.getByRole("radio", { name: "Expert" }).click();
  expect(url(page)).not.toContain("difficulty=");
});

test("home swaps the adventure grid for results when filtered", async ({ page }) => {
  await page.goto("/");
  await expect(advGrid(page)).toBeVisible();
  await expect(page.locator('[data-results="levels"]')).toBeHidden();

  await page.getByRole("radio", { name: "Expert" }).click();
  await expect(advGrid(page)).toBeHidden();
  await expect(page.locator('[data-results="levels"]')).toBeVisible();
});

// ── ARIA contract ───────────────────────────────────────────────────────────
// Structural assertions the unit tests used to make against the mounted
// component. Cheap here, and they now check the shipped markup rather than a
// render tree.

test.describe("aria contract", () => {
  test("desktop difficulty controls form a labelled radiogroup", async ({ page }) => {
    await page.goto("/challenges/");
    const group = page.getByRole("radiogroup", { name: "Filter by difficulty" });
    await expect(group).toBeVisible();

    const radios = group.getByRole("radio");
    // All Levels plus one per difficulty.
    await expect(radios).toHaveCount(4);
    await expect(radios.first()).toHaveAccessibleName("All Levels");

    // Exactly one checked, and the values are the strings ARIA requires.
    await expect(group.locator('[aria-checked="true"]')).toHaveCount(1);
    await expect(radios.first()).toHaveAttribute("aria-checked", "true");
    await expect(radios.nth(1)).toHaveAttribute("aria-checked", "false");
  });

  test("desktop technology controls form a labelled group of toggles", async ({ page }) => {
    await page.goto("/challenges/");
    const group = page.getByRole("group", { name: "Filter by technology" });
    await expect(group).toBeVisible();
    await expect(group.getByRole("button", { name: "All Tools" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("the live region is polite and atomic", async ({ page }) => {
    await page.goto("/challenges/");
    const live = page.locator("[data-live-count]");
    await expect(live).toHaveAttribute("aria-live", "polite");
    await expect(live).toHaveAttribute("aria-atomic", "true");
  });

  test("selecting a second difficulty deselects the first", async ({ page }) => {
    await page.goto("/challenges/");
    const group = page.getByRole("radiogroup", { name: "Filter by difficulty" });
    await page.getByRole("radio", { name: "Beginner" }).click();
    await expect(page.getByRole("radio", { name: "Beginner" })).toHaveAttribute("aria-checked", "true");

    await page.getByRole("radio", { name: "Expert" }).click();
    await expect(page.getByRole("radio", { name: "Beginner" })).toHaveAttribute("aria-checked", "false");
    await expect(group.locator('[aria-checked="true"]')).toHaveCount(1);
  });

  test("All Levels clears the difficulty selection", async ({ page }) => {
    await page.goto("/challenges/");
    await page.getByRole("radio", { name: "Expert" }).click();
    await page.getByRole("radio", { name: "All Levels" }).click();
    await expect(page.getByRole("radio", { name: "All Levels" })).toHaveAttribute("aria-checked", "true");
    expect(url(page)).not.toContain("difficulty=");
  });

  test("tag pills toggle aria-pressed both ways", async ({ page }) => {
    await page.goto("/challenges/");
    const pill = page.getByRole("button", { name: "Kubernetes", exact: true }).first();
    await expect(pill).toHaveAttribute("aria-pressed", "false");
    await pill.click();
    await expect(pill).toHaveAttribute("aria-pressed", "true");
    await pill.click();
    await expect(pill).toHaveAttribute("aria-pressed", "false");
  });

  test("the sr-only results heading is suppressed on home and present on /challenges/", async ({
    page,
  }) => {
    // Home already has a visible "Choose Your Adventure" heading; a second one
    // would duplicate the document outline.
    await page.goto("/");
    await expect(page.locator("[data-results-heading]")).toHaveCount(0);

    await page.goto("/challenges/");
    await expect(page.locator("[data-results-heading]")).toHaveText("All Challenges");
    await page.getByRole("radio", { name: "Expert" }).click();
    await expect(page.locator("[data-results-heading]")).toHaveText("Filtered Challenges");
  });

  test("the See all link appears only when the page previews fewer adventures than exist", async ({
    page,
  }) => {
    await page.goto("/adventures/");
    const total = await page.locator('a.card-glow[href*="/adventures/"]').count();

    await page.goto("/");
    const previewed = await page.locator('[data-results="adventures"] a.card-glow').count();
    const link = page.locator("[data-see-all]");

    if (total > previewed) await expect(link).toBeVisible();
    else await expect(link).toHaveCount(0);
  });
});

// ── mobile dropdowns ────────────────────────────────────────────────────────

test.describe("mobile dropdowns", () => {
  test.use({ viewport: { width: 800, height: 900 } });

  test("triggers are wired to their panels and start closed", async ({ page }) => {
    await page.goto("/challenges/");
    for (const id of ["difficulty-group", "tags-group"]) {
      const trigger = page.locator(`[aria-controls="${id}"]`);
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
      await expect(page.locator(`#${id}`)).toBeHidden();
    }
  });

  test("opening one dropdown closes the other", async ({ page }) => {
    await page.goto("/challenges/");
    await page.locator('[aria-controls="difficulty-group"]').click();
    await expect(page.locator("#difficulty-group")).toBeVisible();

    await page.locator('[aria-controls="tags-group"]').click();
    await expect(page.locator("#tags-group")).toBeVisible();
    await expect(page.locator("#difficulty-group")).toBeHidden();
  });

  test("a choice made in the dropdown is reflected in the desktop controls", async ({ page }) => {
    await page.goto("/challenges/");
    await page.locator('[aria-controls="difficulty-group"]').click();
    await page.locator('#difficulty-group [data-difficulty-option="Expert"]').click();

    await expect(page.locator('[aria-controls="difficulty-group"]')).toHaveAccessibleName(
      "Filter by difficulty: Expert",
    );

    // Both breakpoints read the same state, so the desktop radio agrees.
    await page.setViewportSize({ width: 1400, height: 900 });
    await expect(page.getByRole("radio", { name: "Expert" })).toHaveAttribute("aria-checked", "true");
  });
});

test.describe("keyboard edge cases", () => {
  test("non-arrow keys do not move the radiogroup selection", async ({ page }) => {
    await page.goto("/challenges/");
    const allLevels = page.getByRole("radio", { name: "All Levels" });
    await allLevels.focus();

    for (const key of ["Enter", "Home", "End", "a", "Escape"]) {
      await page.keyboard.press(key);
    }
    await expect(allLevels).toHaveAttribute("aria-checked", "true");
    expect(url(page)).not.toContain("difficulty=");
  });
});

test.describe("dropdown panels are labelled groups", () => {
  test.use({ viewport: { width: 800, height: 900 } });

  for (const [id, label] of [
    ["difficulty-group", "Filter by difficulty"],
    ["tags-group", "Filter by technology"],
  ] as const) {
    test(`#${id} is role=group labelled "${label}"`, async ({ page }) => {
      await page.goto("/challenges/");
      const panel = page.locator(`#${id}`);
      await expect(panel).toHaveAttribute("role", "group");
      await expect(panel).toHaveAttribute("aria-label", label);
    });
  }
});
