// Hydration regression tests.
// Verifies that prerendered pages hydrate without React warnings.
// Requires a production build. Run `npm run build` before `npm run test:e2e`.

import { test, expect } from "@playwright/test";

// Representative subset of the prerender list covering the main layout types.
// Does not duplicate the full route audit in smoke.spec.ts; focuses on routes
// that exercise state initialisation patterns that can mismatch on hydration.
const ROUTES = [
  "/",
  "/adventures",
  "/challenges",
  "/about",
  "/handbook",
  "/privacy",
  "/accessibility",
  "/contribute",
  "/sponsors",
  "/404",
  "/adventures/blind-by-design",
  "/adventures/blind-by-design/levels/beginner",
  "/challenges/kyverno",
];

// React production runtime emits "Minified React error #N" to console.error
// for hydration mismatches. Patterns cover both prod error codes and the
// dev-mode readable text (future dev-build opt-in).
const HYDRATION_PATTERNS = [
  /Minified React error #418/,
  /Minified React error #423/,
  /Minified React error #425/,
  /Hydration failed/i,
  /There was an error while hydrating/i,
  /Expected server HTML/i,
];

function isHydrationWarning(text: string): boolean {
  return HYDRATION_PATTERNS.some((p) => p.test(text));
}

test.describe("hydration: prerendered routes", () => {
  for (const route of ROUTES) {
    test(`${route} hydrates without React warnings`, async ({ page }) => {
      const hydrationErrors: string[] = [];

      page.on("console", (msg) => {
        if (msg.type() === "error" && isHydrationWarning(msg.text())) {
          hydrationErrors.push(msg.text());
        }
      });

      await page.goto(route);
      await page.waitForLoadState("networkidle");

      expect(
        hydrationErrors,
        `React hydration warnings on ${route}:\n${hydrationErrors.join("\n")}`,
      ).toHaveLength(0);
    });
  }
});

// Exercise /challenges/?topics=kyverno: the prerendered HTML has hasFiltered=false
// (no params at build time). The client reads the param in useEffect, not in the
// useState initializer, so the first render matches and React should not warn.
test("hydration: /challenges/?topics=kyverno hydrates with search params", async ({ page }) => {
  const hydrationErrors: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error" && isHydrationWarning(msg.text())) {
      hydrationErrors.push(msg.text());
    }
  });

  await page.goto("/challenges/?topics=kyverno");
  await page.waitForLoadState("networkidle");

  expect(
    hydrationErrors,
    `React hydration warnings on /challenges/?topics=kyverno:\n${hydrationErrors.join("\n")}`,
  ).toHaveLength(0);
});

// Exercise the light-theme path: the inline themeScript in root.tsx applies the
// "light" class to <html> before React mounts. The prerendered HTML has
// className="dark". React sees a mismatch but suppresses it via
// suppressHydrationWarning on <html>. This test confirms suppression is
// working and no other component leaks an unsuppressed mismatch.
test("hydration: /challenges hydrates with stored light theme in localStorage", async ({
  page,
  context,
}) => {
  await context.addInitScript(() => {
    localStorage.setItem("theme", "light");
  });

  const hydrationErrors: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error" && isHydrationWarning(msg.text())) {
      hydrationErrors.push(msg.text());
    }
  });

  await page.goto("/challenges");
  await page.waitForLoadState("networkidle");

  expect(
    hydrationErrors,
    `React hydration warnings with light theme:\n${hydrationErrors.join("\n")}`,
  ).toHaveLength(0);
});
