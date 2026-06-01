import { useState, type JSX } from "react";
import { useParams } from "react-router";
import type { MetaFunction } from "react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { BottomCTA } from "@/components/BottomCTA";
import { FilteredLevelCard } from "@/components/FilteredLevelCard";
import { AdventureCard } from "@/components/AdventureCard";
import { ALL_TAGS, slugToTag, tagToSlug } from "@/data/adventures";
import { ADVENTURE_SUMMARIES, getLevelSummariesByTag } from "@/data/adventures/summaries";
import { SITE_URL, BRAND_NAME } from "@/data/constants";
import { buildPageMeta } from "@/lib/meta";

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

const BASE = import.meta.env.BASE_URL;

const Challenges = (): JSX.Element => {
  const { tag: tagSlug } = useParams<{ tag?: string }>();
  const [activeTag, setActiveTag] = useState<string | null>(
    tagSlug ? slugToTag(tagSlug) ?? null : null
  );
  const [hasInteracted, setHasInteracted] = useState(false);
  const filteredLevels = activeTag ? getLevelSummariesByTag(activeTag) : ALL_LEVELS;

  const handleAllClick = (): void => {
    setHasInteracted(true);
    setActiveTag(null);
    window.history.replaceState(null, "", `${BASE}challenges`);
  };

  const handleTagClick = (tag: string): void => {
    setHasInteracted(true);
    if (activeTag === tag) {
      setActiveTag(null);
      window.history.replaceState(null, "", `${BASE}challenges`);
    } else {
      setActiveTag(tag);
      window.history.replaceState(null, "", `${BASE}challenges/${tagToSlug(tag)}`);
    }
  };

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
            {/* Tag filter pills */}
            <div role="group" aria-label="Filter challenges by technology" className="mb-8 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleAllClick}
                className={`${activeTag === null ? "pill-active" : "pill-inactive"} px-6`}
                aria-pressed={activeTag === null}
              >
                All
              </button>
              {ALL_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className={activeTag === tag ? "pill-active" : "pill-inactive"}
                  aria-pressed={activeTag === tag}
                >
                  {tag}
                </button>
              ))}
            </div>

            <span aria-live="polite" aria-atomic="true" className="sr-only">
              {hasInteracted
                ? activeTag
                  ? `Showing ${filteredLevels.length} ${filteredLevels.length === 1 ? "challenge" : "challenges"} tagged with ${activeTag}`
                  : `Filter cleared, showing all ${ADVENTURE_SUMMARIES.length} adventures`
                : ""}
            </span>

            {activeTag ? (
              <>
                <h2 className="animate-fade-up mb-6 text-lg font-semibold text-foreground">
                  {activeTag} Challenges
                  <span className="ml-2 font-normal text-sm text-muted-foreground">
                    &middot; {filteredLevels.length} result{filteredLevels.length !== 1 ? "s" : ""}
                  </span>
                </h2>
                <div key={activeTag} className="animate-fade-up grid gap-5 md:grid-cols-2 lg:grid-cols-3">
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
