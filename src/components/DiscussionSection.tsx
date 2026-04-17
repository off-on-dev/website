import { useState, useEffect, type CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import { COMMUNITY_URL, COMMUNITY_DISPLAY_NAME } from "@/data/constants";
import { stripHtml } from "@/utils/stripHtml";

type DiscoursePost = {
  username: string;
  avatar_template: string;
  cooked: string;
  created_at: string;
  like_count: number;
}

function extractTopicId(url: string): string | null {
  const match = url.match(/\/t\/[^/]+\/(\d+)/);
  return match ? match[1] : null;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}


const avatarPalette: CSSProperties[] = [
  { backgroundColor: "hsl(var(--primary) / 0.2)", color: "hsl(var(--foreground))" },
  { backgroundColor: "hsl(var(--difficulty-architect) / 0.2)", color: "hsl(var(--difficulty-architect))" },
  { backgroundColor: "hsl(var(--teal) / 0.2)", color: "hsl(var(--teal))" },
  { backgroundColor: "hsl(var(--difficulty-builder) / 0.2)", color: "hsl(var(--difficulty-builder))" },
  { backgroundColor: "hsl(var(--destructive) / 0.2)", color: "hsl(var(--destructive))" },
];

type DiscussionSectionProps = {
  discussionUrls: string[];
}

export const DiscussionSection = ({ discussionUrls }: DiscussionSectionProps): JSX.Element => {
  const [posts, setPosts] = useState<(DiscoursePost & { topicUrl: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchAll = async (): Promise<void> => {
      setLoading(true);
      setError(false);
      try {
        const allPosts: (DiscoursePost & { topicUrl: string })[] = [];
        for (const url of discussionUrls) {
          const topicId = extractTopicId(url);
          if (!topicId) continue;
          try {
            const res = await fetch(`${COMMUNITY_URL}/t/${topicId}.json`);
            if (!res.ok) continue;
            const data = await res.json();
            const topicPosts: DiscoursePost[] = data.post_stream?.posts || [];
            // Skip first post (OP), take next few
            topicPosts.slice(1, 4).forEach((p) =>
              allPosts.push({ ...p, topicUrl: url })
            );
          } catch {
            // skip individual failures
          }
        }
        // Sort by date, take latest 6
        allPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setPosts(allPosts.slice(0, 6));
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [discussionUrls]);

  return (
    <div aria-live="polite" aria-atomic="true" className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground mb-4">Discussion</h2>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="h-4 w-24 rounded bg-muted" />
              </div>
              <div className="h-4 w-full rounded bg-muted mb-2" />
              <div className="h-4 w-3/4 rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : error || posts.length === 0 ? (
        <>
          <div className="card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-8 text-center">
            <p className="text-muted-foreground text-sm">
              {error ? "Couldn't load discussions right now." : "No community posts yet. Be the first to share!"}
            </p>
          </div>
          <a
            href={discussionUrls[0] || COMMUNITY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1 rounded-sm"
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
              className="block card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
            >
              <span className="sr-only">(opens in new tab) </span>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
                    style={avatarPalette[i % avatarPalette.length]}
                  >
                    {post.username.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="font-mono text-sm text-foreground">{post.username}</span>
                  <span className="text-xs text-[hsl(var(--text-faint))]">{timeAgo(post.created_at)}</span>
                </div>
                {post.like_count > 0 && (
                  <span className="text-xs text-muted-foreground">
                    <span aria-hidden="true">♥</span>
                    <span className="sr-only">Likes: </span>
                    {post.like_count}
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
                {stripHtml(post.cooked)}
              </p>
            </a>
          ))}
          <a
            href={discussionUrls[0] || COMMUNITY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1 rounded-sm"
          >
            Join the discussion on {COMMUNITY_DISPLAY_NAME} <ArrowRight size={13} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
          </a>
        </>
      )}
    </div>
  );
};
