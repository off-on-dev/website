import { describe, it, expect } from "vitest";
import { DIFFICULTY_VAR, type Difficulty, difficultyStyle } from "@/lib/difficulty";

// ---------------------------------------------------------------------------
// DIFFICULTY_VAR
// ---------------------------------------------------------------------------
describe("DIFFICULTY_VAR", () => {
  it("maps Beginner to the CSS variable stem 'starter'", () => {
    expect(DIFFICULTY_VAR["Beginner"]).toBe("starter");
  });

  it("maps Intermediate to the CSS variable stem 'builder'", () => {
    expect(DIFFICULTY_VAR["Intermediate"]).toBe("builder");
  });

  it("maps Expert to the CSS variable stem 'architect'", () => {
    expect(DIFFICULTY_VAR["Expert"]).toBe("architect");
  });

  it("has exactly three entries", () => {
    expect(Object.keys(DIFFICULTY_VAR)).toHaveLength(3);
  });

  it("does not have an entry for an unknown difficulty level", () => {
    // Deliberately unknown: the map must not invent an entry for it.
    expect(DIFFICULTY_VAR["Unknown" as Difficulty]).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// difficultyStyle
// ---------------------------------------------------------------------------
// `as const` so the loop variable is Difficulty rather than string.
const DIFFICULTIES = ["Beginner", "Intermediate", "Expert"] as const;

describe("difficultyStyle", () => {
  describe("known difficulty levels", () => {
    it("returns a string containing the shared text token", () => {
      for (const level of DIFFICULTIES) {
        expect(difficultyStyle(level)).toContain(
          "color:hsl(var(--difficulty-text))"
        );
      }
    });

    it("returns the correct border CSS variable for Beginner", () => {
      expect(difficultyStyle("Beginner")).toContain(
        "--difficulty-starter-border"
      );
    });

    it("returns the correct background CSS variable for Beginner", () => {
      expect(difficultyStyle("Beginner")).toContain("--difficulty-starter-bg");
    });

    it("returns the correct border CSS variable for Intermediate", () => {
      expect(difficultyStyle("Intermediate")).toContain(
        "--difficulty-builder-border"
      );
    });

    it("returns the correct background CSS variable for Intermediate", () => {
      expect(difficultyStyle("Intermediate")).toContain(
        "--difficulty-builder-bg"
      );
    });

    it("returns the correct border CSS variable for Expert", () => {
      expect(difficultyStyle("Expert")).toContain(
        "--difficulty-architect-border"
      );
    });

    it("returns the correct background CSS variable for Expert", () => {
      expect(difficultyStyle("Expert")).toContain("--difficulty-architect-bg");
    });

    it("returns a non-empty string for every known level", () => {
      for (const level of DIFFICULTIES) {
        expect(difficultyStyle(level).length).toBeGreaterThan(0);
      }
    });
  });

  describe("unknown difficulty level", () => {
    it("still returns a string (does not throw)", () => {
      // Deliberately invalid: the point is that an unknown level degrades gracefully.
      expect(() => difficultyStyle("Novice" as Difficulty)).not.toThrow();
    });

    it("falls back to the 'starter' CSS variable stem for unknown difficulty levels", () => {
      // Unknown difficulty falls back to "starter" (the Beginner stem) so the output
      // contains valid CSS variable references rather than `--difficulty-undefined-*`.
      const style = difficultyStyle("Novice" as Difficulty);
      expect(style).toContain("--difficulty-starter-border");
      expect(style).toContain("--difficulty-starter-bg");
      expect(style).not.toContain("undefined");
    });
  });

  describe("output format", () => {
    it("is a valid inline CSS string (contains colons and semicolons)", () => {
      const style = difficultyStyle("Beginner");
      expect(style).toMatch(/[a-z-]+:[^;]+;/);
    });

    it("contains the border-color property", () => {
      expect(difficultyStyle("Expert")).toContain("border-color:");
    });

    it("contains the background-color property", () => {
      expect(difficultyStyle("Expert")).toContain("background-color:");
    });
  });
});
