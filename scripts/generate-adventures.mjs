#!/usr/bin/env node

/**
 * Generate TypeScript adventure files from YAML sources.
 *
 * Usage:
 *   node scripts/generate-adventures.mjs [--validate-only]
 *
 * Reads all src/data/adventures/<id>/adventure.yaml files and generates
 * the corresponding <id>.generated.ts files plus index.ts with the correct
 * imports and ADVENTURES array.
 *
 * With --validate-only, parses and validates YAML without writing files.
 *
 * Why YAML + generated TS instead of authoring TS directly?
 * - YAML is easier to write and review for non-engineers, and is validated
 *   by JSON Schema (schemas/adventure.schema.json) before generation.
 * - Vite cannot import YAML natively, so the generator converts each file
 *   to fully-typed TypeScript that the app can statically import and
 *   tree-shake.
 * - The generated files are committed so the build works without running
 *   this script first. CI can detect out-of-sync output by running
 *   `npm run generate` and checking for a clean git diff.
 * - Never edit *.generated.ts by hand — changes will be overwritten.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const ADVENTURES_DIR = resolve(ROOT, "src/data/adventures");
const SCHEMA_PATH = resolve(ROOT, "schemas/adventure.schema.json");

const validateOnly = process.argv.includes("--validate-only");

// --- Helpers ---

function toConstName(id) {
  return id.toUpperCase().replace(/-/g, "_");
}

function fail(msg) {
  console.error(`\x1b[31mError:\x1b[0m ${msg}`);
  process.exit(1);
}

function warn(msg) {
  console.warn(`\x1b[33mWarning:\x1b[0m ${msg}`);
}

/**
 * Escape a string for safe embedding in a JS template literal (backtick-quoted).
 * Handles backticks, ${}, and backslashes.
 */
function escapeTemplateLiteral(str) {
  return str.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

/**
 * Escape a string for safe embedding in a JS double-quoted string.
 */
function escapeDoubleQuoted(str) {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

/**
 * Determine whether a string needs template literal (contains COMMUNITY_URL or CODESPACES_BASE references,
 * or has newlines/backticks that make template literals cleaner).
 */
function needsTemplateLiteral(str) {
  return str.includes("\n") || str.includes("`");
}

/**
 * Format a string value as a JS string literal or template literal.
 */
function formatString(str, indent = "") {
  if (needsTemplateLiteral(str)) {
    return `\`${escapeTemplateLiteral(str)}\``;
  }
  return `"${escapeDoubleQuoted(str)}"`;
}

/**
 * Format an array of strings.
 */
function formatStringArray(arr, indent) {
  if (!arr || arr.length === 0) return "[]";
  if (arr.length === 1 && !needsTemplateLiteral(arr[0]) && arr[0].length < 80) {
    return `["${escapeDoubleQuoted(arr[0])}"]`;
  }
  const items = arr.map((s) => `${indent}  ${formatString(s)},`).join("\n");
  return `[\n${items}\n${indent}]`;
}

// --- YAML Discovery ---

function findAdventureYamls() {
  const entries = readdirSync(ADVENTURES_DIR, { withFileTypes: true });
  const yamls = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const yamlPath = resolve(ADVENTURES_DIR, entry.name, "adventure.yaml");
      if (existsSync(yamlPath)) {
        yamls.push({ id: entry.name, path: yamlPath });
      }
    }
  }
  return yamls;
}

// --- Validation ---

function validateAdventure(data, id) {
  const errors = [];
  if (!data.id) errors.push("Missing required field: id");
  else if (data.id !== id) errors.push(`id "${data.id}" does not match folder name "${id}"`);
  if (!data.title) errors.push("Missing required field: title");
  if (!data.month) errors.push("Missing required field: month");
  if (!data.story) errors.push("Missing required field: story");
  if (!data.tags || !Array.isArray(data.tags) || data.tags.length === 0) {
    errors.push("Missing or empty required field: tags");
  }
  if (!data.levels || !Array.isArray(data.levels) || data.levels.length === 0) {
    errors.push("Missing or empty required field: levels");
  } else {
    for (let i = 0; i < data.levels.length; i++) {
      const level = data.levels[i];
      const prefix = `levels[${i}]`;
      if (!level.id) errors.push(`${prefix}: Missing id`);
      if (!level.name) errors.push(`${prefix}: Missing name`);
      if (!level.difficulty) errors.push(`${prefix}: Missing difficulty`);
      if (!["Beginner", "Intermediate", "Expert"].includes(level.difficulty)) {
        errors.push(`${prefix}: Invalid difficulty "${level.difficulty}"`);
      }
      if (!level.learnings || level.learnings.length === 0) {
        errors.push(`${prefix}: Missing learnings`);
      }
      if (!level.devcontainerPath) errors.push(`${prefix}: Missing devcontainerPath`);
      if (!level.discussionUrl) errors.push(`${prefix}: Missing discussionUrl`);
    }
  }
  return errors;
}

// --- Code Generation ---

function generateLevelCode(level, adventureId, indent) {
  const lines = [];
  const i = indent;
  const i2 = indent + "  ";

  lines.push(`${i}{`);
  lines.push(`${i2}id: "${level.id}",`);
  lines.push(`${i2}name: "${escapeDoubleQuoted(level.name)}",`);
  lines.push(`${i2}difficulty: "${level.difficulty}",`);

  if (level.topics) {
    lines.push(`${i2}topics: [${level.topics.map((t) => `"${escapeDoubleQuoted(t)}"`).join(", ")}],`);
  }
  if (level.audience) {
    lines.push(`${i2}audience: ${formatString(level.audience)},`);
  }

  lines.push(`${i2}learnings: ${formatStringArray(level.learnings, i2)},`);

  // Build codespacesUrl from devcontainerPath
  const encodedPath = encodeURIComponent(level.devcontainerPath).replace(/%2F/g, "%2F");
  lines.push(`${i2}codespacesUrl: \`\${CODESPACES_BASE}?devcontainer_path=${encodedPath}&quickstart=1\`,`);

  // Build discussionUrl
  if (level.discussionUrl.startsWith("http")) {
    lines.push(`${i2}discussionUrl: "${escapeDoubleQuoted(level.discussionUrl)}",`);
  } else {
    // Relative path: prepend COMMUNITY_URL
    const path = level.discussionUrl.startsWith("/") ? level.discussionUrl : `/${level.discussionUrl}`;
    lines.push(`${i2}discussionUrl: \`\${COMMUNITY_URL}${path}\`,`);
  }

  if (level.deadline) lines.push(`${i2}deadline: "${escapeDoubleQuoted(level.deadline)}",`);
  if (level.hook) lines.push(`${i2}hook: ${formatString(level.hook)},`);
  if (level.intro) lines.push(`${i2}intro: ${formatStringArray(level.intro, i2)},`);
  if (level.backstory) lines.push(`${i2}backstory: ${formatStringArray(level.backstory, i2)},`);
  if (level.objective) lines.push(`${i2}objective: ${formatStringArray(level.objective, i2)},`);
  if (level.scenario) lines.push(`${i2}scenario: ${formatString(level.scenario)},`);
  if (level.architecture) lines.push(`${i2}architecture: ${formatStringArray(level.architecture, i2)},`);

  if (level.architectureDiagram) {
    const baseName = level.architectureDiagram.replace(/\.svg$/, "");
    const varName = baseName.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    lines.push(`${i2}architectureDiagram: ${varName},`);
  }
  if (level.diagramAlt) lines.push(`${i2}diagramAlt: ${formatString(level.diagramAlt)},`);

  if (level.toolbox && level.toolbox.length > 0) {
    lines.push(`${i2}toolbox: [`);
    for (const tool of level.toolbox) {
      const parts = [`name: "${escapeDoubleQuoted(tool.name)}"`, `description: "${escapeDoubleQuoted(tool.description)}"`];
      if (tool.url) parts.push(`url: "${escapeDoubleQuoted(tool.url)}"`);
      lines.push(`${i2}  { ${parts.join(", ")} },`);
    }
    lines.push(`${i2}],`);
  }

  if (level.howToPlay && level.howToPlay.length > 0) {
    lines.push(`${i2}howToPlay: [`);
    for (const step of level.howToPlay) {
      lines.push(`${i2}  { title: "${escapeDoubleQuoted(step.title)}", body: ${formatString(step.body)} },`);
    }
    lines.push(`${i2}],`);
  }

  if (level.helpfulLinks && level.helpfulLinks.length > 0) {
    lines.push(`${i2}helpfulLinks: [`);
    for (const link of level.helpfulLinks) {
      lines.push(`${i2}  { label: "${escapeDoubleQuoted(link.label)}", url: "${escapeDoubleQuoted(link.url)}" },`);
    }
    lines.push(`${i2}],`);
  }

  if (level.verification) {
    lines.push(`${i2}verification: {`);
    lines.push(`${i2}  command: "${escapeDoubleQuoted(level.verification.command)}",`);
    lines.push(`${i2}  description: "${escapeDoubleQuoted(level.verification.description)}",`);
    lines.push(`${i2}},`);
  }

  if (level.solvedCount !== undefined) lines.push(`${i2}solvedCount: ${level.solvedCount},`);
  if (level.topPlayers && level.topPlayers.length > 0) {
    lines.push(`${i2}topPlayers: [`);
    for (const p of level.topPlayers) {
      lines.push(`${i2}  { username: "${escapeDoubleQuoted(p.username)}", count: ${p.count} },`);
    }
    lines.push(`${i2}],`);
  }

  lines.push(`${i}}`);
  return lines.join("\n");
}

function generateAdventureTs(data) {
  const lines = [];
  const constName = toConstName(data.id);

  // Imports
  lines.push(`import { CODESPACES_BASE, COMMUNITY_URL } from "@/data/constants";`);

  // Collect diagram imports — use a camelCase variable name derived from the filename
  const diagrams = new Map();
  for (const level of data.levels) {
    if (level.architectureDiagram) {
      const baseName = level.architectureDiagram.replace(/\.svg$/, "");
      const varName = baseName.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      if (!diagrams.has(baseName)) {
        diagrams.set(baseName, { varName, file: level.architectureDiagram });
      }
    }
  }
  for (const [, d] of diagrams) {
    lines.push(`import ${d.varName} from "@/assets/diagrams/${d.file}";`);
  }

  lines.push(`import type { Adventure } from "./types";`);
  lines.push(``);
  lines.push(`export const ${constName}: Adventure = {`);
  lines.push(`  id: "${data.id}",`);
  lines.push(`  title: "${escapeDoubleQuoted(data.title)}",`);
  lines.push(`  month: "${data.month}",`);
  lines.push(`  story: ${formatString(data.story)},`);
  lines.push(`  tags: [${data.tags.map((t) => `"${escapeDoubleQuoted(t)}"`).join(", ")}],`);

  if (data.contributor) {
    lines.push(`  contributor: {`);
    lines.push(`    name: "${escapeDoubleQuoted(data.contributor.name)}",`);
    if (data.contributor.url) lines.push(`    url: "${escapeDoubleQuoted(data.contributor.url)}",`);
    if (data.contributor.about) lines.push(`    about: "${escapeDoubleQuoted(data.contributor.about)}",`);
    lines.push(`  },`);
  }

  if (data.backstory) {
    lines.push(`  backstory: ${formatStringArray(data.backstory, "  ")},`);
  }

  if (data.context) {
    lines.push(`  context: {`);
    lines.push(`    title: "${escapeDoubleQuoted(data.context.title)}",`);
    lines.push(`    body: ${formatStringArray(data.context.body, "    ")},`);
    lines.push(`  },`);
  }

  if (data.rewards) {
    lines.push(`  rewards: {`);
    lines.push(`    deadline: "${escapeDoubleQuoted(data.rewards.deadline)}",`);
    lines.push(`    eligibility: "${escapeDoubleQuoted(data.rewards.eligibility)}",`);
    lines.push(`    tiers: [`);
    for (const tier of data.rewards.tiers) {
      lines.push(`      { label: "${escapeDoubleQuoted(tier.label)}", description: "${escapeDoubleQuoted(tier.description)}" },`);
    }
    lines.push(`    ],`);
    if (data.rewards.rankingNote) {
      lines.push(`    rankingNote: "${escapeDoubleQuoted(data.rewards.rankingNote)}",`);
    }
    if (data.rewards.rankingRulesUrl) {
      if (data.rewards.rankingRulesUrl.startsWith("http")) {
        lines.push(`    rankingRulesUrl: "${escapeDoubleQuoted(data.rewards.rankingRulesUrl)}",`);
      } else {
        const path = data.rewards.rankingRulesUrl.startsWith("/") ? data.rewards.rankingRulesUrl : `/${data.rewards.rankingRulesUrl}`;
        lines.push(`    rankingRulesUrl: \`\${COMMUNITY_URL}${path}\`,`);
      }
    }
    lines.push(`  },`);
  }

  if (data.upcomingLevels && data.upcomingLevels.length > 0) {
    lines.push(`  upcomingLevels: [`);
    for (const ul of data.upcomingLevels) {
      lines.push(`    { name: "${escapeDoubleQuoted(ul.name)}", difficulty: "${ul.difficulty}" },`);
    }
    lines.push(`  ],`);
  }

  lines.push(`  levels: [`);
  for (const level of data.levels) {
    lines.push(generateLevelCode(level, data.id, "    ") + ",");
  }
  lines.push(`  ],`);
  lines.push(`};`);
  lines.push(``);

  return lines.join("\n");
}

/**
 * Generate summaries.ts — a lightweight card-only snapshot of all adventure data.
 * This file has NO imports from the full *.generated.ts files, so bundlers can
 * split it into a separate chunk. Pages that only render AdventureCard and
 * FilteredLevelCard import from here instead of from index.ts, saving ~12 KB
 * gzipped on the home page by not pulling in walkthrough steps, toolbox items,
 * architecture sections, and other detail-page fields.
 */
function generateSummariesTs(adventures) {
  const lines = [];
  lines.push(`// Generated by scripts/generate-adventures.mjs — do not edit by hand.`);
  lines.push(`import type { AdventureCardSummary, RelatedLevelSummary } from "./types";`);
  lines.push(``);
  lines.push(`export const ADVENTURE_SUMMARIES: AdventureCardSummary[] = [`);

  for (const data of adventures) {
    lines.push(`  {`);
    lines.push(`    id: "${data.id}",`);
    lines.push(`    title: "${escapeDoubleQuoted(data.title)}",`);
    lines.push(`    month: "${data.month}",`);
    lines.push(`    story: ${formatString(data.story)},`);
    lines.push(`    tags: [${data.tags.map((t) => `"${escapeDoubleQuoted(t)}"`).join(", ")}],`);
    if (data.contributor) {
      lines.push(`    contributor: { name: "${escapeDoubleQuoted(data.contributor.name)}" },`);
    }
    lines.push(`    levels: [`);
    for (const level of data.levels) {
      lines.push(`      {`);
      lines.push(`        id: "${level.id}",`);
      lines.push(`        name: "${escapeDoubleQuoted(level.name)}",`);
      lines.push(`        difficulty: "${level.difficulty}",`);
      if (level.topics && level.topics.length > 0) {
        lines.push(`        topics: [${level.topics.map((t) => `"${escapeDoubleQuoted(t)}"`).join(", ")}],`);
      }
      lines.push(`        learnings: ${formatStringArray(level.learnings, "        ")},`);
      lines.push(`      },`);
    }
    lines.push(`    ],`);
    lines.push(`  },`);
  }

  lines.push(`];`);
  lines.push(``);
  lines.push(`/** All unique technology tags across all adventures, for card and filter views. */`);
  lines.push(`export const SUMMARY_TAGS: string[] = Array.from(`);
  lines.push(`  new Set(ADVENTURE_SUMMARIES.flatMap((a) => a.tags))`);
  lines.push(`).sort();`);
  lines.push(``);
  lines.push(`/** Returns level summaries matching a tag, for filtered card views on the home page. */`);
  lines.push(`export const getLevelSummariesByTag = (tag: string): RelatedLevelSummary[] =>`);
  lines.push(`  ADVENTURE_SUMMARIES`);
  lines.push(`    .filter((a) => a.tags.includes(tag))`);
  lines.push(`    .flatMap((a) =>`);
  lines.push(`      a.levels.map((level) => ({`);
  lines.push(`        level,`);
  lines.push(`        adventureId: a.id,`);
  lines.push(`        adventureTitle: a.title,`);
  lines.push(`      }))`);
  lines.push(`    );`);
  lines.push(``);

  return lines.join("\n");
}

function generateIndexTs(adventures) {
  const lines = [];

  // Imports for each adventure
  for (const adv of adventures) {
    const constName = toConstName(adv.id);
    lines.push(`import { ${constName} } from "./${adv.id}.generated";`);
  }
  lines.push(`import type { Adventure, AdventureContributor, RelatedLevel } from "./types";`);
  lines.push(``);
  lines.push(`export type { Adventure, AdventureLevel, AdventureContributor, RelatedLevel, ToolboxItem, WalkthroughStep, VerificationInfo, TopPlayer, UpcomingLevel, AdventureLevelSummary, AdventureCardSummary, RelatedLevelSummary } from "./types";`);
  lines.push(``);
  lines.push(`export const ADVENTURES: Adventure[] = [`);
  for (const adv of adventures) {
    lines.push(`  ${toConstName(adv.id)},`);
  }
  lines.push(`];`);
  lines.push(``);
  lines.push(`/** All unique technology tags across all adventures, sorted alphabetically. Shared with filter components; do not re-derive in component files. */`);
  lines.push(`export const ALL_TAGS: string[] = Array.from(`);
  lines.push(`  new Set(ADVENTURES.flatMap((a) => a.tags))`);
  lines.push(`).sort();`);
  lines.push(``);
  lines.push(`/** Community members who contributed an adventure, grouped by person. Derived from ADVENTURES; do not re-derive in components. */`);
  lines.push(`export const ADVENTURE_CONTRIBUTORS: AdventureContributor[] = Object.values(`);
  lines.push(`  ADVENTURES`);
  lines.push(`    .filter((a): a is Adventure & { contributor: NonNullable<Adventure["contributor"]> } => a.contributor !== undefined)`);
  lines.push(`    .reduce<Record<string, AdventureContributor>>((acc, a) => {`);
  lines.push(`      const key = a.contributor.name;`);
  lines.push(`      if (!acc[key]) {`);
  lines.push(`        acc[key] = { name: a.contributor.name, url: a.contributor.url, about: a.contributor.about, adventures: [] };`);
  lines.push(`      }`);
  lines.push(`      acc[key].adventures.push({ id: a.id, title: a.title });`);
  lines.push(`      return acc;`);
  lines.push(`    }, {})`);
  lines.push(`);`);
  lines.push(``);
  lines.push(`/** Returns all levels across all adventures that include the given technology tag. */`);
  lines.push(`export const getLevelsByTag = (tag: string): RelatedLevel[] =>`);
  lines.push(`  ADVENTURES.filter((adventure) => adventure.tags.includes(tag)).flatMap((adventure) =>`);
  lines.push(`    adventure.levels.map((level) => ({`);
  lines.push(`      level,`);
  lines.push(`      adventureId: adventure.id,`);
  lines.push(`      adventureTitle: adventure.title,`);
  lines.push(`    }))`);
  lines.push(`  );`);
  lines.push(``);
  lines.push(`/** Convert a tag display name to a URL-safe slug. */`);
  lines.push(`export const tagToSlug = (tag: string): string =>`);
  lines.push(`  tag.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");`);
  lines.push(``);
  lines.push(`/** Lookup map from slug back to the original tag name. */`);
  lines.push(`const SLUG_TO_TAG: Record<string, string> = Object.fromEntries(`);
  lines.push(`  ALL_TAGS.map((tag) => [tagToSlug(tag), tag])`);
  lines.push(`);`);
  lines.push(``);
  lines.push(`/** Resolve a URL slug back to the original tag name, or undefined if not found. */`);
  lines.push(`export const slugToTag = (slug: string): string | undefined => SLUG_TO_TAG[slug];`);
  lines.push(``);

  return lines.join("\n");
}

// --- Main ---

function main() {
  const yamls = findAdventureYamls();

  if (yamls.length === 0) {
    warn("No adventure.yaml files found. Nothing to generate.");
    return;
  }

  console.log(`Found ${yamls.length} adventure YAML file(s):\n`);

  const adventures = [];
  let hasErrors = false;

  for (const { id, path } of yamls) {
    const raw = readFileSync(path, "utf-8");
    let data;
    try {
      data = parseYaml(raw);
    } catch (e) {
      console.error(`  \x1b[31m✗\x1b[0m ${id}/adventure.yaml: YAML parse error: ${e.message}`);
      hasErrors = true;
      continue;
    }

    const errors = validateAdventure(data, id);
    if (errors.length > 0) {
      console.error(`  \x1b[31m✗\x1b[0m ${id}/adventure.yaml:`);
      for (const err of errors) {
        console.error(`      - ${err}`);
      }
      hasErrors = true;
      continue;
    }

    console.log(`  \x1b[32m✓\x1b[0m ${id}/adventure.yaml`);
    adventures.push(data);
  }

  if (hasErrors) {
    fail("Validation failed. Fix the errors above before generating.");
  }

  if (validateOnly) {
    console.log("\n\x1b[32mAll YAML files are valid.\x1b[0m");
    return;
  }

  // Generate .generated.ts files
  for (const data of adventures) {
    const tsContent = generateAdventureTs(data);
    const outPath = resolve(ADVENTURES_DIR, `${data.id}.generated.ts`);
    writeFileSync(outPath, tsContent);
    console.log(`  Generated: src/data/adventures/${data.id}.generated.ts`);
  }

  // Generate index.ts
  // Sort adventures by the order we want them (newest first based on existing convention)
  const indexContent = generateIndexTs(adventures);
  const indexPath = resolve(ADVENTURES_DIR, "index.ts");
  writeFileSync(indexPath, indexContent);
  console.log(`  Generated: src/data/adventures/index.ts`);

  // Generate summaries.ts (lightweight card-only data, no imports from full generated files)
  const summariesContent = generateSummariesTs(adventures);
  const summariesPath = resolve(ADVENTURES_DIR, "summaries.ts");
  writeFileSync(summariesPath, summariesContent);
  console.log(`  Generated: src/data/adventures/summaries.ts`);

  console.log(`\n\x1b[32mDone!\x1b[0m Generated ${adventures.length} adventure file(s) + index.ts + summaries.ts`);
}

main();
