import { describe, it, expect } from "vitest";
import { DIFFICULTY_VAR, difficultyStyle } from "@/lib/difficulty";
import type { Difficulty } from "@/data/adventures/filter-utils";

const DIFFICULTIES: Difficulty[] = ["Beginner", "Intermediate", "Expert"];

describe("DIFFICULTY_VAR", () => {
  it("maps every Difficulty to a non-empty suffix", () => {
    DIFFICULTIES.forEach((diff) => {
      expect(typeof DIFFICULTY_VAR[diff]).toBe("string");
      expect(DIFFICULTY_VAR[diff].length).toBeGreaterThan(0);
    });
  });

  it("uses the correct suffix for each difficulty", () => {
    expect(DIFFICULTY_VAR.Beginner).toBe("starter");
    expect(DIFFICULTY_VAR.Intermediate).toBe("builder");
    expect(DIFFICULTY_VAR.Expert).toBe("architect");
  });
});

describe("difficultyStyle", () => {
  it("returns color, borderColor, and backgroundColor for every difficulty", () => {
    DIFFICULTIES.forEach((diff) => {
      const style = difficultyStyle(diff);
      expect(style.color).toBe("hsl(var(--difficulty-text))");
      expect(style.borderColor).toBeTruthy();
      expect(style.backgroundColor).toBeTruthy();
    });
  });

  it("uses the correct CSS variable suffix per difficulty", () => {
    expect(difficultyStyle("Beginner").borderColor).toBe("hsl(var(--difficulty-starter-border))");
    expect(difficultyStyle("Beginner").backgroundColor).toBe("hsl(var(--difficulty-starter-bg))");

    expect(difficultyStyle("Intermediate").borderColor).toBe("hsl(var(--difficulty-builder-border))");
    expect(difficultyStyle("Intermediate").backgroundColor).toBe("hsl(var(--difficulty-builder-bg))");

    expect(difficultyStyle("Expert").borderColor).toBe("hsl(var(--difficulty-architect-border))");
    expect(difficultyStyle("Expert").backgroundColor).toBe("hsl(var(--difficulty-architect-bg))");
  });

  it("returns distinct styles for each difficulty", () => {
    const styles = DIFFICULTIES.map(difficultyStyle);
    const borderColors = styles.map((s) => s.borderColor);
    expect(new Set(borderColors).size).toBe(3);
  });
});
