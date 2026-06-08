import { describe, expect, it } from "vitest";
import {
  computeUpcomingLevels,
  findMissingUpstreamLevels,
  selectActiveLevels,
} from "../../scripts/lib/level-sync.mjs";

describe("findMissingUpstreamLevels", () => {
  it("returns the requested ids not present upstream", () => {
    expect(findMissingUpstreamLevels(["beginner", "intermediate"], new Set(["beginner"]))).toEqual([
      "intermediate",
    ]);
  });

  it("returns an empty array when all requested levels were fetched", () => {
    expect(findMissingUpstreamLevels(["beginner"], new Set(["beginner", "intermediate"]))).toEqual([]);
  });

  it("returns an empty array when no levels were requested", () => {
    expect(findMissingUpstreamLevels([], new Set(["beginner"]))).toEqual([]);
  });

  it("accepts a plain array for fetched ids", () => {
    expect(findMissingUpstreamLevels(["expert"], ["beginner"])).toEqual(["expert"]);
  });
});

describe("selectActiveLevels", () => {
  const fetched = [
    { level: "beginner" },
    { level: "intermediate" },
    { level: "expert" },
  ];

  it("returns every fetched level when no explicit selection is given", () => {
    expect(selectActiveLevels(fetched, [])).toEqual(fetched);
  });

  it("returns only the requested levels when a selection is given", () => {
    expect(selectActiveLevels(fetched, ["intermediate"])).toEqual([{ level: "intermediate" }]);
  });

  it("does not include levels that were requested but not fetched", () => {
    expect(selectActiveLevels(fetched, ["intermediate", "nonexistent"])).toEqual([
      { level: "intermediate" },
    ]);
  });

  it("does not mutate the input array", () => {
    const original = [...fetched];
    selectActiveLevels(fetched, []);
    expect(fetched).toEqual(original);
  });
});

describe("computeUpcomingLevels", () => {
  it("returns an empty list when every fetched level is promoted to live", () => {
    const result = computeUpcomingLevels({
      existing: null,
      allFetchedLevels: [{ level: "beginner", name: "B", difficulty: "Beginner" }],
      existingLiveIds: new Set(),
      activeLevelIds: new Set(["beginner"]),
      missingFromUpstream: [],
    });
    expect(result).toEqual([]);
  });

  it("includes fetched levels that aren't being promoted this run", () => {
    const result = computeUpcomingLevels({
      existing: null,
      allFetchedLevels: [
        { level: "beginner", name: "B", difficulty: "Beginner" },
        { level: "intermediate", name: "I", difficulty: "Intermediate" },
      ],
      existingLiveIds: new Set(),
      activeLevelIds: new Set(["beginner"]),
      missingFromUpstream: [],
    });
    expect(result).toEqual([
      { level: "intermediate", name: "I", difficulty: "Intermediate" },
    ]);
  });

  it("creates placeholders for requested levels missing from upstream", () => {
    const result = computeUpcomingLevels({
      existing: null,
      allFetchedLevels: [{ level: "beginner", name: "B", difficulty: "Beginner" }],
      existingLiveIds: new Set(),
      activeLevelIds: new Set(["beginner"]),
      missingFromUpstream: ["expert"],
    });
    expect(result).toEqual([
      { level: "expert", name: "Expert", difficulty: "Expert" },
    ]);
  });

  it("excludes levels that are already live", () => {
    const result = computeUpcomingLevels({
      existing: null,
      allFetchedLevels: [{ level: "beginner", name: "B", difficulty: "Beginner" }],
      existingLiveIds: new Set(["beginner"]),
      activeLevelIds: new Set(),
      missingFromUpstream: ["beginner"],
    });
    expect(result).toEqual([]);
  });

  it("sorts results by canonical level order (beginner, intermediate, expert)", () => {
    const result = computeUpcomingLevels({
      existing: null,
      allFetchedLevels: [
        { level: "expert", name: "E", difficulty: "Expert" },
        { level: "beginner", name: "B", difficulty: "Beginner" },
        { level: "intermediate", name: "I", difficulty: "Intermediate" },
      ],
      existingLiveIds: new Set(),
      activeLevelIds: new Set(),
      missingFromUpstream: [],
    });
    expect(result.map((u) => u.level)).toEqual(["beginner", "intermediate", "expert"]);
  });

  it("lets upstream entries override missing-from-upstream placeholders", () => {
    // A level can't be both "missing from upstream" and "fetched", but defensively
    // verify that if it ever happens (e.g. case-mismatch resolved upstream mid-sync),
    // the upstream object wins over the synthetic placeholder.
    const result = computeUpcomingLevels({
      existing: null,
      allFetchedLevels: [{ level: "expert", name: "Custom Expert", difficulty: "Expert" }],
      existingLiveIds: new Set(),
      activeLevelIds: new Set(),
      missingFromUpstream: ["expert"],
    });
    expect(result).toEqual([
      { level: "expert", name: "Custom Expert", difficulty: "Expert" },
    ]);
  });

  it("derives difficulty from the emoji when the upstream level omits it", () => {
    const result = computeUpcomingLevels({
      existing: null,
      allFetchedLevels: [{ level: "intermediate", title: "Side Quest", emoji: "🟡" }],
      existingLiveIds: new Set(),
      activeLevelIds: new Set(),
      missingFromUpstream: [],
    });
    expect(result).toEqual([
      { level: "intermediate", name: "Side Quest", difficulty: "Intermediate" },
    ]);
  });

  it("preserves existing upcoming entries across re-syncs using the emitted level field", () => {
    // The sync always emits `level` in upcoming_levels entries, so self-written YAML
    // is always recoverable on the next run even when the upstream level disappears.
    const result = computeUpcomingLevels({
      existing: {
        upcoming_levels: [
          { level: "Expert", name: "Side Quest", difficulty: "Expert" },
        ],
      },
      allFetchedLevels: [{ level: "beginner", name: "B", difficulty: "Beginner" }],
      existingLiveIds: new Set(["beginner"]),
      activeLevelIds: new Set(),
      missingFromUpstream: [],
    });
    expect(result).toEqual([
      { level: "expert", name: "Side Quest", difficulty: "Expert" },
    ]);
  });

  it("does not duplicate a manually-saved entry that is also fetched upstream", () => {
    const result = computeUpcomingLevels({
      existing: {
        upcoming_levels: [{ level: "intermediate", name: "Stale", difficulty: "Intermediate" }],
      },
      allFetchedLevels: [
        { level: "beginner", name: "B", difficulty: "Beginner" },
        { level: "intermediate", name: "Fresh", difficulty: "Intermediate" },
      ],
      existingLiveIds: new Set(["beginner"]),
      activeLevelIds: new Set(),
      missingFromUpstream: [],
    });
    expect(result).toEqual([
      { level: "intermediate", name: "Fresh", difficulty: "Intermediate" },
    ]);
  });


  it("ignores existing upcoming entries that lack a level field (old/malformed YAML guard)", () => {
    // Defensive guard: entries without `level` (e.g. from pre-fix adventure.yaml files)
    // cannot be matched and are silently skipped rather than crashing.
    const result = computeUpcomingLevels({
      existing: {
        upcoming_levels: [{ name: "Intermediate", difficulty: "Intermediate" }],
      },
      allFetchedLevels: [{ level: "beginner", name: "B", difficulty: "Beginner" }],
      existingLiveIds: new Set(["beginner"]),
      activeLevelIds: new Set(),
      missingFromUpstream: [],
    });
    expect(result).toEqual([]);
  });

  it("preserves a 'Coming Soon' entry when the upstream level disappears on re-sync", () => {
    // Regression test for the fix: sync wrote `{ level, name, difficulty }` on the
    // previous run; the challenges repo later removed that level. Without the level
    // field in the existing entry the placeholder would silently vanish.
    const result = computeUpcomingLevels({
      existing: {
        upcoming_levels: [{ level: "intermediate", name: "Intermediate", difficulty: "Intermediate" }],
      },
      allFetchedLevels: [{ level: "beginner", name: "B", difficulty: "Beginner" }],
      existingLiveIds: new Set(["beginner"]),
      activeLevelIds: new Set(),
      missingFromUpstream: [],
    });
    expect(result).toEqual([
      { level: "intermediate", name: "Intermediate", difficulty: "Intermediate" },
    ]);
  });
});

