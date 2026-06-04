import { useState, type JSX } from "react";
import { useParams, useSearchParams } from "react-router";
import type { MetaFunction, LinksFunction } from "react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { BottomCTA } from "@/components/BottomCTA";
import { FilteredLevelCard } from "@/components/FilteredLevelCard";
import { AdventureCard } from "@/components/AdventureCard";
import { StarterNudge } from "@/components/StarterNudge";
import { ChallengeFilters, type Difficulty } from "@/components/ChallengeFilters";
import { DIFFICULTIES } from "@/data/adventures/filter-utils";
import { slugToTag, tagToSlug } from "@/data/adventures";
import { ADVENTURE_SUMMARIES, SUMMARY_TAGS } from "@/data/adventures/summaries";
import { getLevelSummariesByFilters, ALL_LEVEL_SUMMARIES } from "@/data/adventures/filter-utils";
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

const Challenges = (): JSX.Element => {
  const { tag: tagSlug } = useParams<{ tag?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [hasFiltered, setHasFiltered] = useState(false);

  const initialTag = tagSlug ? (slugToTag(tagSlug) ?? null) : null;

  // ?topics= takes precedence over the path param so multi-tag state is clean.
  // On a single-tag path (/challenges/:tag) with no ?topics=, derive from the path.
  const topicsParam = searchParams.get("topics");
  const activeTopics: string[] = topicsParam !== null
    ? topicsParam.split(",").filter(Boolean).map((s) => slugToTag(s)).filter((t): t is string => t !== undefined)
    : initialTag ? [initialTag] : [];

  const difficultyParam = searchParams.get("difficulty");
  const activeDifficulty: Difficulty | null =
    (DIFFICULTIES as readonly string[]).includes(difficultyParam ?? "")
      ? (difficultyParam as Difficulty)
      : null;

  const isFiltered = activeTopics.length > 0 || activeDifficulty !== null;
  const filteredLevels = isFiltered ? getLevelSummariesByFilters(activeTopics, activeDifficulty) : ALL_LEVEL_SUMMARIES;

  // Difficulty always updates via setSearchParams — no path change, no remount, focus held.
  const handleDifficultyChange = (diff: Difficulty | null): void => {
    setHasFiltered(true);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (diff) next.set("difficulty", diff);
        else next.delete("difficulty");
        return next;
      },
      { replace: true, preventScrollReset: true }
    );
  };

  // All topic changes update only the query string — pathname never changes,
  // so ScrollToTop never fires and the user stays at the same scroll position.
  const handleTopicsChange = (topics: string[]): void => {
    setHasFiltered(true);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (topics.length > 0) {
          next.set("topics", topics.map(tagToSlug).join(","));
        } else {
          next.delete("topics");
        }
        return next;
      },
      { replace: true, preventScrollReset: true }
    );
  };

  const filterKey = activeTopics.join(",") + (activeDifficulty ?? "");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content">
        <PageHero
          eyebrow="Challenges"
          title="Open Source Challenges"
          description="Each adventure focuses on one open source technology, with challenges at different difficulty levels. Pick your adventure, work through real-world scenarios hands-on, and share what you learn with the community."
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
                  : `Filters cleared, showing ${ADVENTURE_SUMMARIES.length} ${ADVENTURE_SUMMARIES.length === 1 ? "adventure" : "adventures"} · ${ALL_LEVEL_SUMMARIES.length} ${ALL_LEVEL_SUMMARIES.length === 1 ? "challenge" : "challenges"}`
                : ""}
            </span>

            {isFiltered ? (
              <>
                <p className="animate-fade-up mb-6 font-sans text-sm font-medium tracking-wide text-primary">
                  {filteredLevels.length} {filteredLevels.length === 1 ? "challenge" : "challenges"}
                  {activeDifficulty && ` · ${activeDifficulty}`}
                  {activeTopics.length > 0 && ` · ${activeTopics.join(", ")}`}
                </p>
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
              </>
            ) : (
              <>
                <p className="mb-6 font-sans text-sm font-medium tracking-wide text-primary">
                  {ADVENTURE_SUMMARIES.length} {ADVENTURE_SUMMARIES.length === 1 ? "adventure" : "adventures"} · {ALL_LEVEL_SUMMARIES.length} {ALL_LEVEL_SUMMARIES.length === 1 ? "challenge" : "challenges"}
                </p>
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
