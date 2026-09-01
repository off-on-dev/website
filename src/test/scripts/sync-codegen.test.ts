// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

/**
 * Unit tests for scripts/lib/sync-codegen.mjs.
 *
 * Non-vacuous checks: each test documents the pre-fix behaviour so that
 * reverting the fix causes the test to fail:
 *
 * - escapeTsString: before fix, adventure names containing `"` were written
 *   raw into TS string literals, breaking e2e/routes.ts syntax. Reverting
 *   (removing the replace calls) causes the "produces a parseable literal"
 *   tests to fail because the output contains unescaped quotes.
 *
 * - escapeRegExp: before fix, slugs containing `.` were interpolated raw into
 *   new RegExp(), making the dot match any character. Reverting (removing the
 *   escaping) causes the "dot does not match any char" test to fail.
 *
 * - upsertRoutesBlock XOR markers: before fix, a file with only one marker
 *   fell through to insertion mode, silently creating duplicate route keys.
 *   Reverting the throw causes the "throws when only opening marker present"
 *   and "throws when only closing marker present" tests to fail.
 */

import { describe, it, expect } from "vitest";
import {
  escapeTsString,
  escapeRegExp,
  upsertRoutesBlock,
} from "../../../scripts/lib/sync-codegen.mjs";

// ---------------------------------------------------------------------------
// escapeTsString
// ---------------------------------------------------------------------------

describe("escapeTsString", () => {
  it("passes plain text through unchanged", () => {
    expect(escapeTsString("Hello World")).toBe("Hello World");
  });

  it("escapes double quotes", () => {
    expect(escapeTsString('The "Orbital" Mission')).toBe('The \\"Orbital\\" Mission');
  });

  it("escapes backslashes before quotes so the order is correct", () => {
    // A raw backslash followed by a quote must become \\" not \"" in the output.
    expect(escapeTsString('path\\"file')).toBe('path\\\\\\"file');
  });

  it("produces a parseable TS string literal value for a title with double quotes", () => {
    // This is the exact failure: adventure title '"Orbital" Mission' written
    // raw into a double-quoted TS string literal breaks e2e/routes.ts.
    const title = '"Orbital" Mission';
    const line = `  "/adventures/foo/": "${escapeTsString(title)} - OffOn Adventures",`;
    // The output must contain the escaped form, not the raw quote.
    expect(line).toBe('  "/adventures/foo/": "\\"Orbital\\" Mission - OffOn Adventures",');
    expect(line).not.toContain('": ""Orbital"');
  });

  it("produces a parseable TS string literal for level name with quotes", () => {
    const levelName = 'Fix the "broken" pipeline';
    const line = `  "/adventures/foo/levels/beginner/": "${escapeTsString(levelName)} - OffOn",`;
    expect(line).toBe('  "/adventures/foo/levels/beginner/": "Fix the \\"broken\\" pipeline - OffOn",');
  });
});

// ---------------------------------------------------------------------------
// escapeRegExp
// ---------------------------------------------------------------------------

describe("escapeRegExp", () => {
  it("a dot in the slug matches only a literal dot, not any character", () => {
    // Pre-fix: new RegExp(`"my.adventure":`) would match "myXadventure": (dot = any char).
    const slug = "my.adventure";
    const re = new RegExp(`"${escapeRegExp(slug)}":`);
    expect(re.test('"my.adventure":')).toBe(true);
    expect(re.test('"myXadventure":')).toBe(false);
  });

  it("without escaping, a dot slug would match the wrong line (documents pre-fix behaviour)", () => {
    const slug = "my.adventure";
    // Raw (un-escaped) interpolation matches any character in place of the dot.
    const reRaw = new RegExp(`"${slug}":`);
    expect(reRaw.test('"myXadventure":')).toBe(true); // false positive before fix
  });

  it("escapes + so it is not treated as a quantifier", () => {
    const re = new RegExp(escapeRegExp("a+b"));
    expect(re.test("a+b")).toBe(true);
    expect(re.test("aaab")).toBe(false);
  });

  it("passes a plain slug through unchanged", () => {
    expect(escapeRegExp("my-adventure")).toBe("my-adventure");
  });
});

// ---------------------------------------------------------------------------
// upsertRoutesBlock
// ---------------------------------------------------------------------------

const SMOKE_SRC = [
  "export const SMOKE_ROUTES = {",
  '  "/": "Home",',
  "};",
].join("\n");

const makeBlock = (slug: string, title: string) =>
  [
    `  // GENERATED:${slug}-smoke`,
    `  "/adventures/${slug}/": "${title} - OffOn Adventures",`,
    `  // /GENERATED:${slug}-smoke`,
  ].join("\n");

describe("upsertRoutesBlock:insertion (neither marker present)", () => {
  it("inserts the block before the closing brace", () => {
    const result = upsertRoutesBlock(
      SMOKE_SRC,
      "  // GENERATED:foo-smoke",
      "  // /GENERATED:foo-smoke",
      makeBlock("foo", "Foo"),
      "\n};",
      "export const SMOKE_ROUTES",
      "e2e/routes.ts"
    );
    expect(result).toContain("// GENERATED:foo-smoke");
    expect(result).toContain('"Foo - OffOn Adventures"');
    expect(result.indexOf("// GENERATED:foo-smoke")).toBeLessThan(result.indexOf("};"));
  });
});

describe("upsertRoutesBlock:replacement (both markers present)", () => {
  it("replaces the existing block in-place", () => {
    const srcWithBlock = [
      "export const SMOKE_ROUTES = {",
      "  // GENERATED:foo-smoke",
      '  "/adventures/foo/": "Old Title - OffOn Adventures",',
      "  // /GENERATED:foo-smoke",
      "};",
    ].join("\n");

    const result = upsertRoutesBlock(
      srcWithBlock,
      "  // GENERATED:foo-smoke",
      "  // /GENERATED:foo-smoke",
      makeBlock("foo", "New Title"),
      "\n};",
      "export const SMOKE_ROUTES",
      "e2e/routes.ts"
    );

    expect(result).toContain('"New Title - OffOn Adventures"');
    expect(result).not.toContain('"Old Title - OffOn Adventures"');
    // Exactly one opening and one closing marker remain.
    expect((result.match(/\/\/ GENERATED:foo-smoke/g) ?? []).length).toBe(1);
    expect((result.match(/\/\/ \/GENERATED:foo-smoke/g) ?? []).length).toBe(1);
  });
});

describe("upsertRoutesBlock:XOR marker cases (the silent-corruption bug)", () => {
  it("throws when only the opening marker is present, naming the missing marker and file", () => {
    const srcOnlyOpen = [
      "export const SMOKE_ROUTES = {",
      "  // GENERATED:foo-smoke",
      '  "/adventures/foo/": "Foo - OffOn Adventures",',
      "};",
    ].join("\n");

    expect(() =>
      upsertRoutesBlock(
        srcOnlyOpen,
        "  // GENERATED:foo-smoke",
        "  // /GENERATED:foo-smoke",
        makeBlock("foo", "Foo"),
        "\n};",
        "export const SMOKE_ROUTES",
        "e2e/routes.ts"
      )
    ).toThrow(/\/GENERATED:foo-smoke.*e2e\/routes\.ts|e2e\/routes\.ts.*\/GENERATED:foo-smoke/);
  });

  it("throws when only the closing marker is present, naming the missing marker and file", () => {
    const srcOnlyClose = [
      "export const SMOKE_ROUTES = {",
      '  "/adventures/foo/": "Foo - OffOn Adventures",',
      "  // /GENERATED:foo-smoke",
      "};",
    ].join("\n");

    expect(() =>
      upsertRoutesBlock(
        srcOnlyClose,
        "  // GENERATED:foo-smoke",
        "  // /GENERATED:foo-smoke",
        makeBlock("foo", "Foo"),
        "\n};",
        "export const SMOKE_ROUTES",
        "e2e/routes.ts"
      )
    ).toThrow(/GENERATED:foo-smoke.*e2e\/routes\.ts|e2e\/routes\.ts.*GENERATED:foo-smoke/);
  });

  it("does NOT silently insert a second block when one marker is missing (pre-fix behaviour)", () => {
    // Documents what the old code did: fell through to insertion, creating duplicate keys.
    // With the fix this code path is unreachable (it throws), so we just verify that
    // the throw prevents any return value from being produced.
    const srcOnlyOpen = [
      "export const SMOKE_ROUTES = {",
      "  // GENERATED:foo-smoke",
      '  "/adventures/foo/": "Foo - OffOn Adventures",',
      "};",
    ].join("\n");

    let result: string | undefined;
    try {
      result = upsertRoutesBlock(
        srcOnlyOpen,
        "  // GENERATED:foo-smoke",
        "  // /GENERATED:foo-smoke",
        makeBlock("foo", "Foo"),
        "\n};",
        "export const SMOKE_ROUTES",
        "e2e/routes.ts"
      );
    } catch {
      // expected
    }
    // If a return value was produced, it must not contain two opening markers.
    if (result !== undefined) {
      expect((result.match(/\/\/ GENERATED:foo-smoke/g) ?? []).length).toBeLessThanOrEqual(1);
    }
  });
});
