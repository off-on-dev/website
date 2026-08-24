// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

// Regression: solution.astro registered a window hashchange listener inside
// astro:page-load without a corresponding astro:before-swap teardown. Each
// client-side navigation to the solution page added a new listener on top of
// survivors from previous visits. The fix captures the handler reference and
// removes it on before-swap.

import { test, expect, type Page } from "@playwright/test";

const SOLUTION_URL =
  "/adventures/echoes-lost-in-orbit/levels/beginner/solution/";

async function seedDenied(page: Page): Promise<void> {
  await page.addInitScript(() =>
    localStorage.setItem(
      "analytics_consent",
      JSON.stringify({ value: "denied", timestamp: Date.now() }),
    ),
  );
}

test.describe("solution step hashchange listener lifecycle", () => {
  test("hash in URL opens the matching step on load", async ({ page }) => {
    await seedDenied(page);
    await page.goto(SOLUTION_URL + "#two-applications");
    await page.waitForLoadState("load");
    await expect(page.locator("#two-applications")).toHaveAttribute("open", "");
  });

  // Regression: without astro:before-swap teardown, each client-side navigation
  // to the solution page stacks a new hashchange listener on window. The fix
  // must remove the previous listener before adding the new one.
  test("no hashchange listener accumulation across navigations", async ({
    page,
  }) => {
    // Instrument EventTarget.prototype before any page script runs.
    await page.addInitScript(() => {
      let added = 0;
      let removed = 0;
      const origAdd = EventTarget.prototype.addEventListener;
      const origRemove = EventTarget.prototype.removeEventListener;
      (EventTarget.prototype as unknown as Record<string, unknown>).addEventListener =
        function (
          type: string,
          listener: EventListenerOrEventListenerObject | null,
          opts?: boolean | AddEventListenerOptions,
        ) {
          if (type === "hashchange" && (this as unknown as EventTarget) === window)
            added++;
          return origAdd.call(this, type, listener, opts);
        };
      (EventTarget.prototype as unknown as Record<string, unknown>).removeEventListener =
        function (
          type: string,
          listener: EventListenerOrEventListenerObject | null,
          opts?: boolean | EventListenerOptions,
        ) {
          if (type === "hashchange" && (this as unknown as EventTarget) === window)
            removed++;
          return origRemove.call(this, type, listener, opts);
        };
      (window as unknown as Record<string, unknown>).__hashStats = () => ({
        added,
        removed,
        net: added - removed,
      });
    });

    await seedDenied(page);

    // Full load lands on the solution page; astro:page-load fires and registers
    // the first hashchange listener. addInitScript counters reset here (full nav).
    await page.goto(SOLUTION_URL);
    await page.waitForLoadState("load");

    const challengesLink = () =>
      page.getByRole("link", { name: "Challenges", exact: true }).first();

    // Two round-trips: solution → challenges → solution.
    // Each departure must tear down the listener; each return must add one.
    for (let i = 0; i < 2; i++) {
      await challengesLink().click();
      await page.waitForURL("**/challenges/");
      await page.waitForLoadState("networkidle");

      await page.goBack();
      await page.waitForURL("**/solution/");
      await page.waitForLoadState("networkidle");
    }

    // Now on solution page for the third time.
    const { removed, net } = await page.evaluate(
      () =>
        (
          window as unknown as {
            __hashStats: () => { removed: number; net: number };
          }
        ).__hashStats(),
    );

    // Two departures must have fired teardown.
    expect(removed, "teardown must fire on each astro:before-swap").toBeGreaterThanOrEqual(2);
    // Exactly one listener active right now, regardless of visit count.
    // With the bug (no teardown) this would be 3 after 2 extra returns.
    expect(net, "only one hashchange listener active at any time").toBe(1);
  });
});
