// Smoke + SEO checks for the Astro build. Verifies every prerendered route has
// a unique, correct <title>, a canonical URL matching the path, a meta
// description, exactly one <h1>, and that the theme-toggle island hydrates.
// Requires a production build in dist/ (webServer runs e2e/static-server.mjs).

import { test, expect } from "@playwright/test";
import { SMOKE_ROUTES as ROUTES } from "./routes";
import { setupCollectInterception, STORAGE_KEY } from "./gtag-helpers";

const SITE_URL = "https://offon.dev";

test.describe("SEO + smoke: every route", () => {
  test.beforeEach(async ({ page }) => {
    // Community avatar images come from external servers (community.offon.dev,
    // *.discourse-cdn.com). Under parallel test runs the OS or server refuses
    // the burst of concurrent connections, and Chrome emits each as
    // "Failed to load resource: net::ERR_CONNECTION_REFUSED" -- a real network
    // error, not a site bug. Abort them so the test is not sensitive to
    // external availability; the inline onerror fallback (initials chip)
    // handles a failed image silently. ERR_ABORTED is not console.error.
    await page.route("**/community.offon.dev/**", (r) => r.abort("aborted"));
    await page.route("**/*discourse-cdn.com/**", (r) => r.abort("aborted"));
  });

  for (const [path, title] of Object.entries(ROUTES)) {
    test(path, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(`pageerror: ${e}`));
      // console.error too, not just uncaught exceptions: a caught-and-logged
      // failure (a hydration warning, a rejected fetch) leaves the page standing
      // but still means something is broken.
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(`console.error: ${msg.text()}`);
      });
      await page.goto(path);
      await page.waitForLoadState("load");

      await expect(page).toHaveTitle(title);

      // Exactly one <h1>.
      await expect(page.locator("h1")).toHaveCount(1);

      // Canonical present and correct (SITE_URL + path, trailing slash).
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(canonical, `canonical on ${path}`).toBe(`${SITE_URL}${path}`);

      // Meta description present and non-empty.
      const desc = await page.locator('meta[name="description"]').getAttribute("content");
      expect(desc?.length ?? 0, `meta description on ${path}`).toBeGreaterThan(0);

      // Open Graph essentials.
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", title);
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", `${SITE_URL}${path}`);

      // No duplicate id attributes. Abbreviation IDs are generated per content
      // entry with no page context, so this is the only place the document-level
      // uniqueness they promise can actually be checked. axe does not cover it:
      // duplicate-id is deprecated and duplicate-id-aria only fires when the id
      // is ARIA-referenced.
      const dupes = await page.evaluate(() => {
        const counts = new Map<string, number>();
        document.querySelectorAll("[id]").forEach((el) => {
          const id = el.id;
          if (id) counts.set(id, (counts.get(id) ?? 0) + 1);
        });
        return [...counts].filter(([, n]) => n > 1).map(([id, n]) => `${id} x${n}`);
      });
      expect(dupes, `duplicate id attributes on ${path}`).toEqual([]);

      // Trigger a real link navigation from this page to catch console errors
      // that only appear when leaving (e.g. a stale event listener throwing on
      // the outgoing page) and to exercise runScripts() on the destination.
      const navTarget = path === "/about/" ? "/challenges/" : "/about/";
      await page.click(`a[href="${navTarget}"]`);
      await page.waitForURL(navTarget);
      await page.waitForLoadState("load");

      expect(errors, `console/page errors on ${path} (including outgoing navigation)`).toEqual([]);
    });
  }
});

test.describe("uniqueness", () => {
  test("all titles are unique", () => {
    const titles = Object.values(ROUTES);
    expect(new Set(titles).size).toBe(titles.length);
  });
});

// This site does full page loads, so focus placement after a navigation is the
// browser's job. An earlier version of Layout.astro moved focus to
// #main-content whenever document.referrer was same-origin, a habit carried
// over from <ClientRouter />, where a DOM swap left focus stranded and the
// router had to restore it itself. Re-doing it in an MPA is a regression, not a
// no-op: it takes the skip link and the whole <header> nav out of the forward
// tab order on every in-site navigation, and moves a screen reader's virtual
// cursor past both landmarks. These tests fail if that workaround comes back.
test.describe("focus management", () => {
  test("focus is not moved off the document start after an in-site navigation", async ({ page }) => {
    // Seed denied consent so the banner is not an extra focus stop.
    await page.addInitScript(() =>
      localStorage.setItem("analytics_consent", JSON.stringify({ value: "denied", timestamp: Date.now() })),
    );
    await page.goto("/");
    await page.waitForLoadState("load");

    // Navigate to a different page via a real link click, which is the only
    // case the old block acted on: it sets a same-origin document.referrer.
    await page.click('a[href="/about/"]');
    await page.waitForURL("/about/");
    await page.waitForLoadState("load");

    const referrer = await page.evaluate(() => document.referrer);
    expect(referrer, "the referrer the old block gated on must actually be set").toContain("localhost");

    const activeId = await page.evaluate(() => document.activeElement?.id ?? "");
    expect(activeId, "nothing may move focus to #main-content on load").not.toBe("main-content");
  });

  test("the skip link is still the first Tab stop after an in-site navigation", async ({ page }) => {
    // The consequence the assertion above exists to protect. Checked separately
    // because a future block could move focus somewhere other than #main-content
    // and still break this.
    await page.addInitScript(() =>
      localStorage.setItem("analytics_consent", JSON.stringify({ value: "denied", timestamp: Date.now() })),
    );
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.click('a[href="/about/"]');
    await page.waitForURL("/about/");
    await page.waitForLoadState("load");

    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toContainText("Skip to main content");
  });

  test("a reload after an in-site navigation also leaves focus alone", async ({ page }) => {
    // document.referrer survives a reload, so the old block fired here too:
    // a plain refresh silently skipped the nav. Back/forward, by contrast, has
    // no referrer and never fired, which is what made the behaviour arbitrary.
    await page.addInitScript(() =>
      localStorage.setItem("analytics_consent", JSON.stringify({ value: "denied", timestamp: Date.now() })),
    );
    await page.goto("/");
    await page.click('a[href="/about/"]');
    await page.waitForURL("/about/");
    await page.waitForLoadState("load");
    await page.reload();
    await page.waitForLoadState("load");

    const state = await page.evaluate(() => ({
      referrer: document.referrer,
      activeId: document.activeElement?.id ?? "",
    }));
    expect(state.referrer, "a reload keeps the referrer that gated the old block").toContain("localhost");
    expect(state.activeId, "a reload must not move focus either").not.toBe("main-content");
  });
});

test.describe("island hydration", () => {
  test("theme toggle hydrates and switches theme", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    const toggle = page.getByRole("button", { name: /switch to (light|dark) mode/i });
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.locator("html")).toHaveClass(/light/);
  });

  test("challenges filter hydrates and filters", async ({ page }) => {
    await page.goto("/challenges/");
    await page.waitForLoadState("load");
    // Unfiltered: adventure cards shown, level results hidden.
    await expect(page.locator('[data-results="adventures"]')).toBeVisible();
    await expect(page.locator('[data-results="levels"]')).toBeHidden();
    await page.getByRole("radio", { name: "Beginner", exact: true }).click();
    // Filtered: level cards shown, adventures hidden, URL reflects the difficulty.
    await expect(page.locator('[data-results="levels"]')).toBeVisible();
    await expect(page.locator('[data-results="adventures"]')).toBeHidden();
    expect(await page.locator('[data-results="levels"] > li').count()).toBeGreaterThan(0);
    expect(new URL(page.url()).searchParams.get("difficulty")).toBe("Beginner");
  });
});

// CSP compliance: gate against console errors caused by blocked network requests.
// Runs with consent granted so the full analytics path is exercised. The
// GA_STUB (via setupCollectInterception) replaces real gtag.js — no live hits
// reach Google, yet all CSP-relevant request types are exercised. No violations
// were observed with real gtag.js either (verified empirically: the GTM init
// pixel does not fire in analytics-only mode with all ad signals denied).
test.describe("CSP compliance", () => {
  test("no CSP violations on a consented session across multiple navigations", async ({ page }) => {
    await setupCollectInterception(page);

    const cspViolations: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        if (text.includes("Content Security Policy") || text.includes("violates") || text.includes("CSP")) {
          cspViolations.push(text);
        }
      }
    });
    page.on("pageerror", (err) => {
      const msg = err.message;
      if (msg.includes("Content Security Policy") || msg.includes("violates")) {
        cspViolations.push(`pageerror: ${msg}`);
      }
    });

    await page.addInitScript((key) => {
      localStorage.setItem(key, JSON.stringify({ value: "granted", timestamp: Date.now() }));
    }, STORAGE_KEY);

    // Navigate through representative pages: home, about (prose), challenges
    // (interactive filter), adventures (community avatars from allowed hosts).
    for (const path of ["/", "/about/", "/challenges/", "/adventures/"]) {
      await page.goto(path);
      await page.waitForLoadState("load");
    }

    expect(cspViolations, "no CSP violations across a consented session").toEqual([]);
  });
});

