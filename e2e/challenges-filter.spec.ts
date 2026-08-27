// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT
// ChallengesFilter keyboard and dismissal behaviour.
//
// The filter has two distinct UIs at different breakpoints, so each group sets
// its own viewport: dropdowns below 1024px, the pill radiogroup at and above it.
import { test, expect, type Page } from "@playwright/test";

const DIFF_TRIGGER = 'button[aria-controls="difficulty-group"]';
const DIFF_PANEL = "#difficulty-group";
const TAGS_TRIGGER = 'button[aria-controls="tags-group"]';

/** Settle consent so the banner is not an extra focus stop in these tests. */
async function gotoChallenges(page: Page, waitFor: string): Promise<void> {
  await page.addInitScript(() =>
    localStorage.setItem("analytics_consent", JSON.stringify({ value: "denied", timestamp: Date.now() })),
  );
  await page.goto("/challenges/");
  await page.waitForSelector(waitFor);
}

// An open panel must close on Escape, on an outside click, and when focus leaves
// it. Closing on focus-out must not pull focus back to the trigger, since the
// user has already tabbed somewhere else.
test.describe("dropdown dismissal", () => {
  test.use({ viewport: { width: 800, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await gotoChallenges(page, DIFF_TRIGGER);
  });

  test("tabbing out of an open panel closes it without stealing focus", async ({ page }) => {
    await page.click(DIFF_TRIGGER);
    await expect(page.locator(DIFF_PANEL)).toBeVisible();
    await expect(page.locator(DIFF_TRIGGER)).toHaveAttribute("aria-expanded", "true");

    // Walk forward until focus leaves the difficulty wrapper.
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      const inside = await page.evaluate(
        () => !!document.activeElement?.closest("#difficulty-group, [aria-controls='difficulty-group']"),
      );
      if (!inside) break;
    }

    await expect(page.locator(DIFF_PANEL)).toBeHidden();
    await expect(page.locator(DIFF_TRIGGER)).toHaveAttribute("aria-expanded", "false");

    // Focus must have moved on, NOT snapped back to the trigger.
    const onTrigger = await page.evaluate(
      () => document.activeElement?.getAttribute("aria-controls") === "difficulty-group",
    );
    expect(onTrigger, "focus-out must not restore focus to the trigger").toBe(false);
    const activeTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(activeTag).not.toBe("BODY");
  });

  test("keeps the panel open while focus stays inside it", async ({ page }) => {
    await page.click(DIFF_TRIGGER);
    await expect(page.locator(DIFF_PANEL)).toBeVisible();

    await page.keyboard.press("Tab"); // into the first panel option
    const inside = await page.evaluate(() => !!document.activeElement?.closest("#difficulty-group"));
    expect(inside).toBe(true);
    await expect(page.locator(DIFF_PANEL)).toBeVisible();
  });

  test("Escape still closes and returns focus to the trigger", async ({ page }) => {
    await page.click(DIFF_TRIGGER);
    await expect(page.locator(DIFF_PANEL)).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.locator(DIFF_PANEL)).toBeHidden();
    await expect(page.locator(DIFF_TRIGGER)).toBeFocused();
  });

  test("outside mousedown still closes the panel", async ({ page }) => {
    await page.click(TAGS_TRIGGER);
    await expect(page.locator("#tags-group")).toBeVisible();

    await page.locator("h1").click();
    await expect(page.locator("#tags-group")).toBeHidden();
  });
});

// Desktop difficulty radiogroup: APG roving tabindex. Arrow keys move focus and
// select, exactly one radio is tabbable at a time, and wrapping is circular.
// The group element itself must stay out of the tab order.
test.describe("difficulty radiogroup keyboard", () => {
  test.use({ viewport: { width: 1400, height: 900 } });

  const GROUP = '[role="radiogroup"][aria-label="Filter by difficulty"]';
  const RADIOS = `${GROUP} [role="radio"]`;

  test("arrow keys move focus, select, and wrap", async ({ page }) => {
    await gotoChallenges(page, GROUP);

    const labels = await page.locator(RADIOS).allInnerTexts();
    expect(labels.length).toBeGreaterThan(2);

    const focused = () => page.evaluate(() => document.activeElement?.textContent?.trim() ?? "");
    const checked = () =>
      page.evaluate((sel) => {
        const el = document.querySelector(`${sel}[aria-checked="true"]`);
        return el?.textContent?.trim() ?? null;
      }, RADIOS);

    await page.locator(RADIOS).first().focus();
    expect(await focused()).toBe(labels[0].trim());

    await page.keyboard.press("ArrowRight");
    expect(await focused()).toBe(labels[1].trim());
    expect(await checked()).toBe(labels[1].trim());

    await page.keyboard.press("ArrowLeft");
    expect(await focused()).toBe(labels[0].trim());

    // Wrap backwards from the first to the last.
    await page.keyboard.press("ArrowLeft");
    expect(await focused()).toBe(labels[labels.length - 1].trim());

    // Wrap forwards from the last back to the first.
    await page.keyboard.press("ArrowRight");
    expect(await focused()).toBe(labels[0].trim());
  });

  test("exactly one radio is tabbable and the group is not", async ({ page }) => {
    await gotoChallenges(page, GROUP);

    const state = await page.evaluate((sel) => {
      const group = document.querySelector(sel.group) as HTMLElement;
      const radios = Array.from(document.querySelectorAll<HTMLElement>(sel.radios));
      return {
        groupTabindex: group.getAttribute("tabindex"),
        tabbable: radios.filter((r) => r.getAttribute("tabindex") === "0").length,
        total: radios.length,
      };
    }, { group: GROUP, radios: RADIOS });

    expect(state.groupTabindex, "the radiogroup must not be in the tab order").toBeNull();
    expect(state.tabbable, "exactly one radio carries tabindex=0").toBe(1);
    expect(state.total).toBeGreaterThan(2);
  });
});

// A tag route and the in-page filter produce the same view, so they must produce
// the same heading. They did not: /challenges/<tag>/ rendered "<Tag> Challenges"
// while filtering by pill left "Open Source Challenges", and the pre-migration
// app used the latter on both.
test.describe("heading is stable across how the filter was reached", () => {
  test.use({ viewport: { width: 1400, height: 900 } });

  const EXPECTED = "Open Source Challenges";

  for (const tag of ["backstage", "kubernetes", "opentelemetry"]) {
    test(`/challenges/${tag}/ keeps the page heading`, async ({ page }) => {
      await gotoChallenges(page, "h1");
      const unfiltered = await page.locator("h1").innerText();
      expect(unfiltered).toBe(EXPECTED);

      await page.goto(`/challenges/${tag}/`);
      await page.waitForSelector("h1");
      expect(await page.locator("h1").innerText()).toBe(EXPECTED);

      // The tag is still surfaced, just not as the page heading.
      const count = new RegExp(`\\d+ challenges? · ${tag}`, "i");
      await expect(page.locator("p").filter({ hasText: count })).toBeVisible();

      // Not in the live region though: arriving at a filtered URL is not an
      // interaction, and a live region must not announce the state a page
      // loaded in. It only speaks once the user changes a filter, which
      // challenges-filter-deep.spec.ts covers.
      await expect(page.locator("[data-live-count]")).toBeEmpty();
    });
  }

  test("filtering by pill and by URL agree", async ({ page }) => {
    await gotoChallenges(page, "h1");
    await page.getByRole("button", { name: "Backstage", exact: true }).first().click();
    await page.waitForTimeout(150);
    const viaPill = await page.locator("h1").innerText();

    await page.goto("/challenges/backstage/");
    await page.waitForSelector("h1");
    const viaUrl = await page.locator("h1").innerText();

    expect(viaPill).toBe(viaUrl);
    expect(viaUrl).toBe(EXPECTED);
  });
});

// Filter buttons are tracked by the click tracker. They are not links, so
// click_url falls back to data-url. Verify data-url is populated with a real
// path (not "no-url") so GA4 click_event reports something useful.
test.describe("filter button click_url tracking", () => {
  test.use({ viewport: { width: 1400, height: 900 } });

  test("tag pill buttons carry a real data-url after init", async ({ page }) => {
    await gotoChallenges(page, "[data-tag-pill]");
    // initChallengesFilter runs on DOMContentLoaded; wait until data-url is set.
    await page.waitForFunction(
      () => !!document.querySelector("[data-tag-pill]:not([data-tag-pill=''])")?.getAttribute("data-url"),
    );
    const pill = page.locator("[data-tag-pill]:not([data-tag-pill=''])").first();
    const dataUrl = await pill.getAttribute("data-url");
    expect(dataUrl).not.toBe("no-url");
    expect(dataUrl).toMatch(/^\/challenges\//);
  });

  test("difficulty radio buttons carry a real data-url after init", async ({ page }) => {
    await gotoChallenges(page, "[data-difficulty-radio]");
    await page.waitForFunction(
      () =>
        !!document
          .querySelector("[data-difficulty-radio]:not([data-difficulty-radio=''])")
          ?.getAttribute("data-url"),
    );
    const radio = page.locator("[data-difficulty-radio]:not([data-difficulty-radio=''])").first();
    const dataUrl = await radio.getAttribute("data-url");
    expect(dataUrl).not.toBe("no-url");
    expect(dataUrl).toContain("difficulty=");
  });

  test("tag pill data-url updates after a click", async ({ page }) => {
    await gotoChallenges(page, "[data-tag-pill]");
    await page.waitForFunction(
      () => !!document.querySelector("[data-tag-pill]:not([data-tag-pill=''])")?.getAttribute("data-url"),
    );
    const pill = page.locator("[data-tag-pill]:not([data-tag-pill=''])").first();
    await pill.click();
    // After toggle-on, data-url should reflect the toggled-off projection.
    const dataUrl = await pill.getAttribute("data-url");
    expect(dataUrl).not.toBe("no-url");
    expect(dataUrl).toMatch(/^\/challenges\//);
  });

  // Empirical ordering check: the click tracker fires in document capture phase,
  // before the button's bubble handler runs updateDataUrls(). Verify that for two
  // consecutive clicks, click_url in GA4 equals the URL the click actually produced
  // — not the stale value from the previous state.
  test("click tracker records the URL each click produces, not a stale value", async ({ page }) => {
    // Spy on dataLayer.push before Layout.astro's inline script defines gtag.
    // gtag("event", name, params) calls dataLayer.push(arguments), so the entry
    // that lands in dataLayer is an Arguments-like object with numeric indices.
    await page.addInitScript(() => {
      (window as any).__clickUrls = [];
      (window as any).dataLayer = (window as any).dataLayer || [];
      const orig = Array.prototype.push;
      (window as any).dataLayer.push = function (...args: any[]) {
        const entry = args[0];
        if (entry && entry[0] === "event" && entry[1] === "click_event") {
          (window as any).__clickUrls.push(
            entry[2] != null ? (entry[2] as Record<string, unknown>).click_url : "missing",
          );
        }
        return orig.apply(this, args as any);
      };
      localStorage.setItem(
        "analytics_consent",
        JSON.stringify({ value: "granted", timestamp: Date.now() }),
      );
    });
    // Stub googletagmanager.com so no real network requests leave the test.
    await page.route("**googletagmanager.com/**", (route) =>
      route.fulfill({ status: 200, contentType: "application/javascript", body: "" }),
    );

    await page.goto("/challenges/");
    await page.waitForFunction(
      () => !!document.querySelector("[data-tag-pill]:not([data-tag-pill=''])")?.getAttribute("data-url"),
    );

    const pill = page.locator("[data-tag-pill]:not([data-tag-pill=''])").first();

    // Click 1 — toggle on. Tracker fires in capture (reads current data-url),
    // then the handler runs syncUrl + updateDataUrls.
    const projectedBefore1 = await pill.getAttribute("data-url");
    await pill.click();
    const urlAfter1 = await page.evaluate(() => window.location.pathname + window.location.search);
    const recorded1 = await page.evaluate(() => (window as any).__clickUrls[0]);

    expect(recorded1, "click 1: tracker must record the projected URL").toBe(projectedBefore1);
    expect(recorded1, "click 1: tracker URL must match the URL produced by the click").toBe(urlAfter1);

    // Click 2 — toggle off. This is where a stale value would appear if ordering
    // were wrong: data-url would show click 1's URL instead of click 2's result.
    const projectedBefore2 = await pill.getAttribute("data-url");
    await pill.click();
    const urlAfter2 = await page.evaluate(() => window.location.pathname + window.location.search);
    const recorded2 = await page.evaluate(() => (window as any).__clickUrls[1]);

    expect(recorded2, "click 2: tracker must record the projected URL").toBe(projectedBefore2);
    expect(recorded2, "click 2: tracker URL must match the URL produced by the click").toBe(urlAfter2);
  });
});

