// Pure helpers for sync-adventure.mjs. Extracted so level selection and the
// "Coming Soon" computation can be unit-tested without mocking GitHub fetches.

import { LEVEL_DIFFICULTY_BY_ID, LEVEL_DIFFICULTY_BY_EMOJI, LEVEL_ORDER } from "./level-constants.mjs";

function asSet(value) {
  return value instanceof Set ? value : new Set(value);
}

/**
 * Returns the IDs in `levelsToSync` that were not found upstream.
 */
export function findMissingUpstreamLevels(levelsToSync, fetchedIds) {
  const fetched = asSet(fetchedIds);
  return levelsToSync.filter((id) => !fetched.has(id));
}

/**
 * Selects which fetched levels are promoted to live in adventure.yaml.
 *
 * Empty `levelsToSync` means "all fetched levels". Otherwise only explicitly
 * requested levels are active; pre-existing live levels not in the request are
 * preserved separately by mergeLevels in sync-adventure.mjs.
 */
export function selectActiveLevels(allFetchedLevels, levelsToSync) {
  if (levelsToSync.length === 0) return [...allFetchedLevels];
  const requested = new Set(levelsToSync);
  return allFetchedLevels.filter((l) => requested.has(l.level));
}

/**
 * Builds the deduped, level-ordered "Coming Soon" list for adventure.yaml.
 *
 * Sources, in order (later sources override earlier on the same level id):
 *   1. Placeholders for levels the user requested that don't exist upstream yet.
 *   2. Upstream-fetched levels not being promoted to live this run.
 *
 * Then preserves entries from `existing.upcoming_levels` that aren't already
 * covered so "Coming Soon" placeholders survive re-syncs for levels that have
 * disappeared or been renamed upstream. Entries must include a `level` field
 * to be preserved — the sync always emits it, so self-written YAML is always
 * recoverable. Entries without `level` (e.g. from very old files) are ignored.
 *
 * Levels already live or being promoted this run are never included.
 *
 * Returns objects with `{ level, name, difficulty }`.
 */
export function computeUpcomingLevels({
  existing,
  allFetchedLevels,
  existingLiveIds,
  activeLevelIds,
  missingFromUpstream,
}) {
  const fetchedIds = new Set(allFetchedLevels.map((l) => l.level));
  const liveIds = asSet(existingLiveIds);
  const activeIds = asSet(activeLevelIds);
  const upcomingById = new Map();

  for (const id of missingFromUpstream) {
    if (liveIds.has(id)) continue;
    upcomingById.set(id, {
      level: id,
      name: LEVEL_DIFFICULTY_BY_ID[id] || id,
      difficulty: LEVEL_DIFFICULTY_BY_ID[id] || id,
    });
  }

  for (const l of allFetchedLevels) {
    if (liveIds.has(l.level) || activeIds.has(l.level)) continue;
    upcomingById.set(l.level, {
      level: l.level,
      name: l.name || l.title,
      difficulty: l.difficulty || LEVEL_DIFFICULTY_BY_EMOJI[l.emoji] || LEVEL_DIFFICULTY_BY_ID[l.level],
    });
  }

  for (const u of existing?.upcoming_levels || []) {
    const id = typeof u.level === "string" ? u.level.toLowerCase() : "";
    if (!id) continue;
    if (fetchedIds.has(id) || liveIds.has(id) || activeIds.has(id)) continue;
    if (upcomingById.has(id)) continue;
    upcomingById.set(id, { level: id, name: u.name, difficulty: u.difficulty });
  }

  return [...upcomingById.values()].sort(
    (a, b) => (LEVEL_ORDER[a.level] ?? 99) - (LEVEL_ORDER[b.level] ?? 99)
  );
}
