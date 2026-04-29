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
              result[id] = posts.slice(1, 4).map((p) => ({
                username: p.username,
                cooked: p.cooked,
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
