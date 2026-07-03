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
 *
 * Devcontainer validation and auto-correction:
 * - In generate mode, each level's devcontainer value is cross-checked
 *   against the actual folder names in the challenges repo
 *   (off-on-dev/open-source-challenges/.devcontainer) via gh api.
 * - If a value is wrong but an unambiguous match can be found by slug and
 *   difficulty, the YAML file is patched in place and a warning is emitted.
 *   The corrected value should also be fixed upstream in the challenges repo.
 * - In --validate-only mode, wrong values are always errors (CI must not
 *   silently mutate source files).
 * - Uses the GitHub REST API via native fetch (no auth required for public
 *   repos). Falls back gracefully if the network is unavailable.
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import Ajv2020 from "ajv/dist/2020.js";
import { LEVEL_DIFFICULTY_BY_EMOJI } from "./lib/level-constants.mjs";
import { parseDeadline } from "./lib/deadline.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const ADVENTURES_DIR = resolve(ROOT, "src/data/adventures");
const SCHEMA_PATH = resolve(ROOT, "schemas/adventure.schema.json");

// Duplicated from src/data/constants.ts — scripts run in Node outside the Vite build and cannot import from src/.
const BRAND_NAME = "OffOn";

// Computed once at startup so all date comparisons within a single run are consistent.
const TODAY = new Date().toISOString().slice(0, 10);

const validateOnly = process.argv.includes("--validate-only");

// JSON Schema validator — catches structural issues the custom validateAdventure()
// doesn't check: unknown fields (additionalProperties), pattern mismatches (month
// format, slug format), enum violations, and length constraints.
const adventureSchema = JSON.parse(readFileSync(SCHEMA_PATH, "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: false });
ajv.addFormat("uri", (value) => { try { new URL(value); return true; } catch { return false; } });
const schemaValidate = ajv.compile(adventureSchema);

// Keywords whose AJV violations are reported with better messages by the custom validator.
// "enum" is handled separately in schemaErrors(): only difficulty paths are skipped, so any
// future enum field added to the schema still gets AJV coverage.
const SCHEMA_SKIP_KEYWORDS = new Set(["required", "type", "minItems", "if", "then", "else"]);

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

// --- Build-time markdown-to-HTML pipeline ---

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: ["className"],
    a: ["href", "target", "rel"],
  },
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    "pre",
    "code",
  ],
};

const mdProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSanitize, sanitizeSchema)
  .use(rehypeStringify);

/** Add target/rel/sr-only to http/https <a> tags. The external link icon is
 *  rendered via CSS ::after on [target="_blank"] — no inline SVG needed. */
function annotateExternalLinks(html) {
  return html.replace(
    /<a href="(https?:\/\/[^"]+)"([^>]*)>([\s\S]*?)<\/a>/gi,
    (_, href, restAttrs, content) => {
      const attrs = restAttrs.includes("target=")
        ? restAttrs
        : ` target="_blank" rel="noopener noreferrer"${restAttrs}`;
      return `<a href="${href}"${attrs}>${content}<span class="sr-only"> (opens in new tab)</span></a>`;
    }
  );
}

/** Convert markdown to full block HTML (preserves <p>, <ul>, <pre>, headings).
 *  <pre> elements get tabindex="0" and aria-label so they're keyboard-accessible
 *  as scrollable regions in the prerendered HTML (WCAG 2.1 SC 2.1.1). */
async function mdToBlock(str) {
  if (!str) return "";
  const result = await mdProcessor.process(str);
  let html = String(result).trim();
  html = html.replace(/<pre>/g, '<pre tabindex="0" aria-label="Code block">');
  html = annotateExternalLinks(html);
  return html;
}

/** Convert markdown to inline HTML, stripping the outer <p> wrapper when the
 *  output is a single paragraph. Use for short prose rendered inside <span> or <li>. */
async function mdToInline(str) {
  if (!str) return "";
  const result = await mdProcessor.process(str);
  let html = String(result).trim();
  // Strip wrapping <p>...</p> only when the entire output is exactly one paragraph.
  const pCount = (html.match(/<p>/g) ?? []).length;
  if (pCount === 1 && html.startsWith("<p>") && html.endsWith("</p>")) {
    html = html.slice(3, -4);
  }
  html = annotateExternalLinks(html);
  return html;
}

/** Convert each item in a string array with mdToInline. */
async function mdToInlineArray(arr) {
  if (!arr || arr.length === 0) return [];
  return Promise.all(arr.map(mdToInline));
}

/** Convert each item in a string array with mdToBlock. */
async function mdToBlockArray(arr) {
  if (!arr || arr.length === 0) return [];
  return Promise.all(arr.map(mdToBlock));
}

// --- Helpers ---

function toConstName(id) {
  return id.toUpperCase().replace(/-/g, "_");
}

/** Strip common markdown syntax so strings are safe for plain-text meta descriptions. */
function stripMarkdown(str) {
  if (!str) return "";
  return str
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

/** Truncate at the last word boundary before `max` chars and append "...". */
function truncate(str, max) {
  if (str.length <= max) return str;
  const cut = str.lastIndexOf(" ", max - 3);
  return cut > max / 2 ? str.slice(0, cut) + "..." : str.slice(0, max);
}

/** Synthesize a meta description for a challenge level from YAML fields. */
function buildLevelMetaDescription(level) {
  const { name, difficulty } = normalizeLevelFields(level);
  const rawIntro = Array.isArray(level.intro) ? level.intro[0] : (level.summary || "");
  const intro = stripMarkdown(rawIntro);
  const topics = (level.topics || []).join(", ");
  const base = `${name}: ${intro}`;
  const suffix = ` A ${difficulty.toLowerCase()} ${topics} challenge on ${BRAND_NAME}.`;
  if (base.length + suffix.length <= 160) return base + suffix;
  return truncate(base, 160);
}

/** Synthesize a meta description for an adventure from YAML fields. */
function buildAdventureMetaDescription(data) {
  const { title } = normalizeAdventureFields(data);
  if (data.overview && data.overview.length > 0) {
    const clean = stripMarkdown(data.overview[0]);
    return truncate(clean, 160);
  }
  const tags = (data.tags || []).slice(0, 3).join(", ");
  return truncate(`${title}: a hands-on ${tags} adventure on ${BRAND_NAME}.`, 160);
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

const MONTH_NAME_TO_INDEX = {
  JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
  JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
};

/** Parse a "MMM YYYY" month string (e.g. "MAY 2026") into a numeric sort key. */
function monthToSortKey(month) {
  if (typeof month !== "string") return 0;
  const match = month.trim().toUpperCase().match(/^([A-Z]{3})\s+(\d{4})$/);
  if (!match) return 0;
  const m = MONTH_NAME_TO_INDEX[match[1]];
  if (m === undefined) return 0;
  return Number(match[2]) * 12 + m;
}

/**
 * Fetch the set of valid devcontainer folder names from the challenges repo
 * via the GitHub REST API using native fetch. Works without authentication for
 * public repos, so it runs correctly in every environment — local, sync
 * workflow, and validate CI — without requiring cross-repo token access.
 * Returns null when the check cannot be performed so callers can skip it
 * gracefully instead of failing the build.
 */
async function fetchValidDevcontainerFolders() {
  try {
    const response = await fetch(
      "https://api.github.com/repos/off-on-dev/open-source-challenges/contents/.devcontainer",
      { headers: { "User-Agent": "offon-dev/website generate-adventures" } }
    );
    if (!response.ok) {
      warn(`Could not fetch devcontainer folder list from GitHub (HTTP ${response.status}). Skipping devcontainer path validation.`);
      return null;
    }
    const entries = await response.json();
    return new Set(entries.filter((e) => e.type === "dir").map((e) => e.name));
  } catch (e) {
    warn(`Could not fetch devcontainer folder list from GitHub (${e.message}). Skipping devcontainer path validation.`);
    return null;
  }
}

/**
 * For each level whose devcontainer value is missing from validFolders, try
 * to find the correct folder by matching both the adventure slug and the level
 * difficulty (lowercased) against the known folder names.
 *
 * If exactly one candidate matches, the YAML file on disk is patched and the
 * in-memory data object is updated. Ambiguous or unresolvable cases are left
 * unchanged so validateAdventure can report them as errors.
 *
 * Only called in generate mode — CI (--validate-only) must not silently
 * mutate source files.
 *
 * @returns {{ levelIndex: number, from: string, to: string }[]}
 */
function autoCorrectDevcontainerPaths(data, id, yamlPath, validFolders) {
  if (!validFolders || !data.levels) return [];
  const corrections = [];
  let rawYaml = readFileSync(yamlPath, "utf-8");

  for (let i = 0; i < data.levels.length; i++) {
    const level = data.levels[i];
    const wrong = level.devcontainer;
    if (!wrong || validFolders.has(wrong)) continue;

    const difficulty = (level.difficulty || LEVEL_DIFFICULTY_BY_EMOJI[level.emoji] || "").toLowerCase();
    const candidates = [...validFolders].filter(
      (f) => f.includes(id) && (!difficulty || f.includes(difficulty))
    );

    if (candidates.length !== 1) continue;

    const correct = candidates[0];
    rawYaml = rawYaml.replace(`devcontainer: ${wrong}`, `devcontainer: ${correct}`);
    data.levels[i].devcontainer = correct;
    corrections.push({ levelIndex: i, from: wrong, to: correct });
  }

  if (corrections.length > 0) writeFileSync(yamlPath, rawYaml);
  return corrections;
}

/**
 * Convert an Ajv instancePath ("/levels/0/unknown_field") to the display
 * format used by the custom validator ("levels[0].unknown_field").
 * Uses a split-reduce to handle adjacent numeric indices correctly
 * (e.g. "/tools/1/2" → "tools[1][2]" rather than "tools[1]2").
 */
function ajvPathToDisplay(instancePath) {
  if (!instancePath) return "";
  return instancePath.slice(1).split("/").reduce((acc, seg) =>
    /^\d+$/.test(seg) ? `${acc}[${seg}]` : acc ? `${acc}.${seg}` : seg, "");
}

/**
 * Run JSON Schema validation and return errors for structural issues not
 * already covered by the custom validateAdventure() checks below.
 * Skips keywords whose violations are reported with better messages by the
 * custom validator (see SCHEMA_SKIP_KEYWORDS). "enum" is special: only
 * difficulty enum errors are skipped (re-checked in validateLevel); any other
 * enum field added to the schema in future will still produce AJV errors here.
 */
function schemaErrors(data) {
  const valid = schemaValidate(data);
  if (valid) return [];
  return (schemaValidate.errors ?? [])
    .filter((e) => {
      if (SCHEMA_SKIP_KEYWORDS.has(e.keyword)) return false;
      if (e.keyword === "enum" && e.instancePath.endsWith("/difficulty")) return false;
      return true;
    })
    .map((e) => {
      const path = ajvPathToDisplay(e.instancePath) || "adventure";
      if (e.keyword === "additionalProperties") {
        return `${path}: Unknown field "${e.params.additionalProperty}"`;
      }
      return `${path}: ${e.message}`;
    });
}

function validateLevel(level, index, adventureId, validDevcontainerFolders) {
  const errors = [];
  const prefix = `levels[${index}]`;

  if (!level.level) errors.push(`${prefix}: Missing level`);
  if (!level.name && !level.title) errors.push(`${prefix}: Missing name (or title)`);
  if (level.deadline && !isValidISODeadline(level.deadline)) {
    warn(`${adventureId} ${prefix}: deadline "${level.deadline}" is not ISO 8601 — update before publishing`);
  }

  const difficulty = level.difficulty || LEVEL_DIFFICULTY_BY_EMOJI[level.emoji];
  if (!difficulty) errors.push(`${prefix}: Missing difficulty (or emoji 🟢/🟡/🔴)`);
  else if (!["Beginner", "Intermediate", "Expert"].includes(difficulty)) {
    errors.push(`${prefix}: Invalid difficulty "${difficulty}"`);
  }

  if (!level.topics || level.topics.length === 0) errors.push(`${prefix}: Missing topics`);
  if (!level.learnings && !level.what_you_learn) errors.push(`${prefix}: Missing learnings (or what_you_learn)`);

  if (!level.devcontainer) {
    errors.push(`${prefix}: Missing devcontainer`);
  } else if (validDevcontainerFolders && !validDevcontainerFolders.has(level.devcontainer)) {
    errors.push(`${prefix}: devcontainer "${level.devcontainer}" not found in off-on-dev/open-source-challenges/.devcontainer — check https://github.com/off-on-dev/open-source-challenges/tree/main/.devcontainer`);
  }

  const discussionUrl = level.discussion_url ?? level.community_url;
  if (discussionUrl === undefined || discussionUrl === null) {
    errors.push(`${prefix}: Missing discussion_url (or community_url)`);
  } else if (discussionUrl === "") {
    warn(`${adventureId} ${prefix}: discussion_url/community_url is empty — update with Discourse thread URL before publishing`);
  }

  if (!level.intro && !level.summary) errors.push(`${prefix}: Missing intro (or summary)`);
  if (!level.objective || level.objective.length === 0) errors.push(`${prefix}: Missing objective`);
  if (!level.toolbox || level.toolbox.length === 0) errors.push(`${prefix}: Missing toolbox`);
  if (!level.how_to_play || level.how_to_play.length === 0) errors.push(`${prefix}: Missing how_to_play`);
  if (!level.verification) errors.push(`${prefix}: Missing verification`);

  return errors;
}

function validateAdventure(data, id, validDevcontainerFolders) {
  const errors = [...schemaErrors(data)];

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
    data.levels.forEach((level, i) => errors.push(...validateLevel(level, i, id, validDevcontainerFolders)));
  }

  return errors;
}

// --- Code Generation ---

async function generateLevelCode(level, adventureId, indent) {
  const lines = [];
  const i = indent;
  const i2 = indent + "  ";

  const { id: levelId, name: levelName, difficulty: levelDifficulty, learnings: levelLearnings, intro: levelIntro, discussionUrl: levelDiscussionUrl } = normalizeLevelFields(level);

  // Pre-render prose fields to HTML at build time.
  const learningsHtml = await mdToInlineArray(levelLearnings);
  const audienceHtml = level.audience ? await mdToInline(level.audience) : null;
  const objectiveHtml = level.objective ? await mdToInlineArray(level.objective) : null;
  const hookHtml = level.hook ? await mdToBlock(level.hook) : null;
  // intro and backstory are rendered as individual <p> items in components,
  // so use inline conversion (no <p> wrapper) to keep the JSX <p> container valid.
  const introHtml = levelIntro ? await mdToInlineArray(levelIntro) : null;
  const backstoryHtml = level.backstory ? await mdToInlineArray(level.backstory) : null;
  const scenarioHtml = level.scenario ? await mdToBlock(level.scenario) : null;
  const architectureHtml = level.architecture ? await mdToBlockArray(level.architecture) : null;

  lines.push(`${i}{`);
  lines.push(`${i2}id: "${escapeDoubleQuoted(levelId)}",`);
  lines.push(`${i2}name: "${escapeDoubleQuoted(levelName)}",`);
  lines.push(`${i2}difficulty: "${levelDifficulty}",`);

  if (level.topics) {
    lines.push(`${i2}topics: [${level.topics.map((t) => `"${escapeDoubleQuoted(t)}"`).join(", ")}],`);
  }
  if (audienceHtml) {
    lines.push(`${i2}audience: ${formatString(audienceHtml)},`);
  }
  if (level.estimated_time) {
    lines.push(`${i2}estimatedTime: ${formatString(level.estimated_time)},`);
  }

  lines.push(`${i2}learnings: ${formatStringArray(learningsHtml, i2)},`);

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

  if (level.deadline) lines.push(`${i2}deadline: "${escapeDoubleQuoted(parseDeadline(level.deadline))}",`);
  if (hookHtml) lines.push(`${i2}hook: ${formatString(hookHtml)},`);
  if (introHtml) lines.push(`${i2}intro: ${formatStringArray(introHtml, i2)},`);
  if (backstoryHtml) lines.push(`${i2}backstory: ${formatStringArray(backstoryHtml, i2)},`);
  if (objectiveHtml) lines.push(`${i2}objective: ${formatStringArray(objectiveHtml, i2)},`);
  if (scenarioHtml) lines.push(`${i2}scenario: ${formatString(scenarioHtml)},`);
  if (architectureHtml) lines.push(`${i2}architecture: ${formatStringArray(architectureHtml, i2)},`);

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
      const descHtml = tool.description ? await mdToInline(tool.description) : "";
      const parts = [`name: "${escapeDoubleQuoted(tool.name)}"`, `description: ${formatString(descHtml)}`];
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
      const titleHtml = step.title ? await mdToInline(step.title) : "";
      const contentHtml = await mdToBlock(step.content);
      lines.push(`${i2}  { title: ${formatString(titleHtml)}, content: ${formatString(contentHtml)} },`);
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

  const levelMetaDesc = level.meta_description || buildLevelMetaDescription(level);
  lines.push(`${i2}metaDescription: ${formatString(levelMetaDesc)},`);
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

async function generateAdventureTs(data) {
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

  // Pre-render prose fields to HTML at build time.
  const storyHtml = await mdToInline(adventureStory);
  const contributorAboutHtml = data.contributor?.about ? await mdToInline(data.contributor.about) : null;
  // Each item renders via InlineProse; mdToInline strips the outer <p> on single-paragraph
  // items so they can be safely wrapped as <p md-inline> at render time.
  const backstoryHtml = data.backstory ? await mdToInlineArray(data.backstory) : null;

  lines.push(`export const ${constName}: Adventure = {`);
  lines.push(`  id: "${data.slug}",`);
  lines.push(`  title: "${escapeDoubleQuoted(adventureTitle)}",`);
  if (adventureIcon) lines.push(`  icon: "${escapeDoubleQuoted(adventureIcon)}",`);
  lines.push(`  month: "${data.month}",`);
  lines.push(`  story: ${formatString(storyHtml)},`);
  const adventureMetaDesc = data.meta_description || buildAdventureMetaDescription(data);
  lines.push(`  metaDescription: ${formatString(adventureMetaDesc)},`);
  lines.push(`  tags: [${data.tags.map((t) => `"${escapeDoubleQuoted(t)}"`).join(", ")}],`);

  if (data.contributor) {
    lines.push(`  contributor: {`);
    lines.push(`    name: "${escapeDoubleQuoted(data.contributor.name)}",`);
    if (data.contributor.url) lines.push(`    url: "${escapeDoubleQuoted(data.contributor.url)}",`);
    if (contributorAboutHtml) lines.push(`    aboutHtml: ${formatString(contributorAboutHtml)},`);
    lines.push(`  },`);
  }

  if (backstoryHtml) {
    lines.push(`  backstory: ${formatStringArray(backstoryHtml, "  ")},`);
  }

  if (data.overview) {
    lines.push(`  overview: ${formatStringArray(data.overview, "  ")},`);
  }

  if (data.rewards) {
    const eligibilityRaw = data.rewards.eligibility ?? DEFAULT_REWARDS_ELIGIBILITY;
    const rankingNoteRaw = data.rewards.ranking_note ?? DEFAULT_REWARDS_RANKING_NOTE;
    const rankingRulesUrl = data.rewards.ranking_rules_url ?? DEFAULT_REWARDS_RANKING_RULES_PATH;
    const eligibilityHtml = await mdToInline(eligibilityRaw);
    const rankingNoteHtml = await mdToInline(rankingNoteRaw);
    // rankingNote renders inside a <span> inside a <p>, so block-level HTML there
    // is always invalid HTML. Fail the build rather than silently corrupt the DOM.
    if (/<(p|ul|ol|blockquote|h[1-6]|pre|table|hr|figure|div)\b/.test(rankingNoteHtml)) {
      fail(
        `${data.slug}: rewards.ranking_note produces block-level HTML. ` +
        `It must be a single inline paragraph — collapse it to one line and regenerate.`
      );
    }
    lines.push(`  rewards: {`);
    const rewardsDeadline = data.rewards.deadline === "TODO" ? "" : parseDeadline(data.rewards.deadline);
    lines.push(`    deadline: "${escapeDoubleQuoted(rewardsDeadline)}",`);
    lines.push(`    eligibility: ${formatString(eligibilityHtml)},`);
    lines.push(`    tiers: [`);
    for (const tier of data.rewards.tiers) {
      const tierDescHtml = await mdToInline(tier.description);
      lines.push(`      { label: "${escapeDoubleQuoted(tier.label)}", description: ${formatString(tierDescHtml)} },`);
    }
    lines.push(`    ],`);
    lines.push(`    rankingNote: ${formatString(rankingNoteHtml)},`);
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
    lines.push((await generateLevelCode(level, data.id, "    ")) + ",");
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
/**
 * Returns lines for the ADVENTURE_CONTRIBUTORS export.
 * sourceName is the array to derive from; sourceType is the element type.
 * The caller is responsible for pushing any preceding JSDoc comment.
 */
function buildContributorsCode(sourceName, sourceType) {
  return [
    `export const ADVENTURE_CONTRIBUTORS: AdventureContributor[] = Object.values(`,
    `  ${sourceName}`,
    `    .filter((a): a is ${sourceType} & { contributor: NonNullable<${sourceType}["contributor"]> } => a.contributor !== undefined)`,
    `    .reduce<Record<string, AdventureContributor>>((acc, a) => {`,
    `      const key = a.contributor.name;`,
    `      if (!acc[key]) {`,
    `        acc[key] = { name: a.contributor.name, url: a.contributor.url, aboutHtml: a.contributor.aboutHtml, adventures: [] };`,
    `      }`,
    `      acc[key].adventures.push({ id: a.id, title: a.title });`,
    `      return acc;`,
    `    }, {})`,
    `);`,
  ];
}

async function generateSummariesTs(adventures) {
  const lines = [];
  lines.push(`// Generated by scripts/generate-adventures.mjs — do not edit by hand.`);
  lines.push(`import type { AdventureCardSummary, AdventureContributor, RelatedLevelSummary } from "./types";`);
  lines.push(``);
  lines.push(`export const ADVENTURE_SUMMARIES: AdventureCardSummary[] = [`);

  const now = new Date();

  for (const data of adventures) {
    lines.push(`  {`);
    const { title: summaryTitle, story: summaryStory } = normalizeAdventureFields(data);
    lines.push(`    id: "${data.slug}",`);
    lines.push(`    title: "${escapeDoubleQuoted(summaryTitle)}",`);
    lines.push(`    month: "${data.month}",`);
    if (/[*_`]/.test(summaryStory)) {
      warn(`${data.slug}: story contains markdown syntax (*_\`). AdventureCard renders story as plain text — format the story as plain prose or it will display unstyled in card views.`);
    }
    // story in summaries stays as plain text — AdventureCard renders it without markdown.
    lines.push(`    story: ${formatString(summaryStory)},`);
    lines.push(`    tags: [${data.tags.map((t) => `"${escapeDoubleQuoted(t)}"`).join(", ")}],`);
    if (data.contributor) {
      const contributorAboutHtml = data.contributor.about ? await mdToInline(data.contributor.about) : null;
      lines.push(`    contributor: {`);
      lines.push(`      name: "${escapeDoubleQuoted(data.contributor.name)}",`);
      if (data.contributor.url) lines.push(`      url: "${escapeDoubleQuoted(data.contributor.url)}",`);
      if (contributorAboutHtml) lines.push(`      aboutHtml: ${formatString(contributorAboutHtml)},`);
      lines.push(`    },`);
    }
    const rewardsLive = data.rewards?.deadline && new Date(parseDeadline(data.rewards.deadline)) > now;
    const levelLive = !rewardsLive && (data.levels ?? []).some((l) => l.deadline && new Date(parseDeadline(l.deadline)) > now);
    if (rewardsLive || levelLive) {
      lines.push(`    isLive: true,`);
    }
    lines.push(`    levels: [`);
    for (const level of data.levels) {
      lines.push(`      {`);
      const { id: summaryId, name: summaryName, difficulty: summaryDifficulty, learnings: summaryLearnings } = normalizeLevelFields(level);
      // Pre-render learnings to inline HTML for FilteredLevelCard.
      const summaryLearningsHtml = await mdToInlineArray(summaryLearnings);
      lines.push(`        id: "${escapeDoubleQuoted(summaryId)}",`);
      lines.push(`        name: "${escapeDoubleQuoted(summaryName)}",`);
      lines.push(`        difficulty: "${summaryDifficulty}",`);
      if (level.topics && level.topics.length > 0) {
        lines.push(`        topics: [${level.topics.map((t) => `"${escapeDoubleQuoted(t)}"`).join(", ")}],`);
      }
      lines.push(`        learnings: ${formatStringArray(summaryLearningsHtml, "        ")},`);
      if (level.estimated_time) {
        lines.push(`        estimatedTime: ${formatString(level.estimated_time)},`);
      }
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
  lines.push(`        ...(a.isLive ? { isLive: true } : {}),`);
  lines.push(`      }))`);
  lines.push(`    );`);
  lines.push(``);
  lines.push(`/**`);
  lines.push(` * Community members who contributed an adventure, grouped by person.`);
  lines.push(` * Derived from ADVENTURE_SUMMARIES — import from here instead of "@/data/adventures"`);
  lines.push(` * on pages that do not otherwise need the full adventure dataset (About, Adventures, Challenges).`);
  lines.push(` */`);
  lines.push(...buildContributorsCode("ADVENTURE_SUMMARIES", "AdventureCardSummary"));
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
  lines.push(...buildContributorsCode("ADVENTURES", "Adventure"));
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
  lines.push(`export { tagToSlug, slugToTag } from "./tag-utils";`);

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

// Parse lastmod dates already committed in the sitemap, keyed by URL.
// Used as a stable fallback so re-running the generator on a clean file never changes
// existing dates (avoids churn from shallow-clone environments where git log may be empty).
const SITEMAP_PATH = resolve(ROOT, "public/sitemap.xml");

function loadExistingSitemapDates() {
  const dates = new Map();
  try {
    const content = readFileSync(SITEMAP_PATH, "utf-8");
    for (const m of content.matchAll(/<loc>([^<]+)<\/loc><lastmod>([^<]+)<\/lastmod>/g)) {
      dates.set(m[1], m[2]);
    }
  } catch { /* sitemap may not exist yet on first run */ }
  return dates;
}

const _existingSitemapDates = loadExistingSitemapDates();

// Returns the date the adventure.yaml was last modified, for use as sitemap lastmod.
// If the YAML has uncommitted changes, uses today. If the URL is already in the sitemap
// and the YAML is clean, preserves the existing date. For new URLs, falls back to the
// git commit date (or today if git history is unavailable, e.g. shallow clones).
// Results are memoized per slug.
const _lastmodCache = new Map();
function getAdventureLastmod(slug) {
  if (_lastmodCache.has(slug)) return _lastmodCache.get(slug);
  const relPath = `src/data/adventures/${slug}/adventure.yaml`;
  const status = spawnSync("git", ["status", "--porcelain", "--", relPath], {
    cwd: ROOT, encoding: "utf-8",
  });
  if (status.error || status.stdout.trim()) {
    // YAML has uncommitted changes — content is actively being updated, use today.
    _lastmodCache.set(slug, TODAY);
    return TODAY;
  }
  // YAML is clean. If this adventure already exists in the sitemap, keep its date
  // to avoid churn caused by git log returning different results across environments
  // (e.g. shallow clones in CI vs full history locally).
  const existingDate = _existingSitemapDates.get(`https://offon.dev/adventures/${slug}/`);
  if (existingDate) {
    _lastmodCache.set(slug, existingDate);
    return existingDate;
  }
  // New adventure not yet in the sitemap — use git log date or today as fallback.
  const gitLog = spawnSync("git", ["log", "--format=%ci", "-1", "--", relPath], {
    cwd: ROOT, encoding: "utf-8",
  });
  const gitDate = gitLog.stdout.trim();
  const result = gitDate ? gitDate.slice(0, 10) : TODAY;
  _lastmodCache.set(slug, result);
  return result;
}

/** Build the body for a region as one block of text. Body must include a trailing newline. */
function buildSitemapBody(adventures) {
  const lines = [];
  for (const a of adventures) {
    const lastmod = getAdventureLastmod(a.slug);
    lines.push(`  <url><loc>https://offon.dev/adventures/${a.slug}/</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`);
    for (const l of a.levels) {
      lines.push(`  <url><loc>https://offon.dev/adventures/${a.slug}/levels/${l.level}/</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`);
      const solutionFile = resolve(ROOT, `src/data/solutions/${a.slug}/${l.level}.ts`);
      if (existsSync(solutionFile)) {
        lines.push(`  <url><loc>https://offon.dev/adventures/${a.slug}/levels/${l.level}/solution/</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`);
      }
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

function buildLlmsTxtBody(adventures) {
  const lines = [];
  for (const a of adventures) {
    const { title, story } = normalizeAdventureFields(a);
    lines.push(`- [${title}](https://offon.dev/adventures/${a.slug}/): ${story}`);
    for (const l of a.levels) {
      const solutionFile = resolve(ROOT, `src/data/solutions/${a.slug}/${l.level}.ts`);
      if (existsSync(solutionFile)) {
        lines.push(`  - [${l.name} solution](https://offon.dev/adventures/${a.slug}/levels/${l.level}/solution/)`);
      }
    }
  }
  return "\n" + lines.join("\n") + "\n\n";
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

function buildSitemapTagsBody(tags, adventures) {
  const lines = tags.map((t) => {
    const url = `https://offon.dev/challenges/${tagToSlug(t)}/`;
    const existing = _existingSitemapDates.get(url);
    const matching = adventures.filter((a) => (a.tags || []).includes(t));
    // Compute what the date would be from adventure data.
    const derived = matching.length > 0
      ? matching.map((a) => getAdventureLastmod(a.slug)).sort().at(-1)
      : TODAY;
    // ISO date strings (YYYY-MM-DD) sort lexicographically in chronological order,
    // so string comparison is equivalent to date comparison here.
    // Preserve existing date if derived is not newer — prevents churn in shallow-clone
    // environments where adventure dates may differ across runs.
    const lastmod = existing && derived <= existing ? existing : derived;
    return `  <url><loc>${url}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`;
  });
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
    `<url><loc>https://offon.dev/privacy/</loc><lastmod>2026-06-01</lastmod><changefreq>yearly</changefreq><priority>0.5</priority></url>`,
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
  replaceRegion(
    resolve(ROOT, "public/llms.txt"),
    "Each adventure is a scenario-driven challenge with beginner, intermediate, and expert levels.",
    "## Challenge Technologies",
    buildLlmsTxtBody(adventures)
  );

  // Challenge tag URLs. Derived from ALL_TAGS across every adventure's `tags:`
  // array. Sitemap uses the surrounding `/challenges/` index URL and the closing
  // `</urlset>` as anchors so it stays free of generator comments.
  const tags = collectAllTags(adventures);
  replaceRegion(
    resolve(ROOT, "public/sitemap.xml"),
    `<url><loc>https://offon.dev/challenges/</loc><lastmod>2026-06-03</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>`,
    `</urlset>`,
    buildSitemapTagsBody(tags, adventures)
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

async function main() {
  const yamls = findAdventureYamls();

  if (yamls.length === 0) {
    warn("No adventure.yaml files found. Nothing to generate.");
    return;
  }

  console.log(`Found ${yamls.length} adventure YAML file(s):\n`);

  const validDevcontainerFolders = await fetchValidDevcontainerFolders();
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

    // In generate mode, auto-correct devcontainer values that don't match
    // the challenges repo before validation so the corrected values pass.
    // --validate-only intentionally skips this to keep CI a pure read-only check.
    if (!validateOnly && validDevcontainerFolders) {
      const corrections = autoCorrectDevcontainerPaths(data, id, path, validDevcontainerFolders);
      for (const { levelIndex, from, to } of corrections) {
        warn(`${id} levels[${levelIndex}]: devcontainer auto-corrected "${from}" → "${to}" — update adventure.yaml in the challenges repo`);
      }
    }

    const errors = validateAdventure(data, id, validDevcontainerFolders);
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

  // Order adventures newest first, by month. Stable secondary by slug for ties.
  adventures.sort((a, b) => {
    const da = monthToSortKey(a.month);
    const db = monthToSortKey(b.month);
    if (db !== da) return db - da;
    return a.slug.localeCompare(b.slug);
  });

  if (validateOnly) {
    console.log("\n\x1b[32mAll YAML files are valid.\x1b[0m");
    return;
  }

  // Generate .generated.ts files
  for (const data of adventures) {
    const tsContent = await generateAdventureTs(data);
    const outPath = resolve(ADVENTURES_DIR, `${data.slug}.generated.ts`);
    writeFileSync(outPath, tsContent);
    console.log(`  Generated: src/data/adventures/${data.slug}.generated.ts`);
  }

  // Generate index.ts
  const indexContent = generateIndexTs(adventures);
  const indexPath = resolve(ADVENTURES_DIR, "index.ts");
  writeFileSync(indexPath, indexContent);
  console.log(`  Generated: src/data/adventures/index.ts`);

  // Generate summaries.ts (lightweight card-only data, no imports from full generated files)
  const summariesContent = await generateSummariesTs(adventures);
  const summariesPath = resolve(ADVENTURES_DIR, "summaries.ts");
  writeFileSync(summariesPath, summariesContent);
  console.log(`  Generated: src/data/adventures/summaries.ts`);

  // Patch GENERATED:adventures regions in route/sitemap/test/leaderboard files.
  patchRegions(adventures);

  console.log(`\n\x1b[32mDone!\x1b[0m Generated ${adventures.length} adventure file(s) + index.ts + summaries.ts`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
