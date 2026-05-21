#!/usr/bin/env node

/**
 * Add a new level to an existing adventure.
 *
 * Usage:
 *   node scripts/new-level.mjs --adventure "blind-by-design" --level expert
 *
 * What it does:
 *   - Creates src/data/adventures/<adventure>/<level>.json (discussion stub)
 *   - Adds prerender entry to react-router.config.ts
 *   - Adds sitemap entry to public/sitemap.xml
 *   - Prints a TS snippet to paste into the adventure file's levels array
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
const adventureFile = resolve(ADVENTURES_DIR, `${adventureId}.ts`);
const adventureDataDir = resolve(ADVENTURES_DIR, adventureId);

if (!existsSync(adventureFile)) {
  fail(`Adventure file not found: src/data/adventures/${adventureId}.ts\nRun 'npm run new-adventure' first to create the adventure.`);
}

const jsonPath = resolve(adventureDataDir, `${levelId}.json`);
if (existsSync(jsonPath)) {
  fail(`Level JSON already exists: src/data/adventures/${adventureId}/${levelId}.json`);
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
console.log(`  Created: src/data/adventures/${adventureId}/${levelId}.json`);

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
  sitemapContent = sitemapContent.replace("</urlset>", `${sitemapEntry}\n</urlset>`);
  writeFileSync(sitemapPath, sitemapContent);
  console.log(`  Patched: public/sitemap.xml`);
}

// 4. Print the TS snippet to paste
console.log(`\n\x1b[32mDone!\x1b[0m Level "${levelId}" config added for "${adventureId}".\n`);
console.log("Paste this into the levels array in src/data/adventures/" + adventureId + ".ts:\n");
console.log(`    {
      id: "${levelId}",
      name: "TODO: Level name",
      difficulty: "${difficulty}",
      learnings: ["TODO: Add learnings"],
      codespacesUrl: \`\${CODESPACES_BASE}?devcontainer_path=TODO&quickstart=1\`,
      discussionUrl: \`\${COMMUNITY_URL}/t/TODO\`,
      backstory: [
        "TODO: Add backstory",
      ],
      objective: [
        "TODO: Add objectives",
      ],
      toolbox: [
        { name: "TODO", description: "TODO: Add tools" },
      ],
      howToPlay: [
        { title: "TODO: Step 1", body: "TODO: Add instructions" },
      ],
    },`);
console.log(`\nNext steps:`);
console.log(`  1. Paste the snippet above into src/data/adventures/${adventureId}.ts`);
console.log(`  2. Fill in the TODOs`);
console.log(`  3. Update the discussionUrl in src/data/adventures/${adventureId}/${levelId}.json`);
console.log(`  4. Run: node scripts/refresh-discussions.mjs`);
console.log(`  5. Run: npm run lint && npm test && npm run build && npm run test:e2e`);
