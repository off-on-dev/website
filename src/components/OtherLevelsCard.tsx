import type { CSSProperties, JSX } from "react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import type { Adventure, AdventureLevel } from "@/data/adventures";

type Difficulty = AdventureLevel["difficulty"];

const pillStyle: Record<Difficulty, CSSProperties> = {
  Beginner: {
    borderColor: "hsl(var(--difficulty-starter-border))",
    backgroundColor: "hsl(var(--difficulty-starter-bg))",
    color: "hsl(var(--difficulty-text))",
  },
  Intermediate: {
    borderColor: "hsl(var(--difficulty-builder-border))",
    backgroundColor: "hsl(var(--difficulty-builder-bg))",
    color: "hsl(var(--difficulty-text))",
  },
  Expert: {
    borderColor: "hsl(var(--difficulty-architect-border))",
    backgroundColor: "hsl(var(--difficulty-architect-bg))",
    color: "hsl(var(--difficulty-text))",
  },
};

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
        More Levels
      </p>

      <ul className="space-y-2">
        {otherLevels.map((level) => (
          <li key={level.id}>
            <Link
              to={`/adventures/${adventure.id}/levels/${level.id}`}
              className="group inline-flex w-full items-center gap-2 rounded-sm border px-2.5 py-1.5 text-xs no-underline transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              style={pillStyle[level.difficulty]}
            >
              <span className="shrink-0 uppercase font-medium">{level.difficulty}</span>
              <span aria-hidden="true" className="opacity-40">-</span>
              <span className="flex-1 truncate">{level.name}</span>
              <ArrowRight
                size={11}
                className="shrink-0 opacity-50 transition-opacity group-hover:opacity-100"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}

        {upcoming.map((level) => (
          <li key={`upcoming-${level.difficulty}-${level.name}`}>
            <span
              className="inline-flex w-full items-center gap-2 rounded-sm border px-2.5 py-1.5 text-xs opacity-50"
              style={pillStyle[level.difficulty]}
            >
              <span className="shrink-0 uppercase font-medium">{level.difficulty}</span>
              <span aria-hidden="true" className="opacity-40">-</span>
              <span className="flex-1 truncate">{level.name}</span>
              <span className="shrink-0 text-[0.6rem] uppercase tracking-widest">Soon</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
