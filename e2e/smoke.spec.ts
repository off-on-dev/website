// Smoke + SEO checks for the Astro build. Verifies every prerendered route has
// a unique, correct <title>, a canonical URL matching the path, a meta
// description, exactly one <h1>, and that the theme-toggle island hydrates.
// Requires a production build in dist/ (webServer runs `astro preview`).

import { test, expect } from "@playwright/test";
import { SMOKE_ROUTES as ROUTES } from "./routes";

const SITE_URL = "https://offon.dev";

test.describe("SEO + smoke: every route", () => {
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

      // Trigger one client-side View Transition from this page. page.goto() is
      // a full browser navigation and never invokes Astro's ClientRouter — errors
      // that only surface during View Transitions (e.g. CSP violations from the
      // data: sentinel) are invisible to initial-load checks alone. The outgoing
      // navigation exercises runScripts() on the destination page; any sentinel
      // insertion on the destination would appear in this errors array.
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

test.describe("client-side navigation", () => {
  test("no console errors across several View Transition navigations", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(`pageerror: ${e}`));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(`console.error: ${msg.text()}`);
    });

    await page.goto("/");
    await page.waitForLoadState("load");

    // Navigate home → /about/ via a client-side link (triggers View Transition + runScripts).
    await page.click('a[href="/about/"]');
    await page.waitForURL("/about/");
    await page.waitForLoadState("load");

    // Navigate /about/ → /challenges/ (second navigation).
    await page.click('a[href="/challenges/"]');
    await page.waitForURL("/challenges/");
    await page.waitForLoadState("load");

    // Navigate /challenges/ → /contribute/ (third navigation).
    await page.click('a[href="/contribute/"]');
    await page.waitForURL("/contribute/");
    await page.waitForLoadState("load");

    expect(errors, "no console errors across client-side navigations").toEqual([]);
  });

  test("theme toggle works after client-side navigation", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.click('a[href="/about/"]');
    await page.waitForURL("/about/");
    await page.waitForLoadState("load");

    const toggle = page.getByRole("button", { name: /switch to (light|dark) mode/i }).first();
    await toggle.click();
    await expect(page.locator("html")).toHaveClass(/light/);
  });

  test("consent state persists across client-side navigation", async ({ page }) => {
    await page.addInitScript((key) => {
      localStorage.setItem(key, JSON.stringify({ value: "granted", timestamp: Date.now() }));
    }, "analytics_consent");

    await page.goto("/");
    await page.waitForLoadState("load");

    // Navigate and verify the consent banner stays in the cookie-button state.
    await page.click('a[href="/about/"]');
    await page.waitForURL("/about/");
    await page.waitForLoadState("load");

    await expect(page.getByRole("button", { name: "Change cookie preferences" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Accept Analytics" })).toHaveCount(0);
  });

  test("abbr tooltips wire up after client-side navigation", async ({ page }) => {
    // Start on the adventure index (no abbr elements), then navigate to a level
    // page that has abbr elements via a View Transition. enhanceAbbrTooltips()
    // fires on astro:page-load; if it ran, abbr elements get the abbr-js-tooltip
    // class and lose the CSS ::after fallback.
    await page.goto("/adventures/echoes-lost-in-orbit/");
    await page.waitForLoadState("load");

    await page.click('a[href="/adventures/echoes-lost-in-orbit/levels/beginner/"]');
    await page.waitForURL("/adventures/echoes-lost-in-orbit/levels/beginner/");
    await page.waitForLoadState("load");

    // enhanceAbbrTooltips() adds abbr-js-tooltip to each abbr and appends a
    // portal <span> to body. Both are the observable signal that the script ran.
    const enhanced = page.locator("abbr.abbr-js-tooltip").first();
    await expect(enhanced).toBeAttached();

    // Verify a portal span was appended to the body.
    const portalCount = await page.evaluate(
      () => document.body.querySelectorAll("span[aria-hidden='true']").length,
    );
    expect(portalCount, "abbr portal spans appended to body").toBeGreaterThan(0);
  });

  test("copy buttons wire up after client-side navigation", async ({ page }) => {
    // Navigate to a solution page (which has code blocks) via a View Transition.
    // wireCopyButtons() fires on astro:page-load and sets data-copy-wired; if it
    // did not run, clicking the button would do nothing (no event listener).
    await page.goto("/adventures/echoes-lost-in-orbit/levels/beginner/");
    await page.waitForLoadState("load");

    await page.click('a[href="/adventures/echoes-lost-in-orbit/levels/beginner/solution/"]');
    await page.waitForURL("/adventures/echoes-lost-in-orbit/levels/beginner/solution/");
    await page.waitForLoadState("load");

    const btn = page.locator("[data-copy-code]").first();
    await expect(btn).toBeAttached();
    // data-copy-wired is set by wireCopyButtons() as a guard against double-binding.
    await expect(btn).toHaveAttribute("data-copy-wired", "1");
  });
});
