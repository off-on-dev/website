// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

/**
 * Validate CI-refreshed Discourse data against the schemas the build actually uses.
 *
 * The refresh-community-data workflow used to assert only that a few top-level
 * fields were arrays. That gate is weaker than the build's own schemas, so data
 * Discourse newly starts producing (a section id outside SECTION_IDS, for one)
 * passed validation, got committed to main, and only then failed the deploy build
 * on z.enum. Validating with the real parsers closes that gap: whatever the build
 * would reject, this step rejects first, before anything is committed.
 *
 * Reuses the build's own schemas rather than restating their shapes:
 *   - parseCommunityLeadersData        (src/lib/community-leaders.ts)
 *   - discussionSchema / leaderboardSchema  (src/lib/community-data.ts)
 *
 * Uses the schemas rather than getDiscussion/getLeaderboard deliberately. Those
 * two resolve ADVENTURES_DIR once at module load from process.cwd(), so they can
 * only ever read the real tree, and would report any other directory's files as
 * simply absent. Applying the schema to a path we resolve ourselves keeps this
 * validator honest about what it checked, and testable against fixtures.
 *
 * Both modules are TypeScript. Node 26 strips types natively, so they import
 * directly with no build step.
 *
 * Usage: node scripts/validate-refreshed-data.mjs   (from the repo root)
 */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = process.cwd();
const ADVENTURES_DIR = resolve(ROOT, "src/data/adventures");
const LEADERS_PATH = resolve(ROOT, "src/data/community-leaders.json");

/**
 * Validate every refreshed file. Returns an array of human-readable error
 * strings; empty means everything passed. Exported for unit testing.
 */
export async function validateRefreshedData({
  adventuresDir = ADVENTURES_DIR,
  leadersPath = LEADERS_PATH,
} = {}) {
  const errors = [];

  const { parseCommunityLeadersData } = await import("../src/lib/community-leaders.ts");
  const { discussionSchema, leaderboardSchema } = await import("../src/lib/community-data.ts");

  /** Parse `path` with `schema`, pushing a labelled error instead of throwing. */
  const check = (path, label, schema) => {
    let raw;
    try {
      raw = JSON.parse(readFileSync(path, "utf-8"));
    } catch (err) {
      errors.push(`${label}: ${err.message}`);
      return;
    }
    const result = schema.safeParse(raw);
    if (!result.success) {
      errors.push(`${label}: failed schema validation: ${result.error.message}`);
      return;
    }
    console.log(`  OK ${label}`);
  };

  // community-leaders.json, through the same parser the build uses.
  if (!existsSync(leadersPath)) {
    errors.push(`${leadersPath}: file is missing`);
  } else {
    try {
      const raw = JSON.parse(readFileSync(leadersPath, "utf-8"));
      const data = parseCommunityLeadersData(raw);
      console.log(
        `  OK community-leaders.json (${data.sections.length} sections: ` +
          `${data.sections.map((s) => s.id).join(", ")})`,
      );
    } catch (err) {
      errors.push(`community-leaders.json: ${err.message}`);
    }
  }

  if (!existsSync(adventuresDir)) {
    errors.push(`${adventuresDir}: adventures directory is missing`);
    return errors;
  }

  for (const entry of readdirSync(adventuresDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const adventureId = entry.name;
    const dir = join(adventuresDir, adventureId);

    for (const file of readdirSync(dir)) {
      if (!file.endsWith("-posts.json")) continue;
      check(join(dir, file), `${adventureId}/${file}`, discussionSchema);
    }

    if (existsSync(join(dir, "leaderboard.json"))) {
      check(join(dir, "leaderboard.json"), `${adventureId}/leaderboard.json`, leaderboardSchema);
    }
  }

  return errors;
}

async function main() {
  console.log("Validating refreshed Discourse data against the build's own schemas...\n");
  const errors = await validateRefreshedData();

  if (errors.length > 0) {
    console.error(`\n${errors.length} validation error(s):`);
    for (const e of errors) console.error(`  ERROR ${e}`);
    console.error("\nAborting before commit to protect main.");
    process.exit(1);
  }

  console.log("\nAll refreshed data passes the schemas the build uses.");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
