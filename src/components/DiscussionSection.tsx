import { useState, type JSX } from "react";
import { ExternalLink, Heart, Trophy } from "lucide-react";
import { COMMUNITY_URL, COMMUNITY_DISPLAY_NAME } from "@/data/constants";
import { useDiscussionPosts } from "@/hooks/useDiscussionPosts";
import { isCertificatePost, displaySnippet } from "@/lib/discussion-utils";
import { makeAvatarPalette } from "@/lib/avatar-utils";

const avatarPalette = makeAvatarPalette(0.2);

type DiscussionSectionProps = {
  adventureId: string;
  levelId: string;
  discussionUrl: string;
};

export const DiscussionSection = ({ adventureId, levelId, discussionUrl }: DiscussionSectionProps): JSX.Element => {
  const { posts: allPosts, loaded } = useDiscussionPosts(adventureId, levelId);
  const posts = allPosts.slice(0, 3);
  // Avatars are external (Discourse). Track per-post load failures so a broken
  // image falls back to the initials chip instead of a broken-image icon.
  const [failedAvatars, setFailedAvatars] = useState<Record<number, true>>({});

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

  const statusMessage = loaded
    ? posts.length === 0
      ? "No discussion posts loaded."
      : `${posts.length} recent discussion post${posts.length !== 1 ? "s" : ""} shown.`
    : "";

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground mb-4">Discussion</h2>
      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">{statusMessage}</span>
      <div>
      {loaded && posts.length === 0 ? (
        <>
          <div className="card-glow rounded-xl border border-border bg-[hsl(var(--surface))] p-8 text-center">
            <p className="text-muted-foreground text-sm">
              No community posts yet. Be the first to share!
            </p>
          </div>
          {joinLink}
        </>
      ) : loaded ? (
        <>
          {posts.map((post, i) => (
            <a
              key={`${post.username}-${post.created_at}`}
              href={post.topicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block card-glow rounded-xl border border-border bg-[hsl(var(--surface))] p-5 transition-all focus-ring"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {post.avatarUrl && !failedAvatars[i] ? (
                    <img
                      src={post.avatarUrl}
                      alt=""
                      aria-hidden="true"
                      width={32}
                      height={32}
                      loading="lazy"
                      decoding="async"
                      onError={() => setFailedAvatars((f) => ({ ...f, [i]: true }))}
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
                  <span className="sr-only">{post.username || "Community member"}{post.age ? `, posted ${post.age}` : ""}: </span>
                  {post.age && (
                    <span className="text-xs text-faint" aria-hidden="true">{post.age}</span>
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
      ) : null}
      </div>
    </div>
  );
};
