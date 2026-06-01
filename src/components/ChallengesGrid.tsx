import { useState, type JSX } from "react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { ADVENTURE_SUMMARIES, SUMMARY_TAGS, getLevelSummariesByTag } from "@/data/adventures/summaries";
import { FilteredLevelCard } from "@/components/FilteredLevelCard";
import { AdventureCard } from "@/components/AdventureCard";
import { SectionLabel } from "@/components/SectionLabel";

type ChallengesGridProps = {
  /** When set, limits the number of adventure cards shown and renders a "See all" link to /challenges if there are more. */
  limit?: number;
};

export const ChallengesGrid = ({ limit }: ChallengesGridProps = {}): JSX.Element => {
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [hasFiltered, setHasFiltered] = useState(false);

  const filteredLevels = activeTopic ? getLevelSummariesByTag(activeTopic) : [];

  const visibleAdventures = limit !== undefined ? ADVENTURE_SUMMARIES.slice(0, limit) : ADVENTURE_SUMMARIES;
  const hasMore = limit !== undefined && ADVENTURE_SUMMARIES.length > limit;

  const handleAllClick = (): void => {
    if (activeTopic !== null) setHasFiltered(true);
    setActiveTopic(null);
  };

  const handleTagClick = (tag: string): void => {
    if (activeTopic !== tag) setHasFiltered(true);
    setActiveTopic(activeTopic === tag ? null : tag);
  };

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
              <button
                type="button"
                onClick={handleAllClick}
                className={`${activeTopic === null ? "pill-active" : "pill-inactive"} px-6`}
                aria-pressed={activeTopic === null}
              >
                All
              </button>
              {SUMMARY_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className={activeTopic === tag ? "pill-active" : "pill-inactive"}
                  aria-pressed={activeTopic === tag}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Permanent live region announces both filter-applied and filter-cleared states */}
            <p aria-live="polite" aria-atomic="true" className="sr-only">
              {activeTopic
                ? `Showing ${filteredLevels.length} ${filteredLevels.length === 1 ? "challenge" : "challenges"} tagged with ${activeTopic}`
                : hasFiltered
                ? "Filter cleared, showing all adventures"
                : ""}
            </p>

            {activeTopic ? (
              <>
                <p className="animate-fade-up mb-6 font-sans text-sm font-medium tracking-wide text-primary">
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
              <>
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {visibleAdventures.map((adventure) => (
                    <AdventureCard key={adventure.id} adventure={adventure} />
                  ))}
                </div>
                {hasMore && (
                  <div className="mt-10 flex justify-center">
                    <Link to="/challenges" className="btn-ghost inline-flex items-center gap-2">
                      See all adventures
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                )}
              </>
            )}
        </div>
      </div>
    </section>
  );
};
