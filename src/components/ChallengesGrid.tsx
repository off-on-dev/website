import { useState, type JSX } from "react";
import { Link } from "react-router";
import { ADVENTURES, ALL_TAGS, Adventure } from "@/data/adventures";
import { Layers } from "lucide-react";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { FilteredLevelCard } from "@/components/FilteredLevelCard";

/** Card for a full adventure (all 3 levels) */
const AdventureCard = ({ adventure }: { adventure: Adventure }): JSX.Element => (
  <Link
    to={`/adventures/${adventure.id}`}
    className="group card-glow relative rounded-xl border-2 border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
  >
    <div className="flex items-center justify-between mb-3">
      <span className="font-mono text-xs text-muted-foreground">Adventure</span>
      <span className="badge-levels inline-flex items-center gap-1.5 rounded-sm border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-xs uppercase tracking-wider text-primary">
        <Layers className="h-3 w-3" aria-hidden="true" />
        3 Levels
      </span>
    </div>

    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
      {adventure.title}
    </h3>
    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{adventure.story}</p>

    {/* Level difficulty pills */}
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {adventure.levels.map((level) => (
        <DifficultyBadge key={level.id} difficulty={level.difficulty} />
      ))}
    </div>

    <div className="mt-4 flex flex-wrap gap-1.5">
      {adventure.tags.slice(0, 4).map((tag) => (
        <span key={tag} className="rounded-sm border border-[hsl(var(--surface-border))] px-2 py-0.5 text-xs text-[hsl(var(--text-faint))]">
          {tag}
        </span>
      ))}
    </div>
  </Link>
);

export const ChallengesGrid = (): JSX.Element => {
  const [activeTopic, setActiveTopic] = useState<string | null>(null);

  const filteredLevels = activeTopic
    ? ADVENTURES
        .filter((adventure) => adventure.tags.includes(activeTopic))
        .flatMap((adventure) =>
          adventure.levels.map((level) => ({
            level,
            adventureId: adventure.id,
            adventureTitle: adventure.title,
          }))
        )
    : [];

  return (
    <section id="challenges" className="py-24 px-6 md:px-16">
      <div className="mx-auto max-w-6xl">
        <div>
            <div className="animate-fade-up mb-3">
              <span className="section-label font-sans text-sm font-medium uppercase tracking-widest text-primary">Adventures</span>
            </div>
            <h2 className="animate-fade-up-delay-1 mb-6 text-3xl font-bold text-primary md:text-4xl">
              Choose Your Adventure
            </h2>

            {/* Topic filter chips */}
            <div role="group" aria-label="Filter challenges by technology" className="animate-fade-up-delay-1 mb-8 flex flex-wrap items-center gap-2">
              {ALL_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTopic(activeTopic === tag ? null : tag)}
                  className={activeTopic === tag ? "pill-active" : "pill-inactive"}
                  aria-pressed={activeTopic === tag}
                >
                  {tag}
                </button>
              ))}
            </div>

            {activeTopic ? (
              <>
                <div aria-live="polite" aria-atomic="true">
                <p className="animate-fade-up mb-6 font-sans text-sm font-medium uppercase tracking-widest text-primary">
                  Challenges tagged with {activeTopic}
                </p>
                <div key={activeTopic} className="animate-fade-up grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {filteredLevels.map(({ level, adventureId, adventureTitle }) => (
                    <FilteredLevelCard
                      key={`${adventureId}-${level.id}`}
                      level={level}
                      adventureId={adventureId}
                      adventureTitle={adventureTitle}
                    />
                  ))}
                </div>
                </div>
              </>
            ) : (
              /* Adventure cards */
              <div className="animate-fade-up-delay-2 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {ADVENTURES.map((adventure) => (
                  <AdventureCard key={adventure.id} adventure={adventure} />
                ))}
              </div>
            )}
        </div>
      </div>
    </section>
  );
};
