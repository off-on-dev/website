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

/** Level builders who are not the adventure designer. Drives pill shaping. */
export function guestBuildersOf(adventure: CreditSource): LevelBuilder[] {
  const designer = adventure.contributor?.name;
  return levelBuildersOf(adventure).filter((b) => b.name !== designer);
}

export type PillCredit = {
  proposer?: CreditPerson;
  builder?: CreditPerson;
  hasBuilders: boolean;
};

/**
 * What the contributor pill should show for an adventure.
 *
 * One guest builder is named alongside the designer; several are collapsed to
 * `hasBuilders`, which switches the label to "Adventure Designer" without
 * listing anyone.
 *
 * An adventure with no designer has no level builders either — the content
 * schema rejects that combination (see `creditIntegrityError`) — so this
 * returns an empty credit rather than promoting a builder to the pill. The
 * no-designer case is real: `sync-adventure.mjs` deliberately omits
 * `contributor`, and a reviewer adds it as a PR checklist item.
 */
export function pillCreditOf(adventure: CreditSource): PillCredit {
  const proposer = adventure.contributor;
  if (!proposer) return { proposer: undefined, builder: undefined, hasBuilders: false };
  const guests = guestBuildersOf(adventure);
  return {
    proposer,
    builder: guests.length === 1 ? guests[0] : undefined,
    hasBuilders: guests.length > 1,
  };
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
 * The `proposer` and `builder` props for ContributorBadge on a level page.
 *
 * Compares by name so a designer who is also named explicitly as the level
 * contributor keeps the "Adventure Builder" label rather than flipping to
 * "Challenge Builder" (which happens when presence alone gates the proposer).
 */
export function levelBuilderCredit(
  contributor: CreditPerson | undefined,
  levelContributor: CreditPerson | undefined,
): { proposer: CreditPerson | undefined; builder: CreditPerson | undefined } {
  const builder = levelContributor ?? contributor;
  const isDesignerBuilt = !levelContributor || levelContributor.name === contributor?.name;
  return { proposer: isDesignerBuilt ? contributor : undefined, builder };
}

// ---------------------------------------------------------------------------
// ChallengeBuildersSection: one card per person, listing every adventure they
// touched and in what capacity.
// ---------------------------------------------------------------------------

const ROLE_ORDER: Record<Difficulty, number> = { Beginner: 0, Intermediate: 1, Expert: 2 };

export type Contribution = {
  slug: string;
  title: string;
  proposed: boolean;
  builtDifficulties: Difficulty[];
  /** Levels built, counted per level so two levels of one difficulty both count. */
  builtCount: number;
  totalLevels: number;
  roleLabel: string;
};

export type ContributorEntry = {
  name: string;
  url?: string;
  aboutHtml?: string;
  contributions: Contribution[];
};

/**
 * Human-readable role for one person on one adventure.
 *
 * "Built" collapses to a bare word when they built every level, whether or not
 * they also proposed it, so the two cases read the same way.
 */
export function formatRoles(c: Omit<Contribution, "roleLabel">): string {
  const built = [...c.builtDifficulties].sort((a, b) => ROLE_ORDER[a] - ROLE_ORDER[b]).join(" · ");
  const builtAll = c.builtCount > 0 && c.builtCount === c.totalLevels;
  if (c.proposed && c.builtCount > 0) return builtAll ? "Proposed & Built" : `Proposed & Built · ${built}`;
  if (c.proposed) return "Proposed";
  return builtAll ? "Built" : `Built · ${built}`;
}

/**
 * Every contributor across the collection, sorted by breadth of contribution
 * then name, each with their adventures sorted by title.
 *
 * Keyed by display name: `discourse_username` is optional and absent for most
 * contributors, so name is the only key present on every record.
 */
export function buildContributorIndex(adventures: CreditAdventure[]): ContributorEntry[] {
  type Draft = Omit<ContributorEntry, "contributions"> & {
    contributions: Map<string, Omit<Contribution, "roleLabel">>;
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

  const contributionFor = (
    entry: Draft,
    adventure: CreditAdventure,
  ): Omit<Contribution, "roleLabel"> => {
    let c = entry.contributions.get(adventure.slug);
    if (!c) {
      c = {
        slug: adventure.slug,
        title: adventure.title,
        proposed: false,
        builtDifficulties: [],
        builtCount: 0,
        totalLevels: adventure.levels.length,
      };
      entry.contributions.set(adventure.slug, c);
    }
    return c;
  };

  for (const adventure of adventures) {
    if (adventure.contributor) {
      contributionFor(entryFor(adventure.contributor), adventure).proposed = true;
    }
    for (const builder of levelBuildersOf(adventure)) {
      const c = contributionFor(entryFor(builder), adventure);
      for (const d of builder.difficulties) {
        if (!c.builtDifficulties.includes(d)) c.builtDifficulties.push(d);
      }
      c.builtCount += builder.levelCount;
    }
  }

  return [...byName.values()]
    .map((entry) => ({
      name: entry.name,
      ...(entry.url ? { url: entry.url } : {}),
      ...(entry.aboutHtml ? { aboutHtml: entry.aboutHtml } : {}),
      contributions: [...entry.contributions.values()]
        .sort((a, b) => a.title.localeCompare(b.title))
        .map((c) => ({ ...c, roleLabel: formatRoles(c) })),
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
