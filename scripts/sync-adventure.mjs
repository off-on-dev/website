#!/usr/bin/env node

/**
 * Fetches adventure YAML files from the challenges repo and produces a
 * website-compatible adventure.yaml, discussion JSON stubs, and routes in e2e/routes.ts.
 * The leaderboard registry (refresh-leaderboard.mjs) derives from adventure.yaml at
 * runtime via buildAdventureCategories() and requires no manual update.
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
import { LEVEL_ORDER } from "../src/lib/level-constants.mjs";
import { parseDeadline } from "../src/lib/deadline.mjs";
import { atomicWrite } from "./discourse-utils.mjs";

// This script writes its output back into adventure.yaml, so an unparseable
// timezone must leave the author's original text alone rather than replace it
// with the sentinel. The build still gates on it when it parses the file.
const PRESERVE_TZ = { onUnknownTimezone: "preserve" };
import {
  findMissingUpstreamLevels,
  selectActiveLevels,
  computeUpcomingLevels,
} from "./lib/level-sync.mjs";
import { escapeTsString, escapeRegExp, upsertRoutesBlock } from "./lib/sync-codegen.mjs";

const execAsync = promisify(exec);

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const ADVENTURES_DIR = resolve(ROOT, "src/data/adventures");
const ADVENTURE_ICONS_PATH = resolve(ROOT, "src/lib/adventure-icons.ts");
const LUCIDE_ICONS_PATH = resolve(ROOT, "src/lib/lucide-icons.ts");

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

export function currentMonth() {
  const ABBR = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  const d = new Date();
  return ABBR[d.getUTCMonth()] + " " + d.getUTCFullYear();
}

function parseAdventureUrl(url) {
  const m = url.match(/github\.com\/([^/]+\/[^/]+)\/(?:tree|blob)\/([^/]+)\/(.+)/);
  if (!m) fail(`Cannot parse GitHub URL: ${url}`);
  return { repo: m[1], ref: m[2], path: m[3].replace(/\/$/, "") };
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

async function fetchYaml(repo, filePath, ref) {
  const data = await ghApi(`repos/${repo}/contents/${filePath}?ref=${encodeURIComponent(ref)}`);
  if (!data?.content) return null;
  return parseYaml(Buffer.from(data.content, "base64").toString("utf8"));
}

async function listDir(repo, dirPath, ref) {
  const data = await ghApi(`repos/${repo}/contents/${dirPath}?ref=${encodeURIComponent(ref)}`);
  return Array.isArray(data) ? data.map((f) => f.name) : [];
}

async function fetchBinaryFile(repo, filePath, ref) {
  const data = await ghApi(`repos/${repo}/contents/${filePath}?ref=${encodeURIComponent(ref)}`);
  if (!data?.content) return null;
  return Buffer.from(data.content, "base64");
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

// Minimal markdown stripper for plain-text meta descriptions (links, bold, italic, code).
function stripMarkdown(s) {
  return s
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateAtWord(s, max) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 3).replace(/\s+\S*$/, "");
  return cut + "...";
}

// Prefer the most technical source: first level summary > overview > backstory.
// Reviewers should refine this to cover all levels for multi-level adventures.
function buildAdventureMetaDescription(indexData, activeLevels) {
  const firstSummary = activeLevels?.[0]?.summary;
  if (firstSummary) {
    const plain = stripMarkdown(firstSummary);
    if (plain.length <= 160) return plain;
    return truncateAtWord(plain, 160);
  }
  const overviewFirst = Array.isArray(indexData.overview) ? indexData.overview[0] : "";
  if (overviewFirst) {
    const plain = stripMarkdown(overviewFirst);
    if (plain.length <= 160) return plain;
    return truncateAtWord(plain, 160);
  }
  const name = indexData.title || indexData.name || "";
  const backstoryFirst = Array.isArray(indexData.backstory) ? indexData.backstory[0] || "" : "";
  const full = stripMarkdown(`${name}: ${backstoryFirst}`);
  return truncateAtWord(full, 160);
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

// --- Lucide icon auto-registration ---
// Reads and patches adventure-icons.ts + lucide-icons.ts so new icons from the
// challenges repo are committed alongside the adventure YAML in the same PR.

function iconNameToKebab(pascal) {
  return pascal
    .replace(/([A-Z])/g, (c, _, i) => (i > 0 ? "-" : "") + c.toLowerCase())
    .replace(/([a-z])(\d)/g, "$1-$2");
}

function ensureIconRegistered(iconName, emoji) {
  const kebab = iconNameToKebab(iconName);

  const lucideSet = JSON.parse(readFileSync(resolve(ROOT, "node_modules/@iconify-json/lucide/icons.json"), "utf8"));
  if (!lucideSet.icons[kebab]) {
    fail(`Lucide icon "${kebab}" not found in @iconify-json/lucide. Check https://lucide.dev/icons/ and correct the icon name in docs/index.yaml.`);
  }

  let ai = readFileSync(ADVENTURE_ICONS_PATH, "utf8");
  let li = readFileSync(LUCIDE_ICONS_PATH, "utf8");
  let changed = false;

  if (!ai.includes(`"${iconName}"`)) {
    ai = addToTypeUnion(ai, iconName);
    ai = addToIconToKebab(ai, iconName, kebab);
    li = addIconImport(li, iconName, kebab);
    li = addToLucideIconsMap(li, iconName, kebab);
    changed = true;
    console.log(`  Registered Lucide icon: ${iconName} (${kebab})`);
  }

  if (emoji && !ai.includes(`"${emoji}": `)) {
    ai = addToEmojiToIcon(ai, emoji, iconName);
    changed = true;
    console.log(`  Added emoji mapping: ${emoji} → ${iconName}`);
  }

  if (changed) {
    writeFileSync(ADVENTURE_ICONS_PATH, ai);
    writeFileSync(LUCIDE_ICONS_PATH, li);
  }
}

function addToTypeUnion(content, iconName) {
  const re = /(export type AdventureIconName =\n)((?: {2}\| "[^"]+"\n)* {2}\| "[^"]+";)/;
  const m = content.match(re);
  if (!m) throw new Error("Cannot locate AdventureIconName union in adventure-icons.ts");
  const existing = [...m[2].matchAll(/\| "([^"]+)"/g)].map((x) => x[1]);
  if (existing.includes(iconName)) return content;
  const sorted = [...existing, iconName].sort();
  const block = sorted.map((n, i) => `  | "${n}"${i === sorted.length - 1 ? ";" : ""}`).join("\n");
  return content.replace(re, m[1] + block);
}

function addToEmojiToIcon(content, emoji, iconName) {
  const re = /(export const EMOJI_TO_ICON = \{)([\s\S]*?)(\} satisfies Record<string, AdventureIconName>;)/;
  const m = content.match(re);
  if (!m) throw new Error("Cannot locate EMOJI_TO_ICON in adventure-icons.ts");
  if (m[2].includes(`"${emoji}"`)) return content;
  const entries = [...m[2].matchAll(/"([^"]+)":\s*"([^"]+)"/g)].map((x) => ({ emoji: x[1], icon: x[2] }));
  entries.push({ emoji, icon: iconName });
  entries.sort((a, b) => a.icon.localeCompare(b.icon));
  const block = "\n" + entries.map((e) => `  "${e.emoji}": "${e.icon}",`).join("\n") + "\n";
  return content.replace(re, m[1] + block + m[3]);
}

function addToIconToKebab(content, iconName, kebab) {
  const re = /(export const ICON_TO_KEBAB: Record<AdventureIconName, string> = \{)([\s\S]*?)(\};)/;
  const m = content.match(re);
  if (!m) throw new Error("Cannot locate ICON_TO_KEBAB in adventure-icons.ts");
  if (m[2].includes(`${iconName}:`)) return content;
  const entries = [...m[2].matchAll(/(\w+):\s*"([^"]+)"/g)].map((x) => ({ name: x[1], kebab: x[2] }));
  entries.push({ name: iconName, kebab });
  entries.sort((a, b) => a.name.localeCompare(b.name));
  const block = "\n" + entries.map((e) => `  ${e.name}: "${e.kebab}",`).join("\n") + "\n";
  return content.replace(re, m[1] + block + m[3]);
}

function addIconImport(content, iconName, kebab) {
  const line = `import Icon${iconName} from "~icons/lucide/${kebab}";`;
  if (content.includes(line)) return content;
  const re = /import Icon(\w+) from "~icons\/lucide\/[^"]+";/g;
  const matches = [...content.matchAll(re)];
  const after = matches.find((x) => x[1] > iconName);
  if (after) return content.slice(0, after.index) + line + "\n" + content.slice(after.index);
  const last = matches[matches.length - 1];
  const pos = last.index + last[0].length;
  return content.slice(0, pos) + "\n" + line + content.slice(pos);
}

function addToLucideIconsMap(content, iconName, kebab) {
  const re = /(export const LUCIDE_ICONS: Record<string, LucideIcon \| undefined> = \{)([\s\S]*?)(\};)/;
  const m = content.match(re);
  if (!m) throw new Error("Cannot locate LUCIDE_ICONS map in lucide-icons.ts");
  const needsQuotes = /[^a-z0-9]/.test(kebab);
  const key = needsQuotes ? `"${kebab}"` : kebab;
  if (m[2].includes(key + ":")) return content;
  const entryRe = / {2}(?:"([^"]+)"|([a-z][a-z0-9]*)):\s*Icon\w+,/g;
  const entries = [...m[2].matchAll(entryRe)].map((x) => ({ key: x[1] || x[2], raw: x[0].trim() }));
  entries.push({ key: kebab, raw: `${key}: Icon${iconName},` });
  entries.sort((a, b) => a.key.localeCompare(b.key));
  const block = "\n" + entries.map((e) => `  ${e.raw}`).join("\n") + "\n";
  return content.replace(re, m[1] + block + m[3]);
}

function buildLevel(raw, adventureTags, rewardsDeadline) {
  // architecture_diagram is stripped here. After all levels are fetched, the sync attempts
  // to pull the SVG from docs/diagrams/ in the challenges repo and re-adds the field if
  // successful. If not found there, it must be added manually to src/assets/diagrams/.
  const { architecture_diagram: _ignored, ...rest } = raw;
  const cleaned = transformStrings(rest, stripCodeInLinks);
  return {
    ...cleaned,
    ...(cleaned.deadline && { deadline: parseDeadline(cleaned.deadline, PRESERVE_TZ) }),
    topics: cleaned.topics || deriveTopics(adventureTags),
    verification: cleaned.verification || VERIFICATION_STUB,
    // Fall back to the adventure-level rewards deadline when the level has no deadline of its own,
    // so the compact RewardsCard on ChallengeDetail always has a deadline to display.
    ...(rewardsDeadline && !cleaned.deadline && { deadline: parseDeadline(rewardsDeadline, PRESERVE_TZ) }),
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
      // Preserve the discussion URL set by the add-discussion-url workflow.
      // The challenges repo never sets these — check both field aliases so that
      // adventures using community_url are handled the same as the older discussion_url.
      ...(prev?.community_url && !raw?.community_url && { community_url: prev.community_url }),
      ...(prev?.discussion_url && !raw?.discussion_url && { discussion_url: prev.discussion_url }),
      // architecture_diagram: use the value re-added by the SVG auto-fetch when present;
      // otherwise preserve any value that was manually set in a previous PR.
      ...(!l.architecture_diagram && prev?.architecture_diagram && { architecture_diagram: prev.architecture_diagram }),
      // diagram_alt: upstream wins when set; preserve a manually-written value when upstream
      // does not provide one (same pattern as topics).
      ...(!raw?.diagram_alt && prev?.diagram_alt && { diagram_alt: prev.diagram_alt }),
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

  const { repo, ref, path: adventurePath } = parseAdventureUrl(url);
  const folderName = adventurePath.split("/").pop();
  const slug = deriveSlug(folderName);

  const syncLabel = levelsToSync.length > 0 ? ` (levels: ${levelsToSync.join(", ")})` : " (all levels)";
  console.log(`Syncing: ${repo}/${adventurePath} @ ${ref} → ${slug}${syncLabel}`);

  // Fetch index.yaml and docs directory listing in parallel.
  const [indexData, docsFiles] = await Promise.all([
    fetchYaml(repo, `${adventurePath}/docs/index.yaml`, ref),
    listDir(repo, `${adventurePath}/docs`, ref),
  ]);
  if (!indexData) fail(`docs/index.yaml not found at ${adventurePath}/docs/`);

  const adventureTags = indexData.tags || [];

  // Resolve the Lucide icon name. The content transform's EMOJI_TO_ICON lookup is
  // unreliable in Astro builds, so we always write `icon:` explicitly into the YAML.
  let resolvedIconName = indexData.icon || null;

  if (indexData.icon) {
    // Challenges repo specifies the icon directly — auto-register if new.
    ensureIconRegistered(indexData.icon, indexData.emoji);
  } else if (indexData.emoji) {
    // Resolve from the existing EMOJI_TO_ICON mapping in adventure-icons.ts.
    const aiContent = readFileSync(ADVENTURE_ICONS_PATH, "utf8");
    const mapped = aiContent.match(new RegExp(`"${escapeRegExp(indexData.emoji)}":\\s*"([^"]+)"`));
    if (mapped) {
      resolvedIconName = mapped[1];
      console.log(`  Resolved icon from emoji mapping: ${indexData.emoji} → ${resolvedIconName}`);
    } else {
      console.warn(`  Warning: emoji "${indexData.emoji}" has no Lucide icon mapping. Add \`icon: <LucideName>\` to docs/index.yaml in the challenges repo to auto-register it.`);
    }
  }

  const levelFileNames = docsFiles.filter((f) => f.endsWith(".yaml") && f !== "index.yaml").sort();
  if (levelFileNames.length === 0) fail("No level YAML files found in docs/");

  // Fetch all level YAMLs in parallel.
  const levelResults = await Promise.all(
    levelFileNames.map((fileName) => fetchYaml(repo, `${adventurePath}/docs/${fileName}`, ref))
  );
  const allFetchedLevels = [];
  const rawFetchedLevels = [];
  for (let i = 0; i < levelFileNames.length; i++) {
    const raw = levelResults[i];
    if (raw) {
      rawFetchedLevels.push(raw);
      allFetchedLevels.push(buildLevel(raw, adventureTags, indexData.rewards?.deadline));
      console.log(`  Fetched level: ${levelFileNames[i]}`);
    }
  }

  // Fetch architecture diagram SVGs from docs/diagrams/ in the challenges repo.
  // Any SVG found is written to src/assets/diagrams/ and architecture_diagram is
  // re-added to the level so the generator picks it up without a manual step.
  const diagramsDir = resolve(ROOT, "src/assets/diagrams");
  mkdirSync(diagramsDir, { recursive: true });
  const fetchedDiagrams = new Set();
  for (const raw of rawFetchedLevels) {
    if (!raw.architecture_diagram || fetchedDiagrams.has(raw.architecture_diagram)) continue;
    const svgContent = await fetchBinaryFile(repo, `${adventurePath}/docs/diagrams/${raw.architecture_diagram}`, ref);
    if (svgContent) {
      writeFileSync(resolve(diagramsDir, raw.architecture_diagram), svgContent);
      fetchedDiagrams.add(raw.architecture_diagram);
      console.log(`  Fetched diagram: ${raw.architecture_diagram}`);
    } else if (existsSync(resolve(diagramsDir, raw.architecture_diagram))) {
      fetchedDiagrams.add(raw.architecture_diagram);
      console.log(`  Diagram not in challenges repo — using existing local file: ${raw.architecture_diagram}`);
    } else {
      console.warn(`  Diagram not found at docs/diagrams/${raw.architecture_diagram} — add SVG manually to src/assets/diagrams/`);
    }
  }
  // Re-add architecture_diagram to levels where the SVG was successfully fetched.
  for (const level of allFetchedLevels) {
    const raw = rawFetchedLevels.find((r) => r.level === level.level);
    if (raw?.architecture_diagram && fetchedDiagrams.has(raw.architecture_diagram)) {
      level.architecture_diagram = raw.architecture_diagram;
    }
  }

  const adventureDir = resolve(ADVENTURES_DIR, slug);
  const yamlPath = resolve(adventureDir, "adventure.yaml");
  const existing = existsSync(yamlPath) ? parseYaml(readFileSync(yamlPath, "utf8")) : null;
  const mode = existing ? "update" : "create";
  console.log(`Mode: ${mode}`);

  // Levels that were requested but don't exist in the challenges repo yet.
  const fetchedIds = new Set(allFetchedLevels.map((l) => l.level));
  const missingFromUpstream = findMissingUpstreamLevels(levelsToSync, fetchedIds);
  if (missingFromUpstream.length > 0) {
    if (mode === "update") {
      fail(
        `The following levels were requested but do not exist in the challenges repo: ${missingFromUpstream.join(", ")}.\n` +
        `For an existing adventure, only levels already present upstream can be promoted. Wait until the level docs are added to the challenges repo, then re-run the sync.`
      );
    }
    // New adventure: placeholders are fine — they'll auto-promote when the YAML appears upstream.
    console.log(`  Not in challenges repo yet (will appear as "coming soon"): ${missingFromUpstream.join(", ")}`);
  }

  // Levels already live in the adventure — never demoted regardless of levelsToSync.
  const existingLiveIds = new Set((existing?.levels || []).map((l) => l.level));

  // Active = explicitly in levelsToSync (or all fetched levels if levelsToSync is empty).
  // Existing live levels not in levelsToSync are left untouched in adventure.yaml by mergeLevels,
  // so syncing one level does not overwrite the others.
  const activeLevels = selectActiveLevels(allFetchedLevels, levelsToSync);

  const activeLevelIds = new Set(activeLevels.map((l) => l.level));

  // Upcoming = (a) levels fetched from challenges repo but not yet promoted to live,
  // plus (b) levels the user requested that don't exist upstream yet, plus
  // (c) manually-preserved entries from the previous YAML. Renders as
  // "Coming Soon" placeholders via OtherLevelsCard on the website.
  const upcomingWithIds = computeUpcomingLevels({
    existing,
    allFetchedLevels,
    existingLiveIds,
    activeLevelIds,
    missingFromUpstream,
  });
  // Emit `level` so the preservation loop in computeUpcomingLevels can identify
  // these entries on the next re-sync without relying on hand-edited YAML.
  const upcomingLevels = upcomingWithIds.map(({ level, name, difficulty }) => ({ level, name, difficulty }));

  if (upcomingLevels.length > 0) {
    console.log(`  Upcoming (not live yet): ${upcomingLevels.map((u) => u.difficulty).join(", ")}`);
  }

  // All levels that will be live after this sync (existing + newly synced).
  // Used for level flags and e2e/routes.ts generation below.
  const allLiveLevels = mergeLevels(existing?.levels, activeLevels, rawFetchedLevels);

  // Build the combined adventure object using challenges repo field names.
  // The generator accepts all aliases (name/title, emoji → icon, etc.).
  const adventure = {
    slug,
    // Preserve community_category_id right after slug so its position stays stable on re-syncs.
    ...(existing?.community_category_id !== undefined && { community_category_id: existing.community_category_id }),
    // Preserve a manually-set meta description; auto-generate for new adventures (required by the schema).
    meta_description: existing?.meta_description || buildAdventureMetaDescription(indexData, activeLevels),
    // Use whichever title field the challenges repo provides
    ...(indexData.title ? { title: indexData.title } : { name: indexData.name }),
    ...(resolvedIconName && { icon: resolvedIconName }),
    emoji: indexData.emoji,
    // Preserve month if a previous PR already set it
    month: existing?.month || currentMonth(),
    tags: adventureTags,
    ...(indexData.backstory?.length && { backstory: transformStrings(indexData.backstory, stripCodeInLinks) }),
    ...(indexData.overview?.length && { overview: transformStrings(indexData.overview, stripCodeInLinks) }),
    ...(indexData.rewards && {
      rewards: {
        ...indexData.rewards,
        ...(indexData.rewards.deadline && { deadline: parseDeadline(indexData.rewards.deadline, PRESERVE_TZ) }),
      },
    }),
    // Preserve contributor set by a reviewer; omit otherwise (PR checklist item)
    ...(existing?.contributor && { contributor: existing.contributor }),
    ...(upcomingLevels.length > 0 && { upcoming_levels: upcomingLevels }),
    levels: allLiveLevels,
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

  // Update e2e/routes.ts so the route-coverage drift gate passes without a manual edit.
  // SMOKE_ROUTES gets the adventure index + one representative level (the first in LEVEL_ORDER).
  // A11Y_PAGES gets the adventure index + every live level.
  const routesPath = resolve(ROOT, "e2e/routes.ts");
  let routesSrc = readFileSync(routesPath, "utf-8");
  const sortedLiveLevels = allLiveLevels
    .slice()
    .sort((a, b) => (LEVEL_ORDER[a.level] ?? 99) - (LEVEL_ORDER[b.level] ?? 99));
  const repLevel = sortedLiveLevels[0];
  const smokeBlockStart = `  // GENERATED:${slug}-smoke`;
  const smokeBlockEnd = `  // /GENERATED:${slug}-smoke`;
  const escapedAdventureName = escapeTsString(adventureName);
  if (repLevel && !repLevel.name && !repLevel.title) {
    fail(`Level "${repLevel.level}" of adventure "${slug}" has neither name nor title — check the upstream YAML`);
  }
  const repLevelName = repLevel?.name ?? repLevel?.title;
  const smokeBlock = [
    smokeBlockStart,
    `  "/adventures/${escapeTsString(slug)}/": "${escapedAdventureName} - OffOn Adventures",`,
    ...(repLevel ? [`  "/adventures/${escapeTsString(slug)}/levels/${repLevel.level}/": "${escapeTsString(repLevelName)} - ${escapedAdventureName} - OffOn",`] : []),
    smokeBlockEnd,
  ].join("\n");
  const a11yBlockStart = `  // GENERATED:${slug}-a11y`;
  const a11yBlockEnd = `  // /GENERATED:${slug}-a11y`;
  const escapedSlug = escapeTsString(slug);
  const a11yBlock = [
    a11yBlockStart,
    `  "/adventures/${escapedSlug}/",`,
    ...sortedLiveLevels.map((l) => `  "/adventures/${escapedSlug}/levels/${l.level}/",`),
    a11yBlockEnd,
  ].join("\n");

  routesSrc = upsertRoutesBlock(routesSrc, smokeBlockStart, smokeBlockEnd, smokeBlock, "\n};", "export const SMOKE_ROUTES", routesPath);
  routesSrc = upsertRoutesBlock(routesSrc, a11yBlockStart, a11yBlockEnd, a11yBlock, "\n];", "export const A11Y_PAGES", routesPath);

  // Each unique tag generates a /challenges/<slug>/ route. The drift gate in
  // route-coverage.spec.ts requires every built route to be acknowledged in
  // ROUTES_WITHOUT_FULL_COVERAGE (or fully covered). We upsert a GENERATED block
  // so new tags are automatically registered; duplicates with the manual list or
  // other adventure blocks are harmless (Set-deduplicated at test time).
  const tagToSlug = (tag) =>
    tag.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const allAdventureTags = [
    ...new Set(
      allLiveLevels
        .flatMap((l) => (l.topics ?? []).map((t) => (typeof t === "string" ? t : (t.name ?? ""))))
        .filter(Boolean),
    ),
  ];
  if (allAdventureTags.length > 0) {
    const challengeBlockStart = `  // GENERATED:${slug}-challenges`;
    const challengeBlockEnd = `  // /GENERATED:${slug}-challenges`;
    const challengeBlock = [
      challengeBlockStart,
      ...allAdventureTags.map((tag) => `  "/challenges/${tagToSlug(tag)}/",`),
      challengeBlockEnd,
    ].join("\n");
    routesSrc = upsertRoutesBlock(routesSrc, challengeBlockStart, challengeBlockEnd, challengeBlock, "\n];", "export const ROUTES_WITHOUT_FULL_COVERAGE", routesPath);
  }

  writeFileSync(routesPath, routesSrc);
  console.log(`Updated e2e/routes.ts with routes for ${slug}`);

  // Report only the newly promoted levels so the PR title and checklist are accurate.
  const newLevelIds = activeLevels
    .filter((l) => !existingLiveIds.has(l.level))
    .map((l) => l.level)
    .join(",") || activeLevels.map((l) => l.level).join(",");

  atomicWrite("/tmp/adventure-slug", slug);
  atomicWrite("/tmp/adventure-name", adventureName);
  atomicWrite("/tmp/adventure-levels", newLevelIds);
  atomicWrite("/tmp/adventure-mode", mode);

  console.log(`\nDone: ${adventureName} (live: ${activeLevels.map((l) => l.level).join(", ")}${upcomingLevels.length > 0 ? ` | upcoming: ${upcomingLevels.map((u) => u.difficulty).join(", ")}` : ""})`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
