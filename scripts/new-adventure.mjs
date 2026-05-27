#!/usr/bin/env node

/**
 * Scaffold a new adventure with all required files and config entries.
 *
 * Usage:
 *   node scripts/new-adventure.mjs --id "signal-in-the-storm" --title "Signal in the Storm" --month "JUN 2026" --levels beginner,intermediate,expert
 *
 * What it generates:
 *   - src/data/adventures/<id>/adventure.yaml (template with TODOs)
 *   - src/data/adventures/<id>/<level>-posts.json (discussion stubs)
 *   - Patches: react-router.config.ts, public/sitemap.xml
 *
 * After filling in the YAML, run: npm run generate
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      const value = argv[i + 1];
      if (!value || value.startsWith("--")) {
        args[key] = true;
      } else {
        args[key] = value;
        i++;
      }
    }
  }
  return args;
}

function fail(msg) {
  console.error(`\x1b[31mError:\x1b[0m ${msg}`);
  process.exit(1);
}

const args = parseArgs(process.argv);

if (!args.id) fail("--id is required (e.g. --id \"signal-in-the-storm\")");
if (!args.title) fail("--title is required (e.g. --title \"Signal in the Storm\")");
if (!args.month) fail("--month is required (e.g. --month \"JUN 2026\")");
if (!args.levels) fail("--levels is required (e.g. --levels beginner,intermediate,expert)");

const id = args.id;
const title = args.title;
const month = args.month;
const levels = args.levels.split(",").map((l) => l.trim());

// Validate inputs
if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(id)) {
  fail("--id must be kebab-case (lowercase letters, numbers, hyphens; cannot start/end with hyphen)");
}
const VALID_LEVELS = ["beginner", "intermediate", "expert"];
for (const level of levels) {
  if (!VALID_LEVELS.includes(level)) {
    fail(`Invalid level "${level}". Must be one of: ${VALID_LEVELS.join(", ")}`);
  }
}

const ADVENTURES_DIR = resolve(ROOT, "src/data/adventures");
const adventureDataDir = resolve(ADVENTURES_DIR, id);
const yamlPath = resolve(adventureDataDir, "adventure.yaml");

if (existsSync(yamlPath)) {
  fail(`Adventure YAML already exists: src/data/adventures/${id}/adventure.yaml`);
}

// 1. Create adventure directory and per-level discussion JSON stubs
mkdirSync(adventureDataDir, { recursive: true });

for (const level of levels) {
  const jsonPath = resolve(adventureDataDir, `${level}-posts.json`);
  if (!existsSync(jsonPath)) {
    writeFileSync(
      jsonPath,
      JSON.stringify({ discussionUrl: "TODO: Add Discourse topic URL" }, null, 2) + "\n"
    );
    console.log(`  Created: src/data/adventures/${id}/${level}-posts.json`);
  }
}

// 2. Generate the adventure YAML template
const difficultyMap = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  expert: "Expert",
};

const levelEntries = levels
  .map((level) => {
    const difficulty = difficultyMap[level];
    return `  - id: ${level}
    name: "TODO: Level name"
    difficulty: ${difficulty}
    topics:
      - "TODO: Add topic tags"
    learnings:
      - "TODO: Add learning 1"
      - "TODO: Add learning 2"
    devcontainerPath: ".devcontainer/TODO/devcontainer.json"
    discussionUrl: "/t/TODO"
    intro:
      - "TODO: Add intro paragraph"
    backstory:
      - "TODO: Add backstory"
    objective:
      - "TODO: Add objective 1"
    toolbox:
      - name: "TODO"
        description: "TODO: Add tool description"
    howToPlay:
      - title: "TODO: Step 1"
        body: "TODO: Add instructions"
    verification:
      command: "./verify.sh"
      description: "Once you think you've solved the challenge, run the verification script."`;
  })
  .join("\n\n");

const yamlContent = `id: ${id}
title: "${title}"
month: "${month}"
story: "TODO: Add adventure story summary"
tags:
  - "TODO: Add tags"

# Uncomment and fill in if the adventure has an external contributor:
# contributor:
#   name: "TODO: Contributor name"
#   url: "https://TODO"
#   about: "TODO: Short bio"

backstory:
  - "TODO: Add adventure backstory paragraph 1"

# Uncomment and fill in for a 'What you will be using' section:
# context:
#   title: "What you'll be using"
#   body:
#     - "TODO: Explain the main technology"

# Uncomment and fill in for reward info:
# rewards:
#   deadline: "TODO: Day, DD Month YYYY at HH:MM CET"
#   eligibility: "TODO: Eligibility criteria"
#   tiers:
#     - label: "1st place"
#       description: "TODO: Prize"
#   rankingNote: "TODO: How ranking works"
#   rankingRulesUrl: "/t/about-the-challenges-category/16"

levels:
${levelEntries}
`;

writeFileSync(yamlPath, yamlContent);
console.log(`  Created: src/data/adventures/${id}/adventure.yaml`);

// 3. Patch react-router.config.ts
const configPath = resolve(ROOT, "react-router.config.ts");
let configContent = readFileSync(configPath, "utf-8");

const newRoutes = [
  `"/adventures/${id}"`,
  ...levels.map((l) => `"/adventures/${id}/levels/${l}"`),
];

// Insert new entries before the closing ] of the prerender array
configContent = configContent.replace(
  /(prerender: \[[\s\S]*?)(  \],)/,
  (match, before, closing) => {
    const trimmed = before.trimEnd();
    const needsComma = !trimmed.endsWith(",");
    const entries = newRoutes.map((r) => `    ${r},`).join("\n");
    return `${trimmed}${needsComma ? "," : ""}\n${entries}\n${closing}`;
  }
);

if (!configContent.includes(`"/adventures/${id}"`)) {
  fail("Failed to patch react-router.config.ts. The file format may have changed. Patch manually.");
}
writeFileSync(configPath, configContent);
console.log(`  Patched: react-router.config.ts`);

// 4. Patch sitemap.xml
const sitemapPath = resolve(ROOT, "public/sitemap.xml");
let sitemapContent = readFileSync(sitemapPath, "utf-8");

const sitemapEntries = [
  `  <url><loc>https://offon.dev/adventures/${id}/</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`,
  ...levels.map(
    (l) =>
      `  <url><loc>https://offon.dev/adventures/${id}/levels/${l}/</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`
  ),
];

if (!sitemapContent.includes("</urlset>")) {
  fail("Failed to patch sitemap.xml. Could not find </urlset> marker.");
}
sitemapContent = sitemapContent.replace(
  "</urlset>",
  `${sitemapEntries.join("\n")}\n</urlset>`
);

writeFileSync(sitemapPath, sitemapContent);
console.log(`  Patched: public/sitemap.xml`);

// Done
console.log(`\n\x1b[32mDone!\x1b[0m Adventure "${title}" scaffolded.\n`);
console.log("Next steps:");
console.log(`  1. Fill in the TODOs in src/data/adventures/${id}/adventure.yaml`);
console.log(`  2. Update discussion URLs in the YAML and matching *-posts.json files`);
console.log(`  3. Run: npm run generate`);
console.log(`  4. Run: node scripts/refresh-discussions.mjs`);
console.log(`  5. Run: npm run lint && npm test && npm run build && npm run test:e2e`);
