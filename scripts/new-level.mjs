#!/usr/bin/env node

/**
 * Add a new level to an existing adventure.
 *
 * Usage:
 *   node scripts/new-level.mjs --adventure "blind-by-design" --level expert
 *
 * What it does:
 *   - Creates src/data/adventures/<adventure>/<level>-posts.json (discussion stub)
 *   - Adds prerender entry to react-router.config.ts
 *   - Adds sitemap entry to public/sitemap.xml
 *   - Sets has_<level>: true in ADVENTURE_CATEGORIES in scripts/refresh-leaderboard.mjs
 *   - Prints a YAML snippet to paste into the adventure's adventure.yaml levels array
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

if (!args.adventure) fail("--adventure is required (e.g. --adventure blind-by-design)");
if (!args.level) fail("--level is required (e.g. --level expert)");

const adventureId = args.adventure;
const levelId = args.level;

const VALID_LEVELS = ["beginner", "intermediate", "expert"];
if (!VALID_LEVELS.includes(levelId)) {
  fail(`--level must be one of: ${VALID_LEVELS.join(", ")}`);
}

const ADVENTURES_DIR = resolve(ROOT, "src/data/adventures");
const adventureDataDir = resolve(ADVENTURES_DIR, adventureId);
const yamlPath = resolve(adventureDataDir, "adventure.yaml");

if (!existsSync(yamlPath)) {
  fail(`Adventure YAML not found: src/data/adventures/${adventureId}/adventure.yaml\nRun 'npm run new-adventure' first to create the adventure.`);
}

const jsonPath = resolve(adventureDataDir, `${levelId}-posts.json`);
if (existsSync(jsonPath)) {
  fail(`Level JSON already exists: src/data/adventures/${adventureId}/${levelId}-posts.json`);
}

const difficultyMap = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  expert: "Expert",
};
const difficulty = difficultyMap[levelId] || "Beginner";

// 1. Create discussion JSON stub
mkdirSync(adventureDataDir, { recursive: true });
writeFileSync(
  jsonPath,
  JSON.stringify({ discussionUrl: "TODO: Add Discourse topic URL" }, null, 2) + "\n"
);
console.log(`  Created: src/data/adventures/${adventureId}/${levelId}-posts.json`);

// 2. Patch react-router.config.ts
const configPath = resolve(ROOT, "react-router.config.ts");
let configContent = readFileSync(configPath, "utf-8");

const newRoute = `"/adventures/${adventureId}/levels/${levelId}"`;

if (configContent.includes(newRoute)) {
  console.log(`  Skipped: react-router.config.ts (entry already exists)`);
} else {
  configContent = configContent.replace(
    /(prerender: \[[\s\S]*?)(  \],)/,
    (match, before, closing) => {
      const trimmed = before.trimEnd();
      const needsComma = !trimmed.endsWith(",");
      return `${trimmed}${needsComma ? "," : ""}\n    ${newRoute},\n${closing}`;
    }
  );
  if (!configContent.includes(newRoute)) {
    fail("Failed to patch react-router.config.ts. The file format may have changed. Patch manually.");
  }
  writeFileSync(configPath, configContent);
  console.log(`  Patched: react-router.config.ts`);
}

// 3. Patch sitemap.xml
const sitemapPath = resolve(ROOT, "public/sitemap.xml");
let sitemapContent = readFileSync(sitemapPath, "utf-8");

const sitemapEntry = `  <url><loc>https://offon.dev/adventures/${adventureId}/levels/${levelId}/</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`;

if (sitemapContent.includes(`/adventures/${adventureId}/levels/${levelId}/`)) {
  console.log(`  Skipped: public/sitemap.xml (entry already exists)`);
} else {
  if (!sitemapContent.includes("</urlset>")) {
    fail("Failed to patch sitemap.xml. Could not find </urlset> marker.");
  }
  sitemapContent = sitemapContent.replace("</urlset>", `${sitemapEntry}\n</urlset>`);
  writeFileSync(sitemapPath, sitemapContent);
  console.log(`  Patched: public/sitemap.xml`);
}

// 4. Patch ADVENTURE_CATEGORIES in scripts/refresh-leaderboard.mjs
const leaderboardScriptPath = resolve(ROOT, "scripts/refresh-leaderboard.mjs");
const levelFlag = `has_${levelId}`;
const leaderboardContent = readFileSync(leaderboardScriptPath, "utf-8");
const escapedId = adventureId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const flagFalseRegex = new RegExp(`("${escapedId}"[^\\n]*\\b${levelFlag}:\\s*)false`);

if (flagFalseRegex.test(leaderboardContent)) {
  writeFileSync(leaderboardScriptPath, leaderboardContent.replace(flagFalseRegex, "$1true"));
  console.log(`  Patched: scripts/refresh-leaderboard.mjs (${levelFlag}: true)`);
} else if (new RegExp(`"${escapedId}"`).test(leaderboardContent)) {
  console.log(`  Skipped: scripts/refresh-leaderboard.mjs (${levelFlag} already true)`);
} else {
  console.warn(`  Warning: "${adventureId}" not found in ADVENTURE_CATEGORIES in scripts/refresh-leaderboard.mjs. Add it manually.`);
}

// 5. Print the YAML snippet to paste
console.log(`\n\x1b[32mDone!\x1b[0m Level "${levelId}" config added for "${adventureId}".\n`);
console.log("Paste this into the levels array in src/data/adventures/" + adventureId + "/adventure.yaml:\n");
console.log(`  - id: ${levelId}
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
      description: "Once you think you've solved the challenge, run the verification script."`);
console.log(`\nNext steps:`);
console.log(`  1. Paste the snippet above into src/data/adventures/${adventureId}/adventure.yaml`);
console.log(`  2. Fill in the TODOs`);
console.log(`  3. Add the level route to src/routes.ts`);
console.log(`  4. Update the discussionUrl in the YAML and src/data/adventures/${adventureId}/${levelId}-posts.json`);
console.log(`  5. Run: npm run generate`);
console.log(`  6. Run: node scripts/refresh-discussions.mjs`);
console.log(`  7. Run: node scripts/refresh-leaderboard.mjs  (requires DISCOURSE_API_KEY)`);
console.log(`  8. Add the level URL to e2e/smoke.spec.ts, src/test/seo.test.ts, and src/test/prerender.test.ts`);
console.log(`  9. Update the routes table in README.md`);
console.log(` 10. Run: npm run lint && npm test && npm run build && npm run test:e2e`);
