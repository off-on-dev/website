import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAdventureLeaderboard } from "@/hooks/useAdventureLeaderboard";
import type { LeaderboardLoader } from "@/hooks/useAdventureLeaderboard";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_DATA = {
  updatedAt: "2026-05-22T00:00:00Z",
  rows: [
    { rank: 1, username: "alice", avatarUrl: "https://example.com/alice.png", points: 200 },
    { rank: 2, username: "bob",   avatarUrl: "https://example.com/bob.png",   points: 150 },
    { rank: 3, username: "carol", avatarUrl: undefined,                        points: 100 },
  ],
};

let mockLoader: LeaderboardLoader;

beforeEach(() => {
  mockLoader = vi.fn<LeaderboardLoader>().mockResolvedValue(MOCK_DATA);
});

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

describe("useAdventureLeaderboard - initial state", () => {
  it("returns empty rows before data loads", () => {
    const pendingLoader = vi.fn<LeaderboardLoader>(() => new Promise(() => {}));
    const { result } = renderHook(() => useAdventureLeaderboard("test-adventure", pendingLoader));
    expect(result.current.rows).toEqual([]);
    expect(result.current.updatedAt).toBeNull();
  });

  it("returns empty rows when adventureId is empty", () => {
    const { result } = renderHook(() => useAdventureLeaderboard("", mockLoader));
    expect(result.current.rows).toEqual([]);
    expect(mockLoader).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Data loading
// ---------------------------------------------------------------------------

describe("useAdventureLeaderboard - data loading", () => {
  it("returns all rows after data loads", async () => {
    const { result } = renderHook(() => useAdventureLeaderboard("blind-by-design", mockLoader));
    await waitFor(() => expect(result.current.rows.length).toBe(3));
    expect(result.current.rows[0].username).toBe("alice");
    expect(result.current.rows[1].username).toBe("bob");
    expect(result.current.rows[2].username).toBe("carol");
  });

  it("exposes updatedAt from the loaded data", async () => {
    const { result } = renderHook(() => useAdventureLeaderboard("blind-by-design", mockLoader));
    await waitFor(() => expect(result.current.rows.length).toBe(3));
    expect(result.current.updatedAt).toBe("2026-05-22T00:00:00Z");
  });

  it("passes row fields through unchanged", async () => {
    const { result } = renderHook(() => useAdventureLeaderboard("blind-by-design", mockLoader));
    await waitFor(() => expect(result.current.rows.length).toBe(3));
    const first = result.current.rows[0];
    expect(first.rank).toBe(1);
    expect(first.points).toBe(200);
    expect(first.avatarUrl).toBe("https://example.com/alice.png");
  });

  it("returns empty rows when loader resolves with no rows", async () => {
    const emptyLoader = vi.fn<LeaderboardLoader>().mockResolvedValue({ updatedAt: null, rows: [] });
    const { result } = renderHook(() => useAdventureLeaderboard("blind-by-design", emptyLoader));
    await waitFor(() => {
      expect(result.current.rows).toEqual([]);
      expect(result.current.updatedAt).toBeNull();
    });
  });

  it("calls loader with the adventureId", async () => {
    const { result } = renderHook(() => useAdventureLeaderboard("blind-by-design", mockLoader));
    await waitFor(() => expect(result.current.rows.length).toBe(3));
    expect(mockLoader).toHaveBeenCalledWith("blind-by-design");
  });
});

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

describe("useAdventureLeaderboard - error handling", () => {
  it("returns empty rows and null updatedAt when loader rejects", async () => {
    const failLoader = vi.fn<LeaderboardLoader>().mockRejectedValue(new Error("not found"));
    const { result } = renderHook(() => useAdventureLeaderboard("blind-by-design", failLoader));
    await waitFor(() => {
      expect(result.current.rows).toEqual([]);
      expect(result.current.updatedAt).toBeNull();
    });
  });
});

// ---------------------------------------------------------------------------
// File content regressions
// ---------------------------------------------------------------------------

describe("useAdventureLeaderboard - file content regressions", () => {
  const source = readFileSync(
    resolve(__dirname, "../hooks/useAdventureLeaderboard.ts"),
    "utf-8"
  );

  it("uses import.meta.glob for per-adventure JSON files", () => {
    expect(source).toContain("import.meta.glob");
  });

  it("loader path targets leaderboard.json", () => {
    expect(source).toContain("leaderboard.json");
  });

  it("useEffect dependency array includes [adventureId, loader]", () => {
    expect(source).toContain("[adventureId, loader]");
  });
});
