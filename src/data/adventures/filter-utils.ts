import { ADVENTURE_SUMMARIES } from "./summaries";
import type { RelatedLevelSummary } from "./types";

export const DIFFICULTIES = ["Beginner", "Intermediate", "Expert"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

/** Returns level summaries matching any selected tag (OR) and/or a difficulty. */
export const getLevelSummariesByFilters = (
  tags: string[],
  difficulty: string | null
): RelatedLevelSummary[] =>
  ADVENTURE_SUMMARIES
    .filter((a) => tags.length === 0 || tags.some((t) => a.tags.includes(t)))
    .flatMap((a) =>
      a.levels
        .filter((level) => !difficulty || level.difficulty === difficulty)
        .map((level) => ({
          level,
          adventureId: a.id,
          adventureTitle: a.title,
          ...(a.isLive ? { isLive: true as const } : {}),
          ...(a.icon ? { adventureIcon: a.icon } : {}),
        }))
    );

export const ALL_LEVEL_SUMMARIES: RelatedLevelSummary[] = getLevelSummariesByFilters([], null);
