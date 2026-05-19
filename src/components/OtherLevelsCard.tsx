import type { JSX } from "react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import type { Adventure } from "@/data/adventures";

type OtherLevelsCardProps = {
  adventure: Adventure;
  currentLevelId: string;
};

export const OtherLevelsCard = ({
  adventure,
  currentLevelId,
}: OtherLevelsCardProps): JSX.Element | null => {
  const otherLevels = adventure.levels.filter((l) => l.id !== currentLevelId);
  const upcoming = adventure.upcomingLevels ?? [];

  if (otherLevels.length === 0 && upcoming.length === 0) return null;

  return (
    <div className="rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-5">
      <p className="font-sans text-sm font-semibold tracking-wide text-primary mb-4">
        More levels
      </p>

      <ul className="space-y-2">
        {otherLevels.map((level) => (
          <li key={level.id}>
            <Link
              to={`/adventures/${adventure.id}/levels/${level.id}`}
              className="group flex items-center gap-3 rounded-md py-1 text-sm transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            >
              <DifficultyBadge difficulty={level.difficulty} showDot />
              <span className="min-w-0 flex-1 truncate text-foreground group-hover:text-primary transition-colors">
                {level.name}
              </span>
              <ArrowRight
                size={12}
                className="shrink-0 text-[hsl(var(--text-faint))] group-hover:text-primary transition-colors"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}

        {upcoming.map((level) => (
          <li
            key={`upcoming-${level.difficulty}-${level.name}`}
            className="flex items-center gap-3 py-1 text-sm opacity-60"
          >
            <DifficultyBadge difficulty={level.difficulty} showDot />
            <span className="min-w-0 flex-1 truncate text-[hsl(var(--text-secondary))]">
              {level.name}
            </span>
            <span className="font-mono text-[0.65rem] uppercase tracking-widest text-[hsl(var(--text-faint))] shrink-0">
              Soon
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
