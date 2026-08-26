// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

// Consent banner UI contract: focus handling, reflow safety, and action framing.
//
// The state machine itself is covered by consent.spec.ts and by the unit tests
// on src/stores/consent.ts. This file covers the parts that live in the markup
// and are easy to regress silently when the component is reimplemented.

import { test, expect, type Page } from "@playwright/test";

const STORAGE_KEY = "analytics_consent";
const GTAG_HOST = "**googletagmanager.com/**";

const banner = (page: Page) => page.getByRole("region", { name: "This site uses analytics cookies" });
const accept = (page: Page) => page.getByRole("button", { name: "Accept analytics cookies" });
const decline = (page: Page) => page.getByRole("button", { name: "Decline analytics cookies" });
const cookieButton = (page: Page) => page.getByRole("button", { name: "Change cookie preferences" });

async function stubGtag(page: Page): Promise<void> {
  await page.route(GTAG_HOST, (route) =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: "" }),
  );
}

async function seedConsent(page: Page, value: "granted" | "denied"): Promise<void> {
  await page.addInitScript(
    ([key, v]) => localStorage.setItem(key, JSON.stringify({ value: v, timestamp: Date.now() })),
    [STORAGE_KEY, value] as const,
  );
}

test.beforeEach(async ({ page }) => {
  await stubGtag(page);
});

// Restoring a stored choice on load is a state change but not a user action.
// Focusing there strands keyboard users past the skip-nav link on every page
// load, which is exactly what the previous implementation did.
test.describe("focus is not stolen on load", () => {
  for (const stored of ["granted", "denied"] as const) {
    test(`stored "${stored}" restores without moving focus`, async ({ page }) => {
      await seedConsent(page, stored);
      await page.goto("/");
      await page.waitForLoadState("load");

      await expect(cookieButton(page)).toBeVisible();
      await expect(banner(page)).toBeHidden();

      const active = await page.evaluate(() => document.activeElement?.tagName ?? "NONE");
      expect(active, "focus must stay at the top of the document").toBe("BODY");

      // The skip link is still the first thing a keyboard user reaches.
      await page.keyboard.press("Tab");
      await expect(page.locator(":focus")).toContainText("Skip to main content");
    });
  }

  test("undecided shows the banner without grabbing focus", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await expect(banner(page)).toBeVisible();
    expect(await page.evaluate(() => document.activeElement?.tagName ?? "NONE")).toBe("BODY");
  });
});

test.describe("focus follows a genuine choice", () => {
  test("Accept moves focus to the preferences button", async ({ page }) => {
    await page.goto("/");
    await accept(page).click();
    await expect(cookieButton(page)).toBeFocused();
  });

  test("Decline moves focus to the preferences button", async ({ page }) => {
    await page.goto("/");
    await decline(page).click();
    await expect(cookieButton(page)).toBeFocused();
  });

  test("reopening preferences moves focus to Decline", async ({ page }) => {
    await seedConsent(page, "denied");
    await page.goto("/");
    await cookieButton(page).click();
    await expect(decline(page)).toBeFocused();
  });
});

test.describe("declining is as easy as accepting", () => {
  test("Decline comes first in DOM and tab order", async ({ page }) => {
    await page.goto("/");
    const labels = await banner(page)
      .locator("button")
      .evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")));
    expect(labels).toEqual(["Decline analytics cookies", "Accept analytics cookies"]);
  });

  test("both actions are solid and the same size", async ({ page }) => {
    await page.goto("/");
    const box = async (l: ReturnType<typeof accept>) => (await l.boundingBox())!;
    const [d, a] = [await box(decline(page)), await box(accept(page))];
    expect(Math.abs(d.height - a.height)).toBeLessThanOrEqual(1);

    const declineBg = await decline(page).evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(declineBg, "Decline must be filled, not an outline button").not.toMatch(
      /rgba\(0, 0, 0, 0\)|transparent/,
    );
  });
});

test.describe("reflow safety", () => {
  test("both actions stay reachable at 400% zoom", async ({ page }) => {
    // 400% of a 1280x1024 reference viewport.
    await page.setViewportSize({ width: 320, height: 256 });
    await page.goto("/");
    await expect(banner(page)).toBeVisible();

    const box = (await banner(page).boundingBox())!;
    expect(box.height, "banner must not exceed 80vh").toBeLessThanOrEqual(256 * 0.8 + 2);

    for (const control of [decline(page), accept(page)]) {
      await control.scrollIntoViewIfNeeded();
      await expect(control).toBeInViewport();
      await control.focus();
      await expect(control).toBeFocused();
    }
  });

  test("the banner scrolls rather than clipping its actions", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 256 });
    await page.goto("/");
    const overflow = await banner(page)
      .locator("> div")
      .evaluate((el) => getComputedStyle(el).overflowY);
    expect(overflow).toBe("auto");
  });
});

