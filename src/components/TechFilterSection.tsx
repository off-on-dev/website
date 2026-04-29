import { useState, type JSX } from "react";
import { Link } from "react-router";
import { ADVENTURES } from "@/data/adventures";
import { DifficultyBadge } from "@/components/DifficultyBadge";

const ALL_TAGS = Array.from(new Set(ADVENTURES.flatMap((adventure) => adventure.tags))).sort();

type RelatedLevel = {
  level: (typeof ADVENTURES)[number]["levels"][number];
  adventureId: string;
  adventureTitle: string;
};

const getRelatedLevels = (tech: string): RelatedLevel[] =>
  ADVENTURES.filter((adventure) => adventure.tags.includes(tech)).flatMap((adventure) =>
    adventure.levels.map((level) => ({
      level,
      adventureId: adventure.id,
      adventureTitle: adventure.title,
    }))
  );

export const TechFilterSection = (): JSX.Element => {
  const [activeTech, setActiveTech] = useState<string | null>(null);
  const relatedLevels = activeTech ? getRelatedLevels(activeTech) : [];

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Find Challenges by Technology
      </h2>
      <div role="group" aria-label="Filter challenges by technology" className="mb-6 flex flex-wrap gap-2">
        {ALL_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setActiveTech(activeTech === tag ? null : tag)}
            className={activeTech === tag ? "pill-active" : "pill-inactive"}
            aria-pressed={activeTech === tag}
          >
            {tag}
          </button>
        ))}
      </div>
      <div aria-live="polite" aria-atomic="true">
        {activeTech && relatedLevels.length > 0 && (
          <div key={activeTech} className="animate-fade-up grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {relatedLevels.map(({ level, adventureId, adventureTitle }) => (
              <Link
                key={`${adventureId}-${level.id}`}
                to={`/adventures/${adventureId}/levels/${level.id}`}
                aria-label={level.name}
                className="group card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6 transition-all duration-200 hover:-translate-y-[3px] flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-fade-up-delay-1"
              >
                <div className="mb-3">
                  <DifficultyBadge difficulty={level.difficulty} showDot />
                </div>
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {level.name}
                </h3>
                <ul className="mt-3 space-y-1.5">
                  {level.learnings.slice(0, 3).map((learning, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                      {learning}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-4 flex flex-wrap gap-1.5 items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">Challenge</span>
                  <span className="rounded-sm border border-[hsl(var(--surface-border))] px-2 py-0.5 text-xs text-[hsl(var(--text-faint))]">
                    {adventureTitle}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
