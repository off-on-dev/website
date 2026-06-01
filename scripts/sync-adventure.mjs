#!/usr/bin/env node

/**
 * Fetches adventure YAML files from the challenges repo and produces a
 * website-compatible adventure.yaml, discussion JSON stubs, and regenerated TS.
 *
 * Environment variables:
 *   ADVENTURE_URL  - GitHub URL of the adventure folder in the challenges repo
 *                    e.g. https://github.com/off-on-dev/open-source-challenges/tree/main/adventures/05-lex-imperfecta
 *
 * Outputs to /tmp/:
 *   adventure-slug   - slug of the created/updated adventure
 *   adventure-name   - display name
 *   adventure-levels - comma-separated level ids
 *   adventure-mode   - "create" or "update"
 */

import { exec } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { LEVEL_DIFFICULTY_BY_ID, LEVEL_DIFFICULTY_BY_EMOJI, LEVEL_ORDER } from "./lib/level-constants.mjs";

const execAsync = promisify(exec);

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const ADVENTURES_DIR = resolve(ROOT, "src/data/adventures");

const VERIFICATION_STUB = {
  command: "./verify.sh",
  description:
    "Once you think you've solved the challenge, run the verification script. " +
    "If it fails it will tell you which checks didn't pass. " +
    "If it passes, it generates a Certificate of Completion you can paste into the discussion.",
};


function fail(msg) {
  console.error(`\x1b[31mError:\x1b[0m ${msg}`);
  process.exit(1);
}

function currentMonth() {
  const d = new Date();
  return d.toLocaleString("en-GB", { month: "short" }).toUpperCase() + " " + d.getFullYear();
}

function parseAdventureUrl(url) {
  const m = url.match(/github\.com\/([^/]+\/[^/]+)\/(?:tree|blob)\/[^/]+\/(.+)/);
  if (!m) fail(`Cannot parse GitHub URL: ${url}`);
  return { repo: m[1], path: m[2].replace(/\/$/, "") };
}

function deriveSlug(folderName) {
  return folderName.replace(/^\d+-/, "");
}

async function ghApi(endpoint) {
  try {
    const { stdout } = await execAsync(`gh api "${endpoint}"`, { encoding: "utf8" });
    return JSON.parse(stdout);
  } catch (err) {
    console.warn(`  gh api ${endpoint} failed: ${err.stderr?.trim() || err.message}`);
    return null;
  }
}

async function fetchYaml(repo, filePath) {
  const data = await ghApi(`repos/${repo}/contents/${filePath}`);
  if (!data?.content) return null;
  return parseYaml(Buffer.from(data.content, "base64").toString("utf8"));
}

async function listDir(repo, dirPath) {
  const data = await ghApi(`repos/${repo}/contents/${dirPath}`);
  return Array.isArray(data) ? data.map((f) => f.name) : [];
}

function deriveTopics(adventureTags) {
  // Use all adventure tags as starting point; reviewer refines to level-specific subset.
  return adventureTags;
}

// Strip backticks inside markdown link text: [`foo`](url) → [foo](url).
// Inline <code> chips inside a link break the underline visually and add no
// value once the text is already styled as a link. Applied recursively to all
// string fields on sync.
function stripCodeInLinks(s) {
  return s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => `[${text.replace(/`/g, "")}](${url})`);
}

function transformStrings(value, fn) {
  if (typeof value === "string") return fn(value);
  if (Array.isArray(value)) return value.map((v) => transformStrings(v, fn));
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = transformStrings(v, fn);
    return out;
  }
  return value;
}

function buildLevel(raw, adventureTags) {
  // architecture_diagram is dropped on sync. Diagram SVGs live in src/assets/diagrams/
  // and must be added manually in the PR if a level needs one.
  const { architecture_diagram: _ignored, ...rest } = raw;
  const cleaned = transformStrings(rest, stripCodeInLinks);
  return {
    ...cleaned,
    topics: cleaned.topics || deriveTopics(adventureTags),
    verification: cleaned.verification || VERIFICATION_STUB,
  };
}

/**
 * Merges existing website levels with freshly fetched upstream levels.
 *
 * @param {object[]} existing   - Levels currently in adventure.yaml (may include manual edits).
 * @param {object[]} incoming   - Levels after buildLevel processing (from challenges repo).
 * @param {object[]} rawFetched - Raw YAML from the challenges repo before buildLevel runs.
 *                                Used to distinguish fields explicitly set upstream from defaults
 *                                injected by buildLevel, so manual edits are only preserved when
 *                                the upstream did not intentionally change the field.
 */
function mergeLevels(existing, incoming, rawFetched) {
  const levelMap = Object.fromEntries((existing || []).map((l) => [l.level, l]));
  const rawMap = Object.fromEntries((rawFetched || []).map((l) => [l.level, l]));

  for (const l of incoming) {
    const prev = levelMap[l.level];
    const raw = rawMap[l.level];

    levelMap[l.level] = {
      ...l,
      // discussion_url is set after Discourse threads are created and is never present in the
      // challenges repo. Preserve it so a re-sync does not wipe the community thread URL.
      // Check both field names (discussion_url and its alias community_url) before deciding.
      ...(prev?.discussion_url && !(raw?.discussion_url || raw?.community_url) && {
        discussion_url: prev.discussion_url,
      }),
      // architecture_diagram is stripped from incoming by buildLevel because the SVG file must
      // be added manually to src/assets/diagrams/. Preserve it once it has been set.
      ...(prev?.architecture_diagram && { architecture_diagram: prev.architecture_diagram }),
      // topics: when the challenges repo sets them explicitly, use the upstream value so
      // intentional upstream changes come through. When the upstream did not set them (buildLevel
      // derived them from adventure tags), preserve any manual refinements from the website.
      ...(!raw?.topics && prev?.topics && { topics: prev.topics }),
    };
  }

  return Object.values(levelMap).sort(
    (a, b) => (LEVEL_ORDER[a.level] ?? 99) - (LEVEL_ORDER[b.level] ?? 99)
  );
}

async function main() {
  const url = process.env.ADVENTURE_URL;
  if (!url) fail("ADVENTURE_URL environment variable is required");

  const levelsToSync = (process.env.LEVELS_TO_SYNC || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const { repo, path: adventurePath } = parseAdventureUrl(url);
  const folderName = adventurePath.split("/").pop();
  const slug = deriveSlug(folderName);

  const syncLabel = levelsToSync.length > 0 ? ` (levels: ${levelsToSync.join(", ")})` : " (all levels)";
  console.log(`Syncing: ${repo}/${adventurePath} → ${slug}${syncLabel}`);

  // Fetch index.yaml and docs directory listing in parallel.
  const [indexData, docsFiles] = await Promise.all([
    fetchYaml(repo, `${adventurePath}/docs/index.yaml`),
    listDir(repo, `${adventurePath}/docs`),
  ]);
  if (!indexData) fail(`docs/index.yaml not found at ${adventurePath}/docs/`);

  const adventureTags = indexData.tags || [];

  const levelFileNames = docsFiles.filter((f) => f.endsWith(".yaml") && f !== "index.yaml").sort();
  if (levelFileNames.length === 0) fail("No level YAML files found in docs/");

  // Fetch all level YAMLs in parallel.
  const levelResults = await Promise.all(
    levelFileNames.map((fileName) => fetchYaml(repo, `${adventurePath}/docs/${fileName}`))
  );
  const allFetchedLevels = [];
  const rawFetchedLevels = [];
  for (let i = 0; i < levelFileNames.length; i++) {
    const raw = levelResults[i];
    if (raw) {
      rawFetchedLevels.push(raw);
      allFetchedLevels.push(buildLevel(raw, adventureTags));
      console.log(`  Fetched level: ${levelFileNames[i]}`);
    }
  }

  // Track levels that were requested but don't exist in the challenges repo yet.
  // These become "coming soon" placeholders on the website via upcoming_levels.
  // They'll auto-promote to live the next time the sync runs and finds the YAML.
  const fetchedIds = new Set(allFetchedLevels.map((l) => l.level));
  const missingFromUpstream = levelsToSync.filter((id) => !fetchedIds.has(id));
  if (missingFromUpstream.length > 0) {
    console.log(`  Not in challenges repo yet (will appear as "coming soon"): ${missingFromUpstream.join(", ")}`);
  }

  const adventureDir = resolve(ADVENTURES_DIR, slug);
  const yamlPath = resolve(adventureDir, "adventure.yaml");
  const existing = existsSync(yamlPath) ? parseYaml(readFileSync(yamlPath, "utf8")) : null;
  const mode = existing ? "update" : "create";
  console.log(`Mode: ${mode}`);

  // Levels already live in the adventure — never demoted regardless of levelsToSync.
  const existingLiveIds = new Set((existing?.levels || []).map((l) => l.level));

  // Active = already live OR explicitly in levelsToSync (or all if levelsToSync is empty).
  const activeLevels = allFetchedLevels.filter((l) => {
    if (levelsToSync.length === 0) return true;
    return existingLiveIds.has(l.level) || levelsToSync.includes(l.level);
  });

  const activeLevelIds = new Set(activeLevels.map((l) => l.level));

  // Upcoming = (a) levels fetched from challenges repo but not yet promoted to live,
  // plus (b) levels the user requested that don't exist upstream yet. Both render as
  // "coming soon" placeholders via OtherLevelsCard on the website.
  const upcomingFromUpstream = allFetchedLevels
    .filter((l) => !existingLiveIds.has(l.level) && !activeLevelIds.has(l.level))
    .map((l) => ({
      level: l.level,
      name: l.name || l.title,
      difficulty: l.difficulty || LEVEL_DIFFICULTY_BY_EMOJI[l.emoji] || LEVEL_DIFFICULTY_BY_ID[l.level],
    }));

  const upcomingPlaceholders = missingFromUpstream
    .filter((id) => !existingLiveIds.has(id))
    .map((id) => ({
      level: id,
      name: LEVEL_DIFFICULTY_BY_ID[id] || id,
      difficulty: LEVEL_DIFFICULTY_BY_ID[id] || id,
    }));

  // Dedupe by level id (upstream entry wins) and sort by canonical level order.
  const upcomingById = new Map();
  for (const u of [...upcomingPlaceholders, ...upcomingFromUpstream]) {
    upcomingById.set(u.level, u);
  }
  const upcomingLevels = [...upcomingById.values()]
    .sort((a, b) => (LEVEL_ORDER[a.level] ?? 99) - (LEVEL_ORDER[b.level] ?? 99))
    .map(({ name, difficulty }) => ({ name, difficulty }));

  if (upcomingLevels.length > 0) {
    console.log(`  Upcoming (not live yet): ${upcomingLevels.map((u) => u.difficulty).join(", ")}`);
  }

  // Build the combined adventure object using challenges repo field names.
  // The generator accepts all aliases (name/title, emoji → icon, etc.).
  const adventure = {
    slug,
    // Use whichever title field the challenges repo provides
    ...(indexData.title ? { title: indexData.title } : { name: indexData.name }),
    emoji: indexData.emoji,
    // Preserve month if a previous PR already set it
    month: existing?.month || currentMonth(),
    tags: adventureTags,
    ...(indexData.backstory?.length && { backstory: transformStrings(indexData.backstory, stripCodeInLinks) }),
    ...(indexData.overview?.length && { overview: transformStrings(indexData.overview, stripCodeInLinks) }),
    ...(indexData.rewards && { rewards: indexData.rewards }),
    // Preserve contributor set by a reviewer; omit otherwise (PR checklist item)
    ...(existing?.contributor && { contributor: existing.contributor }),
    // Preserve community_category_id once a reviewer has set it; otherwise generator emits a TODO stub.
    ...(existing?.community_category_id !== undefined && { community_category_id: existing.community_category_id }),
    ...(upcomingLevels.length > 0 && { upcoming_levels: upcomingLevels }),
    levels: mergeLevels(existing?.levels, activeLevels, rawFetchedLevels),
  };

  mkdirSync(adventureDir, { recursive: true });
  writeFileSync(yamlPath, stringifyYaml(adventure, { lineWidth: 120, indent: 2 }));
  console.log(`Written: src/data/adventures/${slug}/adventure.yaml`);

  // Create discussion JSON stubs for newly active levels only.
  for (const level of activeLevels) {
    const stubPath = resolve(adventureDir, `${level.level}-posts.json`);
    if (!existsSync(stubPath)) {
      writeFileSync(
        stubPath,
        JSON.stringify({ discussionUrl: "", discussionPosts: [], totalReplies: 0 }, null, 2) + "\n"
      );
      console.log(`  Created stub: ${level.level}-posts.json`);
    }
  }

  const adventureName = indexData.title || indexData.name || slug;
  // Report only the newly promoted levels so the PR title and checklist are accurate.
  const newLevelIds = activeLevels
    .filter((l) => !existingLiveIds.has(l.level))
    .map((l) => l.level)
    .join(",") || activeLevels.map((l) => l.level).join(",");

  writeFileSync("/tmp/adventure-slug", slug);
  writeFileSync("/tmp/adventure-name", adventureName);
  writeFileSync("/tmp/adventure-levels", newLevelIds);
  writeFileSync("/tmp/adventure-mode", mode);

  console.log(`\nDone: ${adventureName} (live: ${activeLevels.map((l) => l.level).join(", ")}${upcomingLevels.length > 0 ? ` | upcoming: ${upcomingLevels.map((u) => u.difficulty).join(", ")}` : ""})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
