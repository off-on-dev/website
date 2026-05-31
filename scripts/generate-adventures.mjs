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
import { LEVEL_DIFFICULTY_BY_EMOJI } from "./lib/level-constants.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const ADVENTURES_DIR = resolve(ROOT, "src/data/adventures");
const SCHEMA_PATH = resolve(ROOT, "schemas/adventure.schema.json");

const validateOnly = process.argv.includes("--validate-only");

// Maps emoji shorthand to Lucide React icon names used in AdventureDetail.
const EMOJI_ICON_MAP = {
  "🧪": "FlaskConical",
  "🔭": "Telescope",
  "☁️": "Cloud",
  "🛰️": "Satellite",
  "⚖️": "Scale",
};


// Constant rewards fields shared by all adventures. Omit from YAML to use these defaults.
const DEFAULT_REWARDS_ELIGIBILITY =
  "Complete all levels and post your solution in the community before the deadline to be eligible.";
const DEFAULT_REWARDS_RANKING_NOTE =
  "Ranking is determined by total points across all three levels. Points per level are awarded" +
  " by submission order within the active week (100 for the first valid solution, 95 for the" +
  " second, and so on; late submissions still earn 60).";
const DEFAULT_REWARDS_RANKING_RULES_PATH = "/t/about-the-challenges-category/16";

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

/** Returns true if str is a valid ISO 8601 datetime with UTC offset. */
function isValidISODeadline(str) {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/.test(str);
}

/** Resolve alias fields on an adventure YAML object to canonical field values. */
function normalizeAdventureFields(data) {
  return {
    title: data.title || data.name,
    story: data.story || (data.backstory?.length > 0 ? data.backstory[0] : ""),
    icon: data.icon || (data.emoji ? EMOJI_ICON_MAP[data.emoji] : undefined),
  };
}

/** Resolve alias fields on a level YAML object to canonical field values. */
function normalizeLevelFields(level) {
  return {
    id: level.level,
    name: level.name || level.title,
    difficulty: level.difficulty || LEVEL_DIFFICULTY_BY_EMOJI[level.emoji],
    learnings: level.learnings || level.what_you_learn,
    intro: level.intro || (level.summary ? [level.summary] : undefined),
    discussionUrl: (level.discussion_url ?? level.community_url) ?? "",
  };
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
  if (!data.slug) errors.push("Missing required field: slug");
  else if (data.slug !== id) errors.push(`slug "${data.slug}" does not match folder name "${id}"`);
  if (!data.title && !data.name) errors.push("Missing required field: title (or name)");
  if (!data.month) errors.push("Missing required field: month");
  if (!data.story && (!data.backstory || data.backstory.length === 0)) {
    errors.push("Missing required field: story (or provide backstory to derive it from)");
  }
  if (!data.tags || !Array.isArray(data.tags) || data.tags.length === 0) {
    errors.push("Missing or empty required field: tags");
  }
  if (data.rewards && data.rewards.deadline && !isValidISODeadline(data.rewards.deadline)) {
    warn(`${id}: rewards.deadline "${data.rewards.deadline}" is not ISO 8601 — update before publishing (e.g. "2026-05-26T23:59:00+01:00")`);
  }
  if (!data.levels || !Array.isArray(data.levels) || data.levels.length === 0) {
    errors.push("Missing or empty required field: levels");
  } else {
    for (let i = 0; i < data.levels.length; i++) {
      const level = data.levels[i];
      const prefix = `levels[${i}]`;
      if (!level.level) errors.push(`${prefix}: Missing level`);
      if (!level.name && !level.title) errors.push(`${prefix}: Missing name (or title)`);
      if (level.deadline && !isValidISODeadline(level.deadline)) {
        warn(`${id} ${prefix}: deadline "${level.deadline}" is not ISO 8601 — update before publishing`);
      }
      const difficulty = level.difficulty || LEVEL_DIFFICULTY_BY_EMOJI[level.emoji];
      if (!difficulty) errors.push(`${prefix}: Missing difficulty (or emoji 🟢/🟡/🔴)`);
      else if (!["Beginner", "Intermediate", "Expert"].includes(difficulty)) {
        errors.push(`${prefix}: Invalid difficulty "${difficulty}"`);
      }
      if (!level.topics || level.topics.length === 0) errors.push(`${prefix}: Missing topics`);
      if (!level.learnings && !level.what_you_learn) {
        errors.push(`${prefix}: Missing learnings (or what_you_learn)`);
      }
      if (!level.devcontainer) errors.push(`${prefix}: Missing devcontainer`);
      const discussionUrl = level.discussion_url ?? level.community_url;
      if (discussionUrl === undefined || discussionUrl === null) {
        errors.push(`${prefix}: Missing discussion_url (or community_url)`);
      } else if (discussionUrl === "") {
        warn(`${id} ${prefix}: discussion_url/community_url is empty — update with Discourse thread URL before publishing`);
      }
      if (!level.intro && !level.summary) errors.push(`${prefix}: Missing intro (or summary)`);
      if (!level.objective || level.objective.length === 0) errors.push(`${prefix}: Missing objective`);
      if (!level.toolbox || level.toolbox.length === 0) errors.push(`${prefix}: Missing toolbox`);
      if (!level.how_to_play || level.how_to_play.length === 0) errors.push(`${prefix}: Missing how_to_play`);
      if (!level.verification) errors.push(`${prefix}: Missing verification`);
    }
  }
  return errors;
}

// --- Code Generation ---

function generateLevelCode(level, adventureId, indent) {
  const lines = [];
  const i = indent;
  const i2 = indent + "  ";

  const { id: levelId, name: levelName, difficulty: levelDifficulty, learnings: levelLearnings, intro: levelIntro, discussionUrl: levelDiscussionUrl } = normalizeLevelFields(level);

  lines.push(`${i}{`);
  lines.push(`${i2}id: "${escapeDoubleQuoted(levelId)}",`);
  lines.push(`${i2}name: "${escapeDoubleQuoted(levelName)}",`);
  lines.push(`${i2}difficulty: "${levelDifficulty}",`);

  if (level.topics) {
    lines.push(`${i2}topics: [${level.topics.map((t) => `"${escapeDoubleQuoted(t)}"`).join(", ")}],`);
  }
  if (level.audience) {
    lines.push(`${i2}audience: ${formatString(level.audience)},`);
  }

  lines.push(`${i2}learnings: ${formatStringArray(levelLearnings, i2)},`);

  // Build codespacesUrl from devcontainer short name
  const fullDevcontainerPath = `.devcontainer/${level.devcontainer}/devcontainer.json`;
  const encodedPath = encodeURIComponent(fullDevcontainerPath).replace(/%2F/g, "%2F");
  lines.push(`${i2}codespacesUrl: \`\${CODESPACES_BASE}?devcontainer_path=${encodedPath}&quickstart=1\`,`);

  // Build discussionUrl — always output (empty string is valid placeholder for new adventures)
  if (levelDiscussionUrl && levelDiscussionUrl.startsWith("http")) {
    lines.push(`${i2}discussionUrl: "${escapeDoubleQuoted(levelDiscussionUrl)}",`);
  } else if (levelDiscussionUrl) {
    const path = levelDiscussionUrl.startsWith("/") ? levelDiscussionUrl : `/${levelDiscussionUrl}`;
    lines.push(`${i2}discussionUrl: \`\${COMMUNITY_URL}${path}\`,`);
  } else {
    lines.push(`${i2}discussionUrl: "",`);
  }

  if (level.deadline) lines.push(`${i2}deadline: "${escapeDoubleQuoted(level.deadline)}",`);
  if (level.hook) lines.push(`${i2}hook: ${formatString(level.hook)},`);
  if (levelIntro) lines.push(`${i2}intro: ${formatStringArray(levelIntro, i2)},`);
  if (level.backstory) lines.push(`${i2}backstory: ${formatStringArray(level.backstory, i2)},`);
  if (level.objective) lines.push(`${i2}objective: ${formatStringArray(level.objective, i2)},`);
  if (level.scenario) lines.push(`${i2}scenario: ${formatString(level.scenario)},`);
  if (level.architecture) lines.push(`${i2}architecture: ${formatStringArray(level.architecture, i2)},`);

  if (level.architecture_diagram) {
    const baseName = level.architecture_diagram.replace(/\.svg$/, "");
    const varName = baseName.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    lines.push(`${i2}architectureDiagram: ${varName},`);
  }
  if (level.diagram_alt) lines.push(`${i2}diagramAlt: ${formatString(level.diagram_alt)},`);
  if (level.architecture_ascii) lines.push(`${i2}architectureAscii: ${formatString(level.architecture_ascii)},`);

  if (level.toolbox && level.toolbox.length > 0) {
    lines.push(`${i2}toolbox: [`);
    for (const tool of level.toolbox) {
      const parts = [`name: "${escapeDoubleQuoted(tool.name)}"`, `description: "${escapeDoubleQuoted(tool.description)}"`];
      if (tool.url) parts.push(`url: "${escapeDoubleQuoted(tool.url)}"`);
      lines.push(`${i2}  { ${parts.join(", ")} },`);
    }
    lines.push(`${i2}],`);
  }

  const steps = level.how_to_play ? [...level.how_to_play] : [];
  if (level.services && level.services.length > 0) {
    const accessible = level.services.filter((s) => !s.internal);
    const internal = level.services.filter((s) => s.internal);
    if (accessible.length > 0) {
      let body = "Open the **Ports** tab and navigate to each service:\n\n";
      for (const svc of accessible) {
        const creds = svc.credentials ? ` (${svc.credentials})` : "";
        body += `- **Port ${String(svc.port)}:** ${svc.name}${creds}. ${svc.description}`;
        body += "\n";
      }
      if (internal.length > 0) {
        body += "\n";
        for (const svc of internal) {
          body += `${svc.name} runs on the docker-internal network only. No port forwarding needed.\n`;
        }
      }
      steps.splice(1, 0, { title: "Explore the UIs", content: body.trim() });
    }
  }
  if (steps.length > 0) {
    lines.push(`${i2}howToPlay: [`);
    for (const step of steps) {
      lines.push(`${i2}  { title: "${escapeDoubleQuoted(step.title)}", content: ${formatString(step.content)} },`);
    }
    lines.push(`${i2}],`);
  }

  if (level.helpful_links && level.helpful_links.length > 0) {
    lines.push(`${i2}helpfulLinks: [`);
    for (const link of level.helpful_links) {
      const parts = [`title: "${escapeDoubleQuoted(link.title)}"`, `url: "${escapeDoubleQuoted(link.url)}"`];
      if (link.description) parts.push(`description: "${escapeDoubleQuoted(link.description)}"`);
      lines.push(`${i2}  { ${parts.join(", ")} },`);
    }
    lines.push(`${i2}],`);
  }

  if (level.verification) {
    lines.push(`${i2}verification: {`);
    lines.push(`${i2}  command: "${escapeDoubleQuoted(level.verification.command)}",`);
    lines.push(`${i2}  description: "${escapeDoubleQuoted(level.verification.description)}",`);
    lines.push(`${i2}},`);
  }

  if (level.meta_description) lines.push(`${i2}metaDescription: ${formatString(level.meta_description)},`);
  if (level.solved_count !== undefined) lines.push(`${i2}solvedCount: ${level.solved_count},`);
  if (level.top_players && level.top_players.length > 0) {
    lines.push(`${i2}topPlayers: [`);
    for (const p of level.top_players) {
      lines.push(`${i2}  { username: "${escapeDoubleQuoted(p.username)}", count: ${p.count} },`);
    }
    lines.push(`${i2}],`);
  }

  lines.push(`${i}}`);
  return lines.join("\n");
}

function generateAdventureTs(data) {
  const lines = [];
  const constName = toConstName(data.slug);

  // Imports
  lines.push(`import { CODESPACES_BASE, COMMUNITY_URL } from "@/data/constants";`);

  // Collect diagram imports — use a camelCase variable name derived from the filename
  const diagrams = new Map();
  for (const level of data.levels) {
    if (level.architecture_diagram) {
      const baseName = level.architecture_diagram.replace(/\.svg$/, "");
      const varName = baseName.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      if (!diagrams.has(baseName)) {
        diagrams.set(baseName, { varName, file: level.architecture_diagram });
      }
    }
  }
  for (const [, d] of diagrams) {
    lines.push(`import ${d.varName} from "@/assets/diagrams/${d.file}";`);
  }

  lines.push(`import type { Adventure } from "./types";`);
  lines.push(``);
  const { title: adventureTitle, story: adventureStory, icon: adventureIcon } = normalizeAdventureFields(data);
  if (data.emoji && !adventureIcon) {
    warn(`${data.slug}: emoji "${data.emoji}" is not in EMOJI_ICON_MAP — add it to scripts/generate-adventures.mjs and src/pages/AdventureDetail.tsx`);
  }

  lines.push(`export const ${constName}: Adventure = {`);
  lines.push(`  id: "${data.slug}",`);
  lines.push(`  title: "${escapeDoubleQuoted(adventureTitle)}",`);
  if (adventureIcon) lines.push(`  icon: "${escapeDoubleQuoted(adventureIcon)}",`);
  lines.push(`  month: "${data.month}",`);
  lines.push(`  story: ${formatString(adventureStory)},`);
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

  if (data.overview) {
    lines.push(`  overview: ${formatStringArray(data.overview, "  ")},`);
  }

  if (data.rewards) {
    const eligibility = data.rewards.eligibility ?? DEFAULT_REWARDS_ELIGIBILITY;
    const rankingNote = data.rewards.ranking_note ?? DEFAULT_REWARDS_RANKING_NOTE;
    const rankingRulesUrl = data.rewards.ranking_rules_url ?? DEFAULT_REWARDS_RANKING_RULES_PATH;
    lines.push(`  rewards: {`);
    const rewardsDeadline = data.rewards.deadline === "TODO" ? "" : data.rewards.deadline;
    lines.push(`    deadline: "${escapeDoubleQuoted(rewardsDeadline)}",`);
    lines.push(`    eligibility: "${escapeDoubleQuoted(eligibility)}",`);
    lines.push(`    tiers: [`);
    for (const tier of data.rewards.tiers) {
      lines.push(`      { label: "${escapeDoubleQuoted(tier.label)}", description: "${escapeDoubleQuoted(tier.description)}" },`);
    }
    lines.push(`    ],`);
    lines.push(`    rankingNote: "${escapeDoubleQuoted(rankingNote)}",`);
    if (rankingRulesUrl.startsWith("http")) {
      lines.push(`    rankingRulesUrl: "${escapeDoubleQuoted(rankingRulesUrl)}",`);
    } else {
      const path = rankingRulesUrl.startsWith("/") ? rankingRulesUrl : `/${rankingRulesUrl}`;
      lines.push(`    rankingRulesUrl: \`\${COMMUNITY_URL}${path}\`,`);
    }
    lines.push(`  },`);
  }

  if (data.upcoming_levels && data.upcoming_levels.length > 0) {
    lines.push(`  upcomingLevels: [`);
    for (const ul of data.upcoming_levels) {
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
    const { title: summaryTitle, story: summaryStory } = normalizeAdventureFields(data);
    lines.push(`    id: "${data.slug}",`);
    lines.push(`    title: "${escapeDoubleQuoted(summaryTitle)}",`);
    lines.push(`    month: "${data.month}",`);
    lines.push(`    story: ${formatString(summaryStory)},`);
    lines.push(`    tags: [${data.tags.map((t) => `"${escapeDoubleQuoted(t)}"`).join(", ")}],`);
    if (data.contributor) {
      lines.push(`    contributor: { name: "${escapeDoubleQuoted(data.contributor.name)}" },`);
    }
    lines.push(`    levels: [`);
    for (const level of data.levels) {
      lines.push(`      {`);
      const { id: summaryId, name: summaryName, difficulty: summaryDifficulty, learnings: summaryLearnings } = normalizeLevelFields(level);
      lines.push(`        id: "${escapeDoubleQuoted(summaryId)}",`);
      lines.push(`        name: "${escapeDoubleQuoted(summaryName)}",`);
      lines.push(`        difficulty: "${summaryDifficulty}",`);
      if (level.topics && level.topics.length > 0) {
        lines.push(`        topics: [${level.topics.map((t) => `"${escapeDoubleQuoted(t)}"`).join(", ")}],`);
      }
      lines.push(`        learnings: ${formatStringArray(summaryLearnings, "        ")},`);
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
    const constName = toConstName(adv.slug);
    lines.push(`import { ${constName} } from "./${adv.slug}.generated";`);
  }
  lines.push(`import type { Adventure, AdventureContributor, RelatedLevel } from "./types";`);
  lines.push(``);
  lines.push(`export type { Adventure, AdventureLevel, AdventureContributor, RelatedLevel, ToolboxItem, WalkthroughStep, VerificationInfo, TopPlayer, UpcomingLevel, AdventureLevelSummary, AdventureCardSummary, RelatedLevelSummary } from "./types";`);
  lines.push(``);
  lines.push(`export const ADVENTURES: Adventure[] = [`);
  for (const adv of adventures) {
    lines.push(`  ${toConstName(adv.slug)},`);
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

// --- Region patching ---

/**
 * Each consumer file has a region marked by `GENERATED:adventures` / `/GENERATED:adventures`
 * comments. The body between those markers is regenerated from the YAML on every build.
 * Hand-edits to entries inside the region will be overwritten. Add manual entries OUTSIDE
 * the markers.
 */
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceRegion(filePath, openMarker, closeMarker, body) {
  if (!existsSync(filePath)) fail(`Region target file not found: ${filePath}`);
  const content = readFileSync(filePath, "utf-8");
  const re = new RegExp(
    `(${escapeRegex(openMarker)})[\\s\\S]*?(${escapeRegex(closeMarker)})`
  );
  if (!re.test(content)) {
    fail(`Region markers not found in ${filePath}. Expected "${openMarker}" ... "${closeMarker}".`);
  }
  const next = content.replace(re, `$1\n${body}$2`);
  if (next !== content) {
    writeFileSync(filePath, next);
    console.log(`  Patched region: ${filePath.replace(ROOT + "/", "")}`);
  }
}

/** Build the body for a region as one block of text. Body must include a trailing newline. */
function buildSitemapBody(adventures) {
  const lines = [];
  for (const a of adventures) {
    lines.push(`  <url><loc>https://offon.dev/adventures/${a.slug}/</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`);
    for (const l of a.levels) {
      lines.push(`  <url><loc>https://offon.dev/adventures/${a.slug}/levels/${l.level}/</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`);
    }
  }
  return lines.join("\n") + "\n  ";
}

function buildPrerenderBody(adventures) {
  const lines = [];
  for (const a of adventures) {
    lines.push(`    "/adventures/${a.slug}",`);
    for (const l of a.levels) {
      lines.push(`    "/adventures/${a.slug}/levels/${l.level}",`);
    }
  }
  return lines.join("\n") + "\n    ";
}

function buildSeoRoutesBody(adventures) {
  const lines = [];
  for (const a of adventures) {
    lines.push(`  "/adventures/${a.slug}",`);
    for (const l of a.levels) {
      lines.push(`  "/adventures/${a.slug}/levels/${l.level}",`);
    }
  }
  return lines.join("\n") + "\n  ";
}

function buildSmokeRoutesBody(adventures) {
  const lines = [];
  for (const a of adventures) {
    const { title } = normalizeAdventureFields(a);
    lines.push(`  { path: "/adventures/${a.slug}", title: /${escapeRegex(title)}/ },`);
    for (const l of a.levels) {
      const { name } = normalizeLevelFields(l);
      lines.push(`  { path: "/adventures/${a.slug}/levels/${l.level}", title: /${escapeRegex(name)}/ },`);
    }
  }
  return lines.join("\n") + "\n  ";
}

function buildPrerenderTestBody(adventures) {
  // The "contains" check matches the raw HTML, so HTML entities must be encoded here.
  const htmlEncode = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const lines = [];
  for (const a of adventures) {
    const { title } = normalizeAdventureFields(a);
    lines.push(`  {`);
    lines.push(`    file: "adventures/${a.slug}/index.html",`);
    lines.push(`    check: { type: "contains", value: "${escapeDoubleQuoted(htmlEncode(title))}" },`);
    lines.push(`  },`);
    for (const l of a.levels) {
      const { name } = normalizeLevelFields(l);
      lines.push(`  {`);
      lines.push(`    file: "adventures/${a.slug}/levels/${l.level}/index.html",`);
      lines.push(`    check: { type: "contains", value: "${escapeDoubleQuoted(htmlEncode(name))}" },`);
      lines.push(`  },`);
    }
  }
  return lines.join("\n") + "\n  ";
}

function buildLeaderboardCategoriesBody(adventures) {
  const lines = [];
  // Align colons by padding the key to a stable width.
  const maxKeyLen = Math.max(...adventures.map((a) => a.slug.length));
  for (const a of adventures) {
    const has_beginner = a.levels.some((l) => l.level === "beginner");
    const has_intermediate = a.levels.some((l) => l.level === "intermediate");
    const has_expert = a.levels.some((l) => l.level === "expert");
    const key = `"${a.slug}":`.padEnd(maxKeyLen + 3);
    const todo = a.community_category_id === undefined
      ? " // TODO: set categoryId — look up at https://community.offon.dev/categories.json"
      : "";
    const categoryId = a.community_category_id ?? 0;
    lines.push(`  ${key} { categoryId: ${categoryId}, has_beginner: ${has_beginner}, has_intermediate: ${has_intermediate}, has_expert: ${has_expert}, has_single: false },${todo}`);
  }
  return lines.join("\n") + "\n  ";
}

/** Mirrors `tagToSlug` in the generated index.ts so consumer files use identical slugs. */
function tagToSlug(tag) {
  return tag.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function collectAllTags(adventures) {
  const set = new Set();
  for (const a of adventures) {
    for (const t of a.tags || []) set.add(t);
  }
  return [...set].sort((x, y) => x.localeCompare(y));
}

function buildSitemapTagsBody(tags) {
  const lines = tags.map(
    (t) =>
      `  <url><loc>https://offon.dev/challenges/${tagToSlug(t)}/</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`,
  );
  return lines.join("\n") + "\n";
}

function buildPrerenderTagsBody(tags) {
  const lines = tags.map((t) => `    "/challenges/${tagToSlug(t)}",`);
  return lines.join("\n") + "\n    ";
}

function buildSeoTagsBody(tags) {
  const lines = tags.map((t) => `  "/challenges/${tagToSlug(t)}",`);
  return lines.join("\n") + "\n  ";
}

function buildSmokeTagsBody(tags) {
  const lines = tags.map(
    (t) => `  { path: "/challenges/${tagToSlug(t)}", title: /${escapeRegex(t)} Challenges/ },`,
  );
  return lines.join("\n") + "\n  ";
}

function patchRegions(adventures) {
  // Sitemap uses the surrounding static URL lines as anchors so the file stays
  // free of generator comments. The adventures block sits between the last
  // static page (/privacy/) and /challenges/. Both anchor lines must stay
  // exactly as-is; do not reorder the static URLs around them.
  replaceRegion(
    resolve(ROOT, "public/sitemap.xml"),
    `<url><loc>https://offon.dev/privacy/</loc><changefreq>yearly</changefreq><priority>0.5</priority></url>`,
    `<url><loc>https://offon.dev/challenges/</loc>`,
    buildSitemapBody(adventures)
  );
  replaceRegion(
    resolve(ROOT, "react-router.config.ts"),
    "// GENERATED:adventures",
    "// /GENERATED:adventures",
    buildPrerenderBody(adventures)
  );
  replaceRegion(
    resolve(ROOT, "src/test/seo.test.ts"),
    "// GENERATED:adventures",
    "// /GENERATED:adventures",
    buildSeoRoutesBody(adventures)
  );
  replaceRegion(
    resolve(ROOT, "e2e/smoke.spec.ts"),
    "// GENERATED:adventures",
    "// /GENERATED:adventures",
    buildSmokeRoutesBody(adventures)
  );
  replaceRegion(
    resolve(ROOT, "src/test/prerender.test.ts"),
    "// GENERATED:adventures",
    "// /GENERATED:adventures",
    buildPrerenderTestBody(adventures)
  );
  replaceRegion(
    resolve(ROOT, "scripts/refresh-leaderboard.mjs"),
    "// GENERATED:adventures",
    "// /GENERATED:adventures",
    buildLeaderboardCategoriesBody(adventures)
  );

  // Challenge tag URLs. Derived from ALL_TAGS across every adventure's `tags:`
  // array. Sitemap uses the surrounding `/challenges/` index URL and the closing
  // `</urlset>` as anchors so it stays free of generator comments.
  const tags = collectAllTags(adventures);
  replaceRegion(
    resolve(ROOT, "public/sitemap.xml"),
    `<url><loc>https://offon.dev/challenges/</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>`,
    `</urlset>`,
    buildSitemapTagsBody(tags)
  );
  replaceRegion(
    resolve(ROOT, "react-router.config.ts"),
    "// GENERATED:challenge-tags",
    "// /GENERATED:challenge-tags",
    buildPrerenderTagsBody(tags)
  );
  replaceRegion(
    resolve(ROOT, "src/test/seo.test.ts"),
    "// GENERATED:challenge-tags",
    "// /GENERATED:challenge-tags",
    buildSeoTagsBody(tags)
  );
  replaceRegion(
    resolve(ROOT, "e2e/smoke.spec.ts"),
    "// GENERATED:challenge-tags",
    "// /GENERATED:challenge-tags",
    buildSmokeTagsBody(tags)
  );
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
    const outPath = resolve(ADVENTURES_DIR, `${data.slug}.generated.ts`);
    writeFileSync(outPath, tsContent);
    console.log(`  Generated: src/data/adventures/${data.slug}.generated.ts`);
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

  // Patch GENERATED:adventures regions in route/sitemap/test/leaderboard files.
  patchRegions(adventures);

  console.log(`\n\x1b[32mDone!\x1b[0m Generated ${adventures.length} adventure file(s) + index.ts + summaries.ts`);
}

main();
