// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

// Mobile navigation drawer: keyboard trap, focus handling and background inerting.
//
// Written against observable behaviour and the public DOM contract only, never
// against the component's internals, so it holds for any implementation. The
// contract these rely on:
//
//   - a trigger matching `button[aria-controls="mobile-menu"]`, whose
//     `aria-expanded` reflects the open state
//   - a drawer with `id="mobile-menu"`, carrying `hidden` while closed
//   - while open, every body child except the nav's own subtree is `inert`
//     and `aria-hidden`
//
// A drawer with no trap strands keyboard and screen-reader users behind an
// overlay they cannot leave, so these are non-negotiable.

import { test, expect, type Page } from "@playwright/test";

// The drawer is the sub-md UI; above 768px the trigger is display:none.
test.use({ viewport: { width: 390, height: 780 } });

const TRIGGER = 'button[aria-controls="mobile-menu"]';
const DRAWER = "#mobile-menu";

test.beforeEach(async ({ page }) => {
  // Skip the consent banner: it is a body sibling and would otherwise be one
  // more thing to reason about when asserting inert state.
  await page.addInitScript(() =>
    localStorage.setItem(
      "analytics_consent",
      JSON.stringify({ value: "denied", timestamp: Date.now() }),
    ),
  );
  await page.goto("/");
  await page.waitForSelector(TRIGGER);
});

/** Tag names + accessible names of what is focusable inside the drawer, in order. */
async function drawerFocusables(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const drawer = document.querySelector("#mobile-menu");
    if (!drawer) return [];
    return Array.from(
      drawer.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [contenteditable]:not([contenteditable="false"]), [tabindex]:not([tabindex="-1"])',
      ),
    ).map((el) => `${el.tagName.toLowerCase()}:${(el.textContent ?? "").trim()}`);
  });
}

async function activeDescriptor(page: Page): Promise<string> {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el) return "none";
    return `${el.tagName.toLowerCase()}:${(el.textContent ?? "").trim()}`;
  });
}

async function openDrawer(page: Page): Promise<void> {
  await page.click(TRIGGER);
  await expect(page.locator(DRAWER)).toBeVisible();
}

test("starts closed, with the drawer hidden and aria-expanded false", async ({ page }) => {
  await expect(page.locator(TRIGGER)).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator(DRAWER)).toBeHidden();
});

test("opening moves focus to the first focusable in the drawer", async ({ page }) => {
  await openDrawer(page);
  await expect(page.locator(TRIGGER)).toHaveAttribute("aria-expanded", "true");

  const items = await drawerFocusables(page);
  expect(items.length).toBeGreaterThan(1);
  expect(await activeDescriptor(page)).toBe(items[0]);
});

test("Tab from the last item wraps to the first", async ({ page }) => {
  await openDrawer(page);
  const items = await drawerFocusables(page);

  // Walk to the last item.
  for (let i = 1; i < items.length; i++) await page.keyboard.press("Tab");
  expect(await activeDescriptor(page)).toBe(items[items.length - 1]);

  await page.keyboard.press("Tab");
  expect(await activeDescriptor(page)).toBe(items[0]);
});

test("Shift+Tab from the first item wraps to the last", async ({ page }) => {
  await openDrawer(page);
  const items = await drawerFocusables(page);
  expect(await activeDescriptor(page)).toBe(items[0]);

  await page.keyboard.press("Shift+Tab");
  expect(await activeDescriptor(page)).toBe(items[items.length - 1]);
});

test("focus never escapes the drawer while it is open", async ({ page }) => {
  await openDrawer(page);
  const items = await drawerFocusables(page);

  for (let i = 0; i < items.length * 2 + 3; i++) {
    await page.keyboard.press("Tab");
    const inside = await page.evaluate(
      () => !!document.activeElement?.closest("#mobile-menu"),
    );
    expect(inside, `focus left the drawer after ${i + 1} Tab presses`).toBe(true);
  }
});

test("Escape closes the drawer and returns focus to the trigger", async ({ page }) => {
  await openDrawer(page);
  await page.keyboard.press("Escape");

  await expect(page.locator(DRAWER)).toBeHidden();
  await expect(page.locator(TRIGGER)).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator(TRIGGER)).toBeFocused();
});

test("background body siblings are inert and aria-hidden while open, and restored on close", async ({
  page,
}) => {
  const snapshot = (): Promise<{ total: number; inert: number; hidden: number }> =>
    page.evaluate(() => {
      // The drawer's own top-level ancestor stays operable; everything else must not be.
      let host: Element | null = document.querySelector("#mobile-menu");
      while (host && host.parentElement !== document.body) host = host.parentElement;
      const siblings = Array.from(document.body.children).filter((el) => el !== host);
      return {
        total: siblings.length,
        inert: siblings.filter((el) => el.hasAttribute("inert")).length,
        hidden: siblings.filter((el) => el.getAttribute("aria-hidden") === "true").length,
      };
    });

  const before = await snapshot();
  expect(before.inert).toBe(0);

  await openDrawer(page);
  const during = await snapshot();
  expect(during.total).toBeGreaterThan(0);
  expect(during.inert, "every background body sibling must be inert").toBe(during.total);
  expect(during.hidden, "every background body sibling must be aria-hidden").toBe(during.total);

  await page.keyboard.press("Escape");
  await expect(page.locator(DRAWER)).toBeHidden();
  const after = await snapshot();
  expect(after.inert).toBe(0);
  expect(after.hidden).toBe(0);
});

test("the trigger toggles the drawer shut again", async ({ page }) => {
  await openDrawer(page);
  await page.click(TRIGGER);
  await expect(page.locator(DRAWER)).toBeHidden();
  await expect(page.locator(TRIGGER)).toHaveAttribute("aria-expanded", "false");
});

test("following a drawer link navigates and leaves no trap behind", async ({ page }) => {
  await openDrawer(page);
  await page.locator(`${DRAWER} a[href$="/challenges/"]`).first().click();

  await page.waitForURL("**/challenges/");
  await expect(page.locator(DRAWER)).toBeHidden();

  const stuck = await page.evaluate(() =>
    Array.from(document.body.children).filter((el) => el.hasAttribute("inert")).length,
  );
  expect(stuck, "inert must be cleared after navigating away").toBe(0);
});

test("the trigger icon tracks the open state", async ({ page }) => {
  const icons = (): Promise<string[]> =>
    page.evaluate((sel) =>
      Array.from(document.querySelector(sel)!.querySelectorAll("svg"))
        .filter((s) => getComputedStyle(s).display !== "none")
        .map((s) =>
          s.querySelector("path")?.getAttribute("d")?.includes("M4 5h16") ? "hamburger" : "close",
        ), TRIGGER);

  expect(await icons()).toEqual(["hamburger"]);
  await openDrawer(page);
  expect(await icons()).toEqual(["close"]);
  await page.keyboard.press("Escape");
  expect(await icons()).toEqual(["hamburger"]);
});

test("the trap includes form controls, not just links", async ({ page }) => {
  // The drawer only holds links today. A trap whose selector silently skips an
  // input is a trap with a hole in it, so prove the full selector is in use.
  await openDrawer(page);
  await page.evaluate(() => {
    const input = document.createElement("input");
    input.type = "text";
    input.id = "probe";
    document.querySelector("#mobile-menu")!.appendChild(input);
  });

  const cycle: string[] = [];
  for (let i = 0; i < 9; i++) {
    await page.keyboard.press("Tab");
    cycle.push(
      await page.evaluate(() => document.activeElement?.id || document.activeElement?.tagName || "?"),
    );
  }
  expect(cycle, `tab cycle was ${cycle.join(", ")}`).toContain("probe");
});

test("crossing to the desktop breakpoint while open releases the trap", async ({ page }) => {
  await openDrawer(page);
  await page.setViewportSize({ width: 1400, height: 900 });

  const stuck = await page.evaluate(
    () => Array.from(document.body.children).filter((el) => el.hasAttribute("inert")).length,
  );
  expect(stuck, "inert must clear when the breakpoint hides the drawer").toBe(0);
  await expect(page.locator(TRIGGER)).toHaveAttribute("aria-expanded", "false");
});
