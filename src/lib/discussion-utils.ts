import type { PostWithAge } from "@/hooks/useDiscussionPosts";

const CERT_RE = /(?:---|\u2014)\s*CERTIFICATE START\s*(?:---|\u2014)[\s\S]*?(?:---|\u2014)\s*CERTIFICATE END\s*(?:---|\u2014)/;

export const isCertificatePost = (post: PostWithAge): boolean =>
  post.cooked.includes("CERTIFICATE START");

export const displaySnippet = (post: PostWithAge): string => {
  if (!isCertificatePost(post)) return post.cooked;
  const stripped = post.cooked.replace(CERT_RE, "").trim();
  return stripped || "Completed the challenge.";
};
