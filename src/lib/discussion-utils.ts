import type { PostWithAge } from "@/hooks/useDiscussionPosts";

/** Returns true if the post marks a completed challenge submission. */
export const isCertificatePost = (post: PostWithAge): boolean =>
  post.challengeSolved === true;

/** Returns the post's HTML with certificate blocks stripped; falls back to a default string for empty results. */
export const displaySnippet = (post: PostWithAge): string => {
  if (!isCertificatePost(post)) return post.cooked;
  // Matches certificate blocks in external Discourse content. The em dash (\u2014)
  // is used by some posters as a delimiter alongside triple hyphens.
  const certRe = /(?:---|\u2014)\s*CERTIFICATE START\s*(?:---|\u2014)[\s\S]*?(?:---|\u2014)\s*CERTIFICATE END\s*(?:---|\u2014)/;
  const stripped = post.cooked.replace(certRe, "").trim();
  return stripped || "Completed the challenge.";
};
