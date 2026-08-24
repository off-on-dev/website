// Smoke + SEO checks for the Astro build. Verifies every prerendered route has
// a unique, correct <title>, a canonical URL matching the path, a meta
// description, exactly one <h1>, and that the theme-toggle island hydrates.
// Requires a production build in dist/ (webServer runs `astro preview`).

import { test, expect } from "@playwright/test";
import { solution as beginnerSolution } from "@/data/solutions/echoes-lost-in-orbit/beginner";
import { solution as intermediateSolution } from "@/data/solutions/echoes-lost-in-orbit/intermediate";
import { solution as expertSolution } from "@/data/solutions/echoes-lost-in-orbit/expert";

const SITE_URL = "https://offon.dev";

// Route → expected exact <title>. Covers every layout type + all static pages.
const ROUTES: Record<string, string> = {
  "/": "OffOn - Vendor-Neutral. Open Source. Community-Driven",
  "/adventures/": "Adventures - Open Source Learning Paths | OffOn",
  "/adventures/blind-by-design/": "Blind by Design - OffOn Adventures",
  "/adventures/blind-by-design/levels/beginner/": "Stand up the Lab - Blind by Design - OffOn",
  "/adventures/building-cloudhaven/": "Building CloudHaven - OffOn Adventures",
  "/adventures/building-cloudhaven/levels/beginner/": "The Foundation Stones - Building CloudHaven - OffOn",
  "/adventures/dead-reckoning/": "Dead Reckoning - OffOn Adventures",
  "/adventures/dead-reckoning/levels/expert/": "The Chronometer - Dead Reckoning - OffOn",
  "/adventures/echoes-lost-in-orbit/": "Echoes Lost in Orbit - OffOn Adventures",
  "/adventures/echoes-lost-in-orbit/levels/beginner/": "Broken Echoes - Echoes Lost in Orbit - OffOn",
  "/adventures/echoes-lost-in-orbit/levels/beginner/solution/":
    `${beginnerSolution.title} - Echoes Lost in Orbit - OffOn`,
  "/adventures/echoes-lost-in-orbit/levels/intermediate/solution/":
    `${intermediateSolution.title} - Echoes Lost in Orbit - OffOn`,
  "/adventures/echoes-lost-in-orbit/levels/expert/solution/":
    `${expertSolution.title} - Echoes Lost in Orbit - OffOn`,
  "/adventures/lex-imperfecta/": "Lex Imperfecta - OffOn Adventures",
  "/adventures/lex-imperfecta/levels/beginner/": "The Twelve Tables - Lex Imperfecta - OffOn",
  "/adventures/the-ai-observatory/": "The AI Observatory - OffOn Adventures",
  "/adventures/the-ai-observatory/levels/beginner/": "Calibrating the Lens - The AI Observatory - OffOn",
  "/challenges/": "Open Source Challenges | OffOn",
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
