// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

// solution-hash.ts opens the <details> element matching the URL hash on load.

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

test.describe("solution step hash navigation", () => {
  test("hash in URL opens the matching step on load", async ({ page }) => {
    await seedDenied(page);
    await page.goto(SOLUTION_URL + "#two-applications");
    await page.waitForLoadState("load");
    await expect(page.locator("#two-applications")).toHaveAttribute("open", "");
  });
});
