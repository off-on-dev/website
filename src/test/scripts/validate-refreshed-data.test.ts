// SPDX-FileCopyrightText: 2025 OffOn contributors
// SPDX-License-Identifier: MIT

/**
 * Unit tests for scripts/validate-refreshed-data.mjs.
 *
 * The workflow gate this replaces checked only Array.isArray(d.sections), which
 * is weaker than the build's schema. A section id Discourse newly started
 * producing passed the gate, was committed to main, and only then failed z.enum
 * in the deploy build. These tests fail if that gap reopens.
 *
 * Non-vacuous checks:
 * - "rejects an unrecognised section id" fails if the real parser is swapped back
 *   for a structural array check: the bad payload is still a valid array.
 * - "rejects a leaderboard row missing points" and the posts equivalent fail the
 *   same way, for the same reason.
 * - "accepts the repository's own committed data" fails if the validator is made
 *   stricter than the build, which would block every hourly run.
 *
 * The validator applies the exported schemas to paths it resolves itself, so
 * fixtures work without touching process.cwd(). An earlier draft called
 * getDiscussion/getLeaderboard instead; those freeze ADVENTURES_DIR at module
 * load, so every fixture read as "file absent" and the invalid-data tests below
 * all passed vacuously. They are the reason the validator uses schemas directly.
 */

import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { validateRefreshedData } from "../../../scripts/validate-refreshed-data.mjs";

const VALID_LEADERS = {
  lastUpdated: "2025-01-01T00:00:00Z",
  sections: [
    {
      id: "top-contributors",
      title: "Top Contributors",
      users: [{ username: "alice", avatarUrl: "https://example.com/a.png", count: 5 }],
    },
  ],
};

const VALID_POSTS = {
  discussionUrl: "https://community.offon.dev/t/thing/1",
  discussionPosts: [
    {
      username: "alice",
      cooked: "Nice one.",
      created_at: "2025-01-01T00:00:00Z",
    },
  ],
  totalReplies: 1,
  solvers: [],
};

const VALID_LEADERBOARD = {
  updatedAt: "2025-01-01T00:00:00Z",
  rows: [{ rank: 1, username: "alice", points: 10, challengesSolved: 2 }],
};

let root: string;

/** Build a temp root laid out like the repo's data directory. */
function makeRoot(): string {
  const dir = mkdtempSync(join(tmpdir(), "vrd-test-"));
  mkdirSync(join(dir, "src/data/adventures"), { recursive: true });
  return dir;
}

function writeJson(path: string, data: unknown): void {
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

/**
 * Fixture writer. `posts` and `leaderboard` are deliberately `unknown`: most of
 * the tests below write shapes the schemas must reject, which by definition do
 * not satisfy the valid types. Pass null to omit a file entirely.
 */
function addAdventure(
  dir: string,
  id: string,
  options: { posts?: unknown; leaderboard?: unknown; levelId?: string } = {},
): void {
  const {
    posts = VALID_POSTS,
    leaderboard = VALID_LEADERBOARD,
    levelId = "beginner",
  } = options;
  const advDir = join(dir, "src/data/adventures", id);
  mkdirSync(advDir, { recursive: true });
  if (posts) writeJson(join(advDir, `${levelId}-posts.json`), posts);
  if (leaderboard) writeJson(join(advDir, "leaderboard.json"), leaderboard);
}

function opts(dir: string) {
  return {
    adventuresDir: resolve(dir, "src/data/adventures"),
    leadersPath: resolve(dir, "src/data/community-leaders.json"),
  };
}

beforeEach(() => {
  root = makeRoot();
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("validateRefreshedData", () => {
  describe("valid data", () => {
    it("returns no errors when everything matches the build schemas", async () => {
      writeJson(join(root, "src/data/community-leaders.json"), VALID_LEADERS);
      addAdventure(root, "my-adventure");
      expect(await validateRefreshedData(opts(root))).toEqual([]);
    });

    it("accepts an adventure with no leaderboard.json yet", async () => {
      writeJson(join(root, "src/data/community-leaders.json"), VALID_LEADERS);
      addAdventure(root, "new-adventure", { leaderboard: null });
      expect(await validateRefreshedData(opts(root))).toEqual([]);
    });

    it("accepts every id in SECTION_IDS", async () => {
      const { SECTION_IDS } = await import("@/lib/community-leaders");
      writeJson(join(root, "src/data/community-leaders.json"), {
        lastUpdated: "2025-01-01T00:00:00Z",
        sections: SECTION_IDS.map((id) => ({ id, title: id, users: [] })),
      });
      expect(await validateRefreshedData(opts(root))).toEqual([]);
    });
  });

  describe("community-leaders.json", () => {
    it("rejects an unrecognised section id", async () => {
      // The exact case that used to reach main: still a valid array, so the old
      // Array.isArray gate passed it and the deploy build failed on z.enum.
      writeJson(join(root, "src/data/community-leaders.json"), {
        lastUpdated: "2025-01-01T00:00:00Z",
        sections: [
          ...VALID_LEADERS.sections,
          { id: "brand-new-discourse-section", title: "New Thing", users: [] },
        ],
      });
      addAdventure(root, "my-adventure");

      const errors = await validateRefreshedData(opts(root));
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain("community-leaders.json");
      expect(errors[0]).toContain("failed schema validation");
    });

    it("still rejects a bad section id when sections is a valid array", async () => {
      // Guards specifically against reverting to a structural check.
      const payload = {
        lastUpdated: "2025-01-01T00:00:00Z",
        sections: [{ id: "not-a-real-section", title: "X", users: [] }],
      };
      expect(Array.isArray(payload.sections)).toBe(true);
      writeJson(join(root, "src/data/community-leaders.json"), payload);

      const errors = await validateRefreshedData(opts(root));
      expect(errors.length).toBeGreaterThan(0);
    });

    it("rejects a user whose avatarUrl is not a URL", async () => {
      writeJson(join(root, "src/data/community-leaders.json"), {
        lastUpdated: "2025-01-01T00:00:00Z",
        sections: [
          {
            id: "top-contributors",
            title: "Top Contributors",
            users: [{ username: "alice", avatarUrl: "not-a-url", count: 5 }],
          },
        ],
      });
      const errors = await validateRefreshedData(opts(root));
      expect(errors.length).toBeGreaterThan(0);
    });

    it("reports a missing community-leaders.json", async () => {
      addAdventure(root, "my-adventure");
      const errors = await validateRefreshedData(opts(root));
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain("missing");
    });

    it("reports malformed JSON rather than throwing", async () => {
      writeFileSync(join(root, "src/data/community-leaders.json"), "{ not json", "utf-8");
      const errors = await validateRefreshedData(opts(root));
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain("community-leaders.json");
    });
  });

  describe("per-level posts JSON", () => {
    it("rejects a post missing its username", async () => {
      writeJson(join(root, "src/data/community-leaders.json"), VALID_LEADERS);
      addAdventure(root, "bad-posts", {
        posts: {
          ...VALID_POSTS,
          discussionPosts: [{ cooked: "hi", created_at: "2025-01-01T00:00:00Z" }],
        },
      });
      const errors = await validateRefreshedData(opts(root));
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain("beginner-posts.json");
    });

    it("rejects totalReplies sent as a string", async () => {
      writeJson(join(root, "src/data/community-leaders.json"), VALID_LEADERS);
      addAdventure(root, "bad-posts", {
        posts: { ...VALID_POSTS, totalReplies: "3" },
      });
      const errors = await validateRefreshedData(opts(root));
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain("beginner-posts.json");
    });

    it("names the adventure and level in the error", async () => {
      writeJson(join(root, "src/data/community-leaders.json"), VALID_LEADERS);
      addAdventure(root, "named-adventure", {
        levelId: "expert",
        posts: { ...VALID_POSTS, totalReplies: "3" },
      });
      const errors = await validateRefreshedData(opts(root));
      expect(errors[0]).toContain("named-adventure");
      expect(errors[0]).toContain("expert-posts.json");
    });
  });

  describe("leaderboard JSON", () => {
    it("rejects a row missing points", async () => {
      writeJson(join(root, "src/data/community-leaders.json"), VALID_LEADERS);
      addAdventure(root, "bad-board", {
        leaderboard: {
          updatedAt: "2025-01-01T00:00:00Z",
          rows: [{ rank: 1, username: "alice", challengesSolved: 2 }],
        },
      });
      const errors = await validateRefreshedData(opts(root));
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain("leaderboard.json");
    });

    it("rejects rows sent as an object instead of an array", async () => {
      writeJson(join(root, "src/data/community-leaders.json"), VALID_LEADERS);
      addAdventure(root, "bad-board", {
        leaderboard: { updatedAt: "2025-01-01T00:00:00Z", rows: { rank: 1 } },
      });
      const errors = await validateRefreshedData(opts(root));
      expect(errors).toHaveLength(1);
    });
  });

  describe("multiple failures", () => {
    it("collects every error rather than stopping at the first", async () => {
      writeJson(join(root, "src/data/community-leaders.json"), {
        lastUpdated: "2025-01-01T00:00:00Z",
        sections: [{ id: "nope", title: "X", users: [] }],
      });
      addAdventure(root, "bad-one", { posts: { ...VALID_POSTS, totalReplies: "x" } });
      addAdventure(root, "bad-two", {
        leaderboard: { updatedAt: "2025-01-01T00:00:00Z", rows: [{ rank: 1 }] },
      });

      const errors = await validateRefreshedData(opts(root));
      expect(errors.length).toBeGreaterThanOrEqual(3);
    });
  });
});

describe("validateRefreshedData against the repository's committed data", () => {
  it("accepts the real files, so the gate cannot block every hourly run", async () => {
    // Runs against the actual repo, not a fixture: a validator stricter than the
    // build would fail here and break the refresh workflow permanently.
    expect(await validateRefreshedData()).toEqual([]);
  });
});
