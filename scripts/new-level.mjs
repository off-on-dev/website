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

// 4. Print the YAML snippet to paste
console.log(`\n\x1b[32mDone!\x1b[0m Level "${levelId}" config added for "${adventureId}".\n`);
console.log("Paste this into the levels array in src/data/adventures/" + adventureId + "/adventure.yaml:\n");
console.log(`  - id: ${levelId}
    name: "TODO: Level name"
    difficulty: ${difficulty}
    topics:
      - "TODO: Add topic tags"
    learnings:
      - "TODO: Add learning 1"
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
      description: "Once you think you've solved the challenge, run the verification script."`);
console.log(`\nNext steps:`);
console.log(`  1. Paste the snippet above into src/data/adventures/${adventureId}/adventure.yaml`);
console.log(`  2. Fill in the TODOs`);
console.log(`  3. Update the discussionUrl in the YAML and src/data/adventures/${adventureId}/${levelId}-posts.json`);
console.log(`  4. Run: npm run generate`);
console.log(`  5. Run: node scripts/refresh-discussions.mjs`);
console.log(`  6. Run: npm run lint && npm test && npm run build && npm run test:e2e`);
