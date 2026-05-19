import { type CSSProperties, type JSX, useMemo } from "react";
import { ArrowRight, CircleCheck, MessageCircle, Trophy } from "lucide-react";
import { COMMUNITY_URL, COMMUNITY_DISPLAY_NAME } from "@/data/constants";
import { useDiscussionPosts, type PostWithAge } from "@/hooks/useDiscussionPosts";
import { ContributorBadge } from "@/components/ContributorBadge";
import type { Adventure } from "@/data/adventures";

const avatarPalette: CSSProperties[] = [
  { backgroundColor: "hsl(var(--primary) / 0.25)", color: "hsl(var(--foreground))" },
  { backgroundColor: "hsl(var(--difficulty-architect) / 0.25)", color: "hsl(var(--foreground))" },
  { backgroundColor: "hsl(var(--teal) / 0.25)", color: "hsl(var(--foreground))" },
  { backgroundColor: "hsl(var(--difficulty-builder) / 0.25)", color: "hsl(var(--foreground))" },
  { backgroundColor: "hsl(var(--destructive) / 0.25)", color: "hsl(var(--foreground))" },
];

const isCertificatePost = (post: PostWithAge): boolean =>
  post.cooked.includes("CERTIFICATE START");

const displaySnippet = (post: PostWithAge): string => {
  if (isCertificatePost(post)) return "Completed the challenge.";
  return post.cooked;
};

type TopPlayer = { username: string; count: number };

type CommunitySidebarProps = {
  adventureId: string;
  levelId: string;
  discussionUrl: string;
  contributor?: Adventure["contributor"];
};

const SectionLabel = ({ children }: { children: string }): JSX.Element => (
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
  const { posts, totalReplies } = useDiscussionPosts(adventureId, levelId);
  const hasThread = discussionUrl !== COMMUNITY_URL;

  // Derive solvedCount and topPlayers from certificate posts
  const { solvedCount, topPlayers } = useMemo(() => {
    const certPosts = posts.filter(isCertificatePost);
    const userCounts = new Map<string, number>();
    for (const post of certPosts) {
      userCounts.set(post.username, (userCounts.get(post.username) ?? 0) + 1);
    }
    const uniqueSolvers = userCounts.size;
    const leaders: TopPlayer[] = Array.from(userCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([username, count]) => ({ username, count }));
    return { solvedCount: uniqueSolvers, topPlayers: leaders };
  }, [posts]);

  const nonCertPosts = useMemo(() => posts.filter((p) => !isCertificatePost(p)), [posts]);
  const visibleCount = 3;
  const visible = nonCertPosts.slice(0, visibleCount);
  const more = Math.max(0, totalReplies - visible.length);
  const hasLeaderboard = topPlayers.length > 0;
  const hasActivity = visible.length > 0;

  return (
    <div className="rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-5">
      <div className="flex items-center gap-2 mb-5">
        <MessageCircle size={14} className="text-primary" aria-hidden="true" />
        <p className="font-sans text-sm font-semibold tracking-wide text-primary">
          Community
        </p>
      </div>

      {/* Challenge builder */}
      {contributor && (
        <div className="mb-5 pb-5 border-b border-[hsl(var(--surface-border))]">
          <ContributorBadge name={contributor.name} url={contributor.url} />
        </div>
      )}

      {/* Completion stat */}
      {solvedCount > 0 && (
        <div className="flex items-center gap-2 mb-5 pb-5 border-b border-[hsl(var(--surface-border))]">
          <CircleCheck size={16} className="text-primary shrink-0" aria-hidden="true" />
          <p className="text-sm text-foreground">
            <span className="font-semibold">{solvedCount}</span>{" "}
            <span className="text-[hsl(var(--text-secondary))]">
              {solvedCount === 1 ? "person has" : "people have"} solved this
            </span>
          </p>
        </div>
      )}

      {/* Top players */}
      {hasLeaderboard && (
        <div className="mb-5 pb-5 border-b border-[hsl(var(--surface-border))]">
          <SectionLabel>Completions</SectionLabel>
          <ol className="space-y-2.5" aria-label="Players who completed this challenge">
            {topPlayers.map((player, i) => (
              <li
                key={player.username}
                className="flex items-center gap-3 text-sm"
              >
                <span className="font-mono text-xs text-[hsl(var(--text-faint))] w-4 shrink-0 text-right" aria-hidden="true">
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
                <Trophy size={12} className="shrink-0 text-primary" aria-hidden="true" />
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
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm"
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
