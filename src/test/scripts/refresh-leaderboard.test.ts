// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

/**
 * Unit tests for buildAdventureCategories() in scripts/refresh-leaderboard.mjs.
 *
 * Non-vacuous checks:
 * - "throws when leaderboard exists but category ID gone" fails if the guard is
 *   removed (reverts to a silent skip).
 * - "warns and skips new adventure" fails if the warn+skip path is removed (it
 *   would either throw or include the entry).
 */

import { describe, it, expect, vi } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { buildAdventureCategories } from "../../../scripts/refresh-leaderboard.mjs";

function makeAdventureDir(root: string, id: string): string {
  const dir = join(root, id);
  mkdirSync(dir, { recursive: true });
  return dir;
}

function writeYaml(dir: string, content: string): void {
  writeFileSync(join(dir, "adventure.yaml"), content, "utf8");
}

function writeLeaderboard(dir: string): void {
  writeFileSync(join(dir, "leaderboard.json"), JSON.stringify({ updatedAt: "2025-01-01T00:00:00Z", rows: [] }), "utf8");
}

describe("buildAdventureCategories", () => {
  it("returns empty map for an empty directory", () => {
    const root = mkdtempSync(join(tmpdir(), "rl-test-"));
    try {
      expect(buildAdventureCategories(root)).toEqual({});
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("derives categoryId and level flags from YAML", () => {
    const root = mkdtempSync(join(tmpdir(), "rl-test-"));
    try {
      const dir = makeAdventureDir(root, "my-adventure");
      writeYaml(
        dir,
        [
          "community_category_id: 42",
          "levels:",
          "  - level: beginner",
          "  - level: intermediate",
        ].join("\n"),
      );
      expect(buildAdventureCategories(root)).toEqual({
        "my-adventure": {
          categoryId: 42,
          has_beginner: true,
          has_intermediate: true,
          has_expert: false,
          has_single: false,
        },
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("warns and skips a new adventure with no category ID and no leaderboard", () => {
    const root = mkdtempSync(join(tmpdir(), "rl-test-"));
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const dir = makeAdventureDir(root, "new-adventure");
      writeYaml(dir, "levels:\n  - level: beginner\n");
      const result = buildAdventureCategories(root);
      expect(result).toEqual({});
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("new-adventure"),
      );
    } finally {
      warnSpy.mockRestore();
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("throws when a category ID is gone but leaderboard.json already exists", () => {
    const root = mkdtempSync(join(tmpdir(), "rl-test-"));
    try {
      const dir = makeAdventureDir(root, "existing-adventure");
      writeYaml(dir, "levels:\n  - level: beginner\n");
      writeLeaderboard(dir);
      expect(() => buildAdventureCategories(root)).toThrowError(
        /existing-adventure.*community_category_id/,
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("throws when adventure YAML cannot be parsed", () => {
    const root = mkdtempSync(join(tmpdir(), "rl-test-"));
    try {
      const dir = makeAdventureDir(root, "bad-yaml");
      writeYaml(dir, "not: valid: yaml: ::::");
      expect(() => buildAdventureCategories(root)).toThrowError(
        /Cannot parse/,
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("skips entries that are not directories", () => {
    const root = mkdtempSync(join(tmpdir(), "rl-test-"));
    try {
      writeFileSync(join(root, "not-a-dir.yaml"), "community_category_id: 1\n", "utf8");
      expect(buildAdventureCategories(root)).toEqual({});
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("skips directories without adventure.yaml", () => {
    const root = mkdtempSync(join(tmpdir(), "rl-test-"));
    try {
      mkdirSync(join(root, "no-yaml"), { recursive: true });
      expect(buildAdventureCategories(root)).toEqual({});
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
