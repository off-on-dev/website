// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

// Inline links must not be jammed against the words around them.
//
// Astro strips the whitespace between a text node and an adjacent element when
// the source has a newline there, so markup that reads correctly renders as
// "See ourPrivacy Policyfor details." JSX had the same behaviour and the React
// source carried explicit `{" "}`; Vue's compiler condensed it to a single space
// instead, so the requirement disappeared from view and came back with the port
// to .astro.
//
// This scans the build rather than a live page: it is a text-rendering defect
// that no accessibility or smoke assertion looks at, and it is close to
// invisible when reviewing the source.

import { test, expect } from "@playwright/test";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const DIST = resolve(import.meta.dirname, "..", "dist");

function htmlFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(full);
    return entry.name.endsWith(".html") ? [full] : [];
  });
}

/** Strip regions where adjacency is meaningless or intentional. */
function stripCodeRegions(html: string): string {
  return html.replace(/<(script|style|pre|code)\b[\s\S]*?<\/\1>/g, "");
}

// Characters that may legitimately sit against a link with no space:
// an opening bracket before it, and closing punctuation after it.
const OK_BEFORE = /[\s>(["'‘’“”\-–—/]/;
const OK_AFTER = /[\s.,;:!?)\]<&"'‘’“”\-–—/]/;

test("no inline link is jammed against surrounding text", () => {
  const offenders: string[] = [];

  for (const file of htmlFiles(DIST)) {
    const html = stripCodeRegions(readFileSync(file, "utf8"));
    const rel = file.slice(DIST.length + 1);

    for (const match of html.matchAll(/(.)<a\s[^>]*>([^<]{0,24})/g)) {
      if (!OK_BEFORE.test(match[1])) {
        offenders.push(`${rel}: "...${match[1]}" runs into link "${match[2].trim()}"`);
      }
    }
    for (const match of html.matchAll(/>([^<]{0,24})<\/a>(.)/g)) {
      if (!OK_AFTER.test(match[2])) {
        offenders.push(`${rel}: link "${match[1].trim()}" runs into "${match[2]}..."`);
      }
    }
  }

  // Report one line per distinct message so a failure names the component.
  expect(
    [...new Set(offenders.map((o) => o.replace(/^[^:]+: /, "")))].sort(),
    `${offenders.length} occurrences. Add {" "} around the link in the .astro source.`,
  ).toEqual([]);
});
