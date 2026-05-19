/**
 * Refresh discussion posts for all adventure levels.
 *
 * Reads each per-level JSON file, extracts the discussionUrl, fetches latest
 * posts from the Discourse API, and writes them back into the file under
 * `discussionPosts` and `totalReplies`. Only writes if data changed.
 *
 * Usage: node scripts/refresh-discussions.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const COMMUNITY_BASE = "https://community.open-ecosystem.com";
const ADVENTURES_DIR = resolve("src/data/adventures");
const MIN_POST_TEXT_LENGTH = 20;

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

function hasSubstantialText(html) {
  return extractPostText(html).length >= MIN_POST_TEXT_LENGTH;
}

function extractTopicId(url) {
  const match = url.match(/\/t\/[^/]+\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Recursively find all JSON files in a directory, excluding _meta/.
 */
function findLevelFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (entry === "_meta") continue;
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
    if (!res.ok) return { posts: [], totalReplies: 0 };

    const data = await res.json();
    const posts = data.post_stream?.posts ?? [];

    const storedPosts = posts
      .slice(1)
      .filter((p) => hasSubstantialText(p.cooked))
      .slice(-8)
      .reverse()
      .map((p) => ({
        username: p.username,
        cooked: extractPostText(p.cooked),
        created_at: p.created_at,
        like_count: p.like_count,
        topicUrl,
      }));

    const totalReplies = Math.max(0, (data.posts_count ?? 0) - 1);
    return { posts: storedPosts, totalReplies };
  } catch {
    return { posts: [], totalReplies: 0 };
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

    const { posts, totalReplies } = await fetchTopicPosts(topicId, discussionUrl);

    const newContent = { ...content, discussionPosts: posts, totalReplies };
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
