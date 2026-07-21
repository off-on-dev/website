// Derives the flat, filterable level list and the tag set for /challenges,
// from the adventures collection. Mirrors filter-utils.ts + tag-utils.ts:
// tags are ADVENTURE tags (OR match); levels are then filtered by difficulty.

export const DIFFICULTIES = ["Beginner", "Intermediate", "Expert"] as const;

/** Convert a tag display name to a URL-safe slug. */
export const tagToSlug = (tag: string): string =>
  tag.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export type ChallengeEntry = {
  levelId: string;
  name: string;
  difficulty: string;
  topics: string[];
  estimatedTime?: string;
  adventureId: string;
  adventureTitle: string;
  adventureTags: string[];
  url: string;
};

type AdventureData = {
  slug: string;
  title: string;
  tags: string[];
  levels: { id: string; name: string; difficulty: string; topics: string[]; estimatedTime?: string }[];
};

export function getChallengeData(adventures: AdventureData[]): {
  entries: ChallengeEntry[];
  tags: string[];
} {
  const entries: ChallengeEntry[] = adventures.flatMap((a) =>
    a.levels.map((level) => ({
      levelId: level.id,
      name: level.name,
      difficulty: level.difficulty,
      topics: level.topics,
      estimatedTime: level.estimatedTime,
      adventureId: a.slug,
      adventureTitle: a.title,
      adventureTags: a.tags,
      url: `/adventures/${a.slug}/levels/${level.id}/`,
    })),
  );
  const tags = Array.from(new Set(adventures.flatMap((a) => a.tags))).sort();
  return { entries, tags };
}
