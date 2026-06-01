#!/usr/bin/env node

/**
 * Fetch adventure leaderboard data from the Discourse Data Explorer.
 *
 * Requires a Discourse API key with admin access. Set via environment variables
 * or a local .env file (never commit the .env file).
 *
 * Usage:
 *   node scripts/refresh-leaderboard.mjs
 *
 * Environment variables:
 *   DISCOURSE_API_KEY      - Discourse admin API key
 *   DISCOURSE_API_USERNAME - Discourse username the key belongs to (often "system")
 *
 * Writes per-adventure leaderboard data to:
 *   src/data/adventures/<adventure-id>/leaderboard.json
 *
 * NOTE: community.offon.dev is the actual Discourse server URL used for API calls.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const ADVENTURES_DIR = resolve(ROOT, "src/data/adventures");
const COMMUNITY_BASE = "https://community.offon.dev";
const QUERY_ID = 5;

// Maps adventure ID -> Discourse category ID and which difficulty levels are active.
// Generated from src/data/adventures/<id>/adventure.yaml by scripts/generate-adventures.mjs.
// Do not edit the GENERATED block by hand — change adventure.yaml instead.
// Category IDs are from: GET https://community.offon.dev/categories.json
const ADVENTURE_CATEGORIES = {
  // GENERATED:adventures
  "blind-by-design":      { categoryId: 41, has_beginner: true, has_intermediate: true, has_expert: true, has_single: false },
  "the-ai-observatory":   { categoryId: 37, has_beginner: true, has_intermediate: true, has_expert: true, has_single: false },
  "building-cloudhaven":  { categoryId: 36, has_beginner: true, has_intermediate: true, has_expert: true, has_single: false },
  "echoes-lost-in-orbit": { categoryId: 35, has_beginner: true, has_intermediate: true, has_expert: true, has_single: false },
  // /GENERATED:adventures
};

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

function resolveAvatarUrl(url) {
  if (!url) return undefined;
  const absolute = url.startsWith("http") ? url : `${COMMUNITY_BASE}${url}`;
  return absolute.replace("/user_avatar/community.open-ecosystem.com/", "/user_avatar/community.offon.dev/");
}

async function fetchLeaderboard(adventureId, { categoryId, has_beginner, has_intermediate, has_expert, has_single }, apiKey, apiUsername) {
  const url = `${COMMUNITY_BASE}/admin/plugins/discourse-data-explorer/queries/${QUERY_ID}/run`;
  const body = new URLSearchParams({
    "params[category_id]":     String(categoryId),
    "params[has_beginner]":    String(has_beginner),
    "params[has_intermediate]": String(has_intermediate),
    "params[has_expert]":      String(has_expert),
    "params[has_single]":      String(has_single),
  });

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
    throw new Error(`HTTP ${res.status} for ${adventureId}`);
  }

  const data = await res.json();

  if (!data.success) {
    throw new Error(`Query failed for ${adventureId}: ${JSON.stringify(data.errors)}`);
  }

  const columns = data.columns;
  const col = (name) => columns.indexOf(name);

  const usernameIdx        = col("username");
  const avatarIdx          = col("avatar_url");
  const totalPointsIdx     = col("total_points");
  const solvedIdx          = col("challenges_solved");
  const beginnerPtsIdx     = col("beginner_points");
  const intermediatePtsIdx = col("intermediate_points");
  const expertPtsIdx       = col("expert_points");
  const singlePtsIdx       = col("single_points");
  const breakdownIdx       = col("breakdown");

  if (usernameIdx === -1 || totalPointsIdx === -1) {
    throw new Error(`Unexpected columns for ${adventureId}: ${columns.join(", ")}`);
  }

  const unsorted = (data.rows ?? []).map((row) => ({
    username:           row[usernameIdx],
    avatarUrl:          avatarIdx !== -1          ? resolveAvatarUrl(row[avatarIdx]) : undefined,
    points:             Number(row[totalPointsIdx]),
    challengesSolved:   solvedIdx !== -1          ? Number(row[solvedIdx]) : undefined,
    beginnerPoints:     beginnerPtsIdx !== -1     ? Number(row[beginnerPtsIdx]) : undefined,
    intermediatePoints: intermediatePtsIdx !== -1 ? Number(row[intermediatePtsIdx]) : undefined,
    expertPoints:       expertPtsIdx !== -1       ? Number(row[expertPtsIdx]) : undefined,
    singlePoints:       singlePtsIdx !== -1       ? Number(row[singlePtsIdx]) : undefined,
    breakdown:          breakdownIdx !== -1       ? row[breakdownIdx] : undefined,
  }));

  unsorted.sort((a, b) => b.points - a.points);

  return unsorted.map((row, i) => ({ rank: i + 1, ...row }));
}

async function main() {
  loadDotEnv();

  const apiKey = process.env.DISCOURSE_API_KEY;
  const apiUsername = process.env.DISCOURSE_API_USERNAME ?? "system";

  if (!apiKey) {
    console.warn("  DISCOURSE_API_KEY not set, skipping leaderboard refresh.");
    console.warn("  Set it in .env (local) or as a GitHub secret (CI).");
    process.exit(0);
  }

  let changed = 0;
  let errors = 0;

  for (const [adventureId, config] of Object.entries(ADVENTURE_CATEGORIES)) {
    const activeCount = [config.has_beginner, config.has_intermediate, config.has_expert, config.has_single].filter(Boolean).length;
    const outPath = resolve(ADVENTURES_DIR, adventureId, "leaderboard.json");
    console.log(`  Fetching leaderboard: ${adventureId} (category ${config.categoryId}, ${activeCount} active levels)`);

    try {
      const rows = await fetchLeaderboard(adventureId, config, apiKey, apiUsername);
      const payload = JSON.stringify({ updatedAt: new Date().toISOString(), rows }, null, 2) + "\n";

      const existing = existsSync(outPath) ? readFileSync(outPath, "utf-8") : "";
      const existingParsed = existing ? JSON.parse(existing) : {};
      const existingRows = JSON.stringify(existingParsed.rows ?? []);

      if (existingRows !== JSON.stringify(rows)) {
        writeFileSync(outPath, payload);
        console.log(`    Updated: ${rows.length} entries`);
        changed++;
      } else {
        console.log(`    No change (${rows.length} entries)`);
      }
    } catch (err) {
      console.error(`    Error: ${err.message}`);
      errors++;
    }
  }

  console.log(`\nDone. ${changed} file(s) updated, ${errors} error(s).`);
  if (errors > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
