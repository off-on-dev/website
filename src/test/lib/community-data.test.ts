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

const VALID_DISCUSSION = {
  discussionUrl: "https://community.offon.dev/t/1",
  discussionPosts: [],
  totalReplies: 0,
};

const VALID_LEADERBOARD = {
  updatedAt: "2025-01-01T00:00:00Z",
  rows: [],
};

describe("getDiscussion", () => {
  it("returns null when the posts file does not exist", () => {
    expect(getDiscussion(adventureId, "beginner")).toBeNull();
  });

  it("parses and returns the discussion when the file is valid", () => {
    writeFileSync(postsPath, JSON.stringify(VALID_DISCUSSION), "utf8");
    expect(getDiscussion(adventureId, "beginner")).toEqual(VALID_DISCUSSION);
    rmSync(postsPath);
  });

  it("parses solvers when present", () => {
    const withSolvers = {
      ...VALID_DISCUSSION,
      solvers: [{ username: "alice", solvedAt: "2025-01-02T00:00:00Z" }],
    };
    writeFileSync(postsPath, JSON.stringify(withSolvers), "utf8");
    expect(getDiscussion(adventureId, "beginner")).toEqual(withSolvers);
    rmSync(postsPath);
  });

  it("throws on invalid JSON syntax: fails the build rather than serving wrong content", () => {
    writeFileSync(postsPath, "not-json{{{", "utf8");
    expect(() => getDiscussion(adventureId, "beginner")).toThrow();
    rmSync(postsPath);
  });

  it("throws when the file has valid JSON but is missing required fields", () => {
    writeFileSync(postsPath, JSON.stringify({ discussionUrl: "https://x.com" }), "utf8");
    expect(() => getDiscussion(adventureId, "beginner")).toThrow("[community-data]");
    rmSync(postsPath);
  });

  it("throws when discussionPosts contains an entry with a wrong type", () => {
    const bad = {
      discussionUrl: "https://community.offon.dev/t/1",
      discussionPosts: [{ username: 42, cooked: "<p>hi</p>", created_at: "2025-01-01" }],
      totalReplies: 0,
    };
    writeFileSync(postsPath, JSON.stringify(bad), "utf8");
    expect(() => getDiscussion(adventureId, "beginner")).toThrow("[community-data]");
    rmSync(postsPath);
  });
});

describe("getLeaderboard", () => {
  it("returns null when the leaderboard file does not exist", () => {
    expect(getLeaderboard(adventureId)).toBeNull();
  });

  it("parses and returns the leaderboard when the file is valid", () => {
    writeFileSync(leaderboardPath, JSON.stringify(VALID_LEADERBOARD), "utf8");
    expect(getLeaderboard(adventureId)).toEqual(VALID_LEADERBOARD);
    rmSync(leaderboardPath);
  });

  it("throws on invalid JSON syntax", () => {
    writeFileSync(leaderboardPath, "{invalid", "utf8");
    expect(() => getLeaderboard(adventureId)).toThrow();
    rmSync(leaderboardPath);
  });

  it("throws when the file is missing the rows array", () => {
    writeFileSync(leaderboardPath, JSON.stringify({ updatedAt: "2025-01-01T00:00:00Z" }), "utf8");
    expect(() => getLeaderboard(adventureId)).toThrow("[community-data]");
    rmSync(leaderboardPath);
  });

  it("throws when a leaderboard row has a wrong type for a required field", () => {
    const bad = {
      updatedAt: "2025-01-01T00:00:00Z",
      rows: [{ rank: "first", username: "alice", points: 100, challengesSolved: 1 }],
    };
    writeFileSync(leaderboardPath, JSON.stringify(bad), "utf8");
    expect(() => getLeaderboard(adventureId)).toThrow("[community-data]");
    rmSync(leaderboardPath);
  });
});
