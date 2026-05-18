import { useState, useEffect } from "react";

type StoredPost = {
  username: string;
  cooked: string;
  created_at: string;
  like_count?: number;
  topicUrl: string;
};

export type PostWithAge = StoredPost & { age: string };

// Exported so callers can type test mocks; tests inject a mock loader to
// avoid Vitest's dynamic-import mock runner initialization cost (~3-6s).
export type DiscussionDataLoader = () => Promise<Record<string, StoredPost[]>>;

function extractTopicId(url: string): string | null {
  const match = url.match(/\/t\/[^/]+\/(\d+)/);
  return match ? match[1] : null;
}

function timeAgo(dateStr: string, now: number): string {
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// Data is fetched at build time by the discourse-data Vite plugin in vite.config.ts
// and written to src/data/discussion-data.json. The import is kicked off at module
// load time (not inside useEffect) so the data is already in-flight before the
// component mounts, eliminating the render-then-effect waterfall. The dynamic import
// keeps the chunk code-split from ChallengeDetail.
const discussionDataPromise: Promise<Record<string, StoredPost[]>> =
  import("@/data/discussion-data.json").then((m) => m.default as Record<string, StoredPost[]>);

const defaultLoader: DiscussionDataLoader = () => discussionDataPromise;

/**
 * Loads discussion posts for an adventure level from pre-built static data.
 * Post ages are computed client-side after mount to avoid calling Date.now() during render.
 * @param discussionUrl - Full Discourse topic URL; the numeric topic ID is extracted automatically.
 * @param loader - Optional loader for testing; defaults to dynamically importing discussion-data.json.
 * @returns Array of posts with computed relative age strings (e.g. "2h ago"), or empty array while loading.
 */
export function useDiscussionPosts(
  discussionUrl: string,
  loader: DiscussionDataLoader = defaultLoader,
): PostWithAge[] {
  const topicId = extractTopicId(discussionUrl);
  const [posts, setPosts] = useState<PostWithAge[]>([]);

  useEffect(() => {
    if (!topicId) return;
    let cancelled = false;
    loader()
      .then((data) => {
        if (cancelled) return;
        const raw = data[topicId] ?? [];
        const now = Date.now();
        setPosts(raw.map((p) => ({ ...p, age: timeAgo(p.created_at, now) })));
      })
      .catch(() => {
        if (!cancelled) setPosts([]);
      });
    return () => { cancelled = true; };
  }, [topicId, loader]);

  return posts;
}
