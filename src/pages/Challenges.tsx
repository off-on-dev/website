import { useState, type JSX } from "react";
import { useParams } from "react-router";
import type { MetaFunction } from "react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { BottomCTA } from "@/components/BottomCTA";
import { FilteredLevelCard } from "@/components/FilteredLevelCard";
import { AdventureCard } from "@/components/AdventureCard";
import { ADVENTURES, ALL_TAGS, getLevelsByTag, slugToTag, tagToSlug } from "@/data/adventures";
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
    title: `Challenges - Hands-on open source challenges | ${BRAND_NAME}`,
    description: `Browse all hands-on open source challenges by technology. Practice with real tools like OpenTelemetry, Argo CD, OpenTofu, and more.`,
    url: `${SITE_URL}/challenges`,
  });
};

const Challenges = (): JSX.Element => {
  const { tag: tagSlug } = useParams<{ tag?: string }>();
  const [activeTag, setActiveTag] = useState<string | null>(
    tagSlug ? slugToTag(tagSlug) ?? null : null
  );
  const filteredLevels = activeTag ? getLevelsByTag(activeTag) : [];

  const handleTagClick = (tag: string): void => {
    if (activeTag === tag) {
      setActiveTag(null);
      window.history.replaceState(null, "", "/challenges");
    } else {
      setActiveTag(tag);
      window.history.replaceState(null, "", `/challenges/${tagToSlug(tag)}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content">
        <PageHero
          eyebrow="Challenges"
          title="Find Challenges by Technology"
          description="Browse hands-on open source challenges by the tools and technologies they cover. Everything runs in your browser, no local setup required."
        />
        <section className="py-24 px-6 md:px-16">
          <div className="mx-auto max-w-6xl">
            {/* Tag filter pills */}
            <div role="group" aria-label="Filter challenges by technology" className="mb-8 flex flex-wrap items-center gap-2">
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

            {activeTag ? (
              <>
                <p aria-live="polite" aria-atomic="true" className="animate-fade-up mb-6 font-sans text-sm font-medium tracking-wide text-primary">
                  {filteredLevels.length} {filteredLevels.length === 1 ? "challenge" : "challenges"} tagged with {activeTag}
                </p>
                <div key={activeTag} className="animate-fade-up grid gap-5 md:grid-cols-2 lg:grid-cols-3">
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
              <>
                <h2 className="text-lg font-semibold text-foreground mb-6">All Adventures</h2>
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {ADVENTURES.map((adventure) => (
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
