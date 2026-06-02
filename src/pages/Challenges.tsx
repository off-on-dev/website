import { useState, lazy, Suspense, type JSX } from "react";
import { useParams } from "react-router";
import type { MetaFunction, LinksFunction } from "react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { BottomCTA } from "@/components/BottomCTA";

// Lazy-load to keep react-markdown out of the initial /challenges bundle.
// FilteredLevelCard only renders when filters are active.
const FilteredLevelCard = lazy(() =>
  import("@/components/FilteredLevelCard").then((m) => ({ default: m.FilteredLevelCard }))
);
import { AdventureCard } from "@/components/AdventureCard";
import { StarterNudge } from "@/components/StarterNudge";
import { ChallengeFilters, type Difficulty } from "@/components/ChallengeFilters";
import { slugToTag, tagToSlug } from "@/data/adventures";
import { ADVENTURE_SUMMARIES, SUMMARY_TAGS } from "@/data/adventures/summaries";
import { getLevelSummariesByFilters } from "@/data/adventures/filter-utils";
import { SITE_URL, BRAND_NAME } from "@/data/constants";
import { buildPageMeta } from "@/lib/meta";

export const links: LinksFunction = () => [
  { rel: "preload", href: `${import.meta.env.BASE_URL}fonts/jetbrains-mono-latin-400-normal.woff2`, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
  { rel: "preload", href: `${import.meta.env.BASE_URL}fonts/jetbrains-mono-latin-600-normal.woff2`, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
];

export const meta: MetaFunction = ({ params }) => {
  const tag = params.tag ? slugToTag(params.tag) : undefined;
  if (params.tag && !tag) {
    return [
      { title: `Tag Not Found - ${BRAND_NAME}` },
      { name: "robots", content: "noindex, nofollow" },
    ];
  }
  if (tag) {
    return buildPageMeta({
      title: `${tag} Challenges - ${BRAND_NAME}`,
      description: `Hands-on open source challenges using ${tag}. Practice in real-world scenarios directly in your browser.`,
      url: `${SITE_URL}/challenges/${tagToSlug(tag)}`,
    });
  }
  return buildPageMeta({
    title: `Open Source Challenges | ${BRAND_NAME}`,
    description: `Hands-on challenges built around open source tools. Filter by technology and learn by solving real-world scenarios in your browser.`,
    url: `${SITE_URL}/challenges`,
  });
};

const ALL_LEVELS = ADVENTURE_SUMMARIES.flatMap((adventure) =>
  adventure.levels.map((level) => ({
    level,
    adventureId: adventure.id,
    adventureTitle: adventure.title,
    ...(adventure.isLive ? { isLive: true as const } : {}),
  }))
);

const Challenges = (): JSX.Element => {
  const { tag: tagSlug } = useParams<{ tag?: string }>();
  const initialTag = tagSlug ? slugToTag(tagSlug) ?? null : null;

  const [activeTopics, setActiveTopics] = useState<string[]>(initialTag ? [initialTag] : []);
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty | null>(null);
  const [hasFiltered, setHasFiltered] = useState(false);

  const isFiltered = activeTopics.length > 0 || activeDifficulty !== null;
  const filteredLevels = isFiltered ? getLevelSummariesByFilters(activeTopics, activeDifficulty) : ALL_LEVELS;

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
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content">
        <PageHero
          eyebrow="Challenges"
          title="Open Source Challenges"
          description="Hands-on challenges built around real open source tools. Filter by technology, work through real-world scenarios, and learn by doing, entirely in your browser."
        />
        <section className="py-24 px-6 md:px-16">
          <div className="mx-auto max-w-6xl">
            <StarterNudge />

            <ChallengeFilters
              activeTopics={activeTopics}
              activeDifficulty={activeDifficulty}
              tags={SUMMARY_TAGS}
              onDifficultyChange={handleDifficultyChange}
              onTopicsChange={handleTopicsChange}
            />

            <span aria-live="polite" aria-atomic="true" className="sr-only">
              {hasFiltered
                ? isFiltered
                  ? `Showing ${filteredLevels.length} ${filteredLevels.length === 1 ? "challenge" : "challenges"}${activeDifficulty ? ` · ${activeDifficulty}` : ""}${activeTopics.length > 0 ? ` · ${activeTopics.join(", ")}` : ""}`
                  : `Filters cleared, showing all ${ADVENTURE_SUMMARIES.length} adventures`
                : ""}
            </span>

            {isFiltered ? (
              <>
                <h2 className="animate-fade-up mb-6 text-lg font-semibold text-foreground">
                  {activeTopics.length > 0 ? activeTopics.join(", ") : activeDifficulty} Challenges
                  <span className="ml-2 font-normal text-sm text-muted-foreground">
                    &middot; {filteredLevels.length} {filteredLevels.length !== 1 ? "results" : "result"}
                  </span>
                </h2>
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
                <h2 className="mb-6 text-lg font-semibold text-foreground">
                  All Adventures
                  <span className="ml-2 font-normal text-sm text-muted-foreground">
                    &middot; {ADVENTURE_SUMMARIES.length} {ADVENTURE_SUMMARIES.length === 1 ? "adventure" : "adventures"}, {ALL_LEVELS.length} {ALL_LEVELS.length === 1 ? "challenge" : "challenges"}
                  </span>
                </h2>
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {ADVENTURE_SUMMARIES.map((adventure) => (
                    <AdventureCard key={adventure.id} adventure={adventure} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Challenges;
