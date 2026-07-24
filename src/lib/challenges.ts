// Derives the flat, filterable level list and the tag set for /challenges,
// from the adventures collection. Mirrors filter-utils.ts + tag-utils.ts:
// tags are ADVENTURE tags (OR match); levels are then filtered by difficulty.

export const DIFFICULTIES = ["Beginner", "Intermediate", "Expert"] as const;

/** Convert a tag display name to a URL-safe slug. */
export const tagToSlug = (tag: string): string =>
  tag.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const monthKey = (m: string): number => {
  const [mon, year] = m.split(" ");
  return Number(year) * 12 + Math.max(0, MONTHS.indexOf(mon));
};

/** Adventures newest-first by their "MON YYYY" month string (non-mutating). */
export const sortAdventuresByMonthDesc = <T extends { month: string }>(adventures: T[]): T[] =>
  [...adventures].sort((x, y) => monthKey(y.month) - monthKey(x.month));

/** Build-time live check: an active rewards window or any future level deadline. */
export const isAdventureLive = (a: {
  rewards?: { deadline?: string };
  levels: { deadline?: string }[];
}): boolean => {
  const now = Date.now();
  return (
    !!(a.rewards?.deadline && Date.parse(a.rewards.deadline) > now) ||
    a.levels.some((l) => !!l.deadline && Date.parse(l.deadline) > now)
  );
};

export type ChallengeEntry = {
  levelId: string;
  name: string;
  difficulty: string;
  topics: string[];
  learnings: string[];
  estimatedTime?: string;
  adventureId: string;
  adventureTitle: string;
  adventureTags: string[];
  adventureIcon?: string;
  isLive: boolean;
  url: string;
};

type AdventureData = {
  slug: string;
  title: string;
  tags: string[];
  icon?: string;
  rewards?: { deadline?: string };
  levels: {
    id: string;
    name: string;
    difficulty: string;
    topics: string[];
    learnings?: string[];
    estimatedTime?: string;
    deadline?: string;
  }[];
};

export function getChallengeData(adventures: AdventureData[]): {
  entries: ChallengeEntry[];
  tags: string[];
} {
  // Build-time isLive: active rewards window or any future level deadline.
  const now = Date.now();
  const isLive = (a: AdventureData): boolean =>
    !!(a.rewards?.deadline && Date.parse(a.rewards.deadline) > now) ||
    a.levels.some((l) => l.deadline && Date.parse(l.deadline) > now);

  const entries: ChallengeEntry[] = adventures.flatMap((a) => {
    const live = isLive(a);
    return a.levels.map((level) => ({
      levelId: level.id,
      name: level.name,
      difficulty: level.difficulty,
      topics: level.topics,
      learnings: level.learnings ?? [],
      estimatedTime: level.estimatedTime,
      adventureId: a.slug,
      adventureTitle: a.title,
      adventureTags: a.tags,
      adventureIcon: a.icon,
      isLive: live,
      url: `/adventures/${a.slug}/levels/${level.id}/`,
    }));
  });
  const tags = Array.from(new Set(adventures.flatMap((a) => a.tags))).sort();
  return { entries, tags };
}
