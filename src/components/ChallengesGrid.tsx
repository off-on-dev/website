import { useState, lazy, Suspense, type JSX } from "react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { ADVENTURE_SUMMARIES, SUMMARY_TAGS } from "@/data/adventures/summaries";
import { getLevelSummariesByFilters } from "@/data/adventures/filter-utils";
import { AdventureCard } from "@/components/AdventureCard";
import { SectionLabel } from "@/components/SectionLabel";
import { StarterNudge } from "@/components/StarterNudge";
import { ChallengeFilters, type Difficulty } from "@/components/ChallengeFilters";

// Lazy-load FilteredLevelCard to keep react-markdown out of the initial home page bundle.
// It only renders when filters are active, so the deferred load has no UX cost.
const FilteredLevelCard = lazy(() =>
  import("@/components/FilteredLevelCard").then((m) => ({ default: m.FilteredLevelCard }))
);

type ChallengesGridProps = {
  /** When set, limits the number of adventure cards shown and renders a "See all" link to /challenges if there are more. */
  limit?: number;
};

export const ChallengesGrid = ({ limit }: ChallengesGridProps = {}): JSX.Element => {
  const [activeTopics, setActiveTopics] = useState<string[]>([]);
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty | null>(null);
  const [hasFiltered, setHasFiltered] = useState(false);

  const isFiltered = activeTopics.length > 0 || activeDifficulty !== null;
  const filteredLevels = isFiltered ? getLevelSummariesByFilters(activeTopics, activeDifficulty) : [];

  const visibleAdventures = limit !== undefined ? ADVENTURE_SUMMARIES.slice(0, limit) : ADVENTURE_SUMMARIES;
  const hasMore = limit !== undefined && ADVENTURE_SUMMARIES.length > limit;

  const handleDifficultyChange = (diff: Difficulty | null): void => {
    setHasFiltered(true);
    setActiveDifficulty(diff);
  };

  const handleTopicsChange = (topics: string[]): void => {
    setHasFiltered(true);
    setActiveTopics(topics);
  };

  const filterKey = activeTopics.join(",") + (activeDifficulty ?? "");

  return (
    <section id="challenges" className="py-24 px-6 md:px-16">
      <div className="mx-auto max-w-6xl">
        <div>
          <SectionLabel>Adventures</SectionLabel>
          <h2 className="mb-6 text-3xl font-bold text-primary md:text-4xl">
            Choose Your Adventure
          </h2>

          <StarterNudge />

          <ChallengeFilters
            activeTopics={activeTopics}
            activeDifficulty={activeDifficulty}
            tags={SUMMARY_TAGS}
            onDifficultyChange={handleDifficultyChange}
            onTopicsChange={handleTopicsChange}
          />

          {/* Live region */}
          <p aria-live="polite" aria-atomic="true" className="sr-only">
            {isFiltered
              ? `Showing ${filteredLevels.length} ${filteredLevels.length === 1 ? "challenge" : "challenges"}`
              : hasFiltered
              ? "Filters cleared, showing all adventures"
              : ""}
          </p>

          {isFiltered ? (
            <>
              <p className="animate-fade-up mb-6 font-sans text-sm font-medium tracking-wide text-primary">
                {filteredLevels.length} {filteredLevels.length === 1 ? "challenge" : "challenges"}
                {activeDifficulty && ` · ${activeDifficulty}`}
                {activeTopics.length > 0 && ` · ${activeTopics.join(", ")}`}
              </p>
              <Suspense fallback={null}>
                <div key={filterKey} className="animate-fade-up grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {filteredLevels.map(({ level, adventureId, adventureTitle, isLive }) => (
                    <FilteredLevelCard
                      key={`${adventureId}-${level.id}`}
                      level={level}
                      adventureId={adventureId}
                      adventureTitle={adventureTitle}
                      isLive={isLive}
                    />
                  ))}
                </div>
              </Suspense>
            </>
          ) : (
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
