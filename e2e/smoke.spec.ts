// Requires a production build in dist/client/. Run `npm run build` before `npm run test:e2e`.

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

type RouteSpec = { path: string; title: RegExp };

const ROUTES: RouteSpec[] = [
  { path: "/", title: /OffOn - Vendor-Neutral/ },
  { path: "/about", title: /Building the contributors/ },
  { path: "/sponsors", title: /Sponsorship and Independence/ },
  { path: "/handbook", title: /Handbook/ },
  { path: "/privacy", title: /Privacy Policy/ },
  { path: "/accessibility", title: /Accessibility Statement/ },
  { path: "/404", title: /Page Not Found/ },
  { path: "/adventures", title: /Adventures - Hands-on open source challenges/ },
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
  { path: "/adventures/blind-by-design", title: /Blind by Design/ },
  { path: "/adventures/blind-by-design/levels/beginner", title: /Stand up the Lab/ },
  { path: "/adventures/blind-by-design/levels/intermediate", title: /Outcome by Cohort/ },
];

test.describe("every prerendered route", () => {
  for (const { path, title } of ROUTES) {
    test(path, async ({ page }) => {
      const jsErrors: string[] = [];
      page.on("pageerror", (e) => jsErrors.push(e.message));

      // Reduced motion must be set before navigation so the global
      // prefers-reduced-motion CSS rule kills transitions from first paint.
      // Calling it after goto leaves any in-flight transitions running and
      // axe samples mid-animation colors that fail contrast.
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);

      expect(jsErrors, `unexpected JS errors on ${path}`).toHaveLength(0);
      await expect(page.locator("main#main-content")).toBeAttached();
      await expect(page).toHaveTitle(title);

      // Wait for hydration and post-mount renders (consent banner, theme
      // sync) to settle so axe sees stable computed styles.
      await page.waitForLoadState("networkidle");
      const a11y = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
        .analyze();
      expect(a11y.violations, `axe violations on ${path}`).toEqual([]);
    });
  }
});

test.describe("every prerendered route (light mode)", () => {
  for (const { path } of ROUTES) {
    test(path, async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem("theme", "light"));
      // Set reduced motion before goto; see comment in dark-mode block above.
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);

      await expect(page.locator("html")).toHaveClass(/light/);
      // Wait for hydration to fully settle; without this axe occasionally
      // samples elements mid React-render with stale dark-mode computed
      // colors from the initial dark-class server render.
      await page.waitForLoadState("networkidle");
      const a11y = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
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
    await expect(page).toHaveTitle(/OffOn - Vendor-Neutral/);

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
