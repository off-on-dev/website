// Derives the flat, filterable level list and the tag set for /challenges,
// from the adventures collection.
// tags are ADVENTURE tags (OR match); levels are then filtered by difficulty.

import { type Difficulty } from "@/lib/difficulty";

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

export type StarterTarget<A> = { adventure: A; levelId: string };

/**
 * Where to send a newcomer: the easiest level of the most recent adventure.
 *
 * Deliberately not gated on `isAdventureLive`. Gating on it means the pointer
 * disappears entirely once every deadline has passed, which is precisely when a
 * new visitor still needs somewhere to start. The challenges stay solvable after
 * their rewards window closes, so "latest" is the useful answer, not "live".
 *
 * Sorts internally rather than trusting the caller's order, and falls back to
 * the easiest level present if an adventure ever ships without a Beginner, so a
 * data change cannot silently blank the pointer again.
 */
export function getStarterTarget<
  A extends { month: string; levels: { id: string; difficulty: string }[] },
>(adventures: A[]): StarterTarget<A> | null {
  const latest = sortAdventuresByMonthDesc(adventures)[0];
  if (!latest) return null;

  const rank = (difficulty: string): number => {
    const i = DIFFICULTIES.indexOf(difficulty as (typeof DIFFICULTIES)[number]);
    return i === -1 ? DIFFICULTIES.length : i;
  };
  const easiest = [...latest.levels].sort((x, y) => rank(x.difficulty) - rank(y.difficulty))[0];

  return easiest ? { adventure: latest, levelId: easiest.id } : null;
}

// The filter cards preview at most this many learnings; entries are capped at
// build so the (SSR-serialized) island payload stays small.
const LEARNINGS_PREVIEW_COUNT = 3;

export type ChallengeEntry = {
  levelId: string;
  name: string;
  difficulty: Difficulty;
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
    difficulty: Difficulty;
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
  const entries: ChallengeEntry[] = adventures.flatMap((a) => {
    const live = isAdventureLive(a);
    return a.levels.map((level) => ({
      levelId: level.id,
      name: level.name,
      difficulty: level.difficulty,
      learnings: (level.learnings ?? []).slice(0, LEARNINGS_PREVIEW_COUNT),
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
