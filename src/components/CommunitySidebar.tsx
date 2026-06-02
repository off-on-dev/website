import { type CSSProperties, type JSX, useMemo } from "react";
import { ExternalLink, MessageCircle } from "lucide-react";
import { COMMUNITY_URL } from "@/data/constants";
import { useDiscussionPosts } from "@/hooks/useDiscussionPosts";
import { useAdventureLeaderboard, type LeaderboardRow } from "@/hooks/useAdventureLeaderboard";
import { isCertificatePost, displaySnippet } from "@/lib/discussion-utils";
import { ContributorBadge } from "@/components/ContributorBadge";
import { LeaderboardList } from "@/components/LeaderboardList";
import type { Adventure } from "@/data/adventures";

const LEADERBOARD_ROWS_VISIBLE = 3;
const POSTS_VISIBLE = 3;

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
  <p className="font-mono text-xs uppercase tracking-widest text-[hsl(var(--text-faint))] mb-3">
    {children}
  </p>
);

export const CommunitySidebar = ({
  adventureId,
  levelId,
  discussionUrl,
  contributor,
}: CommunitySidebarProps): JSX.Element => {
  const { posts, solvers } = useDiscussionPosts(adventureId, levelId);
  const { rows: leaderboardRows } = useAdventureLeaderboard(adventureId);
  const hasThread = discussionUrl !== COMMUNITY_URL;

  const hasLeaderboard = solvers.length > 0;
  const topSolvers = solvers.slice(0, LEADERBOARD_ROWS_VISIBLE);

  // Points for this specific level, keyed by username.
  const pointsByUsername = useMemo(() => {
    const LEVEL_POINT_KEY = {
      beginner:     "beginnerPoints",
      intermediate: "intermediatePoints",
      expert:       "expertPoints",
      single:       "singlePoints",
    } as const satisfies Partial<Record<string, keyof LeaderboardRow>>;
    const levelKey = LEVEL_POINT_KEY[levelId as keyof typeof LEVEL_POINT_KEY] ?? null;
    return Object.fromEntries(
      leaderboardRows.map((r) => [
        r.username,
        levelKey !== null ? r[levelKey] : undefined,
      ])
    );
  }, [leaderboardRows, levelId]);

  const nonCertPosts = useMemo(() => posts.filter((p) => !isCertificatePost(p)), [posts]);
  // Show non-cert posts if available; fall back to cert posts so activity is never empty when posts exist
  const visible = nonCertPosts.length > 0
    ? nonCertPosts.slice(0, POSTS_VISIBLE)
    : posts.slice(0, POSTS_VISIBLE);
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
          <LeaderboardList
            label="Players who completed this challenge"
            rows={topSolvers.map((solver, i) => ({
              rank: i + 1,
              username: solver.username,
              avatarUrl: solver.avatarUrl,
              points: pointsByUsername[solver.username],
              avatarFallbackStyle: avatarPalette[i % avatarPalette.length],
            }))}
          />
          <p className="text-xs text-[hsl(var(--text-secondary))] mt-3">
            Challenge solved by {solvers.length} {solvers.length === 1 ? "person" : "people"}
          </p>
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

      <div className="border-t border-[hsl(var(--surface-border))] pt-4">
        <a
          href={hasThread ? discussionUrl : COMMUNITY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-soft w-full"
        >
          <MessageCircle size={14} aria-hidden="true" />
          {hasThread ? "Share & Discuss" : "Join the Community"}
          <ExternalLink size={14} aria-hidden="true" />
          <span className="sr-only"> (opens in new tab)</span>
        </a>
        <p className="mt-2.5 text-xs text-[hsl(var(--text-faint))] font-mono text-center">
          Get help or share your solution
        </p>
      </div>
    </div>
  );
};
