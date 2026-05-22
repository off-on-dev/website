import type { CSSProperties, JSX } from "react";

export type LeaderboardEntry = {
  rank: number;
  username: string;
  avatarUrl?: string;
  points?: number;
  /** Optional inline style for the avatar fallback span (e.g. palette colors). */
  avatarFallbackStyle?: CSSProperties;
};

type LeaderboardListProps = {
  rows: LeaderboardEntry[];
  /** Accessible label for the ordered list. */
  label?: string;
};

/**
 * Renders a ranked list of players with avatar, username, and optional points.
 * Used by AdventureLeaderboard (adventure page sidebar) and CommunitySidebar
 * (challenge detail sidebar). Ranks are plain numbers, no medal icons.
 */
export const LeaderboardList = ({ rows, label = "Ranked players" }: LeaderboardListProps): JSX.Element => (
  <ol className="space-y-2.5" aria-label={label}>
    {rows.map((row) => (
      <li key={row.username} className="flex items-center gap-3 text-sm">
        <span
          className="font-mono text-xs text-[hsl(var(--text-faint))] w-4 shrink-0 text-right"
          aria-hidden="true"
        >
          {row.rank}
        </span>
        {row.avatarUrl ? (
          <img
            src={row.avatarUrl}
            alt=""
            aria-hidden="true"
            width={24}
            height={24}
            loading="lazy"
            className="h-6 w-6 rounded-full shrink-0"
          />
        ) : (
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-[0.6rem] font-semibold text-foreground"
            style={row.avatarFallbackStyle}
            aria-hidden="true"
          >
            {row.username.slice(0, 2).toUpperCase()}
          </span>
        )}
        <span className="font-medium text-foreground min-w-0 flex-1 truncate">{row.username}</span>
        {row.points != null && (
          <span className="shrink-0 font-mono text-xs font-semibold text-primary tabular-nums">
            {row.points} pts
          </span>
        )}
      </li>
    ))}
  </ol>
);
