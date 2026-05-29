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
// adventureId "test-adventure" + levelId "beginner" has data; others return empty.
// ---------------------------------------------------------------------------

const MOCK_POSTS = [
  {
    username: "alice",
    cooked: "<p>Great challenge!</p>",
    created_at: "2024-06-15T11:15:00Z",
    like_count: 5,
    topicUrl: "https://community.offon.dev/t/topic/42/1",
  },
  {
    username: "bob",
    cooked: "<p>Loved it.</p>",
    created_at: "2024-06-15T09:00:00Z",
    like_count: 0,
    topicUrl: "https://community.offon.dev/t/topic/42/2",
  },
  {
    username: "carol",
    cooked: "<p>Well done everyone.</p>",
    created_at: "2024-06-13T12:00:00Z",
    like_count: 1,
    topicUrl: "https://community.offon.dev/t/topic/42/3",
  },
];

const MOCK_LEVEL_DATA = {
  discussionPosts: MOCK_POSTS,
  totalReplies: 12,
};

// Injected via the third argument of useDiscussionPosts instead of mocking
// the JSON module. Avoids Vitest's dynamic-import mock runner initialization
// cost (~3-6s per test run) that caused the first async tests to time out.
let mockLoader: DiscussionDataLoader;

// now = 2024-06-15T12:00:00Z = 1718445600000
const FAKE_NOW = new Date("2024-06-15T12:00:00Z").getTime();

beforeEach(() => {
  mockLoader = vi.fn<DiscussionDataLoader>().mockResolvedValue(MOCK_LEVEL_DATA);
  vi.spyOn(Date, "now").mockReturnValue(FAKE_NOW);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

describe("useDiscussionPosts - initial state", () => {
  it("returns an empty result before data loads", () => {
    const pendingLoader = vi.fn<DiscussionDataLoader>(
      () => new Promise(() => {})
    );
    const { result } = renderHook(() =>
      useDiscussionPosts("test-adventure", "beginner", pendingLoader)
    );
    expect(result.current).toEqual({ posts: [], totalReplies: 0, solvers: [] });
  });

  it("returns an empty result when adventureId is empty", () => {
    const { result } = renderHook(() =>
      useDiscussionPosts("", "beginner", mockLoader)
    );
    expect(result.current).toEqual({ posts: [], totalReplies: 0, solvers: [] });
  });

  it("returns an empty result when levelId is empty", () => {
    const { result } = renderHook(() =>
      useDiscussionPosts("test-adventure", "", mockLoader)
    );
    expect(result.current).toEqual({ posts: [], totalReplies: 0, solvers: [] });
  });
});

// ---------------------------------------------------------------------------
// Data loading
// ---------------------------------------------------------------------------

describe("useDiscussionPosts - data loading", () => {
  it("returns all posts after data loads", async () => {
    const { result } = renderHook(() =>
      useDiscussionPosts("test-adventure", "beginner", mockLoader)
    );
    await waitFor(() => expect(result.current.posts.length).toBe(3));
    expect(result.current.posts[0].username).toBe("alice");
    expect(result.current.posts[1].username).toBe("bob");
    expect(result.current.posts[2].username).toBe("carol");
  });

  it("returns empty posts when loader returns no discussionPosts", async () => {
    const emptyLoader = vi.fn<DiscussionDataLoader>().mockResolvedValue({});
    const { result } = renderHook(() =>
      useDiscussionPosts("test-adventure", "beginner", emptyLoader)
    );
    await waitFor(() => {
      expect(result.current).toEqual({ posts: [], totalReplies: 0, solvers: [] });
    });
  });

  it("returns totalReplies from the loaded entry", async () => {
    const { result } = renderHook(() =>
      useDiscussionPosts("test-adventure", "beginner", mockLoader)
    );
    await waitFor(() => expect(result.current.posts.length).toBe(3));
    expect(result.current.totalReplies).toBe(12);
  });

  it("falls back to posts.length when totalReplies is not provided", async () => {
    const noTotalLoader = vi.fn<DiscussionDataLoader>().mockResolvedValue({
      discussionPosts: MOCK_POSTS,
    });
    const { result } = renderHook(() =>
      useDiscussionPosts("test-adventure", "beginner", noTotalLoader)
    );
    await waitFor(() => expect(result.current.posts.length).toBe(3));
    expect(result.current.totalReplies).toBe(3);
  });

  it("passes each post's raw fields through unchanged", async () => {
    const { result } = renderHook(() =>
      useDiscussionPosts("test-adventure", "beginner", mockLoader)
    );
    await waitFor(() => expect(result.current.posts.length).toBe(3));
    expect(result.current.posts[0].cooked).toBe("<p>Great challenge!</p>");
    expect(result.current.posts[0].like_count).toBe(5);
    expect(result.current.posts[0].topicUrl).toBe(
      "https://community.offon.dev/t/topic/42/1"
    );
  });

  it("calls loader with adventureId and levelId", async () => {
    const { result } = renderHook(() =>
      useDiscussionPosts("test-adventure", "beginner", mockLoader)
    );
    await waitFor(() => expect(result.current.posts.length).toBe(3));
    expect(mockLoader).toHaveBeenCalledWith("test-adventure", "beginner");
  });
});

// ---------------------------------------------------------------------------
// Age computation
// ---------------------------------------------------------------------------

describe("useDiscussionPosts - age computation", () => {
  it("computes '45m ago' for alice (created 45 minutes before now)", async () => {
    const { result } = renderHook(() =>
      useDiscussionPosts("test-adventure", "beginner", mockLoader)
    );
    await waitFor(() => expect(result.current.posts.length).toBe(3));
    expect(result.current.posts[0].age).toBe("45m ago");
  });

  it("computes '3h ago' for bob (created 3 hours before now)", async () => {
    const { result } = renderHook(() =>
      useDiscussionPosts("test-adventure", "beginner", mockLoader)
    );
    await waitFor(() => expect(result.current.posts.length).toBe(3));
    expect(result.current.posts[1].age).toBe("3h ago");
  });

  it("computes '2d ago' for carol (created 2 days before now)", async () => {
    const { result } = renderHook(() =>
      useDiscussionPosts("test-adventure", "beginner", mockLoader)
    );
    await waitFor(() => expect(result.current.posts.length).toBe(3));
    expect(result.current.posts[2].age).toBe("2d ago");
  });

  it("all three relative timestamps are present after data loads", async () => {
    const { result } = renderHook(() =>
      useDiscussionPosts("test-adventure", "beginner", mockLoader)
    );
    await waitFor(() => expect(result.current.posts.length).toBe(3));
    const ages = result.current.posts.map((p) => p.age);
    expect(ages).toEqual(["45m ago", "3h ago", "2d ago"]);
  });
});

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

describe("useDiscussionPosts - error handling", () => {
  it("returns empty on loader rejection", async () => {
    const failLoader = vi.fn<DiscussionDataLoader>().mockRejectedValue(new Error("fail"));
    const { result } = renderHook(() =>
      useDiscussionPosts("test-adventure", "beginner", failLoader)
    );
    await waitFor(() => {
      expect(result.current).toEqual({ posts: [], totalReplies: 0, solvers: [] });
    });
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

  it("defaultLoader uses import.meta.glob for per-level JSON", () => {
    expect(source).toContain("import.meta.glob");
  });

  it("does not import discussion-data.json", () => {
    expect(source).not.toContain("discussion-data.json");
  });

  it("useEffect calls loader(), not a dynamic import directly", () => {
    const effectMatch = source.match(/useEffect\(\(\) => \{([\s\S]*?)\}, \[adventureId, levelId, loader\]\)/);
    expect(effectMatch).toBeTruthy();
    const effectBody = effectMatch![1];
    expect(effectBody).toContain("loader(");
  });

  it("useEffect dependency array includes [adventureId, levelId, loader]", () => {
    expect(source).toContain("[adventureId, levelId, loader]");
  });

  it("does not contain extractTopicId", () => {
    expect(source).not.toContain("extractTopicId");
  });
});
