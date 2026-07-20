import { type JSX } from "react";
import { useParams, useLoaderData, Link } from "react-router";
import type { MetaFunction, LoaderFunctionArgs, LinksFunction } from "react-router";
import { Check, Clock, ExternalLink, ArrowRight } from "lucide-react";
import { ADVENTURES } from "@/data/adventures";
import { SOLUTION_IDS } from "@/data/solutions/manifest";
import { TagChips } from "@/components/TagChips";
import { CodespacesButton } from "@/components/CodespacesButton";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { ContributorBadge } from "@/components/ContributorBadge";
import { NotFoundPage } from "@/components/NotFoundPage";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Breadcrumb } from "@/components/Breadcrumb";
import { LevelCard } from "@/components/LevelCard";
import { ScenarioSection } from "@/components/ScenarioSection";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { ArchitectureSection } from "@/components/ArchitectureSection";
import { WalkthroughSection } from "@/components/WalkthroughSection";
import { DiscussionSection } from "@/components/DiscussionSection";
import { CommunitySidebar } from "@/components/CommunitySidebar";
import { OtherLevelsCard } from "@/components/OtherLevelsCard";
import { RewardsCard } from "@/components/RewardsCard";
import { ChallengeShareLinks } from "@/components/ChallengeShareLinks";
import { SITE_URL, BRAND_NAME, COMMUNITY_DISPLAY_NAME, COMMUNITY_URL } from "@/data/constants";
import { buildPageMeta } from "@/lib/meta";
import { stripHtml } from "@/lib/markdown";
import { isDeadlinePast, isSolutionUnlocked, resolveDiscussionUrl } from "@/lib/utils";
import { InlineProse } from "@/components/InlineProse";
import { Abbr } from "@/components/Abbr";

export const links: LinksFunction = () => [
  { rel: "preload", href: `${import.meta.env.BASE_URL}fonts/jetbrains-mono-latin-400-normal.woff2`, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
  { rel: "preload", href: `${import.meta.env.BASE_URL}fonts/jetbrains-mono-latin-600-normal.woff2`, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
];

export function loader({ params }: LoaderFunctionArgs): { rewardsBelowFold: boolean; hasSolution: boolean } {
  const adventure = ADVENTURES.find((a) => a.id === params.id);
  const level = adventure?.levels.find((l) => l.id === params.levelId);
  const deadline = level?.deadline ?? adventure?.rewards?.deadline;
  const rewardsBelowFold = isDeadlinePast(deadline);
  const hasSolution =
    isSolutionUnlocked(deadline) &&
    SOLUTION_IDS.has(`${params.id}/${params.levelId}`);
  return { rewardsBelowFold, hasSolution };
}

export const meta: MetaFunction = ({ params }) => {
  const adventure = ADVENTURES.find((a) => a.id === params.id);
  const level = adventure?.levels.find((l) => l.id === params.levelId);
  if (!adventure || !level) {
    return [
      { title: `Challenge Not Found - ${BRAND_NAME}` },
      { name: "robots", content: "noindex, nofollow" },
    ];
  }
  const description = (
    level.metaDescription ??
    `${level.name}: ${stripHtml(level.intro?.[0] ?? level.topics.join(", "))}`
  ).slice(0, 160);
  return buildPageMeta({
    title: `${level.name} - ${adventure.title} - ${BRAND_NAME}`,
    description,
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
      {
        "script:ld+json": {
          "@context": "https://schema.org",
          "@type": "LearningResource",
          name: level.name,
          description,
          url: `${SITE_URL}/adventures/${adventure.id}/levels/${level.id}/`,
          educationalLevel: level.difficulty,
          teaches: level.learnings,
          learningResourceType: "Challenge",
          isPartOf: {
            "@type": "Course",
            name: adventure.title,
            url: `${SITE_URL}/adventures/${adventure.id}/`,
          },
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

type StructuredLayoutProps = {
  adventure: (typeof ADVENTURES)[number];
  level: (typeof ADVENTURES)[number]["levels"][number];
  rewardsBelowFold: boolean;
  hasSolution: boolean;
};

const StructuredLayout = ({ adventure, level, rewardsBelowFold, hasSolution }: StructuredLayoutProps): JSX.Element => {
  const { intro, objective, toolbox, backstory, architecture, architectureDiagram, diagramAlt, architectureAscii, howToPlay, helpfulLinks, verification } = level;
  const levelUrl = `${SITE_URL}/adventures/${adventure.id}/levels/${level.id}/`;
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(levelUrl)}`;
  return (
    <>
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{level.name}</h1>

        <div className="flex flex-wrap items-center gap-2 mb-5">
          <DifficultyBadge difficulty={level.difficulty} showDot />
          {level.estimatedTime && (
            <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 font-mono text-xs text-dim">
              <Clock size={11} aria-hidden="true" />
              {level.estimatedTime}
            </span>
          )}
          <TagChips tags={level.topics ?? adventure.tags} />
        </div>

        {/* Intro as hook */}
        {intro && intro.length > 0 && (
          <div className="space-y-3 mb-5 max-w-3xl">
            {intro.map((p, i) => (
              <InlineProse key={i} html={p} className="text-dim leading-relaxed" />
            ))}
          </div>
        )}
      </div>

      {/* Two-column layout: main content + sidebar */}
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
        <div className="min-w-0">
          {/* Objective + Key Learnings side-by-side */}
          <div className="grid gap-5 sm:grid-cols-2 mb-6">
            {objective && objective.length > 0 && (
              <section id="objective" className="scroll-mt-28 rounded-xl border border-border bg-[hsl(var(--surface))] p-5">
                <h2 className="font-sans text-sm font-semibold tracking-wide text-primary mb-3">
                  Mission Objective
                </h2>
                <ul role="list" className="space-y-2">
                  {objective.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-dim leading-relaxed">
                      <Check size={14} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                      <span className="min-w-0 md-inline" dangerouslySetInnerHTML={{ __html: item }} />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section id="learnings" className="scroll-mt-28 rounded-xl border border-border bg-[hsl(var(--surface))] p-5">
              <h2 className="font-sans text-sm font-semibold tracking-wide text-primary mb-3">
                Key Learnings
              </h2>
              <ul role="list" className="space-y-2">
                {level.learnings.map((learning) => (
                  <li key={learning} className="flex items-start gap-2.5 text-sm text-dim leading-relaxed">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                    <span className="min-w-0 md-inline" dangerouslySetInnerHTML={{ __html: learning }} />
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Audience */}
          {level.audience && (
            <CollapsibleSection id="audience" title="Best Suited For">
              <InlineProse html={level.audience} className="text-sm text-dim leading-relaxed" />
            </CollapsibleSection>
          )}

          {/* Collapsible sections */}
          {backstory && backstory.length > 0 && (
            <ScenarioSection backstory={backstory} />
          )}
          {((architecture && architecture.length > 0) || architectureDiagram || architectureAscii) && (
            <ArchitectureSection
              architecture={architecture && architecture.length > 0 ? architecture.join("\n\n") : undefined}
              diagram={architectureDiagram}
              diagramAlt={diagramAlt}
              ascii={architectureAscii}
            />
          )}

          {/* CTA card */}
          <section aria-labelledby="cta-start-heading" className="mb-6 rounded-xl border border-border bg-[hsl(var(--surface))] p-5">
            <div className="lg:grid lg:grid-cols-2 lg:gap-6 lg:items-center">
              <div>
                <h2 id="cta-start-heading" className="text-sm font-semibold text-foreground mb-1">
                  Ready to start?
                </h2>
                <p className="text-xs text-dim">
                  Launch in a preconfigured <Abbr title="development container: a portable, reproducible coding environment defined by a configuration file">devcontainer</Abbr>
                </p>
              </div>
              <div className="mt-4 lg:mt-0 flex flex-col lg:items-end">
                <CodespacesButton href={level.codespacesUrl} />
              </div>
            </div>
          </section>

          {howToPlay && howToPlay.length > 0 && (
            <WalkthroughSection
              steps={[
                {
                  title: "Get Started",
                  content: [
                    `<p><a href="${level.codespacesUrl.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}" target="_blank" rel="noopener noreferrer">Open in GitHub Codespaces</a>. The <abbr data-title="development container: a portable, reproducible coding environment defined by a configuration file" aria-describedby="abbr-devcontainer" tabindex="0">devcontainer</abbr><span id="abbr-devcontainer" class="sr-only">development container: a portable, reproducible coding environment defined by a configuration file</span> is pre-configured and starts automatically. When you push from Codespaces, GitHub forks the repository to your account automatically.</p>`,
                    `<p>Prefer working locally? Clone the repo and open it in any editor that supports the Dev Containers specification (<abbr data-title="Visual Studio Code" aria-describedby="abbr-vscode" tabindex="0">VS Code</abbr><span id="abbr-vscode" class="sr-only">Visual Studio Code</span>, JetBrains, and others). The devcontainer config will be detected automatically.</p>`,
                  ].join("\n"),
                },
                ...howToPlay,
              ]}
            />
          )}

          {/* Completion section */}
          <section id="completion" className="mb-6 scroll-mt-28 rounded-xl border border-border bg-[hsl(var(--surface))] p-5">
            <h2 className="font-sans text-sm font-semibold tracking-wide text-primary mb-3">
              Complete Your Challenge
            </h2>
            <ul role="list" className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-dim leading-relaxed">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                <span>
                  When you push from Codespaces, GitHub forks the repository to your account automatically. If you are working locally, fork the repository on GitHub before pushing.
                </span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-dim leading-relaxed">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                {verification ? (
                  <span>
                    Verify your solution:
                    {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- tabIndex={0} makes this scrollable code block keyboard-reachable per WCAG 2.1 SC 2.1.1 */}
                    <pre tabIndex={0} aria-label="Verification command (scroll left or right to see the full command)" className="mt-2 overflow-x-auto rounded-lg border border-border bg-background/60 px-4 py-3 font-mono text-sm text-foreground">
                      <code>{verification.command}</code>
                    </pre>
                    <span className="mt-2 block text-faint">If it passes, it generates a Certificate of Completion you can paste into the discussion.</span>
                  </span>
                ) : (
                  <span>Commit and push your changes, then trigger the verification workflow on GitHub Actions.</span>
                )}
              </li>
              <li className="flex items-start gap-2.5 text-sm text-dim leading-relaxed">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                <span>
                  Share your solutions in the{" "}
                  <a
                    href={resolveDiscussionUrl(level.discussionUrl, COMMUNITY_URL)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="docs-ext-link font-medium"
                  >
                    challenge thread <ExternalLink size={12} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
                  </a>{" "}
                  on {COMMUNITY_DISPLAY_NAME}.
                </span>
              </li>
            </ul>
            <p className="mt-4 pt-4 border-t border-border text-xs text-faint">
              Completed the challenge?{" "}
              <a
                href={linkedinShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="docs-ext-link text-xs"
              >
                Share your achievement on LinkedIn
                <ExternalLink size={11} aria-hidden="true" />
                <span className="sr-only"> (opens in new tab)</span>
              </a>
            </p>
          </section>

          {/* Solution walkthrough link — shown after deadline passes and only when a solution is authored */}
          {hasSolution && (
            <section className="mb-6 rounded-xl border border-border bg-[hsl(var(--surface))] p-5">
              <h2 className="font-sans text-sm font-semibold tracking-wide text-primary mb-1">
                Check Out the Solution Walkthrough
              </h2>
              <p className="text-sm text-dim leading-relaxed mb-3">
                See how we approached this challenge step by step. Found a better way? We&apos;d love to hear about it in the discussion.
              </p>
              <Link
                to={`/adventures/${adventure.id}/levels/${level.id}/solution/`}
                aria-label={`View the solution walkthrough for ${level.name}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline focus-ring-tight rounded-sm"
              >
                View the solution walkthrough
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </section>
          )}

          {/* Toolbox + Helpful Documentation side-by-side */}
          {((toolbox && toolbox.length > 0) || (helpfulLinks && helpfulLinks.length > 0)) && (
            <div className={`grid gap-5 mb-6${toolbox && toolbox.length > 0 && helpfulLinks && helpfulLinks.length > 0 ? " sm:grid-cols-2" : ""}`}>
              {toolbox && toolbox.length > 0 && (
                <section id="toolbox" className="scroll-mt-28 rounded-xl border border-border bg-[hsl(var(--surface))] p-5">
                  <h2 className="font-sans text-sm font-semibold tracking-wide text-primary mb-3">
                    Toolbox
                  </h2>
                  <ul role="list" className="space-y-2">
                    {toolbox.map((tool) => (
                      <li key={tool.name} className="flex items-start gap-2.5 text-sm text-dim leading-relaxed">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                        <span>
                          {tool.url ? (
                            <a
                              href={tool.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="docs-ext-link font-medium"
                            >
                              {tool.name}
                              <ExternalLink size={12} aria-hidden="true" />
                              <span className="sr-only"> (opens in new tab)</span>
                            </a>
                          ) : (
                            <span className="font-medium text-foreground">{tool.name}</span>
                          )}
                          {tool.description && <> - <span className="md-inline" dangerouslySetInnerHTML={{ __html: tool.description }} /></>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {helpfulLinks && helpfulLinks.length > 0 && (
                <section aria-labelledby="helpful-links-heading" className="rounded-xl border border-border bg-[hsl(var(--surface))] p-5">
                  <h2 id="helpful-links-heading" className="font-sans text-sm font-semibold tracking-wide text-primary mb-3">
                    Helpful Documentation
                  </h2>
                  <ul role="list" className="space-y-2">
                    {helpfulLinks.map((link) => (
                      <li key={link.url} className="flex items-start gap-2.5 text-sm text-dim leading-relaxed">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                        <span>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="docs-ext-link font-medium"
                          >
                            {link.title}
                            <ExternalLink size={11} aria-hidden="true" />
                            <span className="sr-only"> (opens in new tab)</span>
                          </a>
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}
          <ChallengeShareLinks url={levelUrl} levelName={level.name} />
        </div>

        {/* Sidebar */}
        <aside
          aria-label="Challenge resources"
          className="mt-10 lg:mt-0 space-y-4 lg:sticky lg:top-28 lg:self-start"
        >
          {adventure.rewards && !rewardsBelowFold && (
            <RewardsCard rewards={adventure.rewards} compact levelDeadline={level.deadline} deadlinePast={rewardsBelowFold} />
          )}

          {/* CTA panel - hidden on mobile where inline CTA is shown */}
          <div className="hidden lg:block rounded-xl border border-border bg-[hsl(var(--surface))] p-5">
            <CodespacesButton href={level.codespacesUrl} fullWidth />
          </div>
          <CommunitySidebar
            adventureId={adventure.id}
            levelId={level.id}
            discussionUrl={level.discussionUrl}
            contributor={adventure.contributor}
          />
          <OtherLevelsCard adventure={adventure} currentLevelId={level.id} />

          {adventure.rewards && rewardsBelowFold && (
            <RewardsCard rewards={adventure.rewards} compact levelDeadline={level.deadline} deadlinePast={rewardsBelowFold} />
          )}
        </aside>
      </div>

    </>
  );
};

const ChallengeDetail = (): JSX.Element => {
  const { id, levelId } = useParams<{ id: string; levelId: string }>();
  const { rewardsBelowFold, hasSolution } = useLoaderData<ReturnType<typeof loader>>();
  const adventure = ADVENTURES.find((adventure) => adventure.id === id);
  const level = adventure?.levels.find((level) => level.id === levelId);

  if (!adventure || !level) {
    return <NotFoundPage title="Challenge not found" message="The challenge you're looking for doesn't exist." />;
  }

  const hasStructuredContent = !!(
    level.intro || level.backstory || level.architecture || level.toolbox || level.howToPlay || level.helpfulLinks
  );

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="px-6 md:px-16 pt-28 pb-24">
        <div className="mx-auto max-w-6xl">
          <Breadcrumb
            className="mb-10"
            items={[
              { label: "Adventures", href: "/adventures/" },
              { label: adventure.title, href: `/adventures/${adventure.id}/` },
              { label: level.name },
            ]}
          />

          {hasStructuredContent ? (
            <StructuredLayout adventure={adventure} level={level} rewardsBelowFold={rewardsBelowFold} hasSolution={hasSolution} />
          ) : (
            <>
              {/* Legacy layout for levels without structured content */}
              <div className="mb-10">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{level.name}</h1>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <DifficultyBadge difficulty={level.difficulty} showDot />
                  <TagChips tags={level.topics ?? adventure.tags} />
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

            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ChallengeDetail;
