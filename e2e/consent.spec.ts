// Runtime regression tests for the GA4 gated-load consent state machine
// (src/stores/consent.ts + ConsentBanner.astro). Asserts the observable effects
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

// Helper: count page_view entries pushed to window.dataLayer.
// gtag() is the dataLayer.push shim (defined in the inline bootstrap), so every
// gtag('event','page_view',{...}) call is captured synchronously before gtag.js
// even loads. Arguments objects serialise as array-like: [0]='event', [1]=name.
const countPageViews = (page: Page) =>
  page.evaluate(() =>
    (window.dataLayer ?? []).filter(
      (a) => (a as unknown[])[0] === "event" && (a as unknown[])[1] === "page_view",
    ).length,
  );

test.describe("consent: page_view accounting", () => {
  test.beforeEach(async ({ page }) => {
    await stubGtag(page);
  });

  // Regression test for the first-grant under-count: a new visitor who accepts
  // consent on the landing page and leaves without navigating produced zero
  // page_views before grant() began calling firePageView() directly.
  // This test MUST fail if the firePageView() call is removed from grant().
  test("first-grant on landing page sends exactly one page_view", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");

    // Before consent: no page_view should have been pushed.
    expect(await countPageViews(page)).toBe(0);

    await accept(page).click();

    // grant() calls firePageView() synchronously; the push is immediate via the
    // dataLayer shim. No navigation occurred, so astro:page-load did not re-fire.
    expect(await countPageViews(page)).toBe(1);
  });

  // Double-count guard: a returning visitor whose consent is already stored
  // must produce exactly one page_view on the landing page — not two. The
  // risk is that gtag('config', {send_page_view:false}) is bypassed somehow
  // and the tag fires its own automatic page_view alongside our manual one.
  test("returning granted visitor: exactly one page_view on landing", async ({ page }) => {
    await page.addInitScript((key) => {
      localStorage.setItem(key, JSON.stringify({ value: "granted", timestamp: Date.now() }));
    }, STORAGE_KEY);

    await page.goto("/");
    await page.waitForLoadState("load");

    expect(await countPageViews(page)).toBe(1);
  });

  // Double-count guard for client-side navigations: each View Transition hop
  // must add exactly one page_view to the running total, not two. firePageView()
  // is called once per astro:page-load; the 'config' call with send_page_view:false
  // does not re-fire on subsequent navigations (injectGtag is guarded by a
  // module-scope flag), so there is no second automatic page_view to collide with.
  test("each client-side navigation adds exactly one page_view", async ({ page }) => {
    await page.addInitScript((key) => {
      localStorage.setItem(key, JSON.stringify({ value: "granted", timestamp: Date.now() }));
    }, STORAGE_KEY);

    await page.goto("/");
    await page.waitForLoadState("load");
    expect(await countPageViews(page)).toBe(1);

    await page.click('a[href="/about/"]');
    await page.waitForURL("/about/");
    await page.waitForLoadState("load");
    expect(await countPageViews(page)).toBe(2);

    await page.click('a[href="/challenges/"]');
    await page.waitForURL("/challenges/");
    await page.waitForLoadState("load");
    expect(await countPageViews(page)).toBe(3);
  });

  // The only session ordering where both grant() → firePageView() and
  // astro:page-load → firePageView() both fire. A double-count would show up
  // here as count=4 instead of 3, or as wrong page_paths on the second and
  // third events. Also verifies page_path is correct on all three events.
  test("first-grant then navigate: correct count and page_path for all three events", async ({
    page,
  }) => {
    const pageViewPaths = () =>
      page.evaluate(() =>
        (window.dataLayer ?? [])
          .filter((a) => (a as unknown[])[0] === "event" && (a as unknown[])[1] === "page_view")
          .map((a) => ((a as unknown[])[2] as Record<string, string>).page_path),
      );

    await page.goto("/");
    await page.waitForLoadState("load");

    // Accept on the landing page — grant() fires firePageView() for /.
    await accept(page).click();
    expect(await pageViewPaths()).toEqual(["/"]);

    // First client-side navigation — astro:page-load fires firePageView() for /about/.
    await page.click('a[href="/about/"]');
    await page.waitForURL("/about/");
    await page.waitForLoadState("load");
    expect(await pageViewPaths()).toEqual(["/", "/about/"]);

    // Second client-side navigation — astro:page-load fires firePageView() for /challenges/.
    await page.click('a[href="/challenges/"]');
    await page.waitForURL("/challenges/");
    await page.waitForLoadState("load");
    expect(await pageViewPaths()).toEqual(["/", "/about/", "/challenges/"]);
  });
});
