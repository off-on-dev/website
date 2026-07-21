import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// Build-time reads of the CI-refreshed per-level discussion and per-adventure
// leaderboard JSON. Read with node fs (not import.meta.glob) because the files
// live outside the Astro project root while nested. This makes DiscussionSection
// and AdventureLeaderboard fully static (no client fetch), per the plan.
//
// Resolve from process.cwd() (the astro/ project root during `astro build`), not
// import.meta.url: this module is bundled by Vite for page rendering, which
// rewrites import.meta.url and would break a file-relative path.
const ADVENTURES_DIR = resolve(process.cwd(), "../src/data/adventures");

export type DiscussionPost = {
  username: string;
  avatarUrl?: string;
  cooked: string;
  created_at: string;
  challengeSolved?: boolean;
  topicUrl?: string;
};

export type Discussion = {
  discussionUrl: string;
  discussionPosts: DiscussionPost[];
  totalReplies: number;
};

export type LeaderboardRow = {
  rank: number;
  username: string;
  avatarUrl?: string;
  points: number;
  challengesSolved: number;
};

export type Leaderboard = { updatedAt: string; rows: LeaderboardRow[] };

function readJson<T>(path: string): T | null {
  return existsSync(path) ? (JSON.parse(readFileSync(path, "utf8")) as T) : null;
}

export function getDiscussion(adventureId: string, levelId: string): Discussion | null {
  return readJson<Discussion>(resolve(ADVENTURES_DIR, adventureId, `${levelId}-posts.json`));
}

export function getLeaderboard(adventureId: string): Leaderboard | null {
  return readJson<Leaderboard>(resolve(ADVENTURES_DIR, adventureId, "leaderboard.json"));
}
