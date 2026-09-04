import type { Difficulty } from "@/lib/difficulty";

// Single source of truth for "who gets credit for what" across the adventure
// collection. Four surfaces consume this — AdventureCard, the adventure page
// aside, ChallengeBuildersSection and CommunityLeaders — and they previously
// each derived it inline with subtly different rules, so the same person could
// be credited with two different level counts on one page.
//
// The rule: a level is built by its own `contributor` when it has one, and by
// the adventure `contributor` (the designer) otherwise. The fallback is
// per-level, not all-or-nothing: a designer who builds two of three levels
// keeps credit for those two while a guest builder takes the third.
//
// Pure functions over plain data — no `astro:content` import — so the rules are
// directly unit-testable without a build.

export type CreditPerson = {
  name: string;
  url?: string;
  discourseUsername?: string;
  aboutHtml?: string;
};

export type CreditLevel = {
  difficulty: Difficulty;
  contributor?: CreditPerson;
};

export type CreditAdventure = {
  slug: string;
  title: string;
  contributor?: CreditPerson;
  levels: CreditLevel[];
};

/** The part of an adventure the credit rules actually read. */
export type CreditSource = Pick<CreditAdventure, "contributor" | "levels">;

/** Who built this level: its own contributor, else the adventure designer. */
export function builderOfLevel(
  level: CreditLevel,
  adventure: Pick<CreditAdventure, "contributor">,
): CreditPerson | undefined {
  return level.contributor ?? adventure.contributor;
}

/** A person who built at least one level of an adventure, with which levels. */
export type LevelBuilder = CreditPerson & {
  difficulties: Difficulty[];
  /** Levels credited, which can exceed `difficulties.length` if two share a difficulty. */
  levelCount: number;
};

/**
 * Everyone credited with building a level of this adventure, keyed by name and
 * ordered by the first level they appear on. Includes the designer when the
 * fallback credits them.
 */
export function levelBuildersOf(adventure: CreditSource): LevelBuilder[] {
  const byName = new Map<string, LevelBuilder>();
  for (const level of adventure.levels) {
    const person = builderOfLevel(level, adventure);
    if (!person) continue;
    let entry = byName.get(person.name);
    if (!entry) {
      entry = { ...person, difficulties: [], levelCount: 0 };
      byName.set(person.name, entry);
    }
    if (!entry.difficulties.includes(level.difficulty)) entry.difficulties.push(level.difficulty);
    entry.levelCount++;
  }
  return [...byName.values()];
}

/** One rendered credit: a role label and the person it applies to. */
export type PillCredit = {
  label: string;
  person: CreditPerson;
};

/**
 * The single credit shown on an adventure card and the adventure page title.
 *
 * Always exactly one person, the designer. The label says whether they also
 * built the whole thing:
 *
 *   "Adventure Builder"   they designed it and built every challenge
 *   "Adventure Designer"  someone else built at least one challenge
 *
 * The label is about the designer's own scope, never about who the other
 * builders are, so the pill stays a compact identity marker rather than a
 * credits ledger. Challenge cards carry no credit at all, and per-challenge
 * attribution lives on the level pages and in the adventure page aside.
 *
 * An adventure with no designer has no level builders either, because the
 * content schema rejects that combination (see `creditIntegrityError`), so this
 * returns null rather than promoting a builder into the pill. The no-designer
 * case is real: `sync-adventure.mjs` deliberately omits `contributor`, and a
 * reviewer adds it as a PR checklist item.
 */
export function adventurePillCredit(adventure: CreditSource): PillCredit | null {
  const designer = adventure.contributor;
  if (!designer) return null;
  const builtEveryChallenge =
    adventure.levels.length > 0 &&
    adventure.levels.every((l) => builderOfLevel(l, adventure)?.name === designer.name);
  return {
    label: builtEveryChallenge ? "Adventure Builder" : "Adventure Designer",
    person: designer,
  };
}

const DIFFICULTY_ORDER: Record<Difficulty, number> = { Beginner: 0, Intermediate: 1, Expert: 2 };

/**
 * Difficulties in curriculum order, easiest first, whatever order the levels
 * were authored in. Returns a new array; the input is not mutated.
 *
 * Used wherever a person's built levels are rendered as badges, so two people
 * on the same adventure never show their levels in different orders.
 */
export function sortDifficulties(difficulties: Difficulty[]): Difficulty[] {
  return [...difficulties].sort((a, b) => DIFFICULTY_ORDER[a] - DIFFICULTY_ORDER[b]);
}

/**
 * Rejects the one credit shape the design forbids: levels naming their own
 * builder on an adventure that names no designer. Every adventure has exactly
 * one designer by definition, so this is authoring error, not a state to render.
 *
 * Returns the error message, or null when the adventure is valid. Enforced by
 * the content collection schema, so it fails `astro sync` and the build.
 */
export function creditIntegrityError(adventure: {
  slug: string;
  contributor?: unknown;
  levels: { contributor?: unknown }[];
}): string | null {
  if (adventure.contributor) return null;
  const withBuilder = adventure.levels.filter((l) => l.contributor).length;
  if (withBuilder === 0) return null;
  return (
    `Adventure "${adventure.slug}": ${withBuilder} level(s) set their own \`contributor\`, ` +
    "but the adventure has no top-level `contributor`. Every adventure needs a designer " +
    "before its levels can credit separate builders. Add a `contributor:` block " +
    "(name, url, about, discourse_username) at the top level of adventure.yaml."
  );
}

/**
 * The single credit shown on a level page: whoever built this challenge.
 *
 * Always "Challenge Builder", whether that is a guest or the designer falling
 * through. The page is about one challenge, so the question it answers is "who
 * built this", and splitting the label by whether the builder also designed the
 * adventure made the same fact read two different ways.
 */
export function levelPillCredit(
  designer: CreditPerson | undefined,
  levelContributor: CreditPerson | undefined,
): PillCredit | null {
  const person = levelContributor ?? designer;
  return person ? { label: "Challenge Builder", person } : null;
}

// ---------------------------------------------------------------------------
// Challenge Contributors: one card per person, listing every adventure they
// touched. Which levels, and in what capacity, is deliberately not shown: the
// section thanks people, and per-level detail lives on the adventure pages.
// ---------------------------------------------------------------------------

export type Contribution = {
  slug: string;
  title: string;
};

export type ContributorEntry = {
  name: string;
  url?: string;
  aboutHtml?: string;
  contributions: Contribution[];
};

/**
 * Every contributor across the collection, sorted by breadth of contribution
 * then name, each with their adventures sorted by title. Designers and level
 * builders are both included, and someone who is both appears once.
 *
 * Keyed by display name: `discourse_username` is optional and absent for most
 * contributors, so name is the only key present on every record.
 */
export function buildContributorIndex(adventures: CreditAdventure[]): ContributorEntry[] {
  type Draft = Omit<ContributorEntry, "contributions"> & {
    contributions: Map<string, Contribution>;
  };
  const byName = new Map<string, Draft>();

  const entryFor = (person: CreditPerson): Draft => {
    let entry = byName.get(person.name);
    if (!entry) {
      entry = { name: person.name, contributions: new Map() };
      byName.set(person.name, entry);
    }
    entry.url ??= person.url;
    entry.aboutHtml ??= person.aboutHtml;
    return entry;
  };

  const noteContribution = (entry: Draft, adventure: CreditAdventure): void => {
    if (entry.contributions.has(adventure.slug)) return;
    entry.contributions.set(adventure.slug, { slug: adventure.slug, title: adventure.title });
  };

  for (const adventure of adventures) {
    if (adventure.contributor) noteContribution(entryFor(adventure.contributor), adventure);
    for (const builder of levelBuildersOf(adventure)) noteContribution(entryFor(builder), adventure);
  }

  return [...byName.values()]
    .map((entry) => ({
      name: entry.name,
      ...(entry.url ? { url: entry.url } : {}),
      ...(entry.aboutHtml ? { aboutHtml: entry.aboutHtml } : {}),
      contributions: [...entry.contributions.values()].sort((a, b) => a.title.localeCompare(b.title)),
    }))
    .sort((a, b) => b.contributions.length - a.contributions.length || a.name.localeCompare(b.name));
}

// ---------------------------------------------------------------------------
// CommunityLeaders: counts per person for the derived leaderboard sections.
// ---------------------------------------------------------------------------

export type CreditCount = {
  name: string;
  discourseUsername?: string;
  count: number;
};

const rankByCount = (a: CreditCount, b: CreditCount): number =>
  b.count - a.count || a.name.localeCompare(b.name);

/** Levels built per person, highest first. Same rule as `builderOfLevel`. */
export function challengeCounts(adventures: CreditAdventure[]): CreditCount[] {
  const byName = new Map<string, CreditCount>();
  for (const adventure of adventures) {
    for (const builder of levelBuildersOf(adventure)) {
      const entry = byName.get(builder.name) ?? { name: builder.name, count: 0 };
      entry.discourseUsername ??= builder.discourseUsername;
      entry.count += builder.levelCount;
      byName.set(builder.name, entry);
    }
  }
  return [...byName.values()].sort(rankByCount);
}

/**
 * Discourse handle (lowercased) to the person's real name, from every
 * contributor in the collection.
 *
 * Discourse-sourced leaderboard rows arrive keyed by handle, so this lets a
 * section show "Katharina Sick" instead of "KatharinaSick" wherever the YAML
 * already tells us who the handle belongs to. Handles we have no record for are
 * left alone rather than guessed at.
 */
export function displayNameByHandle(adventures: CreditAdventure[]): Map<string, string> {
  const byHandle = new Map<string, string>();
  const add = (person?: CreditPerson): void => {
    if (!person?.discourseUsername) return;
    const key = person.discourseUsername.toLowerCase();
    if (!byHandle.has(key)) byHandle.set(key, person.name);
  };
  for (const adventure of adventures) {
    add(adventure.contributor);
    for (const level of adventure.levels) add(level.contributor);
  }
  return byHandle;
}

/** Adventures designed per person, highest first. */
export function designerCounts(adventures: CreditAdventure[]): CreditCount[] {
  const byName = new Map<string, CreditCount>();
  for (const { contributor } of adventures) {
    if (!contributor) continue;
    const entry = byName.get(contributor.name) ?? { name: contributor.name, count: 0 };
    entry.discourseUsername ??= contributor.discourseUsername;
    entry.count++;
    byName.set(contributor.name, entry);
  }
  return [...byName.values()].sort(rankByCount);
}
