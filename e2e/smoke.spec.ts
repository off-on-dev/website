// Smoke + SEO checks for the Astro build. Verifies every prerendered route has
// a unique, correct <title>, a canonical URL matching the path, a meta
// description, exactly one <h1>, and that the theme-toggle island hydrates.
// Requires a production build in dist/ (webServer runs `astro preview`).

import { test, expect } from "@playwright/test";

const SITE_URL = "https://offon.dev";

// Route → expected exact <title>. Covers every layout type + all static pages.
const ROUTES: Record<string, string> = {
  "/": "OffOn - Learn Open Source by Doing",
  "/adventures/": "Adventures - OffOn",
  "/adventures/echoes-lost-in-orbit/": "Echoes Lost in Orbit - OffOn Adventures",
  "/adventures/echoes-lost-in-orbit/levels/beginner/": "Broken Echoes - Echoes Lost in Orbit - OffOn",
  "/adventures/echoes-lost-in-orbit/levels/beginner/solution/":
    "Beginner Solution: Broken Echoes - Echoes Lost in Orbit - OffOn",
  "/challenges/": "Challenges - OffOn",
  "/challenges/opentelemetry/": "OpenTelemetry Challenges - OffOn",
  "/about/": "About OffOn - Building the contributors and maintainers of tomorrow",
  "/contribute/": "How to Contribute - OffOn",
  "/handbook/": "Handbook - OffOn",
  "/sponsors/": "Sponsorship and Independence - OffOn",
  "/brand/": "Brand Guidelines - OffOn",
  "/presentation-templates/": "Presentation Templates - OffOn",
  "/privacy/": "Privacy Policy - OffOn",
  "/accessibility/": "Accessibility Statement - OffOn",
  "/404/": "Page Not Found - OffOn",
};

test.describe("SEO + smoke: every route", () => {
  for (const [path, title] of Object.entries(ROUTES)) {
    test(path, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(String(e)));
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

      expect(errors, `page errors on ${path}`).toEqual([]);
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
    const before = await page.locator("main ul li").count();
    await page.getByRole("button", { name: "Beginner", exact: true }).click();
    const after = await page.locator("main ul li").count();
    expect(after).toBeLessThanOrEqual(before);
    expect(new URL(page.url()).searchParams.get("difficulty")).toBe("Beginner");
  });
});
