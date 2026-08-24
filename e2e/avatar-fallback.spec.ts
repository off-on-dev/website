// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

// Community avatars are external (Discourse) and go stale when a user changes
// theirs. Every one must degrade to an initials chip rather than a broken-image
// icon, on both surfaces that render them.

import { test, expect } from "@playwright/test";

const PAGES = [
  { path: "/adventures/dead-reckoning/", what: "adventure leaderboard" },
  { path: "/adventures/echoes-lost-in-orbit/levels/beginner/", what: "challenge sidebar" },
  { path: "/about/", what: "community leaders" },
];

for (const { path, what } of PAGES) {
  test(`${what}: avatars fall back to initials when the image fails`, async ({ page }) => {
    await page.route("**/community.offon.dev/**", (r) => r.abort());
    await page.route("**/*discourse-cdn.com/**", (r) => r.abort());
    await page.goto(path);
    await page.waitForLoadState("load");

    // Avatars are loading="lazy". An image that was never requested is pending,
    // not failed, and never fires onerror, so scroll it into view first.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
    });
    await page.waitForFunction(() =>
      Array.from(document.querySelectorAll<HTMLImageElement>("img"))
        .filter((i) => /community\.offon\.dev|discourse-cdn/.test(i.src))
        .every((i) => i.complete),
    );

    const state = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll<HTMLImageElement>("img")).filter((i) =>
        /community\.offon\.dev|discourse-cdn/.test(i.src),
      );
      const chips = Array.from(document.querySelectorAll<HTMLElement>("span")).filter(
        (el) => /rounded-full/.test(el.className) && /^[A-Z0-9]{1,2}$/.test((el.textContent ?? "").trim()),
      );
      return {
        // Failed means the load was attempted and produced nothing. A displayed
        // image that loaded fine is not a failure, and a lazy image that was
        // never requested is pending rather than broken.
        failedButShown: imgs.filter(
          (i) => i.complete && i.naturalWidth === 0 && getComputedStyle(i).display !== "none",
        ).length,
        visibleChips: chips.filter((c) => getComputedStyle(c).display !== "none").length,
      };
    });

    expect(state.failedButShown, "a failed avatar must not stay displayed").toBe(0);
    expect(state.visibleChips, "an initials chip must take its place").toBeGreaterThan(0);
  });
}

test("chips are never below the very-small-text threshold", async ({ page }) => {
  await page.route("**/community.offon.dev/**", (r) => r.abort());
  await page.goto("/adventures/dead-reckoning/");
  await page.waitForLoadState("load");
  const sizes = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>("span"))
      .filter((el) => /rounded-full/.test(el.className) && /^[A-Z0-9]{1,2}$/.test((el.textContent ?? "").trim()))
      .map((el) => parseFloat(getComputedStyle(el).fontSize)),
  );
  expect(sizes.length).toBeGreaterThan(0);
  for (const px of sizes) expect(px).toBeGreaterThanOrEqual(10);
});
