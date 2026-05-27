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
    # required | e.g. "Stand up the Lab" / "Outcome by Cohort" / "Lights On"
    name: "TODO: Level name"
    difficulty: ${difficulty}
    topics:
      # required | technology and tool names shown as pill tags on the level card.
      # e.g. OpenFeature, flagd, Spring Boot
      - "TODO: Add topic tags"
    learnings:
      # required | full sentences describing concrete skills or insights gained.
      # e.g. "How an OpenFeature client and provider work together: the SDK is provider-agnostic and plugs in via dependency only"
      - "TODO: Add learning 1"
      - "TODO: Add learning 2"
    devcontainerPath: ".devcontainer/TODO/devcontainer.json" # required
    discussionUrl: "/t/TODO" # required
    intro:
      # required | one or two sentences: what the player will wire up and what they will prove works.
      # e.g. "Wire the OpenFeature Java SDK into a Spring Boot service so flag evaluations are resolved by a flagd sidecar. Prove that editing flags.json flips the response without restarting the app."
      - "TODO: Add intro paragraph"
    backstory:
      # optional | narrative context that sets the scene for this specific level.
      # e.g. "The lab is on its first shift and it isn't reading the chart. Every subject who walks through the door gets the same hard-coded reading, no matter what the director signed off on."
      - "TODO: Add backstory"
    objective:
      # required | verifiable outcomes a player can check with a command.
      # e.g. "curl http://localhost:8080/ returns a vision_state resolved from flags.json (not the hard-coded fallback)"
      - "TODO: Add objective 1"
    # optional | uncomment to describe who this level is aimed at and what prior knowledge helps.
    # audience: "Best suited for: Platform engineers, SREs, and developers curious about Kubernetes security. No prior Kyverno experience needed, but familiarity with basic kubectl and YAML will help."
    # optional | uncomment to describe the technical setup (services, ports, how they connect).
    # architecture:
    #   - "TODO: e.g. Two containers run side-by-side: the app on http://localhost:8080 and a sidecar on :8013."
    #   - "TODO: e.g. Edit config.json through the IDE; the file watcher picks up changes within a second."
    toolbox:
      # required | list the CLI tools and services available in the Codespace. Add a url field for external docs.
      # e.g. name: "./mvnw" / description: "Maven wrapper; builds and runs the Spring Boot service"
      - name: "TODO"
        description: "TODO: Add tool description"
    howToPlay:
      # required | walk the player from the broken state to a working solution, one titled step at a time.
      # Use fenced code blocks for commands. First step: confirm the broken state. Last step: run the verifier.
      - title: "TODO: Step 1"
        body: "TODO: Add instructions"
    helpfulLinks:
      # optional | reference docs the player will need. label is the link text; url must be a full https:// URL.
      # e.g. label: "OpenFeature Java SDK" / url: https://openfeature.dev/docs/reference/technologies/server/java/
      - label: "TODO: Doc title"
        url: "https://TODO"
    verification:
      # required | keep the defaults unless the verification script name or message differs.
      command: "./verify.sh"
      description: "Once you think you've solved the challenge, run the verification script."`;
  })
  .join("\n\n");

const yamlContent = `id: ${id}
title: "${title}"
month: "${month}"
# required | 2-3 sentences covering what technology is used and what each level does.
# e.g. "Three levels of OpenFeature with flagd as the provider, in a Java + Spring Boot service.
#   Wire the SDK (Beginner), add cohort targeting (Intermediate), then instrument with OpenTelemetry (Expert)."
story: "TODO: Add adventure story summary"
tags:
  # required | technology and tool names. Mirror the topics used across all levels.
  # e.g. OpenFeature, flagd, Spring Boot, Java, OpenTelemetry
  - "TODO: Add tags"

# optional | uncomment and fill in if the adventure has an external contributor:
# contributor:
#   name: "TODO: Contributor name"
#   url: "https://TODO"
#   about: "TODO: Short bio"

backstory:
  # optional | sets the scene for the whole adventure. Can be 1-3 paragraphs.
  # e.g. "The Aletheia Institute is running a multi-phase vision-enhancement trial. The lab is a Spring Boot service whose one job is to record the vision_state of every subject..."
  - "TODO: Add adventure backstory paragraph 1"

# optional | uncomment and fill in for a 'What you will be using' section:
# context:
#   title: "What you'll be using"
#   body:
#     - "TODO: Explain the main technology"

# optional | uncomment and fill in for reward info:
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
const levelList =
  levels.length === 1
    ? levels[0]
    : levels.slice(0, -1).join(", ") + ", and " + levels[levels.length - 1];

console.log(`\n\x1b[32mDone!\x1b[0m Adventure "${title}" scaffolded.\n`);
console.log("Next steps:");
console.log(`  1. Fill in the TODOs in src/data/adventures/${id}/adventure.yaml`);
console.log(`  2. Update discussion URLs in the YAML and matching *-posts.json files`);
console.log(`  3. Run: npm run generate`);
console.log(`  4. Run: node scripts/refresh-discussions.mjs`);
console.log(`  5. Run: npm run lint && npm test && npm run build && npm run test:e2e`);
console.log(`  6. Commit: git commit -s -m "feat(adventures): add ${title} adventure with ${levelList} levels"`);
