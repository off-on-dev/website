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
    # required | e.g. "Stand Up the Lab" / "Outcome by Cohort" / "Lights On"
    name: "TODO: Replace with level display name"
    difficulty: ${difficulty}
    topics:
      # required | technology and tool names shown as pill tags on the level card.
      - "TODO: Replace with technology name"
      - "TODO: Replace with another technology name"
    learnings:
      # required | full sentences describing concrete skills or insights gained. Use >- for prose with colons.
      - >-
        TODO: How the client and provider work together: the SDK is provider-agnostic and plugs in via dependency only
      - >-
        TODO: Why hot-reload matters operationally: editing the flag file flips behaviour on the next request with no redeploy
    devcontainerPath: ".devcontainer/TODO/devcontainer.json" # required
    discussionUrl: "/t/TODO" # required
    intro:
      # required | 1-2 sentences: what the player will wire up and what they will prove works.
      - >-
        TODO: Wire the SDK into the service so flag evaluations are resolved by a sidecar running alongside your Codespace.
        Prove that editing the flag file flips the response on the next request without restarting anything.
    objective:
      # required | verifiable outcomes a player can check with a command.
      - >-
        TODO: curl http://localhost:8080/ returns a value resolved from the flag file, not the hard-coded fallback
      - >-
        TODO: Editing the flag file and re-running curl returns the new value without restarting the service
    # optional | uncomment to describe who this level is aimed at and what prior knowledge helps.
    # audience: >-
    #   Best suited for platform engineers and developers new to feature flagging. Familiarity with basic
    #   Java and Spring Boot helps but no prior SDK experience is needed.
    # optional | narrative context that sets the scene for this specific level.
    # backstory:
    #   - >-
    #     The service is returning a hard-coded response. The SDK was integrated last quarter but the provider
    #     was never registered, so every request falls back to the default. Complete the wiring so the service
    #     reads from the flag file instead.
    # optional | describe the technical setup (services, ports, how they connect).
    # architecture:
    #   - >-
    #     Two containers run side-by-side: the app on http://localhost:8080 and a sidecar on port 8013.
    #   - >-
    #     Edit the flag file through the IDE; the file watcher picks up changes within about a second.
    toolbox:
      # required | list the CLI tools and services available in the Codespace. Add a url field for external docs.
      - name: "TODO: ./run.sh"
        description: "TODO: Starts the service; also available via F5 in VS Code"
      - name: "curl"
        description: "TODO: sends requests to http://localhost:8080/ to confirm flags are being evaluated"
        url: "https://curl.se/"
    howToPlay:
      # required | walk the player from the broken state to a working solution, one titled step at a time.
      # Use fenced code blocks for commands. First step: confirm the broken state. Last step: run the verifier.
      - title: "Confirm the Broken State"
        body: |
          TODO: Start the service and confirm the hard-coded fallback is returned:

          \`\`\`sh
          ./run.sh
          curl http://localhost:8080/
          # returns the fallback — this is the broken state
          \`\`\`
      - title: "TODO: Replace with main fix step title"
        body: >-
          TODO: Replace with instructions for the main fix. What file to open, what to add or change.
      - title: "Verify the Fix"
        body: |
          TODO: Edit the flag file and re-run curl without restarting anything:

          \`\`\`sh
          curl http://localhost:8080/
          # now returns the flag-resolved value
          \`\`\`
    helpfulLinks:
      # optional | reference docs the player will need. label is the link text; url must be a full https:// URL.
      - label: "TODO: SDK documentation"
        url: https://example.com/docs
      - label: "TODO: Flag definition reference"
        url: https://example.com/flags
    verification:
      # required | keep the defaults unless the verification script name or message differs.
      command: "./verify.sh"
      description: "Once you think you've solved the challenge, run the verification script."`;
  })
  .join("\n\n");

const yamlContent = `id: ${id}
title: "${title}"
month: "${month}"
# required | 2-3 sentences: what technology is used and what each level does.
story: >-
  TODO: Replace with a 2-3 sentence summary. e.g. Three levels of OpenFeature with flagd as the provider,
  in a Java + Spring Boot service. Wire the SDK (Beginner), add cohort targeting (Intermediate),
  then instrument with OpenTelemetry (Expert).
tags:
  # required | technology and tool names. Mirror the topics used across all levels.
  - "TODO: Replace with technology name"
  - "TODO: Replace with another technology name"

# optional | uncomment and fill in if the adventure has an external contributor:
# contributor:
#   name: "Contributor Name"
#   url: "https://contributor-website.example.com"
#   about: >-
#     Short bio. e.g. CNCF Ambassador and maintainer of OpenFeature. Helps teams release faster
#     through open standards and feature flagging. Familiar face at KubeCon and Devoxx.

# optional | narrative context that sets the scene for the whole adventure. Can be 1-3 paragraphs.
# backstory:
#   - >-
#     Replace with paragraph 1. Describe the fictional world and situation. e.g. The Aletheia
#     Institute is running a multi-phase trial. The lab is a Spring Boot service whose one job is
#     to record the state of every subject who walks through the protocol.
#   - >-
#     Replace with paragraph 2. Build the stakes. e.g. It hasn't been working for eight months.
#     Every subject through the door has been recorded as "untreated".

# optional | "What you'll be using" explainer section shown on the adventure overview page.
# context:
#   title: "What you'll be using"
#   body:
#     - >-
#       Replace with a paragraph explaining the main technology. e.g. OpenFeature is a vendor-neutral
#       standard for feature flags. The reference cloud-native implementation is flagd, which serves
#       flag definitions from a JSON file.
#     - >-
#       Replace with a second paragraph explaining how the adventure uses the technology.

# optional | uncomment and fill in for reward info:
# rewards:
#   deadline: "DD Month YYYY at HH:MM CET"
#   eligibility: "Complete all levels and post your solution in the community before the deadline to be eligible."
#   tiers:
#     - label: "1st place"
#       description: "Replace with prize description"
#     - label: "Top 3"
#       description: "Credly badge to showcase the achievement"
#   rankingNote: >-
#     Ranking is determined by total points across all levels. Points per level are awarded by
#     submission order within the active week (100 for the first valid solution, 95 for the second;
#     late submissions still earn 60).
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
