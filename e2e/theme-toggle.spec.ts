// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

// Theme switch behaviour.
//
// The icon and the accessible name are driven by CSS off the `.dark` class on
// <html>, so they must already be right in the first painted frame for a
// returning light-mode visitor, before any script runs. The previous island
// rendered the dark defaults server-side and only corrected them after
// hydration, which showed the wrong icon and announced the wrong name in
// between. That regression is what the "before any script" cases below cover.

import { test, expect, type Page } from "@playwright/test";

const TOGGLE = "[data-theme-toggle]";

/** Accessible name of every visible toggle on the page. */
async function visibleToggleNames(page: Page): Promise<string[]> {
  return page.evaluate((sel) =>
    Array.from(document.querySelectorAll<HTMLElement>(sel))
      .filter((el) => el.offsetParent !== null)
      .map((el) =>
        Array.from(el.querySelectorAll("span"))
          .filter((s) => getComputedStyle(s).display !== "none")
          .map((s) => s.textContent?.trim() ?? "")
          .join(" ")
          .trim(),
      ), TOGGLE);
}

/** Which icon is actually displayed, by its distinguishing path data. */
async function visibleIcons(page: Page): Promise<string[]> {
  return page.evaluate((sel) =>
    Array.from(document.querySelectorAll<HTMLElement>(sel))
      .filter((el) => el.offsetParent !== null)
      .flatMap((el) =>
        Array.from(el.querySelectorAll("svg"))
          .filter((s) => getComputedStyle(s).display !== "none")
          .map((s) => (s.querySelector("circle") ? "sun" : "moon")),
      ), TOGGLE);
}

test.describe("correct before any script runs", () => {
  for (const [stored, icon, name] of [
    ["dark", "sun", "Switch to light mode"],
    ["light", "moon", "Switch to dark mode"],
  ] as const) {
    test(`stored "${stored}" theme shows the ${icon} icon and the right name with JS disabled`, async ({
      browser,
    }) => {
      // With scripting off the inline pre-paint script never runs, so rewrite
      // the class it would have set and assert CSS alone resolves the control.
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();
      await page.route("**/*", async (route) => {
        const res = await route.fetch();
        if (!res.headers()["content-type"]?.includes("text/html")) return route.fulfill({ response: res });
        let body = await res.text();
        if (stored === "light") body = body.replace('<html lang="en" class="dark">', '<html lang="en" class="light">');
        return route.fulfill({ response: res, body });
      });

      await page.goto("/");
      expect(await visibleIcons(page)).toContain(icon);
      expect(await visibleToggleNames(page)).toContain(name);
      await context.close();
    });
  }

  test("a returning light-mode visitor never sees the dark icon", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("theme", "light"));
    await page.goto("/");
    // The inline pre-paint script has run; no island hydration is involved.
    await expect(page.locator("html")).toHaveClass(/light/);
    expect(await visibleIcons(page)).not.toContain("sun");
    expect(await visibleToggleNames(page)).toContain("Switch to dark mode");
  });
});

test.describe("toggling", () => {
  test("switches the theme, the icon and the name together", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/dark/);
    expect(await visibleToggleNames(page)).toContain("Switch to light mode");

    await page.locator(TOGGLE).filter({ visible: true }).first().click();

    await expect(page.locator("html")).toHaveClass(/light/);
    expect(await visibleIcons(page)).toContain("moon");
    expect(await visibleToggleNames(page)).toContain("Switch to dark mode");
  });

  test("persists across a reload", async ({ page }) => {
    await page.goto("/");
    await page.locator(TOGGLE).filter({ visible: true }).first().click();
    await expect(page.locator("html")).toHaveClass(/light/);
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("light");

    await page.reload();
    await expect(page.locator("html")).toHaveClass(/light/);
    expect(await visibleToggleNames(page)).toContain("Switch to dark mode");
  });

  test("persists across a full-page navigation via localStorage", async ({ page }) => {
    await page.goto("/");
    await page.locator(TOGGLE).filter({ visible: true }).first().click();
    await expect(page.locator("html")).toHaveClass(/light/);

    await page.getByRole("link", { name: "Challenges", exact: true }).first().click();
    await page.waitForURL("**/challenges/");
    await expect(page.locator("html")).toHaveClass(/light/);
    expect(await visibleToggleNames(page)).toContain("Switch to dark mode");
  });

  test("still works on a subsequent page after navigation", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Challenges", exact: true }).first().click();
    await page.waitForURL("**/challenges/");

    await page.locator(TOGGLE).filter({ visible: true }).first().click();
    await expect(page.locator("html")).toHaveClass(/light/);
  });

  test("announces the change in the live region", async ({ page }) => {
    await page.goto("/");
    await page.locator(TOGGLE).filter({ visible: true }).first().click();
    await expect(page.locator("#theme-status")).toHaveText("Theme switched to light mode");
  });
});

test.describe("both instances agree", () => {
  test("desktop and mobile toggles render the same state", async ({ page }) => {
    await page.goto("/");
    // Both exist in the DOM at any width; only one is visible per breakpoint.
    const states = await page.evaluate((sel) =>
      Array.from(document.querySelectorAll<HTMLElement>(sel)).map((el) =>
        Array.from(el.querySelectorAll("span"))
          .filter((s) => getComputedStyle(s).display !== "none")
          .map((s) => s.textContent?.trim())
          .join(""),
      ), TOGGLE);
    expect(states.length).toBe(2);
    expect(new Set(states).size, `toggles disagree: ${JSON.stringify(states)}`).toBe(1);
  });

  test("toggling at one breakpoint is reflected at the other", async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto("/");
    await page.locator(TOGGLE).filter({ visible: true }).first().click();
    await expect(page.locator("html")).toHaveClass(/light/);

    // Cross to the mobile breakpoint: the other instance must already agree,
    // with no state handed between them.
    await page.setViewportSize({ width: 390, height: 780 });
    expect(await visibleToggleNames(page)).toEqual(["Switch to dark mode"]);
    expect(await visibleIcons(page)).toEqual(["moon"]);
  });
});
