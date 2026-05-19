import { type JSX } from "react";
import { useParams, Link } from "react-router";
import type { LinksFunction, MetaFunction } from "react-router";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { ADVENTURES } from "@/data/adventures";
import { ContributorBadge } from "@/components/ContributorBadge";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { NotFoundPage } from "@/components/NotFoundPage";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LevelCard } from "@/components/LevelCard";
import { VerificationSection } from "@/components/VerificationSection";
import { DiscussionSection } from "@/components/DiscussionSection";
import { TechFilterSection } from "@/components/TechFilterSection";
import { CommunitySidebar } from "@/components/CommunitySidebar";
import { OtherLevelsCard } from "@/components/OtherLevelsCard";
import { ScenarioSection } from "@/components/ScenarioSection";
import { ArchitectureSection } from "@/components/ArchitectureSection";
import { ToolboxSection } from "@/components/ToolboxSection";
import { WalkthroughSection } from "@/components/WalkthroughSection";
import { VerificationCard } from "@/components/VerificationCard";
import { SITE_URL, BRAND_NAME } from "@/data/constants";
import { buildPageMeta, syneBoldPreload } from "@/lib/meta";

export const links: LinksFunction = () => syneBoldPreload;

export const meta: MetaFunction = ({ params }) => {
  const adventure = ADVENTURES.find((a) => a.id === params.id);
  const level = adventure?.levels.find((l) => l.id === params.levelId);
  if (!adventure || !level) {
    return [
      { title: `Challenge Not Found - ${BRAND_NAME}` },
      { name: "robots", content: "noindex, nofollow" },
    ];
  }
  const learningsSummary = level.learnings.slice(0, 2).join("; ");
  return buildPageMeta({
    title: `${level.name} - ${adventure.title} - ${BRAND_NAME}`,
    description: `${level.name}: get hands-on with ${learningsSummary}. A ${level.difficulty.toLowerCase()} challenge from ${adventure.title} on ${BRAND_NAME}.`.slice(0, 160),
    url: `${SITE_URL}/adventures/${adventure.id}/levels/${level.id}`,
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
            { "@type": "ListItem", position: 4, name: level.name, item: `${SITE_URL}/adventures/${adventure.id}/levels/${level.id}/` },
          ],
        },
      },
    ],
  });
};

const ChallengeDetail = (): JSX.Element => {
  const { id, levelId } = useParams<{ id: string; levelId: string }>();
  const adventure = ADVENTURES.find((adventure) => adventure.id === id);
  const level = adventure?.levels.find((level) => level.id === levelId);

  if (!adventure || !level) {
    return <NotFoundPage title="Challenge not found" message="The challenge you're looking for doesn't exist." />;
  }

  // The new structured layout activates once a level has any of the structured fields.
  // Levels without them keep the legacy LevelCard + VerificationSection layout.
  const useStructured = !!(
    level.scenario || level.architecture || level.toolbox || level.howToPlay || level.verification
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content" className="px-6 md:px-16 pt-28 pb-24">
        <div className="mx-auto max-w-6xl">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb">
            <Link
              to={`/adventures/${adventure.id}`}
              className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--text-faint))] hover:text-primary transition-colors mb-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm"
            >
              <ArrowLeft size={14} aria-hidden="true" /> {adventure.title}
            </Link>
          </nav>

          {useStructured ? (
            <>
              {/* Header spans full content + sidebar width */}
              <div className="mb-10 max-w-[66.75rem]">
                <p className="text-xs font-mono uppercase tracking-widest text-[hsl(var(--text-faint))] mb-3">
                  Adventure · {adventure.title}
                </p>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{level.name}</h1>
                {level.hook && (
                  <p className="text-lg text-[hsl(var(--text-secondary))] leading-relaxed mb-5 max-w-3xl">
                    {level.hook}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <DifficultyBadge difficulty={level.difficulty} showDot />
                  {adventure.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-sm border border-[hsl(var(--surface-border))] px-2.5 py-1 text-xs text-[hsl(var(--text-faint))]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-3">
                <div className="min-w-0 max-w-3xl">
                  {/* Hero value cards */}
                  <div className="grid gap-5 sm:grid-cols-2 mb-5">
                    <div className="card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6">
                      <p className="font-sans text-sm font-semibold tracking-wide text-primary mb-3">
                        What you'll learn
                      </p>
                      <ul className="space-y-2">
                        {level.learnings.map((learning) => (
                          <li key={learning} className="flex items-start gap-2 text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                            <span>{learning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {level.objectives && level.objectives.length > 0 && (
                      <div className="card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6">
                        <p className="font-sans text-sm font-semibold tracking-wide text-primary mb-3">
                          Your task
                        </p>
                        <ul className="space-y-2">
                          {level.objectives.map((objective) => (
                            <li key={objective} className="flex items-start gap-2 text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                              <Check size={14} className="mt-1 shrink-0 text-primary" aria-hidden="true" />
                              <span>{objective}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Start CTA card */}
                  <div className="card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6 mb-14">
                    <a
                      href={level.codespacesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                    >
                      Play on GitHub <ArrowRight size={14} aria-hidden="true" />
                      <span className="sr-only"> (opens in new tab)</span>
                    </a>
                    <p className="mt-3 text-xs text-[hsl(var(--text-faint))] font-mono">
                      Free GitHub account required
                    </p>
                    {level.audience && (
                      <p className="mt-2 text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                        {level.audience}
                      </p>
                    )}
                  </div>

                  {/* Structured sections */}
                  {level.scenario && <ScenarioSection scenario={level.scenario} />}
                  {level.architecture && <ArchitectureSection architecture={level.architecture} />}
                  {level.toolbox && level.toolbox.length > 0 && <ToolboxSection toolbox={level.toolbox} />}
                  {level.howToPlay && level.howToPlay.length > 0 && <WalkthroughSection steps={level.howToPlay} />}
                  {level.verification && <VerificationCard verification={level.verification} />}
                </div>

                <aside
                  aria-label="Challenge sidebar"
                  className="space-y-4 lg:sticky lg:top-28 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto"
                >
                  <CommunitySidebar
                    discussionUrl={level.discussionUrl}
                    solvedCount={level.solvedCount}
                    topPlayers={level.topPlayers}
                    contributor={adventure.contributor}
                  />
                  <OtherLevelsCard adventure={adventure} currentLevelId={level.id} />
                </aside>

                {/* TechFilter spans both columns so the sidebar's containing block
                    extends through it and the sticky sidebar stays visible. */}
                <div className="lg:col-span-2 mt-8">
                  <TechFilterSection />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Header */}
              <div className="mb-10 max-w-3xl">
                <p className="text-sm font-mono text-[hsl(var(--text-faint))] mb-2">{adventure.title}</p>
                <h1 className="text-4xl font-bold text-foreground mb-4">{level.name}</h1>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {adventure.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-sm border border-[hsl(var(--surface-border))] px-2.5 py-1 text-xs text-[hsl(var(--text-faint))]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {adventure.contributor && (
                  <div>
                    <ContributorBadge name={adventure.contributor.name} url={adventure.contributor.url} glow />
                  </div>
                )}
              </div>

              <div className="mb-10">
                <LevelCard level={level} headingLevel="none" />
              </div>

              <div className="mb-10">
                <VerificationSection />
              </div>

              <div className="mb-16">
                <DiscussionSection discussionUrl={level.discussionUrl} />
              </div>

              <TechFilterSection />
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ChallengeDetail;
