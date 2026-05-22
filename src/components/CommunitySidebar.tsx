import { type CSSProperties, type JSX, useMemo } from "react";
import { ArrowRight, Trophy } from "lucide-react";
import { COMMUNITY_URL, COMMUNITY_DISPLAY_NAME } from "@/data/constants";
import { useDiscussionPosts } from "@/hooks/useDiscussionPosts";
import { isCertificatePost, displaySnippet } from "@/lib/discussion-utils";
import { ContributorBadge } from "@/components/ContributorBadge";
import type { Adventure } from "@/data/adventures";

const avatarPalette: CSSProperties[] = [
  { backgroundColor: "hsl(var(--primary) / 0.25)", color: "hsl(var(--foreground))" },
  { backgroundColor: "hsl(var(--difficulty-architect) / 0.25)", color: "hsl(var(--foreground))" },
  { backgroundColor: "hsl(var(--teal) / 0.25)", color: "hsl(var(--foreground))" },
  { backgroundColor: "hsl(var(--difficulty-builder) / 0.25)", color: "hsl(var(--foreground))" },
  { backgroundColor: "hsl(var(--destructive) / 0.25)", color: "hsl(var(--foreground))" },
];

type CommunitySidebarProps = {
  adventureId: string;
  levelId: string;
  discussionUrl: string;
  contributor?: Adventure["contributor"];
};

const SidebarLabel = ({ children }: { children: string }): JSX.Element => (
  <p className="font-mono text-[0.65rem] uppercase tracking-widest text-[hsl(var(--text-faint))] mb-3">
    {children}
  </p>
);

export const CommunitySidebar = ({
  adventureId,
  levelId,
  discussionUrl,
  contributor,
}: CommunitySidebarProps): JSX.Element => {
  const { posts, totalReplies, solvers } = useDiscussionPosts(adventureId, levelId);
  const hasThread = discussionUrl !== COMMUNITY_URL;

  const LEADERBOARD_VISIBLE = 3;
  const hasLeaderboard = solvers.length > 0;
  const topSolvers = solvers.slice(0, LEADERBOARD_VISIBLE);
  const remainingSolvers = solvers.length - LEADERBOARD_VISIBLE;

  const nonCertPosts = useMemo(() => posts.filter((p) => !isCertificatePost(p)), [posts]);
  const visibleCount = 3;
  // Show non-cert posts if available; fall back to cert posts so activity is never empty when posts exist
  const visible = nonCertPosts.length > 0
    ? nonCertPosts.slice(0, visibleCount)
    : posts.slice(0, visibleCount);
  const more = Math.max(0, totalReplies - visible.length);
  const hasActivity = visible.length > 0;

  return (
    <div className="rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-5">
      <h2 className="font-sans text-base font-semibold text-foreground mb-5">
        Community
      </h2>

      {/* Challenge builder */}
      {contributor && (
        <div className="mb-5 pb-5 border-b border-[hsl(var(--surface-border))]">
          <ContributorBadge name={contributor.name} url={contributor.url} />
        </div>
      )}

      {/* Leaderboard */}
      {hasLeaderboard && (
        <div className="mb-5 pb-5 border-b border-[hsl(var(--surface-border))]">
          <SidebarLabel>Leaderboard</SidebarLabel>
          <ol className="space-y-2.5" aria-label="Players who completed this challenge">
            {topSolvers.map((solver, i) => (
              <li
                key={solver.username}
                className="flex items-center gap-3 text-sm"
              >
                <span className="font-mono text-xs text-[hsl(var(--text-faint))] w-4 shrink-0 text-right" aria-hidden="true">
                  {i + 1}
                </span>
                {solver.avatarUrl ? (
                  <img
                    src={solver.avatarUrl}
                    alt=""
                    aria-hidden="true"
                    width={24}
                    height={24}
                    className="h-6 w-6 shrink-0 rounded-full"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.6rem] font-semibold"
                    style={avatarPalette[i % avatarPalette.length]}
                    aria-hidden="true"
                  >
                    {solver.username.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="font-medium text-foreground min-w-0 flex-1 truncate">
                  {solver.username}
                </span>
                <Trophy size={12} className="shrink-0 text-primary" aria-hidden="true" />
              </li>
            ))}
          </ol>
          {remainingSolvers > 0 && (
            <p className="text-xs text-[hsl(var(--text-secondary))] mt-3">
              +{remainingSolvers} more solved this challenge
            </p>
          )}
        </div>
      )}

      {/* Latest activity */}
      {hasActivity ? (
        <div className="mb-5">
          <SidebarLabel>Latest activity</SidebarLabel>

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

        </div>
      ) : (
        <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed mb-5">
          {hasThread
            ? "No posts yet. Be the first to share your solution or ask a question."
            : "Got stuck or want to share your solution? Join the conversation."}
        </p>
      )}

      <a
        href={hasThread ? discussionUrl : COMMUNITY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="docs-ext-link text-sm font-medium"
      >
        {hasThread && more > 0
          ? `+${more} more ${more === 1 ? "post" : "posts"}, join the discussion`
          : hasThread
            ? "Join the discussion"
            : `Visit ${COMMUNITY_DISPLAY_NAME}`}
        <ArrowRight size={12} aria-hidden="true" />
        <span className="sr-only"> (opens in new tab)</span>
      </a>
    </div>
  );
};
