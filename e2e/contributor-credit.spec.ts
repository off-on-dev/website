// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

// Rendered-output tests for the multi-contributor credit system. The rules
// themselves are unit-tested in src/test/lib/adventure-credit.test.ts; these
// assert that the pages actually show the credit, so reverting the feature
// fails the suite rather than passing quietly.
//
// Every assertion here is chosen to fail against the pre-feature markup:
// the pill label was "Challenge Builder", the aside heading was "Adventure by",
// the builders list had no role labels, and there was no Adventure Designers
// section.

import { test, expect } from "@playwright/test";

const ADVENTURE = "/adventures/blind-by-design/";
const LEVEL = "/adventures/blind-by-design/levels/beginner/";
const SOLUTION = "/adventures/echoes-lost-in-orbit/levels/beginner/solution/";

const CARD_PAGES = ["/", "/adventures/", "/challenges/", "/about/", "/contribute/", "/handbook/"];

const CANONICAL_ORDER = [
  "Top Contributors",
  "Top Challenge Solvers",
  "Challenge Rockstars",
  "Challenge Grand Builders",
  "Challenge Builders",
  "Adventure Designers",
  "Most Liked",
  "Most Replies",
  "Most Supportive",
];

test.describe("contributor pill", () => {
  // Shape guard, not feature coverage: this passes against the pre-feature
  // markup too. It exists so the single-credit pill stays the anchor itself,
  // which is what keeps it a 24x24 pointer target without a min-height.
  test("adventure page pill is the anchor, and names the designer", async ({ page }) => {
    await page.goto(ADVENTURE);
    await page.waitForLoadState("load");
    const pill = page.locator("main .contributor-pill").first();
    await expect(pill).toContainText("Adventure Builder");
    await expect(pill).toContainText("Simon Schrottner");
    expect(await pill.evaluate((el) => el.tagName)).toBe("A");
    expect(await pill.locator("a").count()).toBe(0);
  });

  test("level page sidebar credits the level's builder", async ({ page }) => {
    await page.goto(LEVEL);
    await page.waitForLoadState("load");
    const pill = page.locator("main .contributor-pill").first();
    await expect(pill).toContainText("Adventure Builder");
    await expect(pill).toContainText("Simon Schrottner");
  });

  // Shape guard for the extraction in step 6: the solution pill must keep its
  // own label after ContributorBadge stops hard-coding one.
  test("solution page keeps its own Solution Contributor label", async ({ page }) => {
    await page.goto(SOLUTION);
    await page.waitForLoadState("load");
    const pill = page.locator("main .contributor-pill").first();
    await expect(pill).toContainText("Solution Contributor");
  });

  // Shape guard, not feature coverage. Holds for both pill shapes, so it catches
  // a regression in either: a one-credit pill is itself the anchor, and a
  // two-credit pill wraps anchors that each meet the 24x24 pointer minimum.
  test("every pill is either an anchor, or a span whose inner links clear 24x24", async ({ page }) => {
    for (const path of [ADVENTURE, LEVEL, SOLUTION, "/adventures/", "/"]) {
      await page.goto(path);
      await page.waitForLoadState("load");
      const shapes = await page.evaluate(() =>
        Array.from(document.querySelectorAll<HTMLElement>(".contributor-pill")).map((pill) => ({
          tag: pill.tagName,
          inner: Array.from(pill.querySelectorAll("a")).map((a) => {
            const r = a.getBoundingClientRect();
            return { w: Math.round(r.width), h: Math.round(r.height) };
          }),
        })),
      );
      expect(shapes.length, `no contributor pill on ${path}`).toBeGreaterThan(0);
      for (const { tag, inner } of shapes) {
        if (tag === "A") {
          expect(inner, `${path}: an anchor pill must not nest anchors`).toHaveLength(0);
        } else {
          for (const box of inner) {
            expect(box.h, `${path}: inner link height ${box.h}`).toBeGreaterThanOrEqual(24);
            expect(box.w, `${path}: inner link width ${box.w}`).toBeGreaterThanOrEqual(24);
          }
        }
      }
    }
  });

  test("card pills never nest an anchor inside the card link", async ({ page }) => {
    await page.goto("/adventures/");
    await page.waitForLoadState("load");
    expect(await page.locator("a .contributor-pill a").count()).toBe(0);
    await expect(page.locator(".contributor-pill").first()).toContainText("Adventure Builder");
  });
});

test.describe("adventure page Contributors aside", () => {
  test("is headed Contributors and names the designer with their bio", async ({ page }) => {
    await page.goto(ADVENTURE);
    await page.waitForLoadState("load");
    const aside = page.getByRole("complementary", { name: "Adventure resources" });
    await expect(aside).toContainText("contributors");
    await expect(aside).toContainText("Simon Schrottner");
    await expect(aside).toContainText("Ambassador");
  });
});

test.describe("Challenge Builders section", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("lists each adventure with a role label, linked to its page", async ({ page }) => {
    await page.goto("/adventures/");
    await page.waitForLoadState("load");
    const section = page.locator("#challenge-builders");
    await expect(section).toBeVisible();
    await expect(section.getByText("adventures contributed to").first()).toBeVisible();
    // Every current adventure is proposed and built by the same person.
    await expect(section.getByText("Proposed & Built").first()).toBeVisible();
    await expect(section.getByRole("link", { name: "Blind by Design" })).toHaveAttribute(
      "href",
      /\/adventures\/blind-by-design\/$/,
    );
  });

  test("every contributor card carries a role label for every adventure listed", async ({ page }) => {
    await page.goto("/adventures/");
    await page.waitForLoadState("load");
    const section = page.locator("#challenge-builders");
    await expect(section).toContainText("Katharina Sick");
    await expect(section).toContainText("Simon Schrottner");
    // Each row is an adventure link plus a role label; the pre-feature list had
    // links only, so a row without a label means the roles were lost.
    // Scope to the contributor cards' <ul>: the sticky aside is slotted inside
    // this section too, and its leaderboard rows are <ol> items.
    const rows = await section.locator('ul[role="list"] > li').evaluateAll((els) =>
      els.map((el) => ({
        link: el.querySelector("a")?.textContent?.trim() ?? "",
        label: el.querySelector("span")?.textContent?.trim() ?? "",
      })),
    );
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(row.link, "each row links an adventure").not.toBe("");
      expect(row.label, `no role label beside "${row.link}"`).toMatch(/^(Proposed|Built)/);
    }
  });
});

test.describe("Community Leaders", () => {
  // The card is `hidden lg:block` on /adventures/, /about/ and /contribute/, so
  // pin a desktop viewport rather than relying on the project default.
  test.use({ viewport: { width: 1280, height: 900 } });

  test("has an Adventure Designers section showing real names, not handles", async ({ page }) => {
    await page.goto("/adventures/");
    await page.waitForLoadState("load");
    const list = page.getByRole("list", { name: "Adventure Designers" });
    await expect(list).toBeVisible();
    await expect(list).toContainText("Katharina Sick");
    await expect(list).toContainText("Simon Schrottner");
  });

  test("builder counts agree with the roles in the section body", async ({ page }) => {
    await page.goto("/adventures/");
    await page.waitForLoadState("load");
    // Six adventures, every level built by its designer: 15 + 3 across two people.
    const grand = page.getByRole("list", { name: "Challenge Grand Builders" });
    await expect(grand).toContainText("Katharina Sick");
    const builders = page.getByRole("list", { name: "Challenge Builders" }).last();
    await expect(builders).toContainText("Simon Schrottner");
    const total = await page.locator("#challenge-builders li").count();
    expect(total, "every contributor lists at least one adventure").toBeGreaterThan(0);
  });

  for (const path of CARD_PAGES) {
    test(`${path}: sections render in canonical order`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("load");
      const titles = await page.evaluate(
        (all) =>
          Array.from(document.querySelectorAll<HTMLElement>("ol[aria-label]"))
            .map((el) => el.getAttribute("aria-label") ?? "")
            .filter((t) => all.includes(t)),
        CANONICAL_ORDER,
      );
      expect(titles.length, `no leaderboard sections on ${path}`).toBeGreaterThan(0);
      const expected = CANONICAL_ORDER.filter((t) => titles.includes(t));
      expect(titles).toEqual(expected);
      expect(titles, `${path} must show Adventure Designers`).toContain("Adventure Designers");
    });
  }
});
