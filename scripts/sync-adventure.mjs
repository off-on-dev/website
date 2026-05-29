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

import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

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

const LEVEL_ORDER = { beginner: 0, intermediate: 1, expert: 2 };

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

function ghApi(endpoint) {
  try {
    return JSON.parse(
      execSync(`gh api "${endpoint}"`, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] })
    );
  } catch {
    return null;
  }
}

function fetchYaml(repo, filePath) {
  const data = ghApi(`repos/${repo}/contents/${filePath}`);
  if (!data?.content) return null;
  return parseYaml(Buffer.from(data.content, "base64").toString("utf8"));
}

function listDir(repo, dirPath) {
  const data = ghApi(`repos/${repo}/contents/${dirPath}`);
  return Array.isArray(data) ? data.map((f) => f.name) : [];
}

function deriveTopics(adventureTags) {
  // Use all adventure tags as starting point; reviewer refines to level-specific subset.
  return adventureTags;
}

function buildLevel(raw, adventureTags) {
  return {
    ...raw,
    topics: raw.topics || deriveTopics(adventureTags),
    verification: raw.verification || VERIFICATION_STUB,
  };
}

function mergeLevels(existing, incoming) {
  const map = Object.fromEntries((existing || []).map((l) => [l.level, l]));
  for (const l of incoming) map[l.level] = l;
  return Object.values(map).sort(
    (a, b) => (LEVEL_ORDER[a.level] ?? 99) - (LEVEL_ORDER[b.level] ?? 99)
  );
}

function main() {
  const url = process.env.ADVENTURE_URL;
  if (!url) fail("ADVENTURE_URL environment variable is required");

  const { repo, path: adventurePath } = parseAdventureUrl(url);
  const folderName = adventurePath.split("/").pop();
  const slug = deriveSlug(folderName);

  console.log(`Syncing: ${repo}/${adventurePath} → ${slug}`);

  const indexData = fetchYaml(repo, `${adventurePath}/docs/index.yaml`);
  if (!indexData) fail(`docs/index.yaml not found at ${adventurePath}/docs/`);

  const adventureTags = indexData.tags || [];

  const docsFiles = listDir(repo, `${adventurePath}/docs`);
  const levelFileNames = docsFiles.filter((f) => f.endsWith(".yaml") && f !== "index.yaml").sort();
  if (levelFileNames.length === 0) fail("No level YAML files found in docs/");

  const incomingLevels = [];
  for (const fileName of levelFileNames) {
    const raw = fetchYaml(repo, `${adventurePath}/docs/${fileName}`);
    if (raw) {
      incomingLevels.push(buildLevel(raw, adventureTags));
      console.log(`  Fetched level: ${fileName}`);
    }
  }

  const adventureDir = resolve(ADVENTURES_DIR, slug);
  const yamlPath = resolve(adventureDir, "adventure.yaml");
  const existing = existsSync(yamlPath) ? parseYaml(readFileSync(yamlPath, "utf8")) : null;
  const mode = existing ? "update" : "create";
  console.log(`Mode: ${mode}`);

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
    ...(indexData.backstory?.length && { backstory: indexData.backstory }),
    ...(indexData.overview?.length && { overview: indexData.overview }),
    ...(indexData.rewards && { rewards: indexData.rewards }),
    // Preserve contributor set by a reviewer; omit otherwise (PR checklist item)
    ...(existing?.contributor && { contributor: existing.contributor }),
    levels: mergeLevels(existing?.levels, incomingLevels),
  };

  mkdirSync(adventureDir, { recursive: true });
  writeFileSync(yamlPath, stringifyYaml(adventure, { lineWidth: 120, indent: 2 }));
  console.log(`Written: src/data/adventures/${slug}/adventure.yaml`);

  // Create discussion JSON stubs for new levels only
  for (const level of incomingLevels) {
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
  const levelIds = incomingLevels.map((l) => l.level).join(",");

  writeFileSync("/tmp/adventure-slug", slug);
  writeFileSync("/tmp/adventure-name", adventureName);
  writeFileSync("/tmp/adventure-levels", levelIds);
  writeFileSync("/tmp/adventure-mode", mode);

  console.log(`\nDone: ${adventureName} (${levelIds})`);
}

main();
