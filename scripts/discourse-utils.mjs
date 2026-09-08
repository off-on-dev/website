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

// Transient server errors worth retrying. 500/502/503/504 are gateway or
// momentary upstream failures; 429 is handled separately via Retry-After.
const RETRYABLE_5XX = new Set([500, 502, 503, 504]);

/**
 * Fetch wrapper that retries on HTTP 429 (rate-limited) and transient 5xx
 * responses (500, 502, 503, 504).
 *
 * - 429: reads the `Retry-After` header; falls back to 60 s, capped at 120 s.
 * - 5xx: exponential backoff (2^attempt seconds), capped at 30 s.
 *
 * Returns the final Response — caller inspects `res.ok` / `res.status`.
 */
export async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, options);
    const is429 = res.status === 429;
    const is5xx = RETRYABLE_5XX.has(res.status);
    if ((!is429 && !is5xx) || attempt === maxRetries) return res;
    let seconds;
    if (is429) {
      const header = res.headers.get("Retry-After");
      seconds = Math.min(parseInt(header ?? "60", 10) || 60, 120);
      console.warn(`  Rate-limited (429). Waiting ${seconds}s before retry ${attempt + 1}/${maxRetries}…`);
    } else {
      seconds = Math.min(2 ** attempt, 30);
      console.warn(`  Server error (${res.status}). Waiting ${seconds}s before retry ${attempt + 1}/${maxRetries}…`);
    }
    await new Promise((r) => setTimeout(r, seconds * 1000));
  }
  return fetch(url, options); // unreachable; satisfies static analysis
}
