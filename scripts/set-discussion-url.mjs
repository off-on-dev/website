/**
 * Set the discussion URL for a specific adventure level.
 *
 * Updates adventure.yaml (community_url field on the level; community_category_id at
 * adventure root if missing) and the per-level *-posts.json file, then fetches
 * initial posts from Discourse.
 *
 * Environment variables:
 *   ADVENTURE_ID    - adventure slug (e.g. lex-imperfecta)
 *   LEVEL_ID        - level ID (beginner, intermediate, expert)
 *   DISCUSSION_URL  - Discourse thread URL
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseDocument } from "yaml";

const __dirname = dirname(fileURLToPath(import.meta.url));
const COMMUNITY_BASE = "https://community.offon.dev";
const ADVENTURES_DIR = resolve(__dirname, "../src/data/adventures");

const adventureId = process.env.ADVENTURE_ID;
const levelId = process.env.LEVEL_ID;
const discussionUrl = process.env.DISCUSSION_URL;

if (!adventureId || !levelId || !discussionUrl) {
  console.error("Error: ADVENTURE_ID, LEVEL_ID, and DISCUSSION_URL must all be set.");
  process.exit(1);
}

if (!/^[a-z0-9-]+$/.test(adventureId)) {
  console.error(`Error: ADVENTURE_ID must be lowercase alphanumeric with hyphens only, got: ${adventureId}`);
  process.exit(1);
}

if (!/^[a-z0-9-]+$/.test(levelId)) {
  console.error(`Error: LEVEL_ID must be lowercase alphanumeric with hyphens only, got: ${levelId}`);
  process.exit(1);
}

if (!discussionUrl.startsWith(`${COMMUNITY_BASE}/`)) {
  console.error(`Error: DISCUSSION_URL must start with ${COMMUNITY_BASE}/, got: ${discussionUrl}`);
  process.exit(1);
}

const adventureDir = resolve(ADVENTURES_DIR, adventureId);

if (!adventureDir.startsWith(ADVENTURES_DIR + "/")) {
  console.error(`Error: Resolved path escapes the adventures directory: ${adventureDir}`);
  process.exit(1);
}

const yamlPath = resolve(adventureDir, "adventure.yaml");
const postsPath = resolve(adventureDir, `${levelId}-posts.json`);

if (!existsSync(yamlPath)) {
  console.error(`Error: Adventure not found — ${yamlPath}`);
  process.exit(1);
}

if (!existsSync(postsPath)) {
  console.error(`Error: Posts file not found — ${postsPath}`);
  process.exit(1);
}

// --- YAML update -------------------------------------------------------

const yamlText = readFileSync(yamlPath, "utf-8");
const doc = parseDocument(yamlText);

const levels = doc.get("levels");
if (!levels || !levels.items) {
  console.error("Error: No levels array found in adventure.yaml");
  process.exit(1);
}

let levelFound = false;
for (const levelNode of levels.items) {
  if (levelNode.get("level") !== levelId) continue;

  const fieldName = levelNode.has("community_url") ? "community_url" : "discussion_url";
  levelNode.set(fieldName, discussionUrl);
  levelFound = true;
  break;
}

if (!levelFound) {
  const available = levels.items
    .map((l) => l.get("level"))
    .filter(Boolean)
    .join(", ");
  console.error(
    `Error: Level '${levelId}' not found in the levels array of adventure.yaml.\n` +
      `Available: ${available || "(none)"}\n` +
      `Note: upcoming_levels are not yet live and cannot have a discussion URL set this way.`
  );
  process.exit(1);
}

// --- Posts JSON fetch --------------------------------------------------
// YAML is written after the posts fetch so that a network failure before the
// write leaves both files unchanged. On retry neither file is stale.

function extractTopicId(url) {
  const match = url.match(/\/t\/[^/]+\/(\d+)/);
  return match ? match[1] : null;
}

function resolveAvatarUrl(template, size = "40") {
  if (!template) return undefined;
  const resolved = template.replace("{size}", size);
  return resolved.startsWith("http") ? resolved : `${COMMUNITY_BASE}${resolved}`;
}

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

function getCookedText(html, post) {
  const text = extractPostText(html);
  if (text.length > 0) return text;
  if (hasChallengeSolvedBadge(post)) return "Completed the challenge.";
  if (/github\.com/.test(html)) return "Submitted a solution.";
  return "";
}

async function fetchTopicPosts(topicId, topicUrl) {
  const res = await fetch(`${COMMUNITY_BASE}/t/${topicId}.json`);
  if (!res.ok) {
    console.warn(`[posts] Discourse returned HTTP ${res.status} — posts will be empty for now`);
    return null;
  }

  const data = await res.json();
  const categoryId = data.category_id ?? null;
  const firstPagePosts = data.post_stream?.posts ?? [];
  const allPostIds = data.post_stream?.stream ?? [];

  const firstPageIds = new Set(firstPagePosts.map((p) => p.id));
  const remainingIds = allPostIds.filter((id) => !firstPageIds.has(id));
  let allPosts = [...firstPagePosts];

  for (let i = 0; i < remainingIds.length; i += 20) {
    const chunk = remainingIds.slice(i, i + 20);
    const params = chunk.map((id) => `post_ids[]=${id}`).join("&");
    const chunkRes = await fetch(`${COMMUNITY_BASE}/t/${topicId}/posts.json?${params}`);
    if (chunkRes.ok) {
      const chunkData = await chunkRes.json();
      allPosts = allPosts.concat(chunkData.post_stream?.posts ?? []);
    }
  }

  const replies = allPosts.slice(1);

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
  return { posts: storedPosts, totalReplies, solvers, categoryId };
}

async function main() {
  const topicId = extractTopicId(discussionUrl);
  if (!topicId) {
    console.warn(
      `[posts] Could not extract topic ID from URL — writing stub with URL only.\n` +
        `  URL: ${discussionUrl}\n` +
        `  Expected format: ${COMMUNITY_BASE}/t/<slug>/<id>`
    );
    const stub = {
      discussionUrl,
      discussionPosts: [],
      totalReplies: 0,
      solvers: [],
    };
    writeFileSync(postsPath, JSON.stringify(stub, null, 2) + "\n");
    writeFileSync(yamlPath, doc.toString());
    console.log(`[posts] Wrote stub to ${postsPath}`);
    console.log(`[yaml] Updated ${levelId} discussion URL in adventure.yaml`);
    return;
  }

  console.log(`[posts] Fetching posts for topic ${topicId}...`);
  const result = await fetchTopicPosts(topicId, discussionUrl);

  if (result?.categoryId > 0 && doc.get("community_category_id") == null) {
    const slugIdx = doc.contents.items.findIndex((p) => p.key?.value === "slug");
    const insertIdx = slugIdx >= 0 ? slugIdx + 1 : 1;
    doc.contents.items.splice(insertIdx, 0, doc.createPair("community_category_id", result.categoryId));
    console.log(`[yaml] Set community_category_id to ${result.categoryId} in adventure.yaml`);
  }

  const content = result
    ? { discussionUrl, discussionPosts: result.posts, totalReplies: result.totalReplies, solvers: result.solvers }
    : { discussionUrl, discussionPosts: [], totalReplies: 0, solvers: [] };

  writeFileSync(postsPath, JSON.stringify(content, null, 2) + "\n");
  writeFileSync(yamlPath, doc.toString());

  if (result) {
    console.log(
      `[posts] Wrote ${result.posts.length} post(s), ${result.totalReplies} total repl(ies) to ${postsPath}`
    );
  } else {
    console.log(`[posts] Discourse fetch failed — wrote stub with URL set to ${postsPath}`);
  }
  console.log(`[yaml] Updated ${levelId} discussion URL in adventure.yaml`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
