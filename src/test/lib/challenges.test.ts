import { describe, it, expect } from "vitest";
import { DIFFICULTIES, getChallengeData, getStarterTarget, isAdventureLive, sortAdventuresByMonthDesc, tagToSlug, type ChallengeEntry } from "@/lib/challenges";

// ---------------------------------------------------------------------------
// DIFFICULTIES
// ---------------------------------------------------------------------------
describe("DIFFICULTIES", () => {
  it("contains exactly three entries", () => {
    expect(DIFFICULTIES).toHaveLength(3);
  });

  it("contains Beginner, Intermediate, and Expert in that order", () => {
    expect(DIFFICULTIES[0]).toBe("Beginner");
    expect(DIFFICULTIES[1]).toBe("Intermediate");
    expect(DIFFICULTIES[2]).toBe("Expert");
  });
});

// ---------------------------------------------------------------------------
// tagToSlug
// ---------------------------------------------------------------------------
describe("tagToSlug", () => {
  it("lowercases the tag", () => {
    expect(tagToSlug("Rust")).toBe("rust");
  });

  it("replaces spaces with hyphens", () => {
    expect(tagToSlug("open source")).toBe("open-source");
  });

  it("replaces slashes with hyphens", () => {
    expect(tagToSlug("CI/CD")).toBe("ci-cd");
  });

  it("collapses consecutive non-alphanumeric characters into a single hyphen", () => {
    expect(tagToSlug("hello---world")).toBe("hello-world");
  });

  it("strips leading hyphens created by leading non-alphanumeric chars", () => {
    expect(tagToSlug("  leading spaces")).toBe("leading-spaces");
  });

  it("strips trailing hyphens created by trailing non-alphanumeric chars", () => {
    expect(tagToSlug("tag!")).toBe("tag");
  });

  it("strips both leading and trailing hyphens", () => {
    expect(tagToSlug("  spaces  ")).toBe("spaces");
  });

  it("handles C++ style tags by dropping non-alphanumeric suffix", () => {
    expect(tagToSlug("C++")).toBe("c");
  });

  it("returns an all-lowercase single word unchanged except for case", () => {
    expect(tagToSlug("python")).toBe("python");
  });

  it("handles a tag with a dot", () => {
    expect(tagToSlug("Node.js")).toBe("node-js");
  });
});

// ---------------------------------------------------------------------------
// sortAdventuresByMonthDesc
// ---------------------------------------------------------------------------
describe("sortAdventuresByMonthDesc", () => {
  it("sorts adventures from newest to oldest month", () => {
    const adventures = [
      { month: "JUN 2024" },
      { month: "JAN 2025" },
      { month: "DEC 2024" },
    ];
    const result = sortAdventuresByMonthDesc(adventures);
    expect(result.map((a) => a.month)).toEqual([
      "JAN 2025",
      "DEC 2024",
      "JUN 2024",
    ]);
  });

  it("does not mutate the original array", () => {
    const adventures = [{ month: "DEC 2024" }, { month: "JAN 2025" }];
    const original = [...adventures];
    sortAdventuresByMonthDesc(adventures);
    expect(adventures).toEqual(original);
  });

  it("returns an empty array for empty input", () => {
    expect(sortAdventuresByMonthDesc([])).toEqual([]);
  });

  it("returns a single-element array unchanged", () => {
    const input = [{ month: "MAR 2024" }];
    expect(sortAdventuresByMonthDesc(input)).toEqual(input);
  });

  it("orders the same month/year items stably (equal keys produce equal result)", () => {
    const adventures = [
      { month: "JUN 2024", id: "a" },
      { month: "JUN 2024", id: "b" },
    ];
    const result = sortAdventuresByMonthDesc(adventures);
    expect(result).toHaveLength(2);
    // Both items have identical month keys; both should be present.
    expect(result.map((a) => a.id)).toContain("a");
    expect(result.map((a) => a.id)).toContain("b");
  });

  it("ranks a later year above an earlier year even if the month is earlier", () => {
    const adventures = [
      { month: "JAN 2024" },
      { month: "DEC 2023" },
    ];
    const result = sortAdventuresByMonthDesc(adventures);
    expect(result[0].month).toBe("JAN 2024");
  });

  it("preserves extra properties on adventure objects", () => {
    const adventures = [
      { month: "JAN 2025", title: "Alpha" },
      { month: "JAN 2024", title: "Beta" },
    ];
    const result = sortAdventuresByMonthDesc(adventures);
    expect(result[0].title).toBe("Alpha");
    expect(result[1].title).toBe("Beta");
  });

  it("throws for an unrecognised month abbreviation (data error is visible, not silent)", () => {
    // monthKey() throws rather than silently mapping -1 to January.
    // In production this is prevented at build time by the Zod z.refine() on
    // the content schema, so this throw is a last-resort developer safeguard.
    const adventures = [
      { month: "XXX 2025" },
      { month: "FEB 2025" },
    ];
    expect(() => sortAdventuresByMonthDesc(adventures)).toThrow(/Unrecognised month abbreviation/);
  });

  it("throws for an empty or malformed month string", () => {
    const adventures = [
      { month: "" },
      { month: "JAN 2025" },
    ];
    expect(() => sortAdventuresByMonthDesc(adventures)).toThrow(/Unrecognised month abbreviation/);
  });
});

// ---------------------------------------------------------------------------
// isAdventureLive
// ---------------------------------------------------------------------------
const PAST = "2020-01-01T00:00:00Z";
const FUTURE = "2099-01-01T00:00:00Z";

describe("isAdventureLive", () => {
  it("returns true when a rewards deadline is in the future", () => {
    expect(
      isAdventureLive({ rewards: { deadline: FUTURE }, levels: [] })
    ).toBe(true);
  });

  it("returns false when a rewards deadline is in the past", () => {
    expect(
      isAdventureLive({ rewards: { deadline: PAST }, levels: [] })
    ).toBe(false);
  });

  it("returns true when any level has a future deadline", () => {
    expect(
      isAdventureLive({
        rewards: { deadline: PAST },
        levels: [{ deadline: FUTURE }],
      })
    ).toBe(true);
  });

  it("returns false when all level deadlines are in the past", () => {
    expect(
      isAdventureLive({
        rewards: { deadline: PAST },
        levels: [{ deadline: PAST }, { deadline: PAST }],
      })
    ).toBe(false);
  });

  it("returns false when there are no deadlines at all", () => {
    expect(isAdventureLive({ levels: [] })).toBe(false);
  });

  it("returns false when levels have no deadline properties", () => {
    expect(
      isAdventureLive({ levels: [{ deadline: undefined }] })
    ).toBe(false);
  });

  it("returns false when rewards deadline is undefined", () => {
    expect(
      isAdventureLive({ rewards: { deadline: undefined }, levels: [] })
    ).toBe(false);
  });

  it("returns true when at least one of multiple levels has a future deadline", () => {
    expect(
      isAdventureLive({
        levels: [{ deadline: PAST }, { deadline: FUTURE }, { deadline: PAST }],
      })
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getChallengeData
// ---------------------------------------------------------------------------
describe("getChallengeData", () => {
  /** Minimal valid adventure used across tests. */
  type TestAdventure = Parameters<typeof getChallengeData>[0][0];

  // Annotated, not inferred: without it the literal widens `difficulty` to
  // string and the union with `overrides.levels` stops matching AdventureData.
  const makeAdventure = (overrides: Partial<TestAdventure> = {}): TestAdventure => ({
    slug: "test-adventure",
    title: "Test Adventure",
    tags: ["rust"],
    levels: [
      {
        id: "level-1",
        name: "Level One",
        difficulty: "Beginner",
        topics: [],
        learnings: ["learn a", "learn b"],
        estimatedTime: "1 hour",
        deadline: PAST,
      },
    ],
    ...overrides,
  });

  describe("entry shape", () => {
    it("creates one entry per level", () => {
      const { entries } = getChallengeData([makeAdventure()]);
      expect(entries).toHaveLength(1);
    });

    it("creates entries for multiple levels across multiple adventures", () => {
      const adventure = makeAdventure({
        levels: [
          { id: "l1", name: "L1", difficulty: "Beginner", topics: [] },
          { id: "l2", name: "L2", difficulty: "Expert", topics: [] },
        ],
      });
      const { entries } = getChallengeData([adventure]);
      expect(entries).toHaveLength(2);
    });

    it("sets the correct adventureId from the slug", () => {
      const { entries } = getChallengeData([makeAdventure({ slug: "my-slug" })]);
      expect(entries[0].adventureId).toBe("my-slug");
    });

    it("sets the correct adventureTitle", () => {
      const { entries } = getChallengeData([
        makeAdventure({ title: "My Adventure" }),
      ]);
      expect(entries[0].adventureTitle).toBe("My Adventure");
    });

    it("builds the correct URL from slug and levelId", () => {
      const { entries } = getChallengeData([
        makeAdventure({ slug: "my-slug" }),
      ]);
      expect(entries[0].url).toBe("/adventures/my-slug/levels/level-1/");
    });

    it("includes the adventureTags array on the entry", () => {
      const { entries } = getChallengeData([
        makeAdventure({ tags: ["rust", "cloud"] }),
      ]);
      expect(entries[0].adventureTags).toEqual(["rust", "cloud"]);
    });

    it("copies the icon from the adventure", () => {
      const { entries } = getChallengeData([makeAdventure({ icon: "🦀" })]);
      expect(entries[0].adventureIcon).toBe("🦀");
    });

    it("sets adventureIcon to undefined when the adventure has no icon", () => {
      const { entries } = getChallengeData([makeAdventure()]);
      // The base makeAdventure has no icon property; it should be undefined.
      expect(entries[0].adventureIcon).toBeUndefined();
    });
  });

  describe("learnings cap", () => {
    it("caps learnings at three entries", () => {
      const { entries } = getChallengeData([
        makeAdventure({
          levels: [
            {
              id: "l1",
              name: "L1",
              difficulty: "Beginner",
              topics: [],
              learnings: ["a", "b", "c", "d", "e"],
            },
          ],
        }),
      ]);
      expect(entries[0].learnings).toHaveLength(3);
      expect(entries[0].learnings).toEqual(["a", "b", "c"]);
    });

    it("keeps learnings unchanged when there are fewer than three", () => {
      const { entries } = getChallengeData([
        makeAdventure({
          levels: [
            {
              id: "l1",
              name: "L1",
              difficulty: "Beginner",
              topics: [],
              learnings: ["only one"],
            },
          ],
        }),
      ]);
      expect(entries[0].learnings).toHaveLength(1);
    });

    it("returns an empty learnings array when the level has no learnings", () => {
      const { entries } = getChallengeData([
        makeAdventure({
          levels: [{ id: "l1", name: "L1", difficulty: "Beginner", topics: [] }],
        }),
      ]);
      expect(entries[0].learnings).toEqual([]);
    });
  });

  describe("isLive propagation", () => {
    it("marks entries as live when the adventure has a future rewards deadline", () => {
      const { entries } = getChallengeData([
        makeAdventure({ rewards: { deadline: FUTURE } }),
      ]);
      expect(entries[0].isLive).toBe(true);
    });

    it("marks entries as not live when all deadlines are in the past", () => {
      const { entries } = getChallengeData([makeAdventure()]);
      // base makeAdventure level deadline is PAST, no rewards deadline
      expect(entries[0].isLive).toBe(false);
    });

    it("marks all levels of an adventure with the same isLive value", () => {
      const adventure = makeAdventure({
        rewards: { deadline: FUTURE },
        levels: [
          { id: "l1", name: "L1", difficulty: "Beginner", topics: [] },
          { id: "l2", name: "L2", difficulty: "Expert", topics: [] },
        ],
      });
      const { entries } = getChallengeData([adventure]);
      expect(entries.every((e) => e.isLive)).toBe(true);
    });
  });

  describe("tags output", () => {
    it("returns a sorted, deduplicated list of all adventure tags", () => {
      const { tags } = getChallengeData([
        makeAdventure({ slug: "a1", tags: ["rust", "cloud"] }),
        makeAdventure({ slug: "a2", tags: ["python", "rust"] }),
      ]);
      expect(tags).toEqual(["cloud", "python", "rust"]);
    });

    it("returns an empty tags array for an empty adventure list", () => {
      const { tags } = getChallengeData([]);
      expect(tags).toEqual([]);
    });

    it("returns an empty entries array for an empty adventure list", () => {
      const { entries } = getChallengeData([]);
      expect(entries).toHaveLength(0);
    });
  });

  describe("entries across multiple adventures", () => {
    it("flattens all levels from all adventures into a single entries array", () => {
      const { entries } = getChallengeData([
        makeAdventure({
          slug: "a1",
          levels: [
            { id: "l1", name: "L1", difficulty: "Beginner", topics: [] },
          ],
        }),
        makeAdventure({
          slug: "a2",
          levels: [
            { id: "l1", name: "L1", difficulty: "Expert", topics: [] },
            { id: "l2", name: "L2", difficulty: "Intermediate", topics: [] },
          ],
        }),
      ]);
      expect(entries).toHaveLength(3);
    });
  });

  describe("ChallengeEntry type completeness", () => {
    it("returned entries satisfy the ChallengeEntry shape", () => {
      const { entries } = getChallengeData([makeAdventure()]);
      const entry: ChallengeEntry = entries[0];
      expect(entry).toHaveProperty("levelId");
      expect(entry).toHaveProperty("name");
      expect(entry).toHaveProperty("difficulty");
      expect(entry).toHaveProperty("learnings");
      expect(entry).toHaveProperty("adventureId");
      expect(entry).toHaveProperty("adventureTitle");
      expect(entry).toHaveProperty("adventureTags");
      expect(entry).toHaveProperty("isLive");
      expect(entry).toHaveProperty("url");
    });
  });
});

// ── getStarterTarget ─────────────────────────────────────────────────────────
//
// Where a newcomer is pointed. Deliberately independent of whether an adventure
// is still live: gating on that blanked the pointer entirely once every deadline
// had passed, which is exactly when a new visitor still needs a starting point.

describe("getStarterTarget", () => {
  const FUTURE = "2999-01-01T00:00:00Z";
  const PAST = "2000-01-01T00:00:00Z";

  const adv = (
    month: string,
    slug: string,
    difficulties: string[],
    deadline?: string,
  ) => ({
    month,
    slug,
    title: slug,
    tags: ["Tag"],
    ...(deadline ? { rewards: { deadline } } : {}),
    levels: difficulties.map((d) => ({ id: d.toLowerCase(), difficulty: d })),
  });

  const ALL = ["Beginner", "Intermediate", "Expert"];

  it("picks the most recent adventure", () => {
    const result = getStarterTarget([
      adv("JAN 2026", "older", ALL),
      adv("JUL 2026", "newest", ALL),
      adv("MAY 2026", "middle", ALL),
    ]);
    expect(result?.adventure.slug).toBe("newest");
  });

  it("picks the Beginner level of that adventure", () => {
    const result = getStarterTarget([adv("JUL 2026", "a", ALL)]);
    expect(result?.levelId).toBe("beginner");
  });

  it("does not depend on the caller's ordering", () => {
    const ascending = [adv("JAN 2026", "older", ALL), adv("JUL 2026", "newest", ALL)];
    const descending = [...ascending].reverse();
    expect(getStarterTarget(ascending)?.adventure.slug).toBe("newest");
    expect(getStarterTarget(descending)?.adventure.slug).toBe("newest");
  });

  it("falls back to the most recent when nothing is live", () => {
    // No deadlines anywhere, so nothing is live. A target is still returned:
    // live is a preference, not a gate.
    const result = getStarterTarget([
      adv("JAN 2026", "older", ALL, PAST),
      adv("JUL 2026", "newest-expired", ALL, PAST),
    ]);
    expect(result?.adventure.slug).toBe("newest-expired");
  });

  it("prefers a live adventure over a newer expired one", () => {
    // The divergent case: preference and recency disagree.
    const result = getStarterTarget([
      adv("JUL 2026", "newer-expired", ALL, PAST),
      adv("JAN 2026", "older-live", ALL, FUTURE),
    ]);
    expect(result?.adventure.slug).toBe("older-live");
  });

  it("picks the newest live one when several are live", () => {
    const result = getStarterTarget([
      adv("JAN 2026", "older-live", ALL, FUTURE),
      adv("JUN 2026", "newer-live", ALL, FUTURE),
      adv("JUL 2026", "newest-expired", ALL, PAST),
    ]);
    expect(result?.adventure.slug).toBe("newer-live");
  });

  it("treats a future level deadline as live, not just a rewards deadline", () => {
    const withLiveLevel = {
      month: "JAN 2026",
      slug: "level-live",
      title: "level-live",
      tags: ["Tag"],
      levels: [{ id: "beginner", difficulty: "Beginner", deadline: FUTURE }],
    };
    const result = getStarterTarget([adv("JUL 2026", "newer-expired", ALL, PAST), withLiveLevel]);
    expect(result?.adventure.slug).toBe("level-live");
  });

  it("falls back to the easiest level present when there is no Beginner", () => {
    const result = getStarterTarget([adv("JUL 2026", "a", ["Expert", "Intermediate"])]);
    expect(result?.levelId).toBe("intermediate");
  });

  it("sorts unknown difficulties last rather than picking them", () => {
    const result = getStarterTarget([adv("JUL 2026", "a", ["Mystery", "Expert"])]);
    expect(result?.levelId).toBe("expert");
  });

  it("returns null when there are no adventures", () => {
    expect(getStarterTarget([])).toBeNull();
  });

  it("returns null when the latest adventure has no levels", () => {
    expect(getStarterTarget([adv("JUL 2026", "a", [])])).toBeNull();
  });

  it("does not mutate the input array", () => {
    const input = [adv("JAN 2026", "older", ALL), adv("JUL 2026", "newest", ALL)];
    const order = input.map((a) => a.slug);
    getStarterTarget(input);
    expect(input.map((a) => a.slug)).toEqual(order);
  });
});
