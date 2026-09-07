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

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { z } from "zod";
import {
  buildLevel,
  challengeTagsOf,
  currentMonth,
  mergeLevels,
  missingDesignerError,
  pickContributor,
  tagToSlug,
} from "../../../scripts/sync-adventure.mjs";
import { creditIntegrityError } from "@/lib/adventure-credit";
import { tagToSlug as canonicalTagToSlug } from "@/lib/challenges";

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
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    warn.mockRestore();
  });

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
    expect(warn).not.toHaveBeenCalled();
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
  ])("returns null for %s without warning", (_label, input) => {
    expect(pickContributor(input)).toBeNull();
    expect(warn).not.toHaveBeenCalled();
  });

  it.each([
    ["a block with no name", { url: "https://example.com" }],
    ["a non-object", "Ada Lovelace"],
    ["a list", [{ name: "Ada Lovelace" }]],
  ])("returns null for %s and says so", (_label, input) => {
    // Silence here would re-credit the level to the designer via the fallback,
    // and print "no contributor found", both stated as fact.
    expect(pickContributor(input, "docs/index.yaml")).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain("docs/index.yaml");
  });

  describe("url validation", () => {
    // `contributor.url` is `z.url()` in the content schema. An unusable value
    // would fail `npm run sync` in the next workflow step, before a PR branch
    // exists to hand-fix, so it is dropped here with the name kept.
    it.each([
      ["a bare domain", "ksick.dev"],
      ["a www host with no scheme", "www.example.com"],
      ["a relative path", "/about"],
    ])("drops %s and keeps the name", (_label, url) => {
      expect(pickContributor({ name: "Ada Lovelace", url })).toEqual({ name: "Ada Lovelace" });
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0][0]).toContain(url);
    });

    it.each([
      ["https", "https://example.com"],
      ["http", "http://example.com"],
      ["a path and query", "https://example.com/a?b=1#c"],
    ])("keeps a valid %s url", (_label, url) => {
      expect(pickContributor({ name: "Ada Lovelace", url })).toEqual({ name: "Ada Lovelace", url });
      expect(warn).not.toHaveBeenCalled();
    });

    it("agrees with the z.url() gate the content schema applies", () => {
      // Parity check: if Zod's rule and this one drift, the sync starts emitting
      // YAML that fails validation again, which is the bug this guards.
      const schema = z.url();
      for (const url of ["https://a.dev", "ksick.dev", "http://a.b", "www.x.com", "mailto:a@b.c", "/rel"]) {
        const kept = pickContributor({ name: "N", url })?.url !== undefined;
        expect(kept).toBe(schema.safeParse(url).success);
      }
    });
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

describe("challengeTagsOf", () => {
  it("omits an adventure tag that no level teaches", () => {
    // The #243 case. "Guidepup Virtual Screen Reader" belongs to an intermediate
    // level that is not live yet, so it must build no route: registering one for
    // a route the build never emits trips the drift gate from the other side.
    const tags = challengeTagsOf(
      ["Accessibility", "Guidepup Virtual Screen Reader", "Playwright"],
      [{ level: "beginner", topics: ["Playwright"] }],
    );
    expect(tags).toEqual(["Playwright"]);
  });

  it("reports the union of the topics levels do teach", () => {
    expect(
      challengeTagsOf(["A"], [{ level: "l1", topics: ["B"] }, { level: "l2", topics: ["C"] }]),
    ).toEqual(["B", "C"]);
  });

  it("deduplicates a topic two levels share", () => {
    expect(challengeTagsOf([], [{ level: "l1", topics: ["A"] }, { level: "l2", topics: ["A"] }])).toEqual(["A"]);
  });

  it("accepts object-shaped topics and drops empty entries", () => {
    expect(challengeTagsOf([], [{ level: "l", topics: [{ name: "A" }, { name: "" }, ""] }])).toEqual(["A"]);
  });

  it.each([
    ["a level carries no topics", ["A"], [{ level: "l" }]],
    ["a level has an empty topics list", ["A"], [{ level: "l", topics: [] }]],
  ])("falls back to adventure tags when %s", (_label, adventureTags, levels) => {
    // Same fallback as getChallengeData, so a topic-less level degrades to the
    // old broader behaviour instead of dropping out of every tag page.
    expect(challengeTagsOf(adventureTags, levels)).toEqual(["A"]);
  });

  it("reports nothing when there are no levels", () => {
    expect(challengeTagsOf(["A"], [])).toEqual([]);
  });

  it("slugs tags the same way the route params are built", () => {
    // Drift against src/lib/challenges.ts would register a route under a slug the
    // build never emits, leaving the real one unregistered and CI red.
    for (const tag of ["Accessibility", "Guidepup Virtual Screen Reader", "ArgoCD", "C++", " Trim Me "]) {
      expect(tagToSlug(tag)).toBe(canonicalTagToSlug(tag));
    }
  });
});

describe("missingDesignerError", () => {
  const lvls = (...contributors: (object | undefined)[]) =>
    contributors.map((c, i) => ({ level: `l${i}`, ...(c && { contributor: c }) }));

  it("fires when a level names a builder but the adventure has no designer", () => {
    const msg = missingDesignerError(undefined, lvls({ name: "Ada" }, undefined), "docs/index.yaml in some/repo");
    expect(msg).toContain("l0");
    expect(msg).toContain("docs/index.yaml in some/repo");
  });

  it("names every offending level, not just the first", () => {
    const msg = missingDesignerError(undefined, lvls({ name: "Ada" }, undefined, { name: "Grace" }), "p");
    expect(msg).toContain("l0, l2");
  });

  it.each([
    ["a designer is set", { name: "Ada" }, lvls({ name: "Grace" })],
    ["no level names a builder", undefined, lvls(undefined, undefined)],
    ["there are no levels", undefined, []],
  ])("passes when %s", (_label, contributor, levels) => {
    expect(missingDesignerError(contributor, levels, "p")).toBeNull();
  });

  it("agrees with creditIntegrityError, the rule the content schema enforces", () => {
    // The script cannot import the TypeScript module, so the rule is stated twice.
    // Drift means the sync writes YAML that then fails validation, which is exactly
    // the failure this gate exists to pre-empt.
    const cases: { contributor?: { name: string }; levels: { contributor?: unknown }[] }[] = [
      { contributor: undefined, levels: lvls({ name: "Ada" }) },
      { contributor: undefined, levels: lvls(undefined) },
      { contributor: { name: "Ada" }, levels: lvls({ name: "Grace" }) },
      { contributor: { name: "Ada" }, levels: lvls(undefined) },
      { contributor: undefined, levels: [] },
    ];
    let fired = 0;
    for (const { contributor, levels } of cases) {
      const scriptFires = missingDesignerError(contributor, levels, "p") !== null;
      const schemaFires = creditIntegrityError({ slug: "s", contributor, levels }) !== null;
      expect(scriptFires).toBe(schemaFires);
      if (scriptFires) fired++;
    }
    // Both agreeing on "never fires" would satisfy the loop without testing anything.
    expect(fired).toBeGreaterThan(0);
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

  it("keeps the website builder even when upstream names a different one, and says so", () => {
    // Losing an existing credit silently misattributes someone's work. Re-crediting
    // a level is a deliberate hand-edit, the same rule as the adventure designer.
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const merged = mergeLevels([lvl({ contributor: GRACE })], [lvl({ contributor: ADA })], [lvl({ contributor: ADA })]);
    expect(merged[0].contributor).toEqual(GRACE);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain("Grace Hopper");
    expect(warn.mock.calls[0][0]).toContain("Ada Lovelace");
    warn.mockRestore();
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
