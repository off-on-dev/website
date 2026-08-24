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

      expect(errors, `console/page errors on ${path}`).toEqual([]);
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
