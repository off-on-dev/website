#!/usr/bin/env node

/**
 * Fetch community leaders data from the Discourse Data Explorer.
 *
 * Requires a Discourse API key with admin access. Set via environment variables
 * or a local .env file (never commit the .env file).
 *
 * Usage:
 *   node scripts/refresh-community-leaders.mjs
 *
 * Environment variables:
 *   DISCOURSE_API_KEY      - Discourse admin API key
 *   DISCOURSE_API_USERNAME - Discourse username the key belongs to
 *
 * Queries:
 *   7 - Community stats per category (topics_created, likes_received, replies, likes_given)
 *       Columns: user_id, username, likes_received, topics_created, replies, solutions,
 *                likes_given, uploaded_avatar_id
 *   8 - Challenge solver/builder stats (solve_count, is_grand_builder, challenges_created)
 *       Columns: user_id, username, solve_count, is_grand_builder, challenges_created,
 *                is_challenge_builder, is_rockstar, uploaded_avatar_id
 *
 * Writes:
 *   src/data/community-leaders.json
 *
 * NOTE: community.offon.dev is the actual Discourse server URL.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT_PATH = resolve(ROOT, "src/data/community-leaders.json");
const COMMUNITY_BASE = "https://community.offon.dev";

// Query IDs in Discourse Data Explorer.
const COMMUNITY_QUERY_ID = 7;
const CHALLENGE_QUERY_ID = 8;

// Category IDs passed to the community stats query (matches CATEGORY_IDS in the Discourse plugin).
const COMMUNITY_CATEGORY_IDS = "38,18,2,10,11";

// Badge names passed to the challenge stats query.
const CHALLENGE_PARAMS = {
  solver_badge_name: "Challenge Solved",
  builder_badge_name: "Challenge Grand Builder",
  cb_badge_name: "Challenge Builder",
  rockstar_badge_name: "Challenge Rockstar",
};

const TOP_N = 5;
const POOL_SIZE = TOP_N + 1; // fetch one extra so promotions/exclusions don't drop displayed lists below TOP_N
const AVATAR_SIZE = "40";

// Load .env file for local development. Never used in CI (secrets are env vars).
function loadDotEnv() {
  const envPath = resolve(ROOT, ".env");
  if (!existsSync(envPath)) return;
  try {
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
      if (key && !(key in process.env)) process.env[key] = value;
    }
    console.log("  Loaded .env");
  } catch {
    // Ignore parse errors
  }
}

// Build avatar URL from the uploaded_avatar_id returned by queries 7 and 8.
// If no ID is present, falls back to the Discourse CDN letter avatar.
function buildAvatarUrl(username, uploadedAvatarId, size = AVATAR_SIZE) {
  if (!uploadedAvatarId) {
    const letter = username.charAt(0).toLowerCase();
    return `https://avatars.discourse-cdn.com/v4/letter/${letter}/b5a626/${size}.png`;
  }
  return `${COMMUNITY_BASE}/user_avatar/community.offon.dev/${encodeURIComponent(username)}/${size}/${uploadedAvatarId}_2.png`;
}

async function runQuery(queryId, params, apiKey, apiUsername) {
  const url = `${COMMUNITY_BASE}/admin/plugins/discourse-data-explorer/queries/${queryId}/run`;
  const body = new URLSearchParams({ limit: "200" });
  for (const [k, v] of Object.entries(params)) {
    body.append(`params[${k}]`, String(v));
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Api-Key": apiKey,
      "Api-Username": apiUsername,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for query ${queryId}`);
  }

  const data = await res.json();
  if (!data.success) {
    throw new Error(`Query ${queryId} failed: ${JSON.stringify(data.errors)}`);
  }

  return { columns: data.columns, rows: data.rows ?? [] };
}

// Require a named column. Throws with a clear message if missing.
function col(columns, name) {
  const idx = columns.indexOf(name);
  if (idx === -1) throw new Error(`Column "${name}" not found in [${columns.join(", ")}]`);
  return idx;
}

function topByCol(rows, usernameIdx, valueIdx, avatarIdx, n) {
  return rows
    .map((row) => ({
      username: String(row[usernameIdx]),
      value: Number(row[valueIdx]),
      avatarUrl: buildAvatarUrl(String(row[usernameIdx]), row[avatarIdx] ?? null),
    }))
    .filter((u) => u.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, n)
    .map((u) => ({ username: u.username, avatarUrl: u.avatarUrl, count: u.value }));
}

async function main() {
  loadDotEnv();

  const apiKey = process.env.DISCOURSE_API_KEY;
  const apiUsername = process.env.DISCOURSE_API_USERNAME ?? "system";

  if (!apiKey) {
    console.warn("  DISCOURSE_API_KEY not set, skipping community leaders refresh.");
    console.warn("  Set it in .env (local) or as a GitHub secret (CI).");
    process.exit(0);
  }

  console.log("  Fetching community stats (query 7)...");
  const community = await runQuery(
    COMMUNITY_QUERY_ID,
    { category_ids: COMMUNITY_CATEGORY_IDS },
    apiKey,
    apiUsername,
  );

  console.log("  Fetching challenge stats (query 8)...");
  const challenge = await runQuery(
    CHALLENGE_QUERY_ID,
    CHALLENGE_PARAMS,
    apiKey,
    apiUsername,
  );

  // Community query column indices
  const cCols = community.columns;
  const cUsername       = col(cCols, "username");
  const cLikesReceived  = col(cCols, "likes_received");
  const cTopics         = col(cCols, "topics_created");
  const cReplies        = col(cCols, "replies");
  const cLikesGiven     = col(cCols, "likes_given");
  const cAvatarId       = col(cCols, "uploaded_avatar_id");

  // Challenge query column indices
  const chCols = challenge.columns;
  const chUsername           = col(chCols, "username");
  const chSolveCount         = col(chCols, "solve_count");
  const chIsGrandBuilder     = col(chCols, "is_grand_builder");
  const chChallengesCreated  = col(chCols, "challenges_created");
  const chIsChallengeBuilder = col(chCols, "is_challenge_builder");
  const chIsRockstar         = col(chCols, "is_rockstar");
  const chAvatarId           = col(chCols, "uploaded_avatar_id");

  const cRows  = community.rows;
  const chRows = challenge.rows;

  const solvers = chRows
    .filter((r) => !r[chIsRockstar])
    .map((r) => ({
      username: String(r[chUsername]),
      value: Number(r[chSolveCount]),
      avatarUrl: buildAvatarUrl(String(r[chUsername]), r[chAvatarId] ?? null),
    }))
    .filter((u) => u.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, POOL_SIZE)
    .map((u) => ({ username: u.username, avatarUrl: u.avatarUrl, count: u.value }));

  const rockstars = chRows
    .filter((r) => r[chIsRockstar])
    .map((r) => ({
      username: String(r[chUsername]),
      avatarUrl: buildAvatarUrl(String(r[chUsername]), r[chAvatarId] ?? null),
      count: Number(r[chSolveCount]),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, POOL_SIZE);

  const grandBuilders = chRows
    .filter((r) => r[chIsGrandBuilder])
    .map((r) => ({
      username: String(r[chUsername]),
      avatarUrl: buildAvatarUrl(String(r[chUsername]), r[chAvatarId] ?? null),
      count: Number(r[chChallengesCreated]),
    }));

  const builders = chRows
    .filter((r) => r[chIsChallengeBuilder] && !r[chIsGrandBuilder] && !r[chIsRockstar])
    .sort((a, b) => Number(b[chChallengesCreated]) - Number(a[chChallengesCreated]))
    .slice(0, POOL_SIZE)
    .map((r) => ({
      username: String(r[chUsername]),
      avatarUrl: buildAvatarUrl(String(r[chUsername]), r[chAvatarId] ?? null),
      count: Number(r[chChallengesCreated]),
    }));

  const sections = [
    { id: "top-contributors",         title: "Top Contributors",         users: topByCol(cRows,  cUsername, cTopics,        cAvatarId,  TOP_N) },
    { id: "challenge-rockstars",      title: "Challenge Rockstars",      users: rockstars },
    { id: "challenge-grand-builders", title: "Challenge Grand Builders", users: grandBuilders },
    { id: "top-challenge-solvers",    title: "Top Challenge Solvers",    users: solvers },
    { id: "challenge-builders",       title: "Challenge Builders",       users: builders },
    { id: "most-liked",               title: "Most Liked",               users: topByCol(cRows,  cUsername, cLikesReceived, cAvatarId,  TOP_N) },
    { id: "most-replies",             title: "Most Replies",             users: topByCol(cRows,  cUsername, cReplies,       cAvatarId,  TOP_N) },
    { id: "most-supportive",          title: "Most Supportive",          users: topByCol(cRows,  cUsername, cLikesGiven,    cAvatarId,  TOP_N) },
  ].filter((s) => s.users.length > 0);

  for (const s of sections) {
    console.log(`  ${s.title}: ${s.users.length} users`);
  }

  const payload = JSON.stringify({ lastUpdated: new Date().toISOString(), sections }, null, 2) + "\n";

  const existing = existsSync(OUT_PATH) ? readFileSync(OUT_PATH, "utf-8") : "";
  const existingParsed = existing ? JSON.parse(existing) : {};
  if (JSON.stringify(existingParsed.sections) !== JSON.stringify(sections)) {
    writeFileSync(OUT_PATH, payload);
    console.log("  Updated community-leaders.json");
  } else {
    console.log("  No change to community-leaders.json");
  }
}

main().catch((err) => {
  console.error(`  Error: ${err.message}`);
  process.exit(1);
});
