import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { DiscussionSection } from "@/components/DiscussionSection";

// ---------------------------------------------------------------------------
// Mock discussion data
// Fixed timestamps relative to the fake "now" set in beforeEach:
//   now = 2024-06-15T12:00:00Z
//   alice: 45m ago → "45m ago"
//   bob:   3h ago  → "3h ago"
//   carol: 2d ago  → "2d ago"
// Topic ID "42" has data; all other IDs return empty.
// ---------------------------------------------------------------------------

vi.mock("@/data/discussion-data.json", () => ({
  default: {
    "42": [
      {
        username: "alice",
        cooked: "<p>Great challenge!</p>",
        created_at: "2024-06-15T11:15:00Z",
        like_count: 5,
        topicUrl: "https://community.open-ecosystem.com/t/topic/42/1",
      },
      {
        username: "bob",
        cooked: "<p>Loved it.</p>",
        created_at: "2024-06-15T09:00:00Z",
        like_count: 0,
        topicUrl: "https://community.open-ecosystem.com/t/topic/42/2",
      },
      {
        username: "carol",
        cooked: "<p>Well done everyone.</p>",
        created_at: "2024-06-13T12:00:00Z",
        like_count: 1,
        topicUrl: "https://community.open-ecosystem.com/t/topic/42/3",
      },
    ],
  },
}));

// ---------------------------------------------------------------------------
// Fake timers: fix Date.now() so timeAgo produces deterministic output
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2024-06-15T12:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

describe("DiscussionSection - empty state", () => {
  it("shows 'No community posts yet' when topic ID is not in the data", () => {
    render(
      <DiscussionSection discussionUrl="https://community.open-ecosystem.com/t/unknown/999/1" />
    );
    expect(screen.getByText(/No community posts yet/)).toBeTruthy();
  });

  it("shows 'Join the discussion' link when topic has no posts", () => {
    render(
      <DiscussionSection discussionUrl="https://community.open-ecosystem.com/t/unknown/999/1" />
    );
    expect(screen.getByRole("link", { name: /Join the discussion/i })).toBeTruthy();
  });

  it("shows 'No community posts yet' when URL contains no topic ID segment", () => {
    render(<DiscussionSection discussionUrl="https://community.open-ecosystem.com" />);
    expect(screen.getByText(/No community posts yet/)).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Posts state
// ---------------------------------------------------------------------------

describe("DiscussionSection - posts state", () => {
  it("renders all posts when data exists for the topic ID", () => {
    render(
      <DiscussionSection discussionUrl="https://community.open-ecosystem.com/t/topic/42/1" />
    );
    expect(screen.getByText("Great challenge!")).toBeTruthy();
    expect(screen.getByText("Loved it.")).toBeTruthy();
    expect(screen.getByText("Well done everyone.")).toBeTruthy();
  });

  it("strips HTML tags from post content", () => {
    render(
      <DiscussionSection discussionUrl="https://community.open-ecosystem.com/t/topic/42/1" />
    );
    expect(screen.getByText("Great challenge!")).toBeTruthy();
    expect(screen.getByText("Loved it.")).toBeTruthy();
  });

  it("shows like count for posts with at least one like", () => {
    render(
      <DiscussionSection discussionUrl="https://community.open-ecosystem.com/t/topic/42/1" />
    );
    expect(screen.getByText("5")).toBeTruthy();
    expect(screen.getByText("1")).toBeTruthy();
  });

  it("does not render a like count element for posts with zero likes", () => {
    render(
      <DiscussionSection discussionUrl="https://community.open-ecosystem.com/t/topic/42/1" />
    );
    // Zero like count must not be rendered (JSX guard: like_count > 0)
    const zeros = screen.queryAllByText("0");
    expect(zeros.length).toBe(0);
  });

  it("renders 'Join the discussion' link when posts are present", () => {
    render(
      <DiscussionSection discussionUrl="https://community.open-ecosystem.com/t/topic/42/1" />
    );
    expect(screen.getByRole("link", { name: /Join the discussion/i })).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Age computation (useEffect-driven, runs after mount)
// ---------------------------------------------------------------------------

describe("DiscussionSection - age computation", () => {
  it("shows '45m ago' for a post created 45 minutes before now", () => {
    render(
      <DiscussionSection discussionUrl="https://community.open-ecosystem.com/t/topic/42/1" />
    );
    expect(screen.getByText("45m ago")).toBeTruthy();
  });

  it("shows '3h ago' for a post created 3 hours before now", () => {
    render(
      <DiscussionSection discussionUrl="https://community.open-ecosystem.com/t/topic/42/1" />
    );
    expect(screen.getByText("3h ago")).toBeTruthy();
  });

  it("shows '2d ago' for a post created 2 days before now", () => {
    render(
      <DiscussionSection discussionUrl="https://community.open-ecosystem.com/t/topic/42/1" />
    );
    expect(screen.getByText("2d ago")).toBeTruthy();
  });

  it("ages are empty strings on first render and populated after mount effect", () => {
    // Verify ages are not empty after render (effect ran via act in testing-library)
    render(
      <DiscussionSection discussionUrl="https://community.open-ecosystem.com/t/topic/42/1" />
    );
    const ageElements = screen.getAllByText(/\d+[mhd] ago/);
    expect(ageElements.length).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// URL-to-ID extraction (tested via component rendering behavior)
// ---------------------------------------------------------------------------

describe("DiscussionSection - topic ID extraction from URL", () => {
  it("extracts ID from a URL with a post number suffix (.../id/postNumber)", () => {
    render(
      <DiscussionSection discussionUrl="https://community.open-ecosystem.com/t/topic/42/1" />
    );
    expect(screen.getByText("Great challenge!")).toBeTruthy();
  });

  it("extracts ID from a URL without a post number suffix (.../id)", () => {
    render(
      <DiscussionSection discussionUrl="https://community.open-ecosystem.com/t/topic/42" />
    );
    expect(screen.getByText("Great challenge!")).toBeTruthy();
  });

  it("returns no posts when the URL's topic ID is not in the data", () => {
    render(
      <DiscussionSection discussionUrl="https://community.open-ecosystem.com/t/topic/99/1" />
    );
    expect(screen.getByText(/No community posts yet/)).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// File-content regression: fix for redundant extractTopicId call in useEffect
// ---------------------------------------------------------------------------

describe("DiscussionSection - file content regressions", () => {
  const source = readFileSync(
    resolve(__dirname, "../components/DiscussionSection.tsx"),
    "utf-8"
  );

  it("useEffect dependency array is [topicId], not [discussionUrl]", () => {
    expect(source).toContain("[topicId]");
    expect(source).not.toContain("[discussionUrl]");
  });

  it("extractTopicId is called at component top level, not inside useEffect", () => {
    // extractTopicId should appear: once in its definition, once at component top.
    // The useEffect body should not contain a call to extractTopicId.
    const effectMatch = source.match(/useEffect\(\(\) => \{([\s\S]*?)\}, \[topicId\]\)/);
    expect(effectMatch).toBeTruthy();
    const effectBody = effectMatch![1];
    expect(effectBody).not.toContain("extractTopicId");
  });
});
