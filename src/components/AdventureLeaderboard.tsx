import type { JSX } from "react";
import { useAdventureLeaderboard } from "@/hooks/useAdventureLeaderboard";
import { LeaderboardList } from "@/components/LeaderboardList";

type AdventureLeaderboardProps = {
  adventureId: string;
};

/**
 * Sidebar card showing the ranked leaderboard for an adventure.
 * Data is fetched from the per-adventure leaderboard.json by useAdventureLeaderboard
 * and refreshed daily by the GitHub Actions workflow. Returns null when no data exists.
 */
export const AdventureLeaderboard = ({ adventureId }: AdventureLeaderboardProps): JSX.Element | null => {
  const { rows } = useAdventureLeaderboard(adventureId);

  if (rows.length === 0) return null;

  return (
    <div className="rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-5">
      <h2 className="font-sans text-base font-semibold text-foreground mb-4">Leaderboard</h2>
      <LeaderboardList rows={rows} label="Adventure leaderboard" />
    </div>
  );
};
