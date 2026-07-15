import type { JSX } from "react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import type { Adventure } from "@/data/adventures";
import { difficultyStyle } from "@/lib/difficulty";

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
    <div className="rounded-xl border border-border bg-[hsl(var(--surface))] p-5">
      <h2 className="font-sans text-base font-semibold text-foreground mb-4">
        More Levels
      </h2>

      <ul role="list" className="space-y-2">
        {otherLevels.map((level) => (
          <li key={level.id}>
            <Link
              to={`/adventures/${adventure.id}/levels/${level.id}/`}
              className="group inline-flex w-full items-center gap-2 rounded-sm border px-2.5 py-1.5 text-xs no-underline hover:brightness-95 transition-[filter] focus-ring-tight"
              style={difficultyStyle(level.difficulty)}
            >
              <span className="shrink-0 uppercase font-medium">{level.difficulty}</span>
              <span aria-hidden="true" className="inline-block w-px h-3 bg-current opacity-40" />
              <span className="flex-1 truncate">{level.name}</span>
              <ArrowRight
                size={11}
                className="shrink-0 opacity-50 transition-opacity group-hover:opacity-100"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}

        {upcoming.map((level) => {
          const hasDistinctName = level.name.toLowerCase() !== level.difficulty.toLowerCase();
          return (
            <li key={`upcoming-${level.difficulty}-${level.name}`}>
              <span
                className="inline-flex w-full items-center gap-2 rounded-sm border border-dashed px-2.5 py-1.5 text-xs"
                style={difficultyStyle(level.difficulty)}
              >
                <span className="shrink-0 uppercase font-medium">{level.difficulty}</span>
                {hasDistinctName ? (
                  <>
                    <span aria-hidden="true" className="inline-block w-px h-3 bg-current opacity-40" />
                    <span className="flex-1 truncate">{level.name}</span>
                  </>
                ) : (
                  <span className="flex-1" />
                )}
                <span className="shrink-0 text-xs uppercase tracking-widest">Soon</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
