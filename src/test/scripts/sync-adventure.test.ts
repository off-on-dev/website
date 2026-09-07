// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

/**
 * Unit tests for currentMonth() in scripts/sync-adventure.mjs.
 *
 * Non-vacuous check: the old implementation used
 *   new Date().toLocaleString("en-GB", { month: "short" }).toUpperCase()
 * Node 26 CLDR returns "Sept" (4 letters) for September, so "SEPT 2026"
 * fails the adventure schema regex /^[A-Z]{3} \d{4}$/.
 *
 * The it.each test pins the system clock to every month of the year so
 * the suite catches a revert to toLocaleString regardless of when it runs.
 * The old-implementation test always asserts "SEPT 2026" against the
 * schema, providing a second revert-catch that does not depend on the clock.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { buildLevel, currentMonth, mergeLevels, pickContributor } from "../../../scripts/sync-adventure.mjs";

const MONTH_SCHEMA = /^[A-Z]{3} \d{4}$/;

const ALL_MONTHS: [number, string][] = [
  [0, "JAN"], [1, "FEB"], [2, "MAR"], [3, "APR"],
  [4, "MAY"], [5, "JUN"], [6, "JUL"], [7, "AUG"],
  [8, "SEP"], [9, "OCT"], [10, "NOV"], [11, "DEC"],
];

describe("currentMonth", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each(ALL_MONTHS)(
    "month %i (%s): produces correct abbreviation and passes schema regex",
    (monthIndex, abbr) => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, monthIndex, 15));
      expect(currentMonth()).toBe(`${abbr} 2026`);
      expect(currentMonth()).toMatch(MONTH_SCHEMA);
    },
  );

  it("old toLocaleString implementation produces 'SEPT 2026' for September, failing the schema", () => {
    // Inline the old implementation so this assertion is always true regardless
    // of the current month. A revert of the fix causes the it.each test above
    // to fail for September; this test makes the cause immediately legible.
    const oldImpl = (d: Date) =>
      d.toLocaleString("en-GB", { month: "short" }).toUpperCase() +
      " " +
      d.getFullYear();
    const result = oldImpl(new Date(2026, 8, 15));
    expect(result).toBe("SEPT 2026");
    expect(result).not.toMatch(MONTH_SCHEMA);
  });
});

describe("pickContributor", () => {
  it("keeps the four fields the content schema accepts", () => {
    expect(
      pickContributor({
        name: "Ada Lovelace",
        url: "https://example.com",
        about: "Writes notes.",
        discourse_username: "ada",
      }),
    ).toEqual({
      name: "Ada Lovelace",
      url: "https://example.com",
      about: "Writes notes.",
      discourse_username: "ada",
    });
  });

  it("drops fields the strict content schema would reject", () => {
    // The challenges repo owns its own index.yaml schema and may carry fields
    // this site has no column for. Passing them through fails `astro sync`.
    const result = pickContributor({ name: "Ada Lovelace", github: "ada", avatar: "a.png" });
    expect(result).toEqual({ name: "Ada Lovelace" });
  });

  it("omits absent optional fields rather than emitting empty values", () => {
    expect(pickContributor({ name: "Ada Lovelace", url: "", about: undefined })).toEqual({
      name: "Ada Lovelace",
    });
  });

  it.each([
    ["null", null],
    ["undefined", undefined],
    ["a block with no name", { url: "https://example.com" }],
    ["a non-object", "Ada Lovelace"],
  ])("returns null for %s", (_label, input) => {
    expect(pickContributor(input)).toBeNull();
  });
});

describe("buildLevel contributor (the challenge builder)", () => {
  // The challenges repo puts the designer in docs/index.yaml and, only when a
  // different person built a level, a `contributor:` in that level's YAML. When
  // designer and builder are the same person the level YAML carries no
  // contributor at all and the site falls back to the designer.
  const base = { level: "beginner", topics: ["a11y"], verification: { command: "./v.sh", description: "d" } };

  it("carries a level builder through from the level YAML", () => {
    const result = buildLevel({ ...base, contributor: { name: "Grace Hopper", url: "https://example.com" } }, ["a11y"]);
    expect(result.contributor).toEqual({ name: "Grace Hopper", url: "https://example.com" });
  });

  it("drops builder fields the strict content schema would reject", () => {
    const result = buildLevel({ ...base, contributor: { name: "Grace Hopper", github: "grace" } }, ["a11y"]);
    expect(result.contributor).toEqual({ name: "Grace Hopper" });
  });

  it("emits no contributor when the level YAML has none, so the designer is credited", () => {
    const result = buildLevel({ ...base }, ["a11y"]);
    expect(result).not.toHaveProperty("contributor");
  });
});

describe("mergeLevels contributor preservation", () => {
  const GRACE = { name: "Grace Hopper", url: "https://example.com" };
  const ADA = { name: "Ada Lovelace" };
  const lvl = (extra: object = {}) => ({ level: "beginner", topics: ["a11y"], ...extra });

  it("keeps a builder already credited on the website when upstream names none", () => {
    const merged = mergeLevels([lvl({ contributor: GRACE })], [lvl()], [lvl()]);
    expect(merged[0].contributor).toEqual(GRACE);
  });

  it("keeps the website builder even when upstream names a different one", () => {
    // Losing an existing credit silently misattributes someone's work. Re-crediting
    // a level is a deliberate hand-edit, the same rule as the adventure designer.
    const merged = mergeLevels([lvl({ contributor: GRACE })], [lvl({ contributor: ADA })], [lvl({ contributor: ADA })]);
    expect(merged[0].contributor).toEqual(GRACE);
  });

  it("takes the upstream builder when the website has none", () => {
    const merged = mergeLevels([lvl()], [lvl({ contributor: ADA })], [lvl({ contributor: ADA })]);
    expect(merged[0].contributor).toEqual(ADA);
  });

  it("leaves a level with no builder on either side uncredited, so the designer is credited", () => {
    const merged = mergeLevels([lvl()], [lvl()], [lvl()]);
    expect(merged[0]).not.toHaveProperty("contributor");
  });

  it("adds a builder to a level that is brand new to the website", () => {
    const merged = mergeLevels([], [lvl({ contributor: ADA })], [lvl({ contributor: ADA })]);
    expect(merged[0].contributor).toEqual(ADA);
  });
});
