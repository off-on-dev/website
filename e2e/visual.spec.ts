// Visual regression gate for the Astro build. Captures full-page screenshots
// across two viewports and two themes, compares against committed baselines in
// e2e/snapshots/. A missing baseline fails the test — add new routes with
// --update-snapshots and commit the generated files.
//
// To regenerate all baselines:
//   npm run build && npx playwright test e2e/visual.spec.ts --update-snapshots
//
// Note: baselines are platform-independent (no OS suffix in the path template).
// The threshold absorbs minor sub-pixel differences between macOS and Linux.

import { test, expect, type Page } from "@playwright/test";

interface Route {
  slug: string;
  path: string;
  /** Set to "banner" to capture the consent banner visible state. */
  consentState?: "denied" | "banner";
}

const ROUTES: Route[] = [
  { slug: "home",              path: "/"                                                    },
  { slug: "adventures",        path: "/adventures/"                                         },
  { slug: "challenges",        path: "/challenges/"                                         },
  { slug: "challenges-otel",   path: "/challenges/opentelemetry/"                           },
  { slug: "about",             path: "/about/"                                              },
  { slug: "handbook",          path: "/handbook/"                                           },
  { slug: "brand",             path: "/brand/"                                              },
  { slug: "adventure-echoes",  path: "/adventures/echoes-lost-in-orbit/"                   },
  { slug: "level-beginner",    path: "/adventures/echoes-lost-in-orbit/levels/beginner/"   },
  { slug: "solution-beginner", path: "/adventures/echoes-lost-in-orbit/levels/beginner/solution/" },
  { slug: "404",               path: "/404/"                                                },
  { slug: "consent-banner",    path: "/",                  consentState: "banner"          },
];

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile",  width: 375,  height: 812 },
] as const;

const THEMES = ["dark", "light"] as const;

const STUB_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

async function setupPage(page: Page, theme: string, consentState?: string) {
  await page.addInitScript(
    ({ theme, consentState }) => {
      localStorage.setItem("theme", theme);
      if (consentState !== "banner") {
        localStorage.setItem(
          "analytics_consent",
          JSON.stringify({ value: "denied", timestamp: Date.now() - 86_400_000 * 30 }),
        );
      }
    },
    { theme, consentState },
  );

  await page.route(
    /community\.offon\.dev|discourse-cdn\.com|avatars\.|gravatar\.com/,
    (r) => r.fulfill({ status: 200, contentType: "image/png", body: STUB_PNG }),
  );
}

for (const viewport of VIEWPORTS) {
  for (const theme of THEMES) {
    test.describe(`${viewport.name} / ${theme}`, () => {
      test.use({
        viewport: { width: viewport.width, height: viewport.height },
        colorScheme: theme === "dark" ? "dark" : "light",
      });

      for (const route of ROUTES) {
        test(route.slug, async ({ page }) => {
          await setupPage(page, theme, route.consentState);

          await page.goto(route.path);
          await page.evaluate(() => document.fonts.ready);

          if (route.consentState === "banner") {
            // Wait for the banner to be revealed by the consent script.
            await page.locator('[aria-live="polite"]').waitFor({ state: "visible", timeout: 5000 }).catch(() => {});
          }

          await expect(page).toHaveScreenshot(
            `${route.slug}--${theme}--${viewport.name}.png`,
            {
              fullPage: true,
              animations: "disabled",
              // 0.2% pixel ratio tolerance absorbs cross-platform sub-pixel
              // rendering differences without masking structural regressions.
              maxDiffPixelRatio: 0.002,
            },
          );
        });
      }
    });
  }
}
