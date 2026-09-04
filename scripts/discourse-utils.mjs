// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

/**
 * Shared utilities for Discourse data refresh scripts.
 * Exported functions are unit-tested in src/test/scripts/discourse-utils.test.ts.
 *
 * Staleness window: the refresh-community-data workflow runs hourly. All
 * Discourse data (posts, leaderboard, community leaders) may therefore be up
 * to 60 minutes stale. This is accepted and documented — it is sufficient for
 * community activity feeds that are not time-critical.
 *
 * Admin-key requirement: refresh-leaderboard.mjs and refresh-community-leaders.mjs
 * query the Discourse Data Explorer, which requires a Discourse admin API key
 * (DISCOURSE_API_KEY env var). refresh-discussions.mjs uses the public Discourse
 * topic API and requires no credentials.
 */

import { writeFileSync, renameSync } from "node:fs";

/**
 * True when running in a CI environment.
 *
 * Treats the conventional falsy spellings as "not CI" so a deliberately
 * disabled CI flag is not read as enabled. GitHub Actions sets CI="true".
 *
 * Used to decide how hard to fail on a missing DISCOURSE_API_KEY: locally an
 * absent key is a friendly skip, but in CI it means the secret was rotated or
 * removed, and a silent skip there produces a green run with data frozen
 * forever. Exported for unit testing.
 *
 * @param {Record<string, unknown>} [env] Defaults to process.env.
 * @returns {boolean}
 */
export function isCI(env = process.env) {
  const value = env.CI;
  if (value === undefined || value === null) return false;
  const normalized = String(value).trim().toLowerCase();
  return normalized !== "" && normalized !== "false" && normalized !== "0";
}

/**
 * Write content to `path` atomically by writing to `<path>.tmp` then renaming.
 * If the process dies between the write and the rename, `path` is unaffected
 * and the orphaned `.tmp` can be safely deleted on the next run.
 */
export function atomicWrite(path, content) {
  const tmp = `${path}.tmp`;
  writeFileSync(tmp, content, "utf-8");
  renameSync(tmp, path);
}

/**
 * Fetch wrapper that retries on HTTP 429 (rate-limited) responses.
 * Reads the `Retry-After` response header; falls back to 60 s when absent.
 * Caps the wait at 120 s to avoid stalling CI runs indefinitely.
 * Returns the final Response — caller inspects `res.ok` / `res.status`.
 */
export async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, options);
    if (res.status !== 429 || attempt === maxRetries) return res;
    const header = res.headers.get("Retry-After");
    const seconds = Math.min(parseInt(header ?? "60", 10) || 60, 120);
    console.warn(`  Rate-limited (429). Waiting ${seconds}s before retry ${attempt + 1}/${maxRetries}…`);
    await new Promise((r) => setTimeout(r, seconds * 1000));
  }
  return fetch(url, options); // unreachable; satisfies static analysis
}
