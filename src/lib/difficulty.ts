import type { CSSProperties } from "react";
import type { Difficulty } from "@/data/adventures/filter-utils";

/** Maps Difficulty label to the CSS variable suffix used in --difficulty-{suffix}-bg/border tokens. */
export const DIFFICULTY_VAR: Record<Difficulty, string> = {
  Beginner: "starter",
  Intermediate: "builder",
  Expert: "architect",
};

/** Base inline style for difficulty-colored elements (badge, pill, card). */
export const difficultyStyle = (difficulty: Difficulty): CSSProperties => {
  const v = DIFFICULTY_VAR[difficulty];
  return {
    color: `hsl(var(--difficulty-text))`,
    borderColor: `hsl(var(--difficulty-${v}-border))`,
    backgroundColor: `hsl(var(--difficulty-${v}-bg))`,
  };
};
