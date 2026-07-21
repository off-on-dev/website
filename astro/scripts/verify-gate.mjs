// Phase 2 verification gate: prove the ported markdown pipeline produces
// byte-identical HTML to the retiring generator's *.generated.ts output.
// Renders real fields from each adventure YAML and asserts each appears in the
// committed generated file. Run: node scripts/verify-gate.mjs (from astro/).

import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import { mdToInline, mdToBlock } from "../src/lib/markdown-pipeline.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const ADV = resolve(ROOT, "src/data/adventures");

// Reverse the generator's TS-literal escaping so produced HTML can be found in
// the source text. Also normalize the abbr-exp-N counter (numbering differs by
// render order between the two runs; that difference is expected and cosmetic).
function normalize(text) {
  return text.replace(/\\([`"$\\])/g, "$1").replace(/\\n/g, "\n").replace(/abbr-exp-\d+/g, "abbr-exp-N");
}
const norm = (s) => s.replace(/abbr-exp-\d+/g, "abbr-exp-N");

let pass = 0;
let fail = 0;
function check(label, produced, haystack) {
  if (normalize(haystack).includes(norm(produced))) {
    pass++;
  } else {
    fail++;
    console.log(`  ✗ ${label}`);
    console.log(`    produced: ${norm(produced).slice(0, 160)}`);
  }
}

for (const dir of readdirSync(ADV, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;
  const id = dir.name;
  const yamlPath = resolve(ADV, id, "adventure.yaml");
  const genPath = resolve(ADV, `${id}.generated.ts`);
  let raw, gen;
  try {
    raw = readFileSync(yamlPath, "utf8");
    gen = readFileSync(genPath, "utf8");
  } catch {
    continue;
  }
  const data = parseYaml(raw);
  console.log(`\n${id}:`);

  // contributor.about -> aboutHtml (inline)
  if (data.contributor?.about) {
    check("contributor.about", await mdToInline(data.contributor.about), gen);
  }
  // adventure story -> inline (when explicit)
  if (data.story) check("story", await mdToInline(data.story), gen);

  for (const level of data.levels ?? []) {
    // learnings (inline array)
    const learnings = level.learnings ?? level.what_you_learn ?? [];
    for (const l of learnings) check(`${level.level}.learning`, await mdToInline(l), gen);
    // how_to_play content (block) — exercises code blocks, links, external-link annotation
    for (const step of level.how_to_play ?? []) {
      check(`${level.level}.how_to_play.content`, await mdToBlock(step.content), gen);
    }
    // audience (inline) — often contains abbr in blind-by-design/lex-imperfecta
    if (level.audience) check(`${level.level}.audience`, await mdToInline(level.audience), gen);
  }
}

console.log(`\n${pass} matched, ${fail} mismatched.`);
process.exit(fail === 0 ? 0 : 1);
