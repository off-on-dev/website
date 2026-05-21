/**
 * Refresh community leaders data from Discourse Data Explorer queries.
 *
 * Calls two Data Explorer queries (IDs 8 and 9) and writes the results to
 * src/data/community-leaders.json. Requires DISCOURSE_API_KEY and
 * DISCOURSE_API_USERNAME environment variables.
 *
 * Usage: DISCOURSE_API_KEY=xxx DISCOURSE_API_USERNAME=system node scripts/refresh-community-leaders.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const COMMUNITY_BASE = "https://community.open-ecosystem.com";
const OUTPUT_PATH = resolve("src/data/community-leaders.json");
const AVATAR_SIZE = 40;

const API_KEY = process.env.DISCOURSE_API_KEY;
const API_USERNAME = process.env.DISCOURSE_API_USERNAME || "system";

if (!API_KEY) {
  console.error("Error: DISCOURSE_API_KEY environment variable is required.");
  process.exit(1);
}

/**
 * Section definitions mapping Data Explorer query results to our JSON structure.
 * Each entry specifies which query ID provides the data and what the section is called.
 *
 * Adjust the queryId and columnMapping if the Data Explorer queries change.
 */
const SECTION_DEFINITIONS = [
  { id: "top-contributors", title: "Top Contributors", emoji: "🏆", queryId: 8, resultIndex: 0 },
  { id: "top-challenge-solvers", title: "Top Challenge Solvers", emoji: "🎯", queryId: 8, resultIndex: 1 },
  { id: "challenge-grand-builders", title: "Challenge Grand Builders", emoji: "🏗️", queryId: 8, resultIndex: 2 },
  { id: "challenge-builders", title: "Challenge Builders", emoji: "🔧", queryId: 8, resultIndex: 3 },
  { id: "most-liked", title: "Most Liked", emoji: "❤️", queryId: 9, resultIndex: 0 },
  { id: "most-replies", title: "Most Replies", emoji: "💬", queryId: 9, resultIndex: 1 },
  { id: "most-supportive", title: "Most Supportive", emoji: "👏", queryId: 9, resultIndex: 2 },
];

/**
 * Resolve a Discourse avatar template to a full URL at the given size.
 */
function resolveAvatarUrl(template, size) {
  if (!template) return "";
  const url = template.replace("{size}", String(size));
  if (url.startsWith("http")) return url;
  return `${COMMUNITY_BASE}${url}`;
}

/**
 * Run a Data Explorer query and return the raw JSON response.
 */
async function runQuery(queryId) {
  const url = `${COMMUNITY_BASE}/admin/plugins/explorer/queries/${queryId}/run`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Api-Key": API_KEY,
      "Api-Username": API_USERNAME,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ params: {}, limit: 10 }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Query ${queryId} failed (${res.status}): ${text}`);
  }

  return res.json();
}

/**
 * Parse a Data Explorer result set into our user array format.
 * Expects columns: username (string), avatar_template or avatar (string), count (number).
 * The column order may vary, so we detect by column name.
 */
function parseResultSet(result) {
  const columns = result.columns || [];
  const rows = result.rows || [];

  // Find column indices by name patterns
  const usernameIdx = columns.findIndex((c) =>
    /username/i.test(c) || /user_?name/i.test(c)
  );
  const avatarIdx = columns.findIndex((c) =>
    /avatar/i.test(c)
  );
  const countIdx = columns.findIndex((c) =>
    /count|total|num|score|likes|replies/i.test(c)
  );

  if (usernameIdx === -1 || countIdx === -1) {
    console.warn("Could not find username/count columns in:", columns);
    return [];
  }

  return rows.map((row) => ({
    username: String(row[usernameIdx]),
    avatarUrl: avatarIdx !== -1 ? resolveAvatarUrl(String(row[avatarIdx]), AVATAR_SIZE) : "",
    count: Number(row[countIdx]) || 0,
  }));
}

/**
 * Some Data Explorer queries return multiple result sets as a single query
 * with a UNION or separate statements. If the query returns a single flat result,
 * we need to split by a grouping column. This function handles both cases.
 *
 * Strategy:
 * 1. If the response has a `result_sets` array, use each set directly.
 * 2. If it has a single `rows`/`columns`, check for a "section" or "category" column
 *    and split by that. Otherwise treat it as a single result set.
 */
function extractResultSets(response) {
  // Some Discourse setups return result_sets
  if (response.result_sets && Array.isArray(response.result_sets)) {
    return response.result_sets;
  }

  const columns = response.columns || [];
  const rows = response.rows || [];

  // Check for a grouping column
  const groupIdx = columns.findIndex((c) =>
    /section|category|group|type/i.test(c)
  );

  if (groupIdx !== -1) {
    // Split rows by the grouping column value
    const groups = new Map();
    for (const row of rows) {
      const key = String(row[groupIdx]);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(row);
    }
    // Filter out the grouping column from each result set
    const filteredColumns = columns.filter((_, i) => i !== groupIdx);
    return Array.from(groups.values()).map((groupRows) => ({
      columns: filteredColumns,
      rows: groupRows.map((r) => r.filter((_, i) => i !== groupIdx)),
    }));
  }

  // Single result set
  return [{ columns, rows }];
}

async function main() {
  console.log("Fetching community leaders from Data Explorer queries 8 and 9...");

  const [response8, response9] = await Promise.all([
    runQuery(8),
    runQuery(9),
  ]);

  const resultSets8 = extractResultSets(response8);
  const resultSets9 = extractResultSets(response9);

  const allResultSets = { 8: resultSets8, 9: resultSets9 };

  const sections = [];
  for (const def of SECTION_DEFINITIONS) {
    const sets = allResultSets[def.queryId] || [];
    const resultSet = sets[def.resultIndex];

    if (!resultSet) {
      console.warn(`No result set at index ${def.resultIndex} for query ${def.queryId} (${def.title})`);
      sections.push({ id: def.id, title: def.title, emoji: def.emoji, users: [] });
      continue;
    }

    const users = parseResultSet(resultSet);
    sections.push({ id: def.id, title: def.title, emoji: def.emoji, users });
    console.log(`  ${def.emoji} ${def.title}: ${users.length} users`);
  }

  const output = {
    lastUpdated: new Date().toISOString(),
    sections,
  };

  const newJson = JSON.stringify(output, null, 2) + "\n";
  let oldJson = "";
  try {
    oldJson = readFileSync(OUTPUT_PATH, "utf-8");
  } catch {
    // File doesn't exist yet
  }

  if (newJson !== oldJson) {
    writeFileSync(OUTPUT_PATH, newJson);
    console.log("Updated community-leaders.json");
  } else {
    console.log("No changes to community-leaders.json");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
