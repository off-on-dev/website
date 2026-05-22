import { describe, it, expect } from "vitest";
import { isCertificatePost, displaySnippet } from "@/lib/discussion-utils";
import type { PostWithAge } from "@/hooks/useDiscussionPosts";

function makePost(overrides: Partial<PostWithAge> = {}): PostWithAge {
  return {
    username: "tester",
    cooked: "Hello world",
    created_at: "2024-01-01T00:00:00Z",
    topicUrl: "https://community.example.com/t/test/1",
    age: "2 days ago",
    ...overrides,
  };
}

describe("isCertificatePost", () => {
  it("returns false when challengeSolved is undefined", () => {
    expect(isCertificatePost(makePost())).toBe(false);
  });

  it("returns false when challengeSolved is false", () => {
    expect(isCertificatePost(makePost({ challengeSolved: false }))).toBe(false);
  });

  it("returns true when challengeSolved is true", () => {
    expect(isCertificatePost(makePost({ challengeSolved: true }))).toBe(true);
  });
});

describe("displaySnippet", () => {
  it("returns cooked unchanged for non-certificate posts", () => {
    const post = makePost({ cooked: "My solution was amazing." });
    expect(displaySnippet(post)).toBe("My solution was amazing.");
  });

  it("strips triple-hyphen certificate block and returns surrounding text", () => {
    const post = makePost({
      challengeSolved: true,
      cooked:
        "Great work!\n--- CERTIFICATE START ---\nSome cert data\n--- CERTIFICATE END ---\nThanks everyone.",
    });
    expect(displaySnippet(post)).toBe("Great work!\n\nThanks everyone.");
  });

  it("strips em-dash certificate block", () => {
    const post = makePost({
      challengeSolved: true,
      cooked:
        "Done.— CERTIFICATE START —\ncert content\n— CERTIFICATE END —",
    });
    expect(displaySnippet(post)).toBe("Done.");
  });

  it("returns fallback text when stripped content is empty", () => {
    const post = makePost({
      challengeSolved: true,
      cooked: "--- CERTIFICATE START ---\nonly cert\n--- CERTIFICATE END ---",
    });
    expect(displaySnippet(post)).toBe("Completed the challenge.");
  });

  it("handles multiline certificate block content", () => {
    const post = makePost({
      challengeSolved: true,
      cooked:
        "My answer:\n--- CERTIFICATE START ---\nline1\nline2\nline3\n--- CERTIFICATE END ---",
    });
    expect(displaySnippet(post)).toBe("My answer:");
  });

  it("returns cooked unchanged for certificate post with no cert block in cooked", () => {
    const post = makePost({
      challengeSolved: true,
      cooked: "I solved it but no block here.",
    });
    expect(displaySnippet(post)).toBe("I solved it but no block here.");
  });
});
