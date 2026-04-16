import { useState } from "react";
import { Link } from "react-router-dom";
import { ADVENTURES, Adventure } from "@/data/adventures";
import { Layers } from "lucide-react";
import { DifficultyBadge } from "@/components/DifficultyBadge";

const allTags = Array.from(new Set(ADVENTURES.flatMap((a) => a.tags))).sort();

/** Card for a full adventure (all 3 levels) */
const AdventureCard = ({ adventure }: { adventure: Adventure }): JSX.Element => (
  <Link
    to={`/adventures/${adventure.id}`}
    className="group card-glow relative rounded-xl border-2 border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6 transition-all duration-200 hover:-translate-y-[3px] block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
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
        .filter((a) => a.tags.includes(activeTopic))
        .flatMap((a) =>
          a.levels.map((level) => ({
            level,
            adventureId: a.id,
            adventureTitle: a.title,
          }))
        )
    : [];

  return (
    <section id="challenges" className="py-24 px-6">
      <div className="mx-auto max-w-6xl">
        <>
          <div className="animate-fade-up mb-3">
            <span className="section-label font-sans text-sm font-medium uppercase tracking-widest text-primary">Adventures</span>
          </div>
          <h2 className="animate-fade-up-delay-1 mb-6 text-3xl font-bold text-primary md:text-4xl">
            Choose your adventure
          </h2>

          {/* Topic filter chips */}
          <div className="animate-fade-up-delay-1 mb-8 flex flex-wrap items-center gap-2">
            {allTags.map((tag) => (
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
              <p className="animate-fade-up mb-6 font-sans text-sm font-medium uppercase tracking-widest text-primary">
                Challenges tagged with {activeTopic}
              </p>
              <div key={activeTopic} className="animate-fade-up grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {filteredLevels.map(({ level, adventureId, adventureTitle }) => (
                  <Link
                    key={`${adventureId}-${level.id}`}
                    to={`/adventures/${adventureId}/levels/${level.id}`}
                    className="group card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6 transition-all duration-200 hover:-translate-y-[3px] flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
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
            </>
          ) : (
            /* Adventure cards */
            <div className="animate-fade-up-delay-2 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {ADVENTURES.map((adventure) => (
                <AdventureCard key={adventure.id} adventure={adventure} />
              ))}
            </div>
          )}
        </>
      </div>
    </section>
  );
};
