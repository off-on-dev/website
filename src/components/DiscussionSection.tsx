import { type CSSProperties, type JSX } from "react";
import { ExternalLink, Heart, Trophy } from "lucide-react";
import { COMMUNITY_URL, COMMUNITY_DISPLAY_NAME } from "@/data/constants";
import { useDiscussionPosts } from "@/hooks/useDiscussionPosts";
import { isCertificatePost, displaySnippet } from "@/lib/discussion-utils";

const avatarPalette: CSSProperties[] = [
  { backgroundColor: "hsl(var(--primary) / 0.2)", color: "hsl(var(--foreground))" },
  { backgroundColor: "hsl(var(--difficulty-architect) / 0.2)", color: "hsl(var(--foreground))" },
  { backgroundColor: "hsl(var(--teal) / 0.2)", color: "hsl(var(--foreground))" },
  { backgroundColor: "hsl(var(--difficulty-builder) / 0.2)", color: "hsl(var(--foreground))" },
  { backgroundColor: "hsl(var(--destructive) / 0.2)", color: "hsl(var(--foreground))" },
];

type DiscussionSectionProps = {
  adventureId: string;
  levelId: string;
  discussionUrl: string;
};

export const DiscussionSection = ({ adventureId, levelId, discussionUrl }: DiscussionSectionProps): JSX.Element => {
  const posts = useDiscussionPosts(adventureId, levelId).posts.slice(0, 3);

  const joinLink = (
    <a
      href={discussionUrl || COMMUNITY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="docs-ext-link mt-4 text-sm font-medium"
    >
      Join the Discussion on {COMMUNITY_DISPLAY_NAME} <ExternalLink size={12} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
    </a>
  );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground mb-4">Discussion</h2>
      <div aria-live="polite" aria-atomic="false">
      {posts.length === 0 ? (
        <>
          <div className="card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-8 text-center">
            <p className="text-muted-foreground text-sm">
              No community posts yet. Be the first to share!
            </p>
          </div>
          {joinLink}
        </>
      ) : (
        <>
          {posts.map((post, i) => (
            <a
              key={`${post.username}-${post.created_at}`}
              href={post.topicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {post.avatarUrl ? (
                    <img
                      src={post.avatarUrl}
                      alt=""
                      aria-hidden="true"
                      width={32}
                      height={32}
                      loading="lazy"
                      decoding="async"
                      className="h-8 w-8 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
                      style={avatarPalette[i % avatarPalette.length]}
                      aria-hidden="true"
                    >
                      {post.username.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="sr-only">{post.username}: </span>
                  {post.age && (
                    <span className="text-xs text-[hsl(var(--text-faint))]" aria-hidden="true">{post.age}</span>
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
                {isCertificatePost(post) && <Trophy size={14} className="inline mr-1 text-primary" aria-hidden="true" />}
                {displaySnippet(post)}
              </p>
              <span className="sr-only"> (opens in new tab)</span>
            </a>
          ))}
          {joinLink}
        </>
      )}
      </div>
    </div>
  );
};
