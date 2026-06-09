// Requires a production build in dist/client/. Run `npm run build` before `npm run test:e2e`.

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

type RouteSpec = { path: string; title: RegExp };

const ROUTES: RouteSpec[] = [
  { path: "/", title: /OffOn - Vendor-Neutral/ },
  { path: "/about", title: /Building the contributors/ },
  { path: "/contribute", title: /How to Contribute/ },
  { path: "/sponsors", title: /Sponsorship and Independence/ },
  { path: "/handbook", title: /Handbook/ },
  { path: "/privacy", title: /Privacy Policy/ },
  { path: "/accessibility", title: /Accessibility Statement/ },
  { path: "/brand", title: /Brand Guidelines/ },
  { path: "/404", title: /Page Not Found/ },
  { path: "/adventures", title: /Adventures - Open Source Learning Paths/ },
  // GENERATED:adventures
  { path: "/adventures/lex-imperfecta", title: /Lex Imperfecta/ },
  { path: "/adventures/lex-imperfecta/levels/beginner", title: /The Twelve Tables/ },
  { path: "/adventures/lex-imperfecta/levels/intermediate", title: /Governing the Provinces/ },
  { path: "/adventures/blind-by-design", title: /Blind by Design/ },
  { path: "/adventures/blind-by-design/levels/beginner", title: /Stand up the Lab/ },
  { path: "/adventures/blind-by-design/levels/intermediate", title: /Outcome by Cohort/ },
  { path: "/adventures/blind-by-design/levels/expert", title: /Read the Chart/ },
  { path: "/adventures/the-ai-observatory", title: /The AI Observatory/ },
  { path: "/adventures/the-ai-observatory/levels/beginner", title: /Calibrating the Lens/ },
  { path: "/adventures/the-ai-observatory/levels/intermediate", title: /The Distracted Pilot/ },
  { path: "/adventures/the-ai-observatory/levels/expert", title: /The Noise Filter/ },
  { path: "/adventures/building-cloudhaven", title: /Building CloudHaven/ },
  { path: "/adventures/building-cloudhaven/levels/beginner", title: /The Foundation Stones/ },
  { path: "/adventures/building-cloudhaven/levels/intermediate", title: /The Modular Metropolis/ },
  { path: "/adventures/building-cloudhaven/levels/expert", title: /The Guardian Protocols/ },
  { path: "/adventures/echoes-lost-in-orbit", title: /Echoes Lost in Orbit/ },
  { path: "/adventures/echoes-lost-in-orbit/levels/beginner", title: /Broken Echoes/ },
  { path: "/adventures/echoes-lost-in-orbit/levels/intermediate", title: /The Silent Canary/ },
  { path: "/adventures/echoes-lost-in-orbit/levels/expert", title: /Hyperspace Operations & Transport/ },
  // /GENERATED:adventures
  { path: "/challenges", title: /Open Source Challenges/ },
  // GENERATED:challenge-tags
  { path: "/challenges/argo-cd", title: /Argo CD Challenges/ },
  { path: "/challenges/argo-rollouts", title: /Argo Rollouts Challenges/ },
  { path: "/challenges/flagd", title: /flagd Challenges/ },
  { path: "/challenges/github-actions", title: /GitHub Actions Challenges/ },
  { path: "/challenges/grafana", title: /Grafana Challenges/ },
  { path: "/challenges/jaeger", title: /Jaeger Challenges/ },
  { path: "/challenges/java", title: /Java Challenges/ },
  { path: "/challenges/kubernetes", title: /Kubernetes Challenges/ },
  { path: "/challenges/kyverno", title: /Kyverno Challenges/ },
  { path: "/challenges/openfeature", title: /OpenFeature Challenges/ },
  { path: "/challenges/openllmetry", title: /OpenLLMetry Challenges/ },
  { path: "/challenges/opentelemetry", title: /OpenTelemetry Challenges/ },
  { path: "/challenges/opentofu", title: /OpenTofu Challenges/ },
  { path: "/challenges/policy-reporter", title: /Policy Reporter Challenges/ },
  { path: "/challenges/prometheus", title: /Prometheus Challenges/ },
  { path: "/challenges/promql", title: /PromQL Challenges/ },
  { path: "/challenges/python", title: /Python Challenges/ },
  { path: "/challenges/spring-boot", title: /Spring Boot Challenges/ },
  { path: "/challenges/tdd", title: /TDD Challenges/ },
  { path: "/challenges/terraform", title: /Terraform Challenges/ },
  { path: "/challenges/trivy", title: /Trivy Challenges/ },
  // /GENERATED:challenge-tags
];

test.describe("every prerendered route", () => {
  for (const { path, title } of ROUTES) {
    test(path, async ({ page }) => {
      const pageErrors: string[] = [];
      const consoleErrors: string[] = [];
      page.on("pageerror", (e) => pageErrors.push(e.message));
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });

      // Reduced motion must be set before navigation so the global
      // prefers-reduced-motion CSS rule kills transitions from first paint.
      // Calling it after goto leaves any in-flight transitions running and
      // axe samples mid-animation colors that fail contrast.
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);

      // Wait for hydration and post-mount renders (consent banner, theme
      // sync) to settle before asserting on error state.
      await page.waitForLoadState("networkidle");

      expect(pageErrors, `unexpected JS exceptions on ${path}:\n${pageErrors.join("\n")}`).toHaveLength(0);
      expect(consoleErrors, `unexpected console.error on ${path}:\n${consoleErrors.join("\n")}`).toHaveLength(0);
      await expect(page.locator("main#main-content")).toBeAttached();
      await expect(page).toHaveTitle(title);

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
      const pageErrors: string[] = [];
      const consoleErrors: string[] = [];
      page.on("pageerror", (e) => pageErrors.push(e.message));
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });

      await page.addInitScript(() => localStorage.setItem("theme", "light"));
      // Set reduced motion before goto; see comment in dark-mode block above.
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);

      await expect(page.locator("html")).toHaveClass(/light/);
      // Wait for hydration to fully settle; without this axe occasionally
      // samples elements mid React-render with stale dark-mode computed
      // colors from the initial dark-class server render.
      await page.waitForLoadState("networkidle");

      expect(pageErrors, `unexpected JS exceptions on ${path} (light mode):\n${pageErrors.join("\n")}`).toHaveLength(0);
      expect(consoleErrors, `unexpected console.error on ${path} (light mode):\n${consoleErrors.join("\n")}`).toHaveLength(0);

      const a11y = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
        .analyze();
      expect(a11y.violations, `axe violations on ${path} (light mode)`).toEqual([]);
    });
  }
});

// axe-core does not check WCAG 1.4.11 border contrast on styled <a> link elements.
// This block fills that gap for the specific interactive chip/pill components.
test.describe("WCAG 1.4.11 border contrast: light mode (axe gap)", () => {
  // All contrast math runs inside page.evaluate so helpers are inline there.
  async function getBorderContrast(page: import("@playwright/test").Page, selector: string): Promise<number | null> {
    return page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const cs = window.getComputedStyle(el);
      const parse = (s: string) => {
        const m = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        return m ? [+m[1], +m[2], +m[3]] as [number, number, number] : null;
      };
      const border = parse(cs.borderTopColor);
      let bg: [number, number, number] | null = null;
      let cur: Element | null = el;
      while (cur) {
        const b = parse(window.getComputedStyle(cur).backgroundColor);
        if (b && window.getComputedStyle(cur).backgroundColor !== "rgba(0, 0, 0, 0)") { bg = b; break; }
        cur = cur.parentElement;
      }
      if (!border || !bg) return null;
      const lin = (c: number) => { const n = c / 255; return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4); };
      const lum = ([r, g, b]: [number, number, number]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
      const l1 = lum(border);
      const l2 = lum(bg);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    }, selector);
  }

  test("tag-chip-link border contrast >= 3:1 on challenge detail (light mode)", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("theme", "light"));
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/adventures/blind-by-design/levels/beginner");
    await page.waitForLoadState("networkidle");
    const ratio = await getBorderContrast(page, ".tag-chip-link");
    expect(ratio, "tag-chip-link border contrast must be >= 3:1 (WCAG 1.4.11)").not.toBeNull();
    expect(ratio!).toBeGreaterThanOrEqual(3.0);
  });

  test("contributor-pill border contrast >= 3:1 on adventure page (light mode)", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("theme", "light"));
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/adventures/blind-by-design");
    await page.waitForLoadState("networkidle");
    const ratio = await getBorderContrast(page, ".contributor-pill");
    expect(ratio, "contributor-pill border contrast must be >= 3:1 (WCAG 1.4.11)").not.toBeNull();
    expect(ratio!).toBeGreaterThanOrEqual(3.0);
  });
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
    const banner = page.getByRole("region", { name: "This site uses analytics cookies" });
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

    await expect(page.getByRole("region", { name: "This site uses analytics cookies" })).not.toBeVisible();
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

  test("skip nav link moves focus to #main-content when activated", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toContainText("Skip to main content");
    await page.keyboard.press("Enter");
    await expect(page.locator(":focus")).toHaveAttribute("id", "main-content");
  });
});

test.describe("reduced motion — axe scan", () => {
  // Runs axe on representative routes with prefers-reduced-motion: reduce to catch
  // content that becomes invisible or inaccessible when animations are disabled.
  const ROUTES = [
    "/",
    "/challenges",
    "/adventures/blind-by-design/levels/beginner",
  ];

  for (const path of ROUTES) {
    test(`no axe violations on ${path} (reduced motion)`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      const response = await page.goto(path);
      expect(response?.status(), `${path} returned non-200 status`).toBe(200);
      await page.waitForLoadState("networkidle");
      const a11y = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
        .analyze();
      expect(a11y.violations, `axe violations on ${path} with reduced motion`).toEqual([]);
    });
  }
});
