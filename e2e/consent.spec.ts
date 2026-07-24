// Runtime regression tests for the GA4 gated-load consent state machine
// (src/stores/consent.ts + ConsentBanner.vue). Asserts the observable effects
// — banner state, localStorage, and whether the gtag.js script tag is injected —
// without loading real Google Analytics: googletagmanager.com is routed to an
// empty stub so the injected <script> "loads" but hits no external network.

import { test, expect, type Page } from "@playwright/test";

const GTAG_HOST = "**/googletagmanager.com/**";
const STORAGE_KEY = "analytics_consent";

async function stubGtag(page: Page): Promise<void> {
  await page.route(GTAG_HOST, (route) =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: "" }),
  );
}

const gtagScript = (page: Page) => page.locator('script[src*="googletagmanager.com/gtag/js"]');
const accept = (page: Page) => page.getByRole("button", { name: "Accept" });
const decline = (page: Page) => page.getByRole("button", { name: "Decline" });
const cookieButton = (page: Page) => page.getByRole("button", { name: "Cookie preferences" });

async function storedConsent(page: Page): Promise<string | null> {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw).value as string) : null;
  }, STORAGE_KEY);
}

test.describe("consent: gated load", () => {
  test.beforeEach(async ({ page }) => {
    await stubGtag(page);
  });

  test("no gtag.js and banner shown before a decision", async ({ page }) => {
    let hitGoogle = false;
    page.on("request", (r) => {
      if (r.url().includes("googletagmanager.com")) hitGoogle = true;
    });
    await page.goto("/");
    await page.waitForLoadState("load");
    await expect(accept(page)).toBeVisible();
    await expect(decline(page)).toBeVisible();
    await expect(gtagScript(page)).toHaveCount(0);
    expect(hitGoogle, "no request to Google before consent").toBe(false);
    expect(await storedConsent(page)).toBeNull();
  });

  test("Accept injects gtag.js, stores granted, swaps to the cookie button", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await accept(page).click();
    await expect(gtagScript(page)).toHaveCount(1);
    expect(await storedConsent(page)).toBe("granted");
    await expect(accept(page)).toHaveCount(0);
    await expect(cookieButton(page)).toBeVisible();
  });

  test("Decline stores denied and does NOT inject gtag.js", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await decline(page).click();
    await expect(gtagScript(page)).toHaveCount(0);
    expect(await storedConsent(page)).toBe("denied");
    await expect(cookieButton(page)).toBeVisible();
  });

  test("Cookie preferences resets to undecided and reopens the banner", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await decline(page).click();
    await cookieButton(page).click();
    await expect(accept(page)).toBeVisible();
    expect(await storedConsent(page)).toBeNull();
  });

  test("stored granted re-injects gtag.js on load without prompting", async ({ page }) => {
    await page.addInitScript((key) => {
      localStorage.setItem(key, JSON.stringify({ value: "granted", timestamp: Date.now() }));
    }, STORAGE_KEY);
    await page.goto("/");
    await page.waitForLoadState("load");
    await expect(gtagScript(page)).toHaveCount(1);
    await expect(accept(page)).toHaveCount(0);
    await expect(cookieButton(page)).toBeVisible();
  });

  test("stored denied stays silent (no gtag.js, no banner)", async ({ page }) => {
    await page.addInitScript((key) => {
      localStorage.setItem(key, JSON.stringify({ value: "denied", timestamp: Date.now() }));
    }, STORAGE_KEY);
    await page.goto("/");
    await page.waitForLoadState("load");
    await expect(gtagScript(page)).toHaveCount(0);
    await expect(accept(page)).toHaveCount(0);
    await expect(cookieButton(page)).toBeVisible();
  });
});
