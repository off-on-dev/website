import type { PostWithAge } from "@/hooks/useDiscussionPosts";

export const isCertificatePost = (post: PostWithAge): boolean =>
  post.challengeSolved === true;

export const displaySnippet = (post: PostWithAge): string => {
  if (!isCertificatePost(post)) return post.cooked;
  const certRe = /(?:---|\u2014)\s*CERTIFICATE START\s*(?:---|\u2014)[\s\S]*?(?:---|\u2014)\s*CERTIFICATE END\s*(?:---|\u2014)/;
  const stripped = post.cooked.replace(certRe, "").trim();
  return stripped || "Completed the challenge.";
};
