import { ADVENTURE_SUMMARIES } from "./summaries";
import type { RelatedLevelSummary } from "./types";

/** Returns level summaries matching all selected tags (AND) and/or a difficulty. */
export const getLevelSummariesByFilters = (
  tags: string[],
  difficulty: string | null
): RelatedLevelSummary[] =>
  ADVENTURE_SUMMARIES
    .filter((a) => tags.length === 0 || tags.every((t) => a.tags.includes(t)))
    .flatMap((a) =>
      a.levels
        .filter((level) => !difficulty || level.difficulty === difficulty)
        .map((level) => ({
          level,
          adventureId: a.id,
          adventureTitle: a.title,
          ...(a.isLive ? { isLive: true as const } : {}),
        }))
    );
