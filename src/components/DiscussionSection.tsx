import { type CSSProperties, type JSX } from "react";
import { ArrowRight, Heart, Trophy } from "lucide-react";
import { COMMUNITY_URL, COMMUNITY_DISPLAY_NAME } from "@/data/constants";
import { useDiscussionPosts, type PostWithAge } from "@/hooks/useDiscussionPosts";

const avatarPalette: CSSProperties[] = [
  { backgroundColor: "hsl(var(--primary) / 0.2)", color: "hsl(var(--foreground))" },
  { backgroundColor: "hsl(var(--difficulty-architect) / 0.2)", color: "hsl(var(--foreground))" },
  { backgroundColor: "hsl(var(--teal) / 0.2)", color: "hsl(var(--foreground))" },
  { backgroundColor: "hsl(var(--difficulty-builder) / 0.2)", color: "hsl(var(--foreground))" },
  { backgroundColor: "hsl(var(--destructive) / 0.2)", color: "hsl(var(--foreground))" },
];

const CERT_RE = /(?:---|\u2014)\s*CERTIFICATE START\s*(?:---|\u2014)[\s\S]*?(?:---|\u2014)\s*CERTIFICATE END\s*(?:---|\u2014)/;

const isCertificatePost = (post: PostWithAge): boolean =>
  post.cooked.includes("CERTIFICATE START");

const displaySnippet = (post: PostWithAge): string => {
  if (!isCertificatePost(post)) return post.cooked;
  const stripped = post.cooked.replace(CERT_RE, "").trim();
  return stripped || "Completed the challenge.";
};

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
      className="docs-ext-link mt-4 inline-flex items-center gap-1 text-sm font-medium underline decoration-2 underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm"
    >
      Join the Discussion on {COMMUNITY_DISPLAY_NAME} <ArrowRight size={13} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
    </a>
  );

  return (
    <div aria-live="polite" className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground mb-4">Discussion</h2>
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
              aria-label={`Community post by ${post.username} (opens in new tab)`}
              className="block card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
                    style={avatarPalette[i % avatarPalette.length]}
                    aria-hidden="true"
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
                {isCertificatePost(post) && <Trophy size={14} className="inline mr-1 text-primary" aria-hidden="true" />}
                {displaySnippet(post)}
              </p>
            </a>
          ))}
          {joinLink}
        </>
      )}
    </div>
  );
};
