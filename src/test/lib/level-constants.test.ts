import { describe, it, expect } from "vitest";
import { LEVEL_DIFFICULTY_BY_EMOJI } from "@/lib/level-constants.mjs";

describe("LEVEL_DIFFICULTY_BY_EMOJI", () => {
  it("maps the green circle emoji to Beginner", () => {
    expect(LEVEL_DIFFICULTY_BY_EMOJI["🟢"]).toBe("Beginner");
  });

  it("maps the yellow circle emoji to Intermediate", () => {
    expect(LEVEL_DIFFICULTY_BY_EMOJI["🟡"]).toBe("Intermediate");
  });

  it("maps the red circle emoji to Expert", () => {
    expect(LEVEL_DIFFICULTY_BY_EMOJI["🔴"]).toBe("Expert");
  });

  it("contains exactly three entries", () => {
    expect(Object.keys(LEVEL_DIFFICULTY_BY_EMOJI)).toHaveLength(3);
  });

  it("has values that are all canonical difficulty strings", () => {
    const canonicalDifficulties = new Set([
      "Beginner",
      "Intermediate",
      "Expert",
    ]);
    for (const value of Object.values(LEVEL_DIFFICULTY_BY_EMOJI)) {
      expect(canonicalDifficulties.has(value)).toBe(true);
    }
  });

  it("has unique difficulty values (no two emoji map to the same difficulty)", () => {
    const values = Object.values(LEVEL_DIFFICULTY_BY_EMOJI);
    expect(new Set(values).size).toBe(values.length);
  });

  it("returns undefined for an unknown emoji", () => {
     
    expect((LEVEL_DIFFICULTY_BY_EMOJI as any)["🔵"]).toBeUndefined();
  });
});
