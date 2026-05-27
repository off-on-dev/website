import { useState, useEffect } from "react";

export type LeaderboardRow = {
  rank: number;
  username: string;
  avatarUrl?: string;
  points: number;
  challengesSolved?: number;
  beginnerPoints?: number;
  intermediatePoints?: number;
  expertPoints?: number;
  singlePoints?: number;
  breakdown?: string;
};

type LeaderboardData = {
  updatedAt: string | null;
  rows: LeaderboardRow[];
};

// Exported so tests can inject a mock loader without Vitest dynamic-import cost.
export type LeaderboardLoader = (adventureId: string) => Promise<LeaderboardData>;

const leaderboardModules = import.meta.glob("@/data/adventures/**/*.json");

const defaultLoader: LeaderboardLoader = async (adventureId) => {
  const key = `/src/data/adventures/${adventureId}/leaderboard.json`;
  const loader = leaderboardModules[key];
  if (!loader) return { updatedAt: null, rows: [] };
  const mod = await loader() as { default: LeaderboardData };
  return mod.default;
};

export type LeaderboardResult = {
  rows: LeaderboardRow[];
  updatedAt: string | null;
};

/**
 * Loads adventure leaderboard data from the per-adventure leaderboard.json file.
 * Data is refreshed daily by the GitHub Actions workflow.
 * @param adventureId - The adventure slug (e.g. "blind-by-design").
 * @param loader - Optional loader for testing; defaults to dynamically importing the JSON.
 */
export function useAdventureLeaderboard(
  adventureId: string,
  loader: LeaderboardLoader = defaultLoader,
): LeaderboardResult {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!adventureId) return;
    let cancelled = false;
    loader(adventureId)
      .then((data) => {
        if (cancelled) return;
        setRows(data.rows ?? []);
        setUpdatedAt(data.updatedAt ?? null);
      })
      .catch(() => {
        if (!cancelled) {
          setRows([]);
          setUpdatedAt(null);
        }
      });
    return () => { cancelled = true; };
  }, [adventureId, loader]);

  return { rows, updatedAt };
}
