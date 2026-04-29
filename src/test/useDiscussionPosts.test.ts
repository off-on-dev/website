import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useDiscussionPosts } from "@/hooks/useDiscussionPosts";
import type { DiscussionDataLoader } from "@/hooks/useDiscussionPosts";

// ---------------------------------------------------------------------------
// Mock data
// Fixed timestamps relative to the fake "now" set in beforeEach:
//   now = 2024-06-15T12:00:00Z
//   alice: 45m ago → "45m ago"
//   bob:   3h ago  → "3h ago"
//   carol: 2d ago  → "2d ago"
// Topic ID "42" has data; all other IDs return empty.
// ---------------------------------------------------------------------------

const MOCK_DATA = {
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
};

// Injected via the second argument of useDiscussionPosts instead of mocking
// the JSON module. Avoids Vitest's dynamic-import mock runner initialization
// cost (~3-6s per test run) that caused the first async tests to time out.
let mockLoader: DiscussionDataLoader;

// now = 2024-06-15T12:00:00Z = 1718445600000
const FAKE_NOW = new Date("2024-06-15T12:00:00Z").getTime();

beforeEach(() => {
  mockLoader = vi.fn<DiscussionDataLoader>().mockResolvedValue(MOCK_DATA);
  vi.spyOn(Date, "now").mockReturnValue(FAKE_NOW);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// Convenience: render the hook with the mock loader for topic-42 URL
const URL_42 = "https://community.open-ecosystem.com/t/topic/42/1";
const URL_42_NO_POST = "https://community.open-ecosystem.com/t/topic/42";
const URL_99 = "https://community.open-ecosystem.com/t/topic/99/1";
const URL_NO_ID = "https://community.open-ecosystem.com";

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

describe("useDiscussionPosts - initial state", () => {
  it("returns an empty array before data loads", () => {
    const { result } = renderHook(() =>
      useDiscussionPosts(URL_42, mockLoader)
    );
    expect(result.current).toEqual([]);
  });

  it("returns an empty array when the URL has no topic ID segment", () => {
    const { result } = renderHook(() =>
      useDiscussionPosts(URL_NO_ID, mockLoader)
    );
    expect(result.current).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Data loading
// ---------------------------------------------------------------------------

describe("useDiscussionPosts - data loading", () => {
  it("returns all posts after data loads for a known topic ID", async () => {
    const { result } = renderHook(() =>
      useDiscussionPosts(URL_42, mockLoader)
    );
    await waitFor(() => expect(result.current.length).toBe(3));
    expect(result.current[0].username).toBe("alice");
    expect(result.current[1].username).toBe("bob");
    expect(result.current[2].username).toBe("carol");
  });

  it("does not populate posts for an unknown topic ID", async () => {
    const { result } = renderHook(() =>
      useDiscussionPosts(URL_99, mockLoader)
    );
    await waitFor(() => {
      expect(result.current).toEqual([]);
    });
  });

  it("passes each post's raw fields through unchanged", async () => {
    const { result } = renderHook(() =>
      useDiscussionPosts(URL_42, mockLoader)
    );
    await waitFor(() => expect(result.current.length).toBe(3));
    expect(result.current[0].cooked).toBe("<p>Great challenge!</p>");
    expect(result.current[0].like_count).toBe(5);
    expect(result.current[0].topicUrl).toBe(
      "https://community.open-ecosystem.com/t/topic/42/1"
    );
  });
});

// ---------------------------------------------------------------------------
// Age computation
// ---------------------------------------------------------------------------

describe("useDiscussionPosts - age computation", () => {
  it("computes '45m ago' for alice (created 45 minutes before now)", async () => {
    const { result } = renderHook(() =>
      useDiscussionPosts(URL_42, mockLoader)
    );
    await waitFor(() => expect(result.current.length).toBe(3));
    expect(result.current[0].age).toBe("45m ago");
  });

  it("computes '3h ago' for bob (created 3 hours before now)", async () => {
    const { result } = renderHook(() =>
      useDiscussionPosts(URL_42, mockLoader)
    );
    await waitFor(() => expect(result.current.length).toBe(3));
    expect(result.current[1].age).toBe("3h ago");
  });

  it("computes '2d ago' for carol (created 2 days before now)", async () => {
    const { result } = renderHook(() =>
      useDiscussionPosts(URL_42, mockLoader)
    );
    await waitFor(() => expect(result.current.length).toBe(3));
    expect(result.current[2].age).toBe("2d ago");
  });

  it("all three relative timestamps are present after data loads", async () => {
    const { result } = renderHook(() =>
      useDiscussionPosts(URL_42, mockLoader)
    );
    await waitFor(() => expect(result.current.length).toBe(3));
    const ages = result.current.map((p) => p.age);
    expect(ages).toEqual(["45m ago", "3h ago", "2d ago"]);
  });
});

// ---------------------------------------------------------------------------
// URL topic ID extraction
// ---------------------------------------------------------------------------

describe("useDiscussionPosts - topic ID extraction from URL", () => {
  it("extracts ID from a URL with a post number suffix (.../id/postNumber)", async () => {
    const { result } = renderHook(() =>
      useDiscussionPosts(URL_42, mockLoader)
    );
    await waitFor(() => expect(result.current.length).toBe(3));
  });

  it("extracts ID from a URL without a post number suffix (.../id)", async () => {
    const { result } = renderHook(() =>
      useDiscussionPosts(URL_42_NO_POST, mockLoader)
    );
    await waitFor(() => expect(result.current.length).toBe(3));
  });
});

// ---------------------------------------------------------------------------
// File content regressions
// ---------------------------------------------------------------------------

describe("useDiscussionPosts - file content regressions", () => {
  const source = readFileSync(
    resolve(__dirname, "../hooks/useDiscussionPosts.ts"),
    "utf-8"
  );

  it("defaultLoader uses a dynamic import of discussion-data.json", () => {
    expect(source).toContain('import("@/data/discussion-data.json")');
  });

  it("useEffect calls loader(), not the dynamic import directly", () => {
    const effectMatch = source.match(/useEffect\(\(\) => \{([\s\S]*?)\}, \[topicId, loader\]\)/);
    expect(effectMatch).toBeTruthy();
    const effectBody = effectMatch![1];
    expect(effectBody).toContain("loader()");
    expect(effectBody).not.toContain('import("@/data/discussion-data.json")');
  });

  it("useEffect dependency array includes [topicId, loader]", () => {
    expect(source).toContain("[topicId, loader]");
    expect(source).not.toContain("[discussionUrl]");
  });

  it("extractTopicId is called at hook top level, not inside useEffect", () => {
    const effectMatch = source.match(/useEffect\(\(\) => \{([\s\S]*?)\}, \[topicId, loader\]\)/);
    expect(effectMatch).toBeTruthy();
    const effectBody = effectMatch![1];
    expect(effectBody).not.toContain("extractTopicId");
  });
});
