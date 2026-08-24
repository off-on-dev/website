// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

// Consent banner UI contract: focus handling, reflow safety, and action framing.
//
// The state machine itself is covered by consent.spec.ts and by the unit tests
// on src/stores/consent.ts. This file covers the parts that live in the markup
// and are easy to regress silently when the component is reimplemented.

import { test, expect, type Page } from "@playwright/test";

const STORAGE_KEY = "analytics_consent";
const GTAG_HOST = "**/googletagmanager.com/**";

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

// The analytics lifecycle was moved out of the banner into its own script in
// Layout.astro. The risk that motivated it: if the listener is registered after
// astro:page-load has already fired, the first page_view of the session is lost.
test.describe("page_view fires", () => {
  const pageViews = (page: Page): Promise<number> =>
    page.evaluate(
      () =>
        ((window as unknown as { dataLayer?: unknown[] }).dataLayer ?? []).filter(
          (entry) => (entry as unknown[])[0] === "event" && (entry as unknown[])[1] === "page_view",
        ).length,
    );

  test("a returning granted visitor gets a page_view on the first load", async ({ page }) => {
    await seedConsent(page, "granted");
    await page.goto("/");
    await page.waitForLoadState("load");
    await expect.poll(() => pageViews(page), { timeout: 5000 }).toBeGreaterThanOrEqual(1);
  });

  test("and another on each client-side navigation", async ({ page }) => {
    await seedConsent(page, "granted");
    await page.goto("/");
    await expect.poll(() => pageViews(page)).toBeGreaterThanOrEqual(1);
    const first = await pageViews(page);

    await page.getByRole("link", { name: "Challenges", exact: true }).first().click();
    await page.waitForURL("**/challenges/");
    await expect.poll(() => pageViews(page)).toBeGreaterThan(first);
  });

  test("an undecided visitor produces none", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    expect(await pageViews(page)).toBe(0);
  });

  test("a declined visitor produces none", async ({ page }) => {
    await seedConsent(page, "denied");
    await page.goto("/");
    await page.waitForLoadState("load");
    expect(await pageViews(page)).toBe(0);
  });
});

// Regression: ConsentBanner used module-scope addEventListener calls that
// targeted DOM nodes replaced by Astro's ClientRouter on every client-side
// navigation. After a navigation the buttons were present in the DOM but
// their click handlers were attached to the dead pre-swap nodes.
test.describe("post-navigation button functionality", () => {
  // Navigate client-side to /challenges/ then exercise the banner there.
  // The banner is in Layout.astro so it is present on every page; the test
  // deliberately does NOT reload between navigations.
  async function goToChallengesViaClientRouter(page: Page): Promise<void> {
    await page.getByRole("link", { name: "Challenges", exact: true }).first().click();
    await page.waitForURL("**/challenges/");
    await page.waitForLoadState("networkidle");
  }

  test("Accept works after a client-side navigation", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");

    await goToChallengesViaClientRouter(page);

    await accept(page).click();

    const stored = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key) ?? "null")?.value,
      STORAGE_KEY,
    );
    expect(stored).toBe("granted");
    await expect(cookieButton(page)).toBeVisible();
    await expect(banner(page)).toBeHidden();
  });

  test("Decline works after a client-side navigation", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");

    await goToChallengesViaClientRouter(page);

    await decline(page).click();

    const stored = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key) ?? "null")?.value,
      STORAGE_KEY,
    );
    expect(stored).toBe("denied");
    await expect(cookieButton(page)).toBeVisible();
    await expect(banner(page)).toBeHidden();
  });

  // Regression: the Reset button starts `hidden` in the server HTML and was
  // only revealed by the $consent subscription. After a client-side navigation
  // the old subscription (on dead DOM nodes) never fired; the new DOM's Reset
  // button stayed hidden indefinitely for returning visitors.
  test("Reset button visible for returning users after navigation", async ({ page }) => {
    await seedConsent(page, "granted");
    await page.goto("/");
    await page.waitForLoadState("load");

    // Baseline: button should be visible on first load.
    await expect(cookieButton(page)).toBeVisible();

    // Navigate client-side.
    await goToChallengesViaClientRouter(page);

    // The $consent subscription must re-run and reveal the button on the
    // new DOM; it must not be stuck at the server-rendered `hidden` default.
    await expect(cookieButton(page)).toBeVisible();
  });

  test("Reset triggers banner reappearance after navigation", async ({ page }) => {
    await seedConsent(page, "denied");
    await page.goto("/");
    await page.waitForLoadState("load");

    await goToChallengesViaClientRouter(page);

    await cookieButton(page).click();

    // After reset, consent is null → banner should appear, cookie button gone.
    await expect(banner(page)).toBeVisible();
    await expect(cookieButton(page)).toBeHidden();
  });
});
