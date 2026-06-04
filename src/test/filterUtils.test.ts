import { describe, it, expect } from "vitest";
import { getLevelSummariesByFilters, ALL_LEVEL_SUMMARIES } from "@/data/adventures/filter-utils";
import { ADVENTURE_SUMMARIES } from "@/data/adventures/summaries";

const allLevels = ADVENTURE_SUMMARIES.flatMap((a) => a.levels);
const allDifficulties = Array.from(new Set(allLevels.map((l) => l.difficulty)));
const firstTag = Array.from(new Set(ADVENTURE_SUMMARIES.flatMap((a) => a.tags))).sort()[0];

describe("ALL_LEVEL_SUMMARIES", () => {
  it("contains every level across all adventures", () => {
    const allLevelCount = ADVENTURE_SUMMARIES.flatMap((a) => a.levels).length;
    expect(ALL_LEVEL_SUMMARIES.length).toBe(allLevelCount);
  });

  it("each entry has adventureId, adventureTitle, and level", () => {
    ALL_LEVEL_SUMMARIES.forEach((item) => {
      expect(item.adventureId).toBeTruthy();
      expect(item.adventureTitle).toBeTruthy();
      expect(item.level).toBeTruthy();
      expect(item.level.id).toBeTruthy();
    });
  });

  it("matches getLevelSummariesByFilters([], null)", () => {
    expect(ALL_LEVEL_SUMMARIES).toEqual(getLevelSummariesByFilters([], null));
  });
});

describe("getLevelSummariesByFilters", () => {
  it("returns all levels across all adventures when no filters are active", () => {
    const result = getLevelSummariesByFilters([], null);
    expect(result.length).toBe(allLevels.length);
  });

  it("filters by a single tag using AND semantics", () => {
    const result = getLevelSummariesByFilters([firstTag], null);
    const expected = ADVENTURE_SUMMARIES
      .filter((a) => a.tags.includes(firstTag))
      .flatMap((a) => a.levels);
    expect(result.length).toBe(expected.length);
  });

  it("returns only levels from adventures that include ALL selected tags", () => {
    const tagsWithMultiple = ADVENTURE_SUMMARIES.find((a) => a.tags.length >= 2);
    if (!tagsWithMultiple) return;
    const [t1, t2] = tagsWithMultiple.tags;
    const result = getLevelSummariesByFilters([t1, t2], null);
    result.forEach(({ adventureId }) => {
      const adventure = ADVENTURE_SUMMARIES.find((a) => a.id === adventureId)!;
      expect(adventure.tags).toContain(t1);
      expect(adventure.tags).toContain(t2);
    });
  });

  it("returns empty array when no adventure matches all selected tags", () => {
    const result = getLevelSummariesByFilters(["__nonexistent_tag__"], null);
    expect(result.length).toBe(0);
  });

  it("filters by difficulty across all adventures", () => {
    allDifficulties.forEach((diff) => {
      const result = getLevelSummariesByFilters([], diff);
      result.forEach(({ level }) => {
        expect(level.difficulty).toBe(diff);
      });
    });
  });

  it("returns empty array when difficulty has no matches in a filtered tag set", () => {
    const beginnerOnly = ADVENTURE_SUMMARIES.find(
      (a) => a.levels.every((l) => l.difficulty === "Beginner")
    );
    if (!beginnerOnly) return;
    const result = getLevelSummariesByFilters([beginnerOnly.tags[0]], "Expert");
    expect(result.length).toBe(0);
  });

  it("combines tag and difficulty filters correctly", () => {
    const result = getLevelSummariesByFilters([firstTag], "Beginner");
    result.forEach(({ level, adventureId }) => {
      expect(level.difficulty).toBe("Beginner");
      const adventure = ADVENTURE_SUMMARIES.find((a) => a.id === adventureId)!;
      expect(adventure.tags).toContain(firstTag);
    });
  });

  it("each result includes adventureId, adventureTitle, and level", () => {
    const result = getLevelSummariesByFilters([firstTag], null);
    result.forEach((item) => {
      expect(item.adventureId).toBeTruthy();
      expect(item.adventureTitle).toBeTruthy();
      expect(item.level).toBeTruthy();
      expect(item.level.id).toBeTruthy();
    });
  });
});
