import { type JSX } from "react";
import { useParams, Link } from "react-router";
import type { LinksFunction, MetaFunction } from "react-router";
import { ArrowLeft, ArrowRight, Check, Lightbulb, Target, Wrench } from "lucide-react";
import { ADVENTURES } from "@/data/adventures";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { ContributorBadge } from "@/components/ContributorBadge";
import { NotFoundPage } from "@/components/NotFoundPage";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LevelCard } from "@/components/LevelCard";
import { ScenarioSection } from "@/components/ScenarioSection";
import { ArchitectureSection } from "@/components/ArchitectureSection";
import { WalkthroughSection } from "@/components/WalkthroughSection";
import { VerificationCard } from "@/components/VerificationCard";
import { DiscussionSection } from "@/components/DiscussionSection";
import { CommunitySidebar } from "@/components/CommunitySidebar";
import { OtherLevelsCard } from "@/components/OtherLevelsCard";
import { TechFilterSection } from "@/components/TechFilterSection";
import { SITE_URL, BRAND_NAME } from "@/data/constants";
import { buildPageMeta, interBoldPreload } from "@/lib/meta";
import { useLevelData } from "@/hooks/useLevelData";

export const links: LinksFunction = () => interBoldPreload;

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
  const extendedData = useLevelData(id ?? "", levelId ?? "");

  if (!adventure || !level) {
    return <NotFoundPage title="Challenge not found" message="The challenge you're looking for doesn't exist." />;
  }

  // Merge static data (from adventures.ts) with dynamically loaded JSON data.
  // Static fields take priority when present.
  const intro = extendedData.intro;
  const backstory = extendedData.backstory;
  const architecture = level.architecture
    ? [level.architecture]
    : extendedData.architecture;
  const objective = level.objectives ?? extendedData.objective;
  const toolbox = level.toolbox ?? extendedData.toolbox;
  const howToPlay = level.howToPlay
    ? level.howToPlay.map((s) => ({ title: "", body: s }))
    : extendedData.howToPlay;
  const verification = level.verification ?? extendedData.verification;

  const hasStructuredContent = !!(
    intro || backstory || architecture || toolbox || howToPlay
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content" className="px-6 md:px-16 pt-28 pb-24">
        <div className="mx-auto max-w-6xl">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-10">
            <ol className="list-none p-0 m-0">
              <li>
                <Link
                  to={`/adventures/${adventure.id}`}
                  className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--text-faint))] hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm"
                >
                  <ArrowLeft size={14} aria-hidden="true" /> {adventure.title}
                </Link>
              </li>
            </ol>
          </nav>

          {hasStructuredContent ? (
            <>
              {/* Header */}
              <div className="mb-10">
                <p className="text-xs font-mono uppercase tracking-widest text-[hsl(var(--text-faint))] mb-3">
                  Adventure <span aria-hidden="true">&middot;</span> {adventure.title}
                </p>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{level.name}</h1>

                {/* Intro as hook */}
                {intro && intro.length > 0 && (
                  <p className="text-[hsl(var(--text-secondary))] leading-relaxed mb-5 max-w-3xl">
                    {intro[0]}
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

              {/* Two-column layout: main content + sidebar */}
              <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8">
                <div className="min-w-0">
                  {/* Key Learnings - full width card */}
                  <div className="card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6 mb-6">
                    <h2 className="flex items-center gap-3 font-sans text-sm font-semibold tracking-wide text-primary mb-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary" aria-hidden="true">
                        <Lightbulb size={16} />
                      </span>
                      Key Learnings
                    </h2>
                    <ul className="space-y-2.5">
                      {level.learnings.map((learning) => (
                        <li key={learning} className="flex items-start gap-2.5 text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                          <span>{learning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 2-col grid: Objective + Toolbox */}
                  {(objective || toolbox) && (
                    <div className="grid gap-6 sm:grid-cols-2 mb-6">
                      {objective && objective.length > 0 && (
                        <div className="card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6">
                          <h2 className="flex items-center gap-3 font-sans text-sm font-semibold tracking-wide text-primary mb-4">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary" aria-hidden="true">
                              <Target size={16} />
                            </span>
                            Objective
                          </h2>
                          <ul className="space-y-2.5">
                            {objective.map((item) => (
                              <li key={item} className="flex items-start gap-2.5 text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                                <Check size={14} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {toolbox && toolbox.length > 0 && (
                        <div className="card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6">
                          <h2 className="flex items-center gap-3 font-sans text-sm font-semibold tracking-wide text-primary mb-4">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary" aria-hidden="true">
                              <Wrench size={16} />
                            </span>
                            Toolbox
                          </h2>
                          <ul className="space-y-2.5">
                            {toolbox.map((tool) => (
                              <li key={tool.name} className="flex items-start gap-2.5 text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                                <span>
                                  {tool.url ? (
                                    <a
                                      href={tool.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="docs-ext-link font-medium underline decoration-2 underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm"
                                    >
                                      {tool.name}<span className="sr-only"> (opens in new tab)</span>
                                    </a>
                                  ) : (
                                    <span className="font-medium text-foreground">{tool.name}</span>
                                  )}
                                  {tool.description && <>{" "}- {tool.description}</>}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Start CTA */}
                  <div className="card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6 mb-10">
                    <a
                      href={level.codespacesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                    >
                      Open in Codespaces <ArrowRight size={14} aria-hidden="true" />
                      <span className="sr-only"> (opens in new tab)</span>
                    </a>
                    <p className="mt-3 text-xs text-[hsl(var(--text-faint))] font-mono">
                      Free GitHub account required
                    </p>
                  </div>

                  {/* Collapsible sections */}
                  {backstory && backstory.length > 0 && (
                    <ScenarioSection backstory={backstory} />
                  )}
                  {architecture && architecture.length > 0 && (
                    <ArchitectureSection architecture={architecture.join("\n\n")} />
                  )}
                  {howToPlay && howToPlay.length > 0 && (
                    <WalkthroughSection
                      steps={verification
                        ? howToPlay.filter((s) => !s.body.startsWith("Run ./verify.sh") && !s.body.startsWith("Run `./verify.sh`"))
                        : howToPlay
                      }
                    />
                  )}
                  {verification && (
                    <VerificationCard verification={verification} />
                  )}
                </div>

                {/* Sidebar */}
                <aside
                  aria-label="Challenge sidebar"
                  className="mt-10 lg:mt-0 space-y-4 lg:sticky lg:top-28 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto"
                >
                  <CommunitySidebar
                    adventureId={adventure.id}
                    levelId={level.id}
                    discussionUrl={level.discussionUrl}
                    contributor={adventure.contributor}
                  />
                  <OtherLevelsCard adventure={adventure} currentLevelId={level.id} />
                </aside>
              </div>

              {/* Tech filter spans full width */}
              <div className="mt-16">
                <TechFilterSection />
              </div>
            </>
          ) : (
            <>
              {/* Legacy layout for levels without structured content */}
              <div className="mb-10">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{level.name}</h1>
                <p className="text-sm font-mono text-[hsl(var(--text-faint))] mb-4">{adventure.title}</p>
                <div className="flex flex-wrap items-center gap-2 mb-4">
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
                {adventure.contributor && (
                  <div>
                    <ContributorBadge name={adventure.contributor.name} url={adventure.contributor.url} glow />
                  </div>
                )}
              </div>

              <div className="mb-10">
                <LevelCard level={level} headingLevel="none" />
              </div>

              <div className="mb-16">
                <DiscussionSection adventureId={adventure.id} levelId={level.id} discussionUrl={level.discussionUrl} />
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
