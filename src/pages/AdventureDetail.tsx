import { type JSX } from "react";
import { useParams, Link } from "react-router";
import type { MetaFunction } from "react-router";
import { ArrowRight } from "lucide-react";
import { ADVENTURES, type AdventureLevel } from "@/data/adventures";
import { NotFoundPage } from "@/components/NotFoundPage";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { PersonNameLink } from "@/components/PersonNameLink";
import { TechFilterSection } from "@/components/TechFilterSection";
import { RewardsCard } from "@/components/RewardsCard";
import { AdventureLeaderboard } from "@/components/AdventureLeaderboard";
import { ContributorBadge } from "@/components/ContributorBadge";
import { SITE_URL, BRAND_NAME } from "@/data/constants";
import { buildPageMeta } from "@/lib/meta";

export const meta: MetaFunction = ({ params }) => {
  const adventure = ADVENTURES.find((a) => a.id === params.id);
  if (!adventure) {
    return [
      { title: `Adventure Not Found - ${BRAND_NAME}` },
      { name: "robots", content: "noindex, nofollow" },
    ];
  }
  const tagsSummary = adventure.tags.slice(0, 3).join(", ");
  return buildPageMeta({
    title: `${adventure.title} - ${BRAND_NAME} Adventures`,
    description: `Tackle ${adventure.title} on ${BRAND_NAME}, a hands-on open source adventure. Work with ${tagsSummary} in a real-world scenario, directly in your browser.`.slice(0, 160),
    url: `${SITE_URL}/adventures/${adventure.id}`,
    ogType: "article",
    extra: [
      {
        "script:ld+json": {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
            { "@type": "ListItem", position: 2, name: "Adventures", item: `${SITE_URL}/adventures/` },
            { "@type": "ListItem", position: 3, name: adventure.title, item: `${SITE_URL}/adventures/${adventure.id}/` },
          ],
        },
      },
    ],
  });
};

type AdventureLevelLinkProps = { level: AdventureLevel; adventureId: string };

const AdventureLevelLink = ({ level, adventureId }: AdventureLevelLinkProps): JSX.Element => {
  const description = level.intro?.[0] ?? level.backstory?.[0];
  return (
    <Link
      to={`/adventures/${adventureId}/levels/${level.id}`}
      className="group card-glow relative rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6 flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="mb-3">
        <DifficultyBadge difficulty={level.difficulty} showDot />
      </div>
      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-3">
        {level.name}
      </h3>
      {description && (
        <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed line-clamp-4 mb-4 flex-1">
          {description}
        </p>
      )}
      <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-primary underline decoration-2 underline-offset-2 group-hover:decoration-primary">
        Start Challenge <ArrowRight size={12} aria-hidden="true" />
      </span>
    </Link>
  );
};

const AdventureDetail = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const adventure = ADVENTURES.find((adventure) => adventure.id === id);

  if (!adventure) {
    return <NotFoundPage title="Adventure not found" message="The adventure you're looking for doesn't exist." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content" className="px-6 md:px-16 pt-28 pb-24">
        <div className="mx-auto max-w-6xl">

          {/* Header: title + tags + intro */}
          <div className="mb-10">
            <span className="inline-block mb-4 rounded-sm border border-[hsl(var(--surface-border))] px-2 py-0.5 font-mono text-xs text-[hsl(var(--text-faint))] uppercase tracking-wider">
              {adventure.month}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{adventure.title}</h1>
            <div className="flex flex-wrap items-center gap-1.5 mb-5">
              {adventure.contributor && (
                <ContributorBadge name={adventure.contributor.name} url={adventure.contributor.url} label="Adventure Builder" />
              )}
              {adventure.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-sm border border-[hsl(var(--surface-border))] px-2.5 py-1 text-xs text-[hsl(var(--text-faint))]"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-[hsl(var(--text-secondary))] leading-relaxed max-w-3xl">{adventure.story}</p>
          </div>

          {/* Two-column layout */}
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">

            {/* Main content */}
            <div className="space-y-8">

              {/* Challenges */}
              <section aria-labelledby="challenges-heading">
                <h2 id="challenges-heading" className="text-lg font-semibold text-foreground mb-5">
                  Challenges
                </h2>
                <div className={`grid gap-5 ${adventure.levels.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
                  {adventure.levels.map((level) => (
                    <AdventureLevelLink key={level.id} level={level} adventureId={adventure.id} />
                  ))}
                </div>
              </section>

              {/* Your Mission */}
              {adventure.context && (
                <CollapsibleSection id="mission" title="Your Mission" defaultOpen={true}>
                  <ul className="space-y-2.5">
                    {adventure.context.body.map((para, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                        <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">{para}</p>
                      </li>
                    ))}
                  </ul>
                </CollapsibleSection>
              )}

              {/* The Story */}
              {adventure.backstory && adventure.backstory.length > 0 && (
                <CollapsibleSection id="backstory" title="The Story" defaultOpen={true}>
                  <ul className="space-y-3">
                    {adventure.backstory.map((para, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                        <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">{para}</p>
                      </li>
                    ))}
                  </ul>
                </CollapsibleSection>
              )}

              {adventure.rewards && (
                <div>
                  <RewardsCard rewards={adventure.rewards} />
                </div>
              )}
            </div>

            {/* Sidebar: leaderboard + contributor */}
            <aside className="mt-10 lg:mt-12 space-y-6 lg:sticky lg:top-28 lg:self-start">
              <AdventureLeaderboard adventureId={adventure.id} />
              {adventure.contributor && (
                <div className="rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] px-5 py-4">
                  <p className="font-mono text-xs uppercase tracking-widest text-[hsl(var(--text-faint))] mb-2">
                    Adventure by
                  </p>
                  <PersonNameLink name={adventure.contributor.name} url={adventure.contributor.url} />
                  {adventure.contributor.about && (
                    <p className="mt-2 text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                      {adventure.contributor.about}
                    </p>
                  )}
                </div>
              )}
            </aside>

          </div>
        </div>

        <div className="mx-auto max-w-6xl mt-12">
          <TechFilterSection />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdventureDetail;
