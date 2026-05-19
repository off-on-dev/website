import { useState, type JSX } from "react";
import { ADVENTURES, ALL_TAGS, getLevelsByTag } from "@/data/adventures";
import { FilteredLevelCard } from "@/components/FilteredLevelCard";
import { AdventureCard } from "@/components/AdventureCard";
import { SectionLabel } from "@/components/SectionLabel";

export const ChallengesGrid = (): JSX.Element => {
  const [activeTopic, setActiveTopic] = useState<string | null>(null);

  const filteredLevels = activeTopic ? getLevelsByTag(activeTopic) : [];

  return (
    <section id="challenges" className="py-24 px-6 md:px-16">
      <div className="mx-auto max-w-6xl">
        <div>
            <SectionLabel>Adventures</SectionLabel>
            <h2 className="mb-6 text-3xl font-bold text-primary md:text-4xl">
              Choose Your Adventure
            </h2>

            {/* Topic filter chips */}
            <div role="group" aria-label="Filter challenges by technology" className="mb-8 flex flex-wrap items-center gap-2">
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
                <p aria-live="polite" aria-atomic="true" className="animate-fade-up mb-6 font-sans text-sm font-medium tracking-wide text-primary">
                  {filteredLevels.length} {filteredLevels.length === 1 ? "challenge" : "challenges"} tagged with {activeTopic}
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
              </>
            ) : (
              /* Adventure cards */
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
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
