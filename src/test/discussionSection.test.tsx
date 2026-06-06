import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DiscussionSection } from "@/components/DiscussionSection";
import type { PostWithAge } from "@/hooks/useDiscussionPosts";

// ---------------------------------------------------------------------------
// Mock the hook so all component tests are synchronous.
// The hook normally does a dynamic import inside useEffect; mocking it here
// eliminates the React 19 concurrent scheduler interaction that caused
// findByText timeouts in the original component-level test.
// ---------------------------------------------------------------------------

const MOCK_POSTS: PostWithAge[] = [
  {
    username: "alice",
    cooked: "Great challenge!",
    created_at: "2024-06-15T11:15:00Z",
    age: "45m ago",
    like_count: 5,
    topicUrl: "https://community.offon.dev/t/topic/42/1",
  },
  {
    username: "bob",
    cooked: "Loved it.",
    created_at: "2024-06-15T09:00:00Z",
    age: "3h ago",
    like_count: 0,
    topicUrl: "https://community.offon.dev/t/topic/42/2",
  },
  {
    username: "carol",
    cooked: "Well done everyone.",
    created_at: "2024-06-13T12:00:00Z",
    age: "2d ago",
    like_count: 1,
    topicUrl: "https://community.offon.dev/t/topic/42/3",
  },
];

vi.mock("@/hooks/useDiscussionPosts", () => ({
  useDiscussionPosts: (adventureId: string, levelId: string) =>
    adventureId === "test-adventure" && levelId === "beginner"
      ? { posts: MOCK_POSTS, totalReplies: MOCK_POSTS.length, solvers: [], loaded: true }
      : { posts: [], totalReplies: 0, solvers: [], loaded: true },
}));

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

describe("DiscussionSection - empty state", () => {
  it("shows 'No community posts yet' when topic has no posts", () => {
    render(
      <DiscussionSection adventureId="unknown" levelId="unknown" discussionUrl="https://community.offon.dev/t/unknown/999/1" />
    );
    expect(screen.getByText(/No community posts yet/)).toBeTruthy();
  });

  it("shows 'Join the discussion' link in the empty state", () => {
    render(
      <DiscussionSection adventureId="unknown" levelId="unknown" discussionUrl="https://community.offon.dev/t/unknown/999/1" />
    );
    expect(screen.getByRole("link", { name: /Join the discussion/i })).toBeTruthy();
  });

  it("shows empty state when adventureId and levelId do not match", () => {
    render(<DiscussionSection adventureId="no-match" levelId="none" discussionUrl="https://community.offon.dev" />);
    expect(screen.getByText(/No community posts yet/)).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Posts state
// ---------------------------------------------------------------------------

describe("DiscussionSection - posts state", () => {
  it("renders all posts when the hook returns data", () => {
    render(
      <DiscussionSection adventureId="test-adventure" levelId="beginner" discussionUrl="https://community.offon.dev/t/topic/42/1" />
    );
    expect(screen.getByText("Great challenge!")).toBeTruthy();
    expect(screen.getByText("Loved it.")).toBeTruthy();
    expect(screen.getByText("Well done everyone.")).toBeTruthy();
  });

  it("renders plain text post content (HTML stripped at build time)", () => {
    render(
      <DiscussionSection adventureId="test-adventure" levelId="beginner" discussionUrl="https://community.offon.dev/t/topic/42/1" />
    );
    expect(screen.getByText("Great challenge!")).toBeTruthy();
    expect(screen.getByText("Loved it.")).toBeTruthy();
  });

  it("shows like count for posts with at least one like", () => {
    render(
      <DiscussionSection adventureId="test-adventure" levelId="beginner" discussionUrl="https://community.offon.dev/t/topic/42/1" />
    );
    expect(screen.getByText("5")).toBeTruthy();
    expect(screen.getByText("1")).toBeTruthy();
  });

  it("does not render a like count element for posts with zero likes", () => {
    render(
      <DiscussionSection adventureId="test-adventure" levelId="beginner" discussionUrl="https://community.offon.dev/t/topic/42/1" />
    );
    expect(screen.queryAllByText("0").length).toBe(0);
  });

  it("renders 'Join the discussion' link when posts are present", () => {
    render(
      <DiscussionSection adventureId="test-adventure" levelId="beginner" discussionUrl="https://community.offon.dev/t/topic/42/1" />
    );
    expect(screen.getByRole("link", { name: /Join the discussion/i })).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Age display: hook computes ages; component renders the string it receives
// ---------------------------------------------------------------------------

describe("DiscussionSection - age display", () => {
  it("renders age strings returned by the hook", () => {
    render(
      <DiscussionSection adventureId="test-adventure" levelId="beginner" discussionUrl="https://community.offon.dev/t/topic/42/1" />
    );
    expect(screen.getByText("45m ago")).toBeTruthy();
    expect(screen.getByText("3h ago")).toBeTruthy();
    expect(screen.getByText("2d ago")).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Live region: sr-only status node announces a concise count, not card content
// ---------------------------------------------------------------------------

describe("DiscussionSection - live region status", () => {
  it("announces post count in the status node when posts are loaded", () => {
    render(
      <DiscussionSection adventureId="test-adventure" levelId="beginner" discussionUrl="https://community.offon.dev/t/topic/42/1" />
    );
    const status = screen.getByRole("status");
    expect(status.textContent).toBe("3 recent discussion posts shown.");
  });

  it("announces no-posts status in the status node when the section is empty", () => {
    render(
      <DiscussionSection adventureId="unknown" levelId="unknown" discussionUrl="https://community.offon.dev/t/unknown/999/1" />
    );
    const status = screen.getByRole("status");
    expect(status.textContent).toBe("No discussion posts loaded.");
  });

  it("status node does not render card content (only the concise message)", () => {
    render(
      <DiscussionSection adventureId="test-adventure" levelId="beginner" discussionUrl="https://community.offon.dev/t/topic/42/1" />
    );
    const status = screen.getByRole("status");
    expect(status.textContent).not.toContain("Great challenge!");
  });
});

// ---------------------------------------------------------------------------
// File content regressions: component must delegate to the hook
// ---------------------------------------------------------------------------

describe("DiscussionSection - file content regressions", () => {
  const source = readFileSync(
    resolve(__dirname, "../components/DiscussionSection.tsx"),
    "utf-8"
  );

  it("imports useDiscussionPosts from the hook", () => {
    expect(source).toContain('from "@/hooks/useDiscussionPosts"');
  });

  it("does not contain a dynamic import of discussion-data.json", () => {
    expect(source).not.toContain('import("@/data/discussion-data.json")');
  });

  it("does not contain extractTopicId (logic moved to hook)", () => {
    expect(source).not.toContain("extractTopicId");
  });

  it("does not contain useEffect (pure renderer)", () => {
    expect(source).not.toContain("useEffect");
  });
});
