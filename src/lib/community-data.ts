import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";

// Build-time reads of the CI-refreshed per-level discussion and per-adventure
// leaderboard JSON. Read with node fs (not import.meta.glob) because the files
// live outside the Astro project root while nested. This makes DiscussionSection
// and AdventureLeaderboard fully static (no client fetch), per the plan.
//
// Resolve from process.cwd() (the project root during `astro build`), not
// import.meta.url: this module is bundled by Vite for page rendering, which
// rewrites import.meta.url and would break a file-relative path.
const ADVENTURES_DIR = resolve(process.cwd(), "src/data/adventures");

// --- Zod schemas (source of truth for these types) ---
//
// Build failure on schema mismatch is intentional: these files are written by
// the CI refresh scripts, which error on Discourse failures rather than writing
// corrupt content. A parse error here means the script's output shape changed,
// which is a code error. Silent wrong content is worse than a broken build.
// The one safe absence is a missing file (adventure with no posts yet), which
// returns null and omits the section rather than failing.

const discussionPostSchema = z.object({
  username: z.string(),
  avatarUrl: z.string().optional(),
  cooked: z.string(),
  created_at: z.string(),
  challengeSolved: z.boolean().optional(),
  topicUrl: z.string().optional(),
});

const solverSchema = z.object({
  username: z.string(),
  avatarUrl: z.string().optional(),
  solvedAt: z.string(),
});

const discussionSchema = z.object({
  discussionUrl: z.string(),
  discussionPosts: z.array(discussionPostSchema),
  totalReplies: z.number(),
  solvers: z.array(solverSchema).optional(),
});

const leaderboardRowSchema = z.object({
  rank: z.number(),
  username: z.string(),
  avatarUrl: z.string().optional(),
  points: z.number(),
  challengesSolved: z.number(),
  beginnerPoints: z.number().optional(),
  intermediatePoints: z.number().optional(),
  expertPoints: z.number().optional(),
  singlePoints: z.number().optional(),
});

const leaderboardSchema = z.object({
  updatedAt: z.string(),
  rows: z.array(leaderboardRowSchema),
});

export type DiscussionPost = z.infer<typeof discussionPostSchema>;
export type Solver = z.infer<typeof solverSchema>;
export type Discussion = z.infer<typeof discussionSchema>;
export type LeaderboardRow = z.infer<typeof leaderboardRowSchema>;
export type Leaderboard = z.infer<typeof leaderboardSchema>;

function readJson<T>(path: string, schema: z.ZodType<T>): T | null {
  if (!existsSync(path)) return null;
  // Let readFileSync and JSON.parse propagate — both signal a code error in the
  // refresh script, not a transient absence, so failing the build is correct.
  const raw = readFileSync(path, "utf8");
  const parsed: unknown = JSON.parse(raw);
  const result = schema.safeParse(parsed);
  if (!result.success) {
    throw new Error(
      `[community-data] ${path} failed schema validation:\n${result.error.message}`,
    );
  }
  return result.data;
}

export function getDiscussion(adventureId: string, levelId: string): Discussion | null {
  return readJson(
    resolve(ADVENTURES_DIR, adventureId, `${levelId}-posts.json`),
    discussionSchema,
  );
}

export function getLeaderboard(adventureId: string): Leaderboard | null {
  return readJson(resolve(ADVENTURES_DIR, adventureId, "leaderboard.json"), leaderboardSchema);
}
