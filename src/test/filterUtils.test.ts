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

  it("filters by a single tag", () => {
    const result = getLevelSummariesByFilters([firstTag], null);
    const expected = ADVENTURE_SUMMARIES
      .filter((a) => a.tags.includes(firstTag))
      .flatMap((a) => a.levels);
    expect(result.length).toBe(expected.length);
  });

  it("returns levels from adventures that match ANY selected tag (OR semantics)", () => {
    const sortedTags = Array.from(new Set(ADVENTURE_SUMMARIES.flatMap((a) => a.tags))).sort();
    const [t1, t2] = sortedTags;
    const result = getLevelSummariesByFilters([t1, t2], null);
    const matchingIds = new Set(
      ADVENTURE_SUMMARIES
        .filter((a) => a.tags.includes(t1) || a.tags.includes(t2))
        .map((a) => a.id)
    );
    result.forEach(({ adventureId }) => {
      expect(matchingIds.has(adventureId)).toBe(true);
    });
    const expectedCount = ADVENTURE_SUMMARIES
      .filter((a) => a.tags.includes(t1) || a.tags.includes(t2))
      .flatMap((a) => a.levels).length;
    expect(result.length).toBe(expectedCount);
  });

  it("returns empty array when no adventure matches any selected tag", () => {
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

  it("propagates adventureIcon when the adventure has an icon", () => {
    const adventuresWithIcon = ADVENTURE_SUMMARIES.filter((a) => a.icon);
    if (adventuresWithIcon.length === 0) return;
    adventuresWithIcon.forEach((a) => {
      const result = getLevelSummariesByFilters([a.tags[0]], null);
      const forThisAdventure = result.filter((r) => r.adventureId === a.id);
      forThisAdventure.forEach((item) => {
        expect(item.adventureIcon).toBe(a.icon);
      });
    });
  });

  it("omits adventureIcon when the adventure has no icon", () => {
    const adventuresWithoutIcon = ADVENTURE_SUMMARIES.filter((a) => !a.icon);
    if (adventuresWithoutIcon.length === 0) return;
    adventuresWithoutIcon.forEach((a) => {
      const result = getLevelSummariesByFilters([a.tags[0]], null);
      const forThisAdventure = result.filter((r) => r.adventureId === a.id);
      forThisAdventure.forEach((item) => {
        expect(item.adventureIcon).toBeUndefined();
      });
    });
  });
});
