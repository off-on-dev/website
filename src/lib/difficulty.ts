// Returns an inline style string (Astro `style=` takes a string) using the
// --difficulty-* tokens from index.css.

export type Difficulty = "Beginner" | "Intermediate" | "Expert";

export const DIFFICULTY_VAR: Record<Difficulty, string> = {
  Beginner: "starter",
  Intermediate: "builder",
  Expert: "architect",
};

export const difficultyStyle = (difficulty: Difficulty): string => {
  const v = DIFFICULTY_VAR[difficulty] ?? "starter";
  return `color:hsl(var(--difficulty-text));border-color:hsl(var(--difficulty-${v}-border));background-color:hsl(var(--difficulty-${v}-bg))`;
};
