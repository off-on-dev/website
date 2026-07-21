// Ported from src/lib/difficulty.ts. Returns an inline style string (Astro
// `style=` takes a string) using the --difficulty-* tokens from index.css.

export const DIFFICULTY_VAR: Record<string, string> = {
  Beginner: "starter",
  Intermediate: "builder",
  Expert: "architect",
};

export const difficultyStyle = (difficulty: string): string => {
  const v = DIFFICULTY_VAR[difficulty];
  return `color:hsl(var(--difficulty-text));border-color:hsl(var(--difficulty-${v}-border));background-color:hsl(var(--difficulty-${v}-bg))`;
};
