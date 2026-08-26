// Visual regression gate for the Astro build. Captures full-page screenshots
// across two viewports and two themes, compares against committed baselines in
// e2e/snapshots/. A missing baseline fails the test — add new routes with
// --update-snapshots and commit the generated files.
//
// NOT a CI gate. Run locally only:
//   npm run test:visual      — compare against committed baselines
//   npm run baselines:update — regenerate baselines (after intentional visual changes)
//
// Both commands run inside a pinned linux Docker image so baselines are
// platform-independent. Never generate baselines directly on macOS or Windows.

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
              // Both baseline generation and comparison build their own dist/.
              // Astro build non-determinism (content hash seeding) can produce
              // small pixel diffs between runs. Tighten this after running
              // `npm run test:visual` and observing the actual diff numbers.
              maxDiffPixels: 1000,
            },
          );
        });
      }
    });
  }
}
