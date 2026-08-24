// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT
// ChallengesFilter dropdown dismissal: an open panel must close on Escape, on an
// outside click, and when focus leaves it. Closing on focus-out must not pull
// focus back to the trigger, since the user has already tabbed somewhere else.
import { test, expect } from "@playwright/test";

// The dropdowns are the mobile/tablet UI (lg:hidden), so stay under 1024px.
test.use({ viewport: { width: 800, height: 900 } });

const DIFF_TRIGGER = 'button[aria-controls="difficulty-group"]';
const DIFF_PANEL = "#difficulty-group";
const TAGS_TRIGGER = 'button[aria-controls="tags-group"]';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("analytics_consent", JSON.stringify({ value: "denied", timestamp: Date.now() })),
  );
  await page.goto("/challenges/");
  await page.waitForSelector(DIFF_TRIGGER);
});

test("tabbing out of an open panel closes it without stealing focus", async ({ page }) => {
  await page.click(DIFF_TRIGGER);
  await expect(page.locator(DIFF_PANEL)).toBeVisible();
  await expect(page.locator(DIFF_TRIGGER)).toHaveAttribute("aria-expanded", "true");

  // Walk forward until focus leaves the difficulty wrapper.
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    const inside = await page.evaluate(
      () => !!document.activeElement?.closest("#difficulty-group, [aria-controls='difficulty-group']"),
    );
    if (!inside) break;
  }

  await expect(page.locator(DIFF_PANEL)).toBeHidden();
  await expect(page.locator(DIFF_TRIGGER)).toHaveAttribute("aria-expanded", "false");

  // Focus must have moved on, NOT snapped back to the trigger.
  const onTrigger = await page.evaluate(
    () => document.activeElement?.getAttribute("aria-controls") === "difficulty-group",
  );
  expect(onTrigger, "focus-out must not restore focus to the trigger").toBe(false);
  const activeTag = await page.evaluate(() => document.activeElement?.tagName);
  expect(activeTag).not.toBe("BODY");
});

test("keeps the panel open while focus stays inside it", async ({ page }) => {
  await page.click(DIFF_TRIGGER);
  await expect(page.locator(DIFF_PANEL)).toBeVisible();

  await page.keyboard.press("Tab"); // into the first panel option
  const inside = await page.evaluate(() => !!document.activeElement?.closest("#difficulty-group"));
  expect(inside).toBe(true);
  await expect(page.locator(DIFF_PANEL)).toBeVisible();
});

test("Escape still closes and returns focus to the trigger", async ({ page }) => {
  await page.click(DIFF_TRIGGER);
  await expect(page.locator(DIFF_PANEL)).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.locator(DIFF_PANEL)).toBeHidden();
  await expect(page.locator(DIFF_TRIGGER)).toBeFocused();
});

test("outside mousedown still closes the panel", async ({ page }) => {
  await page.click(TAGS_TRIGGER);
  await expect(page.locator("#tags-group")).toBeVisible();

  await page.locator("h1").click();
  await expect(page.locator("#tags-group")).toBeHidden();
});
