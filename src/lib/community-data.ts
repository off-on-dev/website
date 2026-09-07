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
//
// TESTING TRAP: this is evaluated once, when the module is first imported, so
// the path is captured at import time. A later process.chdir() does not move it.
// Any test that points getDiscussion/getLeaderboard at a fixture directory will
// therefore read the real tree instead, find nothing, and get null back rather
// than an error, so assertions about invalid data pass without validating
// anything. Validate fixtures with the exported schemas below, not the getters.
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

// Exported so callers can validate a path of their own choosing: this schema and
// leaderboardSchema below are the file-shape contract, independent of where the
// file sits. Used by scripts/validate-refreshed-data.mjs and by its tests.
//
// Reach for these rather than getDiscussion/getLeaderboard whenever the path is
// not the real tree. See the TESTING TRAP note on ADVENTURES_DIR above: the
// getters bind their directory at import time, so against a fixture they report
// "file absent" instead of validating, and a test written on them passes
// vacuously. That is not hypothetical; it happened while adding the CI validator.
export const discussionSchema = z.object({
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

// Exported for the same reason as discussionSchema: validating a path that is
// not the real adventures tree. See the TESTING TRAP note on ADVENTURES_DIR.
export const leaderboardSchema = z.object({
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
  // Let readFileSync and JSON.parse propagate: both signal a code error in the
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

// Both getters read the real adventures tree only: their directory was bound at
// import time (see ADVENTURES_DIR). They cannot be redirected at a fixture, and
// against one they return null rather than erroring. Tests validating arbitrary
// files want discussionSchema / leaderboardSchema instead.
export function getDiscussion(adventureId: string, levelId: string): Discussion | null {
  return readJson(
    resolve(ADVENTURES_DIR, adventureId, `${levelId}-posts.json`),
    discussionSchema,
  );
}

export function getLeaderboard(adventureId: string): Leaderboard | null {
  return readJson(resolve(ADVENTURES_DIR, adventureId, "leaderboard.json"), leaderboardSchema);
}
