// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

// Rendered-output tests for the multi-contributor credit system. The rules
// themselves are unit-tested in src/test/lib/adventure-credit.test.ts; these
// assert that the pages actually show the credit, so reverting the feature
// fails the suite rather than passing quietly.
//
// Every assertion here is chosen to fail against the pre-feature markup:
// the pill label was "Challenge Builder", the aside heading was "Adventure by",
// and there was no Adventure Designers section.
//
// The pill carries exactly one person, the designer, and the label absorbs
// whether they also built every level. Builder credit appears on level pages
// and in the adventure aside, never as a second credit in the pill.

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
  test("adventure page pill is the anchor, and names only the designer", async ({ page }) => {
    await page.goto(ADVENTURE);
    await page.waitForLoadState("load");
    const pill = page.locator("main .contributor-pill").first();
    // Simon designed Blind by Design and built every challenge in it, so the
    // label is "Adventure Builder". It drops to "Adventure Designer" the moment
    // anyone else builds a challenge there.
    await expect(pill).toContainText("Adventure Builder");
    await expect(pill).toContainText("Simon Schrottner");
    expect(await pill.evaluate((el) => el.tagName)).toBe("A");
    expect(await pill.locator("a").count()).toBe(0);
  });

  test("adventure card and title pills name the designer, never a challenge builder", async ({ page }) => {
    // Builder credit lives on the challenge cards, level pages and aside. A
    // "Challenge Builder" credit in an adventure pill means the two-credit pill
    // came back. Scoped to the header on the detail page, because the challenge
    // grid below it now carries builder pills of its own.
    await page.goto(ADVENTURE);
    await page.waitForLoadState("load");
    const titlePill = page.locator("main .contributor-pill").first();
    await expect(titlePill).toContainText(/Adventure (Builder|Designer)/);
    await expect(titlePill).not.toContainText("Challenge Builder");

    await page.goto("/adventures/");
    await page.waitForLoadState("load");
    const cardPills = await page.locator(".contributor-pill").allTextContents();
    expect(cardPills.length, "no contributor pill on /adventures/").toBeGreaterThan(0);
    for (const text of cardPills) {
      expect(text, "an adventure card pill names a challenge builder").not.toContain(
        "Challenge Builder",
      );
    }
  });

  test("challenge cards carry no builder credit on either surface", async ({ page }) => {
    // Credit lives where it has room to read well: the adventure title pill,
    // the level page sidebar, and the adventure page aside. On a challenge card
    // it competed with the difficulty badge and never sat right at any size or
    // position, so it is deliberately absent.
    const SURFACES = [
      { path: ADVENTURE, card: '#challenges-heading ~ div a[href*="/levels/"]' },
      { path: "/challenges/", card: "li[data-level-card]" },
    ];
    for (const { path, card } of SURFACES) {
      await page.goto(path);
      await page.waitForLoadState("load");
      const cards = page.locator(card);
      expect(await cards.count(), `no challenge cards on ${path}`).toBeGreaterThan(0);
      expect(
        await cards.locator(".contributor-pill").count(),
        `${path}: a builder pill came back to the challenge card`,
      ).toBe(0);
      expect(
        await cards.getByText("Challenge Builder").count(),
        `${path}: a builder credit came back to the challenge card`,
      ).toBe(0);
    }
  });

  test("the level page still credits its builder", async ({ page }) => {
    // Removing it from the cards must not remove it from the level page, which
    // is the one per-challenge surface with room for it.
    await page.goto(LEVEL);
    await page.waitForLoadState("load");
    const pill = page.locator("main .contributor-pill").first();
    await expect(pill).toContainText("Challenge Builder");
  });

  test("the adventure pill label tracks whether the designer built everything", async ({ page }) => {
    // Both labels name the designer; only the role word changes, and it is
    // never the name of another builder.
    for (const path of [ADVENTURE, "/adventures/"]) {
      await page.goto(path);
      await page.waitForLoadState("load");
      const texts = await page.locator(".contributor-pill").allTextContents();
      expect(texts.length, `no pill on ${path}`).toBeGreaterThan(0);
      for (const text of texts) {
        expect(text, `${path}: unexpected pill label`).toMatch(/Adventure (Builder|Designer)/);
      }
    }
  });

  test("level page sidebar credits the level's builder", async ({ page }) => {
    await page.goto(LEVEL);
    await page.waitForLoadState("load");
    const pill = page.locator("main .contributor-pill").first();
    // Always "Challenge Builder", even when the builder is the designer falling
    // through, because the page is about one challenge.
    await expect(pill).toContainText("Challenge Builder");
    await expect(pill).toContainText("Simon Schrottner");
  });

  // The solution pill passes its own label rather than deriving one, so it must
  // survive the adventure/level label rules changing around it.
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
    await expect(page.locator(".contributor-pill").first()).toContainText(
      /Adventure (Builder|Designer)/,
    );
  });
});

test.describe("adventure page challenge builders aside", () => {
  test("is headed challenge builder(s) and names each builder with their bio", async ({ page }) => {
    await page.goto(ADVENTURE);
    await page.waitForLoadState("load");
    const aside = page.getByRole("complementary", { name: "Adventure resources" });
    await expect(aside).toContainText(/challenge builders?/);
    await expect(aside).toContainText("Simon Schrottner");
    await expect(aside).toContainText("Ambassador");
    // The role marker moved out: the heading names the role, so repeating
    // "designer" against a name inside the list is redundant.
    await expect(aside).not.toContainText("designer");
  });
});

test.describe("Challenge Contributors section", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("lists each adventure as a link, with no role label", async ({ page }) => {
    await page.goto("/adventures/");
    await page.waitForLoadState("load");
    const section = page.locator("#challenge-contributors");
    await expect(section).toBeVisible();
    await expect(section.getByRole("heading", { name: "Challenge Contributors" })).toBeVisible();
    await expect(section.getByText("adventures contributed to").first()).toBeVisible();
    // .first(): an adventure is listed once per contributor, so several people
    // legitimately link to the same adventure.
    await expect(section.getByRole("link", { name: "Blind by Design" }).first()).toHaveAttribute(
      "href",
      /\/adventures\/blind-by-design\/$/,
    );
    // Roles were removed deliberately: the section thanks people, and per-level
    // detail lives on the adventure pages.
    await expect(section).not.toContainText("Proposed & Built");
    await expect(section).not.toContainText("Proposed");
  });

  test("every contributor card lists adventures, and every row is a bare link", async ({ page }) => {
    await page.goto("/adventures/");
    await page.waitForLoadState("load");
    const section = page.locator("#challenge-contributors");
    await expect(section).toContainText("Katharina Sick");
    await expect(section).toContainText("Simon Schrottner");
    // Scope to the contributor cards' <ul>: the sticky aside is slotted inside
    // this section too, and its leaderboard rows are <ol> items.
    const rows = await section.locator('ul[role="list"] > li').evaluateAll((els) =>
      els.map((el) => ({
        link: el.querySelector("a")?.textContent?.trim() ?? "",
        extra: (el.textContent ?? "").replace(el.querySelector("a")?.textContent ?? "", "").trim(),
      })),
    );
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(row.link, "each row links an adventure").not.toBe("");
      expect(row.extra, `row "${row.link}" carries text beside the link`).toBe("");
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

  // Builder standing comes from Discourse, which owns the badges. This asserts
  // the fetched rows are rendered rather than replaced by a locally derived
  // list, which is what a re-introduced threshold would do. Handles are mapped
  // back to real names wherever the adventure YAML records who they belong to.
  test("builder sections come from Discourse, shown under real names", async ({ page }) => {
    await page.goto("/adventures/");
    await page.waitForLoadState("load");
    const grand = page.getByRole("list", { name: "Challenge Grand Builders" });
    await expect(grand).toContainText("Katharina Sick");
    await expect(grand, "handle should be mapped to a real name").not.toContainText("KatharinaSick");
    const builders = page.getByRole("list", { name: "Challenge Builders" }).last();
    await expect(builders).toContainText("Simon Schrottner");
    const total = await page.locator("#challenge-contributors li").count();
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
