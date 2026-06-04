import { type JSX } from "react";
import { useParams, Link, useLoaderData } from "react-router";
import type { MetaFunction, LoaderFunctionArgs, LinksFunction } from "react-router";
import { ArrowRight, Clock, FlaskConical, Satellite, Cloud, Telescope, Scale, type LucideIcon } from "lucide-react";

const ADVENTURE_ICONS: Record<string, LucideIcon> = {
  FlaskConical,
  Satellite,
  Cloud,
  Telescope,
  Scale,
};
import { ADVENTURES, type AdventureLevel } from "@/data/adventures";
import { NotFoundPage } from "@/components/NotFoundPage";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { PersonNameLink } from "@/components/PersonNameLink";
import { RewardsCard } from "@/components/RewardsCard";
import { AdventureLeaderboard } from "@/components/AdventureLeaderboard";
import { ContributorBadge } from "@/components/ContributorBadge";
import { TagChips } from "@/components/TagChips";
import { SITE_URL, BRAND_NAME } from "@/data/constants";
import { buildPageMeta } from "@/lib/meta";
import { isDeadlinePast } from "@/lib/utils";
import { stripLinks } from "@/lib/markdown";
import { LivePill } from "@/components/LivePill";
import { Breadcrumb } from "@/components/Breadcrumb";

export const links: LinksFunction = () => [
  { rel: "preload", href: `${import.meta.env.BASE_URL}fonts/jetbrains-mono-latin-400-normal.woff2`, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
  { rel: "preload", href: `${import.meta.env.BASE_URL}fonts/jetbrains-mono-latin-600-normal.woff2`, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
];

export function loader({ params }: LoaderFunctionArgs): { rewardsBelowFold: boolean; isLive: boolean } {
  const adventure = ADVENTURES.find((a) => a.id === params.id);
  const deadline = adventure?.rewards?.deadline;
  return {
    rewardsBelowFold: isDeadlinePast(deadline),
    isLive: !!deadline && !isDeadlinePast(deadline),
  };
}

export const meta: MetaFunction = ({ params }) => {
  const adventure = ADVENTURES.find((a) => a.id === params.id);
  if (!adventure) {
    return [
      { title: `Adventure Not Found - ${BRAND_NAME}` },
      { name: "robots", content: "noindex, nofollow" },
    ];
  }
  const tagsSummary = adventure.tags.slice(0, 3).join(", ");
  const description = (adventure.metaDescription ?? `${adventure.title}: a hands-on ${tagsSummary} adventure on ${BRAND_NAME}.`).slice(0, 160);
  return buildPageMeta({
    title: `${adventure.title} - ${BRAND_NAME} Adventures`,
    description,
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
      {
        "script:ld+json": {
          "@context": "https://schema.org",
          "@type": "Course",
          name: adventure.title,
          description,
          url: `${SITE_URL}/adventures/${adventure.id}/`,
          keywords: adventure.tags.join(", "),
          provider: {
            "@type": "Organization",
            name: BRAND_NAME,
            url: SITE_URL,
          },
        },
      },
    ],
  });
};

type UpcomingLevelTileProps = { name: string; difficulty: AdventureLevel["difficulty"] };

const UpcomingLevelTile = ({ name, difficulty }: UpcomingLevelTileProps): JSX.Element => {
  return (
    <div className="relative rounded-xl border border-dashed border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6 flex flex-col">
      <div className="mb-3">
        <DifficultyBadge difficulty={difficulty} showDot />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-3">{name}</h3>
      <span className="mt-auto inline-flex items-center gap-1 text-xs font-mono uppercase tracking-widest text-[hsl(var(--text-secondary))]">
        Coming Soon
      </span>
    </div>
  );
};

type AdventureLevelLinkProps = { level: AdventureLevel; adventureId: string };

const AdventureLevelLink = ({ level, adventureId }: AdventureLevelLinkProps): JSX.Element => {
  const descHtml = level.intro?.[0] ?? level.backstory?.[0];
  return (
    <Link
      to={`/adventures/${adventureId}/levels/${level.id}/`}
      className="group card-glow relative rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6 flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <DifficultyBadge difficulty={level.difficulty} showDot />
        {level.estimatedTime && (
          <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--surface-border))] px-2.5 py-1 font-mono text-xs text-[hsl(var(--text-secondary))]">
            <Clock size={11} aria-hidden="true" />
            {level.estimatedTime}
          </span>
        )}
      </div>
      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-3">
        {level.name}
      </h3>
      {descHtml && (
        <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed line-clamp-4 mb-4 flex-1 md-inline"
          dangerouslySetInnerHTML={{ __html: stripLinks(descHtml) }}
        />
      )}
      <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-primary underline decoration-2 underline-offset-2 group-hover:decoration-primary">
        Start Challenge <ArrowRight size={12} aria-hidden="true" />
      </span>
    </Link>
  );
};

const AdventureDetail = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const { rewardsBelowFold, isLive } = useLoaderData<{ rewardsBelowFold: boolean; isLive: boolean }>();
  const adventure = ADVENTURES.find((adventure) => adventure.id === id);

  if (!adventure) {
    return <NotFoundPage title="Adventure not found" message="The adventure you're looking for doesn't exist." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content" className="px-6 md:px-16 pt-28 pb-24">
        <div className="mx-auto max-w-6xl">

          <Breadcrumb
            items={[
              { label: "Adventures", href: "/adventures/" },
              { label: adventure.title },
            ]}
          />

          {/* Header: title + tags + intro */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-3 mb-4">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">{adventure.title}</h1>
              {adventure.icon && ADVENTURE_ICONS[adventure.icon] && (() => {
                const Icon = ADVENTURE_ICONS[adventure.icon!];
                return <Icon size={28} className="text-primary shrink-0" aria-hidden="true" />;
              })()}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-3">
              {adventure.contributor && (
                <ContributorBadge name={adventure.contributor.name} url={adventure.contributor.url} label="Adventure Builder" />
              )}
              <span className="font-mono text-xs uppercase tracking-widest text-[hsl(var(--text-faint))]">
                {adventure.month}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mb-5">
              {isLive && <LivePill />}
              <TagChips tags={adventure.tags} />
            </div>
            <p className="text-[hsl(var(--text-secondary))] leading-relaxed max-w-3xl md-inline" dangerouslySetInnerHTML={{ __html: adventure.story }} />
          </div>

          {/* Two-column layout */}
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">

            {/* Main content */}
            <div className="space-y-8">

              {/* Overview */}
              {adventure.overview && adventure.overview.length > 0 && (
                <CollapsibleSection id="overview" title="Overview" defaultOpen={true}>
                  <ul className="space-y-2.5">
                    {adventure.overview.map((para, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                        <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">{para}</p>
                      </li>
                    ))}
                  </ul>
                </CollapsibleSection>
              )}

              {/* Challenges */}
              <section aria-labelledby="challenges-heading">
                <h2 id="challenges-heading" className="text-lg font-semibold text-foreground mb-5">
                  Challenges
                </h2>
                {(() => {
                  const upcoming = adventure.upcomingLevels ?? [];
                  const totalTiles = adventure.levels.length + upcoming.length;
                  const gridCols = totalTiles === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";
                  return (
                    <div className={`grid gap-5 ${gridCols}`}>
                      {adventure.levels.map((level) => (
                        <AdventureLevelLink key={level.id} level={level} adventureId={adventure.id} />
                      ))}
                      {upcoming.map((u) => (
                        <UpcomingLevelTile key={`upcoming-${u.difficulty}-${u.name}`} name={u.name} difficulty={u.difficulty} />
                      ))}
                    </div>
                  );
                })()}
              </section>

              {adventure.rewards && !rewardsBelowFold && (
                <div>
                  <RewardsCard rewards={adventure.rewards} deadlinePast={rewardsBelowFold} />
                </div>
              )}

              {/* The Story */}
              {adventure.backstory && adventure.backstory.length > 0 && (
                <CollapsibleSection id="backstory" title="The Story" defaultOpen={true}>
                  <div className="space-y-3">
                    {adventure.backstory.map((para, i) => (
                      <p key={i} className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed md-inline"
                        dangerouslySetInnerHTML={{ __html: para }}
                      />
                    ))}
                  </div>
                </CollapsibleSection>
              )}

              {adventure.rewards && rewardsBelowFold && (
                <div>
                  <RewardsCard rewards={adventure.rewards} deadlinePast={rewardsBelowFold} />
                </div>
              )}

            </div>

            {/* Sidebar: leaderboard + contributor */}
            <aside className="mt-10 lg:mt-0 space-y-6 lg:sticky lg:top-28 lg:self-start">
              <AdventureLeaderboard adventureId={adventure.id} />
              {adventure.contributor && (
                <div className="rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] px-5 py-4">
                  <p className="font-mono text-xs uppercase tracking-widest text-[hsl(var(--text-faint))] mb-2">
                    Adventure by
                  </p>
                  <PersonNameLink name={adventure.contributor.name} url={adventure.contributor.url} />
                  {adventure.contributor.about && (
                    <p className="mt-2 text-sm text-[hsl(var(--text-secondary))] leading-relaxed md-inline"
                      dangerouslySetInnerHTML={{ __html: adventure.contributor.about }}
                    />
                  )}
                </div>
              )}
            </aside>

          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default AdventureDetail;
