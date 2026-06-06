import { useState, useEffect } from "react";

type StoredPost = {
  username: string;
  avatarUrl?: string;
  cooked: string;
  created_at: string;
  like_count?: number;
  challengeSolved?: boolean;
  topicUrl: string;
};

export type PostWithAge = StoredPost & { age: string };

export type Solver = {
  username: string;
  avatarUrl?: string;
  solvedAt: string;
};

/** Shape of the per-level JSON file's discussion fields. */
type LevelDiscussionData = {
  discussionPosts?: StoredPost[];
  totalReplies?: number;
  solvers?: Solver[];
};

// Exported so callers can type test mocks; tests inject a mock loader to
// avoid Vitest's dynamic-import mock runner initialization cost (~3-6s).
export type DiscussionDataLoader = (adventureId: string, levelId: string) => Promise<LevelDiscussionData>;

function timeAgo(dateStr: string, now: number): string {
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const discussionModules = import.meta.glob("@/data/adventures/**/*-posts.json");

// Default loader dynamically imports the per-level JSON file.
// Each level JSON is expected to have optional `discussionPosts` and
// `totalReplies` fields, populated by the hourly GitHub Action.
const defaultLoader: DiscussionDataLoader = async (adventureId, levelId) => {
  const key = `/src/data/adventures/${adventureId}/${levelId}-posts.json`;
  const loader = discussionModules[key];
  if (!loader) return { discussionPosts: [], totalReplies: 0 };
  const mod = await loader() as { default: LevelDiscussionData };
  return mod.default;
};

export type DiscussionResult = {
  posts: PostWithAge[];
  totalReplies: number;
  solvers: Solver[];
  loaded: boolean;
};

/**
 * Loads discussion posts for an adventure level from the per-level JSON file.
 * Post ages are computed client-side after mount to avoid calling Date.now() during render.
 * @param adventureId - The adventure slug (e.g. "echoes-lost-in-orbit").
 * @param levelId - The level slug (e.g. "beginner").
 * @param loader - Optional loader for testing; defaults to dynamically importing the level JSON.
 * @returns Object with posts array, totalReplies count, solvers list, and a loaded flag.
 */
export function useDiscussionPosts(
  adventureId: string,
  levelId: string,
  loader: DiscussionDataLoader = defaultLoader,
): DiscussionResult {
  const [posts, setPosts] = useState<PostWithAge[]>([]);
  const [totalReplies, setTotalReplies] = useState(0);
  const [solvers, setSolvers] = useState<Solver[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // When IDs are missing there is nothing to fetch; settle immediately.
    const promise = (!adventureId || !levelId)
      ? Promise.resolve(null)
      : loader(adventureId, levelId);
    promise
      .then((data) => {
        if (cancelled) return;
        if (!data) { setPosts([]); setTotalReplies(0); setSolvers([]); setLoaded(true); return; }
        const raw = data.discussionPosts ?? [];
        const now = Date.now();
        setPosts(raw.map((p) => ({ ...p, age: timeAgo(p.created_at, now) })));
        setTotalReplies(data.totalReplies ?? raw.length);
        setSolvers(data.solvers ?? []);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) {
          setPosts([]);
          setTotalReplies(0);
          setSolvers([]);
          setLoaded(true);
        }
      });
    return () => { cancelled = true; };
  }, [adventureId, levelId, loader]);

  return { posts, totalReplies, solvers, loaded };
}
