import { type CSSProperties, type JSX } from "react";
import { ArrowRight, CircleCheck, MessageCircle } from "lucide-react";
import { COMMUNITY_URL, COMMUNITY_DISPLAY_NAME } from "@/data/constants";
import { useDiscussionPosts, type PostWithAge } from "@/hooks/useDiscussionPosts";
import { ContributorBadge } from "@/components/ContributorBadge";
import type { Adventure, TopPlayer } from "@/data/adventures";

const avatarPalette: CSSProperties[] = [
  { backgroundColor: "hsl(var(--primary) / 0.25)", color: "hsl(var(--foreground))" },
  { backgroundColor: "hsl(var(--difficulty-architect) / 0.25)", color: "hsl(var(--foreground))" },
  { backgroundColor: "hsl(var(--teal) / 0.25)", color: "hsl(var(--foreground))" },
  { backgroundColor: "hsl(var(--difficulty-builder) / 0.25)", color: "hsl(var(--foreground))" },
  { backgroundColor: "hsl(var(--destructive) / 0.25)", color: "hsl(var(--foreground))" },
];

const displaySnippet = (post: PostWithAge): string => {
  if (post.cooked.includes("CERTIFICATE START")) {
    return "Completed the challenge.";
  }
  return post.cooked;
};

type CommunitySidebarProps = {
  discussionUrl: string;
  solvedCount?: number;
  topPlayers?: TopPlayer[];
  contributor?: Adventure["contributor"];
};

const SectionLabel = ({ children }: { children: string }): JSX.Element => (
  <p className="font-mono text-[0.65rem] uppercase tracking-widest text-[hsl(var(--text-faint))] mb-3">
    {children}
  </p>
);

export const CommunitySidebar = ({
  discussionUrl,
  solvedCount,
  topPlayers,
  contributor,
}: CommunitySidebarProps): JSX.Element => {
  const { posts, totalReplies } = useDiscussionPosts(discussionUrl);
  const hasThread = discussionUrl !== COMMUNITY_URL;
  const visibleCount = 3;
  const visible = posts.slice(0, visibleCount);
  const more = Math.max(0, totalReplies - visible.length);
  const hasLeaderboard = topPlayers && topPlayers.length > 0;
  const hasActivity = posts.length > 0;

  return (
    <div className="card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-5">
      <div className="flex items-center gap-2 mb-5">
        <MessageCircle size={14} className="text-primary" aria-hidden="true" />
        <p className="font-sans text-sm font-semibold tracking-wide text-primary">
          Community
        </p>
      </div>

      {/* Challenge builder */}
      {contributor && (
        <div className="mb-5">
          <ContributorBadge name={contributor.name} url={contributor.url} />
        </div>
      )}

      {/* Completion stat */}
      {typeof solvedCount === "number" && (
        <div className="flex items-center gap-2 mb-5 text-sm text-foreground">
          <CircleCheck size={16} className="text-primary shrink-0" aria-hidden="true" />
          <p>
            <span className="font-semibold">{solvedCount}</span>{" "}
            <span className="text-[hsl(var(--text-secondary))]">
              {solvedCount === 1 ? "person has" : "people have"} solved this
            </span>
          </p>
        </div>
      )}

      {/* Top players */}
      {hasLeaderboard && (
        <div className="mb-5">
          <SectionLabel>Top players</SectionLabel>
          <ol className="space-y-2">
            {topPlayers.slice(0, 3).map((player, i) => (
              <li
                key={player.username}
                className="flex items-center gap-3 text-sm"
              >
                <span className="font-mono text-xs text-[hsl(var(--text-faint))] w-3 shrink-0">
                  {i + 1}
                </span>
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.6rem] font-semibold"
                  style={avatarPalette[i % avatarPalette.length]}
                  aria-hidden="true"
                >
                  {player.username.slice(0, 2).toUpperCase()}
                </div>
                <span className="font-medium text-foreground min-w-0 flex-1 truncate">
                  {player.username}
                </span>
                <span className="font-mono text-xs text-[hsl(var(--text-faint))] shrink-0">
                  {player.count}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Latest activity */}
      {hasActivity ? (
        <div className="mb-5">
          <SectionLabel>Latest activity</SectionLabel>

          <div className="space-y-3">
            {visible.map((post) => (
              <div key={`${post.username}-${post.created_at}`} className="text-xs">
                <p>
                  <span className="font-semibold text-foreground">{post.username}</span>
                  {post.age && (
                    <span className="text-[hsl(var(--text-faint))]"> · {post.age}</span>
                  )}
                </p>
                <p className="text-[hsl(var(--text-secondary))] line-clamp-2 leading-snug mt-0.5">
                  {displaySnippet(post)}
                </p>
              </div>
            ))}
          </div>

          {more > 0 && (
            <p className="text-xs text-[hsl(var(--text-faint))] mt-3">
              +{more} more {more === 1 ? "post" : "posts"} in the thread
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed mb-4">
          {hasThread
            ? "No posts yet. Be the first to share your solution or ask a question."
            : "Got stuck or want to share your solution? Join the conversation."}
        </p>
      )}

      <a
        href={hasThread ? discussionUrl : COMMUNITY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm"
      >
        {hasThread ? "Join the discussion" : `Visit ${COMMUNITY_DISPLAY_NAME}`}
        <ArrowRight size={12} aria-hidden="true" />
        <span className="sr-only"> (opens in new tab)</span>
      </a>
    </div>
  );
};
