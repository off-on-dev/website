/**
 * Refresh discussion posts for all adventure levels.
 *
 * Reads each per-level JSON file, uses the discussionUrl to fetch latest posts
 * from the Discourse API, and writes back `discussionPosts` and `totalReplies`.
 * Only writes if data changed. JSON files contain only discussion data.
 *
 * No credentials required — uses the public Discourse topic API.
 *
 * Usage: node scripts/refresh-discussions.mjs
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { atomicWrite, fetchWithRetry } from "./discourse-utils.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const COMMUNITY_BASE = "https://community.offon.dev";
const ADVENTURES_DIR = resolve(__dirname, "../src/data/adventures");

/**
 * Resolves a Discourse avatar_template to a full HTTPS URL.
 * Returns undefined for http:// URLs (non-HTTPS) and unrecognised forms.
 * Exported for unit-testing.
 */
export function resolveAvatarUrl(template, size = "40") {
  if (!template) return undefined;
  const resolved = template.replace("{size}", size);
  if (resolved.startsWith("https://")) return resolved;
  if (resolved.startsWith("/")) return `${COMMUNITY_BASE}${resolved}`;
  return undefined;
}

/**
 * Extracts user-written plain text from a Discourse "cooked" HTML post.
 * Removes onebox embeds, images, URLs, and metadata.
 */
function extractPostText(html) {
  return html
    .replace(/<aside\b[^>]*>[\s\S]*?<\/aside>/gi, "")
    .replace(/<a\b[^>]*class="[^"]*\binline-onebox\b[^"]*"[^>]*>[\s\S]*?<\/a>/gi, "")
    .replace(/<div\b[^>]*class="[^"]*\bmeta\b[^"]*"[^>]*>[\s\S]*?<\/div>/gi, "")
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, "")
    .replace(/<img\b[^>]*\/?>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Returns true when the post contains at least some plain text, OR when the
 * raw HTML contains a GitHub link (challenge submissions often consist solely
 * of a GitHub repo/actions onebox + screenshot with no prose).
 */
function hasChallengeSolvedBadge(post) {
  return (post.badges_granted ?? []).some((bg) =>
    (bg.badges ?? []).some((b) => b.slug === "challenge-solved")
  );
}

function isMeaningfulPost(html, post) {
  return (
    extractPostText(html).length > 0 ||
    /github\.com/.test(html) ||
    hasChallengeSolvedBadge(post)
  );
}

/**
 * Returns the plain-text snippet to store. Falls back to a short description
 * when the post body is purely links/images with no extractable text.
 */
function getCookedText(html, post) {
  const text = extractPostText(html);
  if (text.length > 0) return text;
  if (hasChallengeSolvedBadge(post)) return "Completed the challenge.";
  if (/github\.com/.test(html)) return "Submitted a solution.";
  return "";
}

function extractTopicId(url) {
  const match = url.match(/\/t\/[^/]+\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Recursively find all discussion JSON files in a directory.
 */
function findLevelFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...findLevelFiles(full));
    } else if (entry.endsWith("-posts.json")) {
      results.push(full);
    }
  }
  return results;
}

/** Failures tolerated in a single run before the whole run is failed. */
export const MAX_TOLERATED_FAILURES = 1;

/**
 * Decide whether a refresh run counts as a failure.
 *
 * Two rules, both aimed at the same thing: never let a run that fetched nothing
 * useful look like a run where nothing had changed.
 *
 *   1. Every attempted topic failed. Discourse is down, or every discussion URL
 *      is wrong. Without this the job exits 0, the untouched files still pass
 *      structural validation, and the site serves stale data indefinitely.
 *   2. More than MAX_TOLERATED_FAILURES failed. Partial degradation. Exactly one
 *      failure is tolerated so a single deleted or archived thread cannot block
 *      every other topic's update from being committed.
 *
 * A run that updates zero files is deliberately NOT a failure. These threads are
 * static for hours at a time and the job runs hourly, so "nothing changed" is the
 * normal healthy outcome; failing on it would fire most hours and train everyone
 * to ignore the alarm. The case that rule would have caught, everything failed,
 * is already rule 1.
 *
 * Exported for unit testing.
 */
export function evaluateRefreshOutcome({ attempted, failures }) {
  const succeeded = attempted - failures.length;
  const detail = failures.map((f) => `    ${f.topicUrl}: ${f.reason}`).join("\n");

  if (attempted === 0) return { ok: true, warning: null, error: null };

  if (succeeded === 0) {
    return {
      ok: false,
      warning: null,
      error:
        `All ${attempted} attempted topic(s) failed to refresh. ` +
        `Discourse may be unreachable, rate-limiting, or every discussion URL is wrong.\n${detail}`,
    };
  }

  if (failures.length > MAX_TOLERATED_FAILURES) {
    return {
      ok: false,
      warning: null,
      error:
        `${failures.length} of ${attempted} topics failed to refresh ` +
        `(at most ${MAX_TOLERATED_FAILURES} is tolerated).\n${detail}`,
    };
  }

  if (failures.length > 0) {
    return {
      ok: true,
      warning:
        `${failures.length} of ${attempted} topics failed to refresh. This is within tolerance so the ` +
        `run still succeeded, but a failure that repeats every hour is a real problem, not noise.\n${detail}`,
      error: null,
    };
  }

  return { ok: true, warning: null, error: null };
}

async function fetchTopicPosts(topicId, topicUrl) {
  try {
    const res = await fetchWithRetry(`${COMMUNITY_BASE}/t/${topicId}.json`);
    if (!res.ok) {
      return { ok: false, reason: `HTTP ${res.status}` };
    }

    let data;
    try {
      data = await res.json();
    } catch {
      return { ok: false, reason: "malformed JSON in topic response" };
    }

    const firstPagePosts = data.post_stream?.posts ?? [];
    const allPostIds = data.post_stream?.stream ?? [];

    // Fetch remaining posts not included in the first page
    const firstPageIds = new Set(firstPagePosts.map((p) => p.id));
    const remainingIds = allPostIds.filter((id) => !firstPageIds.has(id));
    let allPosts = [...firstPagePosts];

    // Fetch in chunks of 20 (Discourse limit)
    for (let i = 0; i < remainingIds.length; i += 20) {
      const chunk = remainingIds.slice(i, i + 20);
      const params = chunk.map((id) => `post_ids[]=${id}`).join("&");
      const chunkRes = await fetchWithRetry(
        `${COMMUNITY_BASE}/t/${topicId}/posts.json?${params}`
      );
      if (chunkRes.ok) {
        let chunkData;
        try {
          chunkData = await chunkRes.json();
        } catch {
          console.warn(`  Failed to parse chunk JSON (posts ${chunk[0]}…${chunk[chunk.length - 1]})`);
          continue;
        }
        allPosts = allPosts.concat(chunkData.post_stream?.posts ?? []);
      } else {
        console.warn(
          `  Failed to fetch chunk (posts ${chunk[0]}…${chunk[chunk.length - 1]}): HTTP ${chunkRes.status}`
        );
      }
    }

    // Skip the OP (first post)
    const replies = allPosts.slice(1);

    // Extract solvers: all users with challenge-solved badge, ordered by post time
    const seenSolvers = new Set();
    const solvers = replies
      .filter((p) => hasChallengeSolvedBadge(p))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .reduce((acc, p) => {
        if (!seenSolvers.has(p.username)) {
          seenSolvers.add(p.username);
          acc.push({
            username: p.username,
            avatarUrl: resolveAvatarUrl(p.avatar_template),
            solvedAt: p.created_at,
          });
        }
        return acc;
      }, []);

    // Store last 8 meaningful posts for activity feed
    const storedPosts = replies
      .filter((p) => isMeaningfulPost(p.cooked, p))
      .slice(-8)
      .reverse()
      .map((p) => ({
        username: p.username,
        avatarUrl: resolveAvatarUrl(p.avatar_template),
        cooked: getCookedText(p.cooked, p),
        created_at: p.created_at,
        like_count: p.like_count,
        challengeSolved: hasChallengeSolvedBadge(p) || undefined,
        topicUrl,
      }));

    const totalReplies = Math.max(0, (data.posts_count ?? 0) - 1);
    return { ok: true, posts: storedPosts, totalReplies, solvers };
  } catch (err) {
    return { ok: false, reason: err.message };
  }
}

async function main() {
  const levelFiles = findLevelFiles(ADVENTURES_DIR);
  let updated = 0;
  let attempted = 0;
  let skipped = 0;
  const failures = [];

  for (const filePath of levelFiles) {
    let content;
    try {
      content = JSON.parse(readFileSync(filePath, "utf-8"));
    } catch (err) {
      // A local file we cannot read is a genuine failure, not an absence: this
      // level's data cannot be refreshed and will silently go stale.
      attempted++;
      failures.push({ topicUrl: filePath, reason: `malformed local JSON (${err.message})` });
      continue;
    }

    const discussionUrl = content.discussionUrl;
    // No thread created for this level yet. A legitimate absence, not a failure.
    if (!discussionUrl) {
      skipped++;
      continue;
    }

    const topicId = extractTopicId(discussionUrl);
    if (!topicId) {
      attempted++;
      failures.push({ topicUrl: discussionUrl, reason: "could not extract a topic ID from the URL" });
      continue;
    }

    attempted++;
    const result = await fetchTopicPosts(topicId, discussionUrl);
    // 500ms delay between requests to stay within Discourse's anonymous rate limit
    await new Promise((res) => setTimeout(res, 500));

    if (!result.ok) {
      failures.push({ topicUrl: discussionUrl, reason: result.reason });
      console.warn(`  Failed ${discussionUrl}: ${result.reason}`);
      continue;
    }

    const { posts, totalReplies, solvers } = result;
    const newContent = { discussionUrl, discussionPosts: posts, totalReplies, solvers };
    const newJson = JSON.stringify(newContent, null, 2) + "\n";
    const oldJson = readFileSync(filePath, "utf-8");

    if (newJson !== oldJson) {
      atomicWrite(filePath, newJson);
      updated++;
      console.log(`Updated: ${filePath}`);
    }
  }

  console.log(
    `\nDone. ${updated} file(s) updated. ` +
      `${attempted - failures.length}/${attempted} topics refreshed successfully, ` +
      `${failures.length} failed, ${skipped} skipped (no discussion URL yet).`,
  );

  const outcome = evaluateRefreshOutcome({ attempted, failures });
  if (outcome.warning) console.warn(`\n[refresh-discussions] WARNING: ${outcome.warning}`);
  if (!outcome.ok) throw new Error(`[refresh-discussions] ${outcome.error}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
