// Runtime regression tests for the GA4 gated-load consent state machine
// (src/stores/consent.ts + ConsentBanner.astro). Asserts the observable effects
// — banner state, localStorage, and whether the gtag.js script tag is injected —
// without loading real Google Analytics: googletagmanager.com is routed to an
// empty stub so the injected <script> "loads" but hits no external network.

import { test, expect, type Page } from "@playwright/test";
import { GTAG_HOST, STORAGE_KEY, setupCollectInterception } from "./gtag-helpers";

async function stubGtag(page: Page): Promise<void> {
  await page.route(GTAG_HOST, (route) =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: "" }),
  );
}

const gtagScript = (page: Page) => page.locator('script[src*="googletagmanager.com/gtag/js"]');
const accept = (page: Page) => page.getByRole("button", { name: "Accept Analytics" });
const decline = (page: Page) => page.getByRole("button", { name: "Decline" });
const cookieButton = (page: Page) => page.getByRole("button", { name: "Change cookie preferences" });

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

  test("clicks are tracked only after consent is granted", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    const themeToggle = page.getByRole("button", { name: /switch to (light|dark) mode/i });
    const clickEvents = () =>
      page.evaluate(() => (window.dataLayer ?? []).filter((a) => (a as unknown[])[1] === "click_event").length);

    // Before consent: clicking a (non-navigating) button records nothing.
    await themeToggle.click();
    expect(await clickEvents()).toBe(0);

    await page.getByRole("button", { name: "Accept Analytics" }).click();
    await themeToggle.click();
    expect(await clickEvents()).toBeGreaterThan(0);
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

  test("granted → reset → denied clears stored value", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await accept(page).click();
    expect(await storedConsent(page)).toBe("granted");
    await cookieButton(page).click();
    await expect(accept(page)).toBeVisible();
    expect(await storedConsent(page)).toBeNull();
    await decline(page).click();
    expect(await storedConsent(page)).toBe("denied");
  });

  test("denied → reset → granted injects gtag.js", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await decline(page).click();
    expect(await storedConsent(page)).toBe("denied");
    await cookieButton(page).click();
    await expect(accept(page)).toBeVisible();
    await accept(page).click();
    await expect(gtagScript(page)).toHaveCount(1);
    expect(await storedConsent(page)).toBe("granted");
  });

  test("GPC active forces denied without prompting", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "globalPrivacyControl", { value: true, configurable: true });
    });
    await page.goto("/");
    await page.waitForLoadState("load");
    await expect(gtagScript(page)).toHaveCount(0);
    await expect(accept(page)).toHaveCount(0);
    await expect(cookieButton(page)).toBeVisible();
    expect(await storedConsent(page)).toBe("denied");
  });

  test("granted → denied: Decline after a previously granted session revokes consent", async ({ page }) => {
    // Start with stored granted — gtag.js should inject, cookie button shown, no banner.
    await page.addInitScript((key) => {
      localStorage.setItem(key, JSON.stringify({ value: "granted", timestamp: Date.now() }));
    }, STORAGE_KEY);
    await page.goto("/");
    await page.waitForLoadState("load");
    await expect(gtagScript(page)).toHaveCount(1);
    await expect(accept(page)).toHaveCount(0);
    // Open preferences, then decline.
    await cookieButton(page).click();
    await expect(accept(page)).toBeVisible();
    await decline(page).click();
    expect(await storedConsent(page)).toBe("denied");
    // Script stays injected (not removed), but cookie button is shown again.
    await expect(gtagScript(page)).toHaveCount(1);
    await expect(cookieButton(page)).toBeVisible();
  });

  test("GPC active + stored granted still injects gtag.js (explicit prior consent wins)", async ({ page }) => {
    await page.addInitScript((key) => {
      Object.defineProperty(navigator, "globalPrivacyControl", { value: true, configurable: true });
      localStorage.setItem(key, JSON.stringify({ value: "granted", timestamp: Date.now() }));
    }, STORAGE_KEY);
    await page.goto("/");
    await page.waitForLoadState("load");
    // Explicit prior grant overrides GPC: inject gtag.js, show cookie button.
    await expect(gtagScript(page)).toHaveCount(1);
    await expect(accept(page)).toHaveCount(0);
    await expect(cookieButton(page)).toBeVisible();
    expect(await storedConsent(page)).toBe("granted");
  });
});

// page_view delivery: pins the changed analytics behaviour after removing
// send_page_view:false. With send_page_view:false gone, gtag fires one automatic
// page_view per config() call. A realistic gtag.js stub (GA_STUB) forwards that
// event to a stubbed collect endpoint so Playwright can count actual hits.
test.describe("consent: page_view delivery", () => {
  test("returning granted visitor: exactly one page_view per load", async ({ page }) => {
    const collectHits = await setupCollectInterception(page);
    await page.addInitScript((key) => {
      localStorage.setItem(key, JSON.stringify({ value: "granted", timestamp: Date.now() }));
    }, STORAGE_KEY);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(collectHits().filter((e) => e === "page_view"), "one page_view per granted load").toHaveLength(1);
  });

  test("first grant: exactly one page_view fires for the landing page", async ({ page }) => {
    const collectHits = await setupCollectInterception(page);
    await page.goto("/");
    await page.waitForLoadState("load");
    expect(collectHits(), "no collect before grant").toHaveLength(0);
    await accept(page).click();
    await expect
      .poll(() => collectHits().filter((e) => e === "page_view").length, { timeout: 5000 })
      .toBe(1);
  });

  test("denied visitor: no collect requests", async ({ page }) => {
    const collectHits = await setupCollectInterception(page);
    await page.addInitScript((key) => {
      localStorage.setItem(key, JSON.stringify({ value: "denied", timestamp: Date.now() }));
    }, STORAGE_KEY);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(collectHits(), "no collect when denied").toHaveLength(0);
  });
});

