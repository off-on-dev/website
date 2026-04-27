import { useState, useEffect, type CSSProperties, type JSX } from "react";
import { ArrowRight, Heart } from "lucide-react";
import { COMMUNITY_URL, COMMUNITY_DISPLAY_NAME } from "@/data/constants";
import { stripHtml } from "@/utils/stripHtml";
import rawDiscussionData from "@/data/discussion-data.json";

// Generated at build time by the discourse-data Vite plugin in vite.config.ts.
// Run `npm run build` to refresh this data from the Discourse API.
type StoredPost = {
  username: string;
  cooked: string;
  created_at: string;
  like_count?: number;
  topicUrl: string;
};

type PostWithAge = StoredPost & { age: string };

const discussionData = rawDiscussionData as Record<string, StoredPost[]>;

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

const avatarPalette: CSSProperties[] = [
  { backgroundColor: "hsl(var(--primary) / 0.2)", color: "hsl(var(--foreground))" },
  { backgroundColor: "hsl(var(--difficulty-architect) / 0.2)", color: "hsl(var(--foreground))" },
  { backgroundColor: "hsl(var(--teal) / 0.2)", color: "hsl(var(--foreground))" },
  { backgroundColor: "hsl(var(--difficulty-builder) / 0.2)", color: "hsl(var(--foreground))" },
  { backgroundColor: "hsl(var(--destructive) / 0.2)", color: "hsl(var(--foreground))" },
];

type DiscussionSectionProps = {
  discussionUrl: string;
};

export const DiscussionSection = ({ discussionUrl }: DiscussionSectionProps): JSX.Element => {
  const topicId = extractTopicId(discussionUrl);
  const rawPosts: StoredPost[] = topicId ? (discussionData[topicId] ?? []) : [];

  // ages are computed on the client after mount to avoid calling Date.now() at render time
  const [ages, setAges] = useState<string[]>([]);

  useEffect(() => {
    const raw: StoredPost[] = topicId ? (discussionData[topicId] ?? []) : [];
    if (raw.length === 0) {
      setAges([]);
      return;
    }
    const now = Date.now();
    setAges(raw.map((p) => timeAgo(p.created_at, now)));
  }, [topicId]);

  const posts: PostWithAge[] = rawPosts.map((p, i) => ({ ...p, age: ages[i] ?? "" }));

  return (
    <div aria-live="polite" aria-atomic="true" className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground mb-4">Discussion</h2>
      {posts.length === 0 ? (
        <>
          <div className="card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-8 text-center">
            <p className="text-muted-foreground text-sm">
              No community posts yet. Be the first to share!
            </p>
          </div>
          <a
            href={discussionUrl || COMMUNITY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm"
          >
            Join the discussion on {COMMUNITY_DISPLAY_NAME} <ArrowRight size={13} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
          </a>
        </>
      ) : (
        <>
          {posts.map((post, i) => (
            <a
              key={i}
              href={post.topicUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Community post: ${stripHtml(post.cooked).slice(0, 100)}`}
              className="block card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
                    style={avatarPalette[i % avatarPalette.length]}
                  >
                    {post.username.slice(0, 2).toUpperCase()}
                  </div>
                  {post.age && (
                    <span className="text-xs text-[hsl(var(--text-faint))]">{post.age}</span>
                  )}
                </div>
                {(post.like_count ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Heart size={12} aria-hidden="true" />
                    <span className="sr-only">Likes: </span>
                    {post.like_count}
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
                {stripHtml(post.cooked)}
              </p>
              <span className="sr-only"> (opens in new tab)</span>
            </a>
          ))}
          <a
            href={discussionUrl || COMMUNITY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm"
          >
            Join the discussion on {COMMUNITY_DISPLAY_NAME} <ArrowRight size={13} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
          </a>
        </>
      )}
    </div>
  );
};
