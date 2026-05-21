/**
 * Refresh discussion posts for all adventure levels.
 *
 * Reads each per-level JSON file, uses the discussionUrl to fetch latest posts
 * from the Discourse API, and writes back `discussionPosts` and `totalReplies`.
 * Only writes if data changed. JSON files contain only discussion data.
 *
 * Usage: node scripts/refresh-discussions.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const COMMUNITY_BASE = "https://community.open-ecosystem.com";
const ADVENTURES_DIR = resolve("src/data/adventures");

/**
 * Resolves a Discourse avatar_template to a full URL.
 * Templates can be relative paths (/user_avatar/...) or full URLs (https://...).
 */
function resolveAvatarUrl(template, size = "40") {
  if (!template) return undefined;
  const resolved = template.replace("{size}", size);
  if (resolved.startsWith("http")) return resolved;
  return `${COMMUNITY_BASE}${resolved}`;
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
 * Recursively find all JSON files in a directory.
 */
function findLevelFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...findLevelFiles(full));
    } else if (entry.endsWith(".json")) {
      results.push(full);
    }
  }
  return results;
}

async function fetchTopicPosts(topicId, topicUrl) {
  try {
    const res = await fetch(`${COMMUNITY_BASE}/t/${topicId}.json`);
    if (!res.ok) return { posts: [], totalReplies: 0, solvers: [] };

    const data = await res.json();
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
      const chunkRes = await fetch(`${COMMUNITY_BASE}/t/${topicId}/posts.json?${params}`);
      if (chunkRes.ok) {
        const chunkData = await chunkRes.json();
        allPosts = allPosts.concat(chunkData.post_stream?.posts ?? []);
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
    return { posts: storedPosts, totalReplies, solvers };
  } catch {
    return { posts: [], totalReplies: 0, solvers: [] };
  }
}

async function main() {
  const levelFiles = findLevelFiles(ADVENTURES_DIR);
  let updated = 0;

  for (const filePath of levelFiles) {
    const content = JSON.parse(readFileSync(filePath, "utf-8"));
    const discussionUrl = content.discussionUrl;
    if (!discussionUrl) continue;

    const topicId = extractTopicId(discussionUrl);
    if (!topicId) continue;

    const { posts, totalReplies, solvers } = await fetchTopicPosts(topicId, discussionUrl);

    const newContent = { discussionUrl, discussionPosts: posts, totalReplies, solvers };
    const newJson = JSON.stringify(newContent, null, 2) + "\n";
    const oldJson = readFileSync(filePath, "utf-8");

    if (newJson !== oldJson) {
      writeFileSync(filePath, newJson);
      updated++;
      console.log(`Updated: ${filePath}`);
    }
  }

  console.log(`Done. ${updated} file(s) updated out of ${levelFiles.length} levels.`);
}

main();
