#!/usr/bin/env node

/**
 * Scaffold a new adventure with all required files and config entries.
 *
 * Usage:
 *   node scripts/new-adventure.mjs --id "signal-in-the-storm" --title "Signal in the Storm" --month "JUN 2026" --levels beginner,intermediate,expert
 *
 * What it generates:
 *   - src/data/adventures/<id>.ts (template with TODOs)
 *   - src/data/adventures/<id>/<level>.json (discussion stubs)
 *   - Patches: index.ts, react-router.config.ts, public/sitemap.xml
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

function toConstName(id) {
  return id.toUpperCase().replace(/-/g, "_");
}

function toCamelCase(id) {
  return id.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
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
const constName = toConstName(id);

const ADVENTURES_DIR = resolve(ROOT, "src/data/adventures");
const adventureFile = resolve(ADVENTURES_DIR, `${id}.ts`);
const adventureDataDir = resolve(ADVENTURES_DIR, id);

if (existsSync(adventureFile)) {
  fail(`Adventure file already exists: src/data/adventures/${id}.ts`);
}

// 1. Create per-level discussion JSON stubs
mkdirSync(adventureDataDir, { recursive: true });

for (const level of levels) {
  const jsonPath = resolve(adventureDataDir, `${level}.json`);
  if (!existsSync(jsonPath)) {
    writeFileSync(
      jsonPath,
      JSON.stringify({ discussionUrl: "TODO: Add Discourse topic URL" }, null, 2) + "\n"
    );
    console.log(`  Created: src/data/adventures/${id}/${level}.json`);
  }
}

// 2. Generate the adventure TS file
const difficultyMap = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  expert: "Expert",
};

const levelEntries = levels
  .map((level) => {
    const difficulty = difficultyMap[level] || "Beginner";
    return `    {
      id: "${level}",
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
    }`;
  })
  .join(",\n");

const tsContent = `import { CODESPACES_BASE, COMMUNITY_URL } from "@/data/constants";
import type { Adventure } from "./types";

export const ${constName}: Adventure = {
  id: "${id}",
  title: "${title}",
  month: "${month}",
  story: "TODO: Add adventure story summary",
  tags: ["TODO: Add tags"],
  levels: [
${levelEntries},
  ],
};
`;

writeFileSync(adventureFile, tsContent);
console.log(`  Created: src/data/adventures/${id}.ts`);

// 3. Patch index.ts
const indexPath = resolve(ADVENTURES_DIR, "index.ts");
let indexContent = readFileSync(indexPath, "utf-8");

// Add import after the last adventure import (before the type import line)
const adventureImportPattern = /^(import \{ \w+ \} from "\.\/[\w-]+";)(\nimport type)/m;
if (adventureImportPattern.test(indexContent)) {
  indexContent = indexContent.replace(
    adventureImportPattern,
    `$1\nimport { ${constName} } from "./${id}";$2`
  );
} else {
  // Fallback: add before the first export
  indexContent = indexContent.replace(
    /\nexport /,
    `\nimport { ${constName} } from "./${id}";\n\nexport `
  );
}

// Add to ADVENTURES array (before the closing ];)
indexContent = indexContent.replace(
  /(export const ADVENTURES: Adventure\[\] = \[[\s\S]*?)(];)/,
  (match, before, closing) => {
    const trimmed = before.trimEnd();
    const needsComma = !trimmed.endsWith(",");
    return `${trimmed}${needsComma ? "," : ""}\n  ${constName},\n${closing}`;
  }
);

writeFileSync(indexPath, indexContent);
console.log(`  Patched: src/data/adventures/index.ts`);

// 4. Patch react-router.config.ts
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

writeFileSync(configPath, configContent);
console.log(`  Patched: react-router.config.ts`);

// 5. Patch sitemap.xml
const sitemapPath = resolve(ROOT, "public/sitemap.xml");
let sitemapContent = readFileSync(sitemapPath, "utf-8");

const sitemapEntries = [
  `  <url><loc>https://offon.dev/adventures/${id}/</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`,
  ...levels.map(
    (l) =>
      `  <url><loc>https://offon.dev/adventures/${id}/levels/${l}/</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`
  ),
];

sitemapContent = sitemapContent.replace(
  "</urlset>",
  `${sitemapEntries.join("\n")}\n</urlset>`
);

writeFileSync(sitemapPath, sitemapContent);
console.log(`  Patched: public/sitemap.xml`);

// Done
console.log(`\n\x1b[32mDone!\x1b[0m Adventure "${title}" scaffolded.\n`);
console.log("Next steps:");
console.log(`  1. Fill in the TODOs in src/data/adventures/${id}.ts`);
console.log(`  2. Update discussion URLs in src/data/adventures/${id}/*.json`);
console.log(`  3. Run: node scripts/refresh-discussions.mjs`);
console.log(`  4. If using a contributor not yet in contributors.ts, add them there`);
console.log(`  5. Run: npm run lint && npm test && npm run build && npm run test:e2e`);
