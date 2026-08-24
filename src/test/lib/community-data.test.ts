// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

// community-data uses Node's fs directly (build-time only). These tests
// use real temp files so there is no mock/happy-dom interaction to worry about.

import { describe, it, expect, afterAll } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

// Create a temp tree that mirrors src/data/adventures/<id>/ at test startup.
const tempRoot = mkdtempSync(join(tmpdir(), "community-data-test-"));
const adventureId = "test-adventure";
const adventureDir = join(tempRoot, adventureId);
mkdirSync(adventureDir, { recursive: true });

afterAll(() => {
  rmSync(tempRoot, { recursive: true, force: true });
});

// Patch process.cwd so community-data resolves its ADVENTURES_DIR to our
// temp tree. The module reads process.cwd() at import time, so we must
// replace it before importing.
const originalCwd = process.cwd;
process.cwd = () => tempRoot;
// Use a dynamic import so that the patched cwd is in effect when the module
// is first evaluated. Each test re-imports to get a fresh ADVENTURES_DIR.
const { getDiscussion, getLeaderboard } = await import("@/lib/community-data");
process.cwd = originalCwd;

// Resolve the actual path community-data will look in, mirroring what the module does.
const postsPath = join(tempRoot, "src/data/adventures", adventureId, "beginner-posts.json");
const leaderboardPath = join(tempRoot, "src/data/adventures", adventureId, "leaderboard.json");
mkdirSync(join(tempRoot, "src/data/adventures", adventureId), { recursive: true });

describe("getDiscussion", () => {
  it("returns null when the posts file does not exist", () => {
    expect(getDiscussion(adventureId, "beginner")).toBeNull();
  });

  it("parses and returns the discussion when the file is valid JSON", () => {
    const fixture = {
      discussionUrl: "https://community.offon.dev/t/1",
      discussionPosts: [],
      totalReplies: 0,
    };
    writeFileSync(postsPath, JSON.stringify(fixture), "utf8");
    expect(getDiscussion(adventureId, "beginner")).toEqual(fixture);
    rmSync(postsPath);
  });

  it("returns null and logs an error when the file contains invalid JSON", () => {
    writeFileSync(postsPath, "not-json{{{", "utf8");
    const errors: unknown[][] = [];
    const orig = console.error;
    console.error = (...args: unknown[]) => { errors.push(args); };
    const result = getDiscussion(adventureId, "beginner");
    console.error = orig;
    rmSync(postsPath);
    expect(result).toBeNull();
    expect(errors.length).toBeGreaterThan(0);
    expect(String(errors[0]?.[0])).toContain("[community-data]");
  });
});

describe("getLeaderboard", () => {
  it("returns null when the leaderboard file does not exist", () => {
    expect(getLeaderboard(adventureId)).toBeNull();
  });

  it("returns null and logs an error on invalid JSON", () => {
    writeFileSync(leaderboardPath, "{invalid", "utf8");
    const errors: unknown[][] = [];
    const orig = console.error;
    console.error = (...args: unknown[]) => { errors.push(args); };
    const result = getLeaderboard(adventureId);
    console.error = orig;
    rmSync(leaderboardPath);
    expect(result).toBeNull();
    expect(errors.length).toBeGreaterThan(0);
    expect(String(errors[0]?.[0])).toContain("[community-data]");
  });
});
