import { defineConfig, type Plugin } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { writeFileSync } from "node:fs";

const base = process.env.VITE_BASE_PATH ?? "/";

const COMMUNITY_BASE = "https://community.open-ecosystem.com";

// Mirrors the discussionUrl values in src/data/adventures.ts.
// Update this map whenever a new adventure level is added.
const DISCUSSION_TOPICS: Record<string, string> = {
  "117": `${COMMUNITY_BASE}/t/adventure-01-echoes-lost-in-orbit-easy-broken-echoes/117/40`,
  "310": `${COMMUNITY_BASE}/t/adventure-01-echoes-lost-in-orbit-intermediate-the-silent-canary/310/8`,
  "351": `${COMMUNITY_BASE}/t/adventure-01-echoes-lost-in-orbit-expert-hyperspace-operations-transport/351/4`,
  "656": `${COMMUNITY_BASE}/t/practice-infrastructure-as-code-with-zero-setup-adventure-02-beginner/656`,
  "723": `${COMMUNITY_BASE}/t/adventure-02-building-cloudhaven-intermediate-the-modular-metropolis/723/10`,
  "782": `${COMMUNITY_BASE}/t/adventure-02-building-cloudhaven-expert-the-guardian-protocols/782/8`,
  "865": `${COMMUNITY_BASE}/t/instrument-your-first-llm-adventure-03-beginner-is-live/865/8`,
  "936": `${COMMUNITY_BASE}/t/instrument-debug-a-rag-pipeline-adventure-03-intermediate-is-live/936/2`,
  "999": `${COMMUNITY_BASE}/t/reduce-telemetry-noise-adventure-03-expert-is-live/999/1`,
  "1419": `${COMMUNITY_BASE}/t/wire-openfeature-flagd-into-a-spring-boot-service-with-zero-setup-adventure-04-beginner/1419`,
  "1485": `${COMMUNITY_BASE}/t/outcome-by-cohort-adventure-04-intermediate/1485`,
};

type RawPost = {
  username: string;
  cooked: string;
  created_at: string;
  like_count?: number;
};

type DiscourseTopicResponse = {
  post_stream?: { posts?: RawPost[] };
};

type StoredPost = RawPost & { topicUrl: string };

// Minimum number of characters of real user text a post must contain after
// removing embeds, images, URLs, and image metadata. Posts below this threshold
// are skipped — they are typically screenshot-only or GitHub-embed-only replies
// with no accompanying text.
const MIN_POST_TEXT_LENGTH = 20;

/**
 * Extracts user-written plain text from a Discourse "cooked" HTML post.
 * Removes onebox embeds (GitHub repos, URL previews), emoji and lightbox
 * images, https URLs, screenshot filenames, and image dimension/file-size
 * strings. The result is stored in discussion-data.json so the component
 * can render post.cooked directly without any runtime processing.
 */
function extractPostText(html: string): string {
  return html
    // Remove entire onebox embed blocks (GitHub repos, URL previews)
    .replace(/<aside\b[^>]*>[\s\S]*?<\/aside>/gi, "")
    // Remove inline GitHub repo links — class="inline-onebox". These are
    // auto-linked repo references whose anchor text is always of the form
    // "GitHub - owner/repo: Hands-on, recurring prompts…". The GitHub-name
    // regex below would strip the owner/repo portion but leave the description
    // suffix (": Hands-on, recurring prompts…"). Removing the whole element
    // at the HTML level is cleaner.
    .replace(/<a\b[^>]*class="[^"]*\binline-onebox\b[^"]*"[^>]*>[\s\S]*?<\/a>/gi, "")
    // Remove lightbox meta divs — these contain only decorative SVG icons,
    // a <span class="filename"> (e.g. "image", "Screenshot 2025-11-23…"),
    // and a <span class="informations"> (e.g. "1920×749 139 KB"). Removing
    // at the HTML level avoids leaving "image" as a leftover word after
    // tag-stripping. The meta div is non-nested so the non-greedy match is safe.
    .replace(/<div\b[^>]*class="[^"]*\bmeta\b[^"]*"[^>]*>[\s\S]*?<\/div>/gi, "")
    // Remove SVG elements (any remaining decorative icons)
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, "")
    // Remove all img tags (emoji, lightbox images)
    .replace(/<img\b[^>]*\/?>/gi, "")
    // Strip all remaining HTML tags
    .replace(/<[^>]*>/g, "")
    // Decode the most common HTML entities so stored text is clean
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    // Remove https:// and http:// URLs
    .replace(/https?:\/\/\S+/gi, "")
    // Normalize whitespace
    .replace(/\s+/g, " ")
    .trim();
}

/** Returns true when a post has enough real user text to be worth showing. */
function hasSubstantialText(html: string): boolean {
  return extractPostText(html).length >= MIN_POST_TEXT_LENGTH;
}

// Fetches community discussion posts at build time and writes them to
// src/data/discussion-data.json so DiscussionSection can import them
// statically without any runtime network requests.
function discourseDataPlugin(): Plugin {
  let isBuild = false;
  return {
    name: "discourse-data",
    configResolved(config) {
      isBuild = config.command === "build";
    },
    async buildStart() {
      if (!isBuild) return;
      const result: Record<string, StoredPost[]> = {};
      await Promise.all(
        Object.entries(DISCUSSION_TOPICS).map(async ([id, topicUrl]) => {
          try {
            const res = await fetch(`${COMMUNITY_BASE}/t/${id}.json`);
            if (res.ok) {
              const data = (await res.json()) as DiscourseTopicResponse;
              const posts = data.post_stream?.posts ?? [];
              // Skip index 0 (the original challenge post), filter out replies
              // that contain only images or GitHub embeds with no real user text,
              // then take up to 3. Filtering across all replies rather than
              // slicing first means we surface the best posts from the thread
              // rather than being limited to whichever three happened to come first.
              result[id] = posts
                .slice(1)
                .filter((p) => hasSubstantialText(p.cooked))
                .slice(0, 3)
                .map((p) => ({
                  username: p.username,
                  // extractPostText removes onebox embeds, images, URLs, and
                  // image metadata before returning clean user-written prose.
                  cooked: extractPostText(p.cooked),
                  created_at: p.created_at,
                  like_count: p.like_count,
                  topicUrl,
                }));
            } else {
              result[id] = [];
            }
          } catch {
            result[id] = [];
          }
        })
      );
      writeFileSync(
        path.resolve(__dirname, "src/data/discussion-data.json"),
        JSON.stringify(result, null, 2)
      );
      console.log(
        `[discourse-data] Wrote discussion data for ${Object.keys(result).length} topics`
      );
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(() => ({
  base,
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [tailwindcss(), reactRouter(), discourseDataPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
