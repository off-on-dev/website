// Visual regression gate for the Astro build. Captures full-page screenshots
// at desktop width (1440 px) across two themes, compares against committed
// baselines in e2e/snapshots/. A missing baseline fails the test — add new
// routes with --update-snapshots and commit the generated files.
//
// NOT a CI gate. Run locally only:
//   npm run test:visual      — compare against committed baselines
//   npm run baselines:update — regenerate baselines (after intentional visual changes)
//
// Desktop only. Mobile was removed because headless Chromium's text
// rasterisation is non-deterministic on long mobile captures (375 px viewport,
// pages up to 12 000 px tall): different pixels fail on every run at any
// tolerance, making the suite unreliable. Mobile layout changes must be checked
// by eye against the production build (npm run preview).
//
// Baselines are generated on macOS (CoreText rendering). Contributors on Linux
// or Windows must run baselines:update before test:visual is meaningful on
// their machine — the committed snapshots will not match their renderer.

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

for (const theme of THEMES) {
  test.describe(`desktop / ${theme}`, () => {
    test.use({
      viewport: { width: 1440, height: 900 },
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
          `${route.slug}--${theme}--desktop.png`,
          {
            fullPage: true,
            animations: "disabled",
            // Noise floor is exactly 0 across repeated runs on macOS (build is
            // deterministic; renders are stable). 0 is correct: there is
            // nothing to absorb. A nonzero diff without a code change means
            // something in the build pipeline is non-deterministic, which is
            // itself worth knowing.
            //
            // Known blind spot: a sufficiently subtle colour shift on a thin
            // element (e.g. border opacity /20 → /30 on the hero-badge pill)
            // produces 0 differing pixels and is undetectable at any tolerance.
            // This suite does not catch all visual changes — it catches layout
            // regressions and changes that affect a meaningful run of pixels.
            maxDiffPixels: 0,
          },
        );
      });
    }
  });
}
