import { useState, type JSX } from "react";
import { ADVENTURES, ALL_TAGS } from "@/data/adventures";
import { FilteredLevelCard } from "@/components/FilteredLevelCard";

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
              <FilteredLevelCard
                key={`${adventureId}-${level.id}`}
                level={level}
                adventureId={adventureId}
                adventureTitle={adventureTitle}
                className="animate-fade-up-delay-1"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
