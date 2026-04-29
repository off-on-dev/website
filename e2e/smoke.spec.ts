// Requires a production build in dist/client/. Run `npm run build` before `npm run test:e2e`.

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

type RouteSpec = { path: string; title: RegExp };

const ROUTES: RouteSpec[] = [
  { path: "/", title: /OffOn - Vendor-neutral/ },
  { path: "/about", title: /Building the contributors/ },
  { path: "/sponsors", title: /Sponsorship and Independence/ },
  { path: "/handbook", title: /Handbook/ },
  { path: "/privacy", title: /Privacy Policy/ },
  { path: "/404", title: /Page Not Found/ },
  { path: "/adventures/echoes-lost-in-orbit", title: /Echoes Lost in Orbit/ },
  { path: "/adventures/building-cloudhaven", title: /Building CloudHaven/ },
  { path: "/adventures/the-ai-observatory", title: /The AI Observatory/ },
  { path: "/adventures/echoes-lost-in-orbit/levels/beginner", title: /Broken Echoes/ },
  { path: "/adventures/echoes-lost-in-orbit/levels/intermediate", title: /The Silent Canary/ },
  { path: "/adventures/echoes-lost-in-orbit/levels/expert", title: /Hyperspace Operations/ },
  { path: "/adventures/building-cloudhaven/levels/beginner", title: /The Foundation Stones/ },
  { path: "/adventures/building-cloudhaven/levels/intermediate", title: /The Modular Metropolis/ },
  { path: "/adventures/building-cloudhaven/levels/expert", title: /The Guardian Protocols/ },
  { path: "/adventures/the-ai-observatory/levels/beginner", title: /Calibrating the Lens/ },
  { path: "/adventures/the-ai-observatory/levels/intermediate", title: /The Distracted Pilot/ },
  { path: "/adventures/the-ai-observatory/levels/expert", title: /The Noise Filter/ },
];

test.describe("every prerendered route", () => {
  for (const { path, title } of ROUTES) {
    test(path, async ({ page }) => {
      const jsErrors: string[] = [];
      page.on("pageerror", (e) => jsErrors.push(e.message));

      await page.goto(path);

      expect(jsErrors, `unexpected JS errors on ${path}`).toHaveLength(0);
      await expect(page.locator("main#main-content")).toBeAttached();
      await expect(page).toHaveTitle(title);

      // Disable animations so axe measures elements at their final visible state,
      // not at opacity 0 mid-animation which produces false contrast failures.
      await page.emulateMedia({ reducedMotion: "reduce" });
      const a11y = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
        .analyze();
      expect(a11y.violations, `axe violations on ${path}`).toEqual([]);
    });
  }
});

test.describe("every prerendered route (light mode)", () => {
  for (const { path } of ROUTES) {
    test(path, async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem("theme", "light"));
      await page.goto(path);

      await expect(page.locator("html")).toHaveClass(/light/);
      await page.emulateMedia({ reducedMotion: "reduce" });
      const a11y = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
        .analyze();
      expect(a11y.violations, `axe violations on ${path} (light mode)`).toEqual([]);
    });
  }
});

test.describe("hydration and interactivity", () => {
  test("theme toggle switches from dark to light", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/dark/);

    // Two buttons exist (desktop + mobile); target the desktop one
    await page.getByRole("button", { name: "Switch to light mode" }).first().click();
    await expect(page.locator("html")).toHaveClass(/light/);
  });

  test("theme preference persists across page reload", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Switch to light mode" }).first().click();
    await expect(page.locator("html")).toHaveClass(/light/);

    await page.reload();
    await expect(page.locator("html")).toHaveClass(/light/);
  });

  test("consent accept stores granted and replaces banner with preferences button", async ({ page }) => {
    await page.goto("/");
    const banner = page.getByRole("region", { name: "Cookie consent" });
    await expect(banner).toBeVisible();

    await page.getByRole("button", { name: "Accept analytics cookies" }).click();

    await expect(banner).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Change cookie preferences" })).toBeVisible();
    const stored = await page.evaluate(() => localStorage.getItem("analytics_consent"));
    expect(JSON.parse(stored!).value).toBe("granted");
  });

  test("consent decline stores denied and replaces banner with preferences button", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Decline analytics cookies" }).click();

    await expect(page.getByRole("region", { name: "Cookie consent" })).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Change cookie preferences" })).toBeVisible();
    const stored = await page.evaluate(() => localStorage.getItem("analytics_consent"));
    expect(JSON.parse(stored!).value).toBe("denied");
  });

  test("client-side navigation updates URL and title without a full reload", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/OffOn - Vendor-neutral/);

    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "About" }).click();

    await expect(page).toHaveURL(/\/about/);
    await expect(page).toHaveTitle(/Building the contributors/);
    await expect(page.locator("main#main-content")).toBeAttached();
  });

  test("skip nav link is the first Tab stop", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toContainText("Skip to main content");
  });
});
