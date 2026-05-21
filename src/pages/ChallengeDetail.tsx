import { type JSX } from "react";
import { useParams, Link } from "react-router";
import type { LinksFunction, MetaFunction } from "react-router";
import { ArrowLeft, ArrowRight, Check, ExternalLink } from "lucide-react";
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
import { DiscussionSection } from "@/components/DiscussionSection";
import { CommunitySidebar } from "@/components/CommunitySidebar";
import { OtherLevelsCard } from "@/components/OtherLevelsCard";
import { TechFilterSection } from "@/components/TechFilterSection";
import { SITE_URL, BRAND_NAME, COMMUNITY_DISPLAY_NAME } from "@/data/constants";
import { buildPageMeta, interBoldPreload } from "@/lib/meta";

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

type SectionOutlineItem = { id: string; label: string };

type StructuredLayoutProps = {
  adventure: (typeof ADVENTURES)[number];
  level: (typeof ADVENTURES)[number]["levels"][number];
  intro: string[] | undefined;
  objective: string[] | undefined;
  toolbox: { name: string; url?: string; description?: string }[] | undefined;
  backstory: string[] | undefined;
  architecture: string[] | undefined;
  architectureDiagram: string | undefined;
  howToPlay: { title: string; body: string }[] | undefined;
  verification: (typeof ADVENTURES)[number]["levels"][number]["verification"];
};

const StructuredLayout = ({
  adventure,
  level,
  intro,
  objective,
  toolbox,
  backstory,
  architecture,
  architectureDiagram,
  howToPlay,
  verification,
}: StructuredLayoutProps): JSX.Element => {
  const outlineSections: SectionOutlineItem[] = (() => {
    const items: SectionOutlineItem[] = [];
    if (objective && objective.length > 0) items.push({ id: "objective", label: "Objective" });
    items.push({ id: "learnings", label: "Key Learnings" });
    if (toolbox && toolbox.length > 0) items.push({ id: "toolbox", label: "Toolbox" });
    if (backstory && backstory.length > 0) items.push({ id: "backstory", label: "The Story" });
    if (architecture && architecture.length > 0 || architectureDiagram) items.push({ id: "architecture", label: "Architecture" });
    if (howToPlay && howToPlay.length > 0) items.push({ id: "walkthrough", label: "Walkthrough" });
    items.push({ id: "completion", label: "Completion" });
    return items;
  })();

  return (
    <>
      {/* Header */}
      <div className="mb-10">
        <span className="block text-xs font-mono uppercase tracking-widest text-[hsl(var(--text-faint))] mb-3">
          Adventure <span aria-hidden="true">&middot;</span> {adventure.title}
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{level.name}</h1>

        <div className="flex flex-wrap items-center gap-2 mb-5">
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

        {/* Intro as hook */}
        {intro && intro.length > 0 && (
          <p className="text-[hsl(var(--text-secondary))] leading-relaxed mb-5 max-w-3xl">
            {intro[0]}
          </p>
        )}
      </div>

      {/* Two-column layout: main content + sidebar */}
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
        <div className="min-w-0">
          {/* Objective card */}
          {objective && objective.length > 0 && (
            <section id="objective" className="mb-6 scroll-mt-28 rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-5">
              <h2 className="font-sans text-sm font-semibold tracking-wide text-primary mb-3">
                Objective
              </h2>
              <ul className="space-y-2">
                {objective.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                    <Check size={14} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Key Learnings + Toolbox side-by-side cards */}
          <div className="grid gap-5 sm:grid-cols-2 mb-6">
            <section id="learnings" className="scroll-mt-28 rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-5">
              <h2 className="font-sans text-sm font-semibold tracking-wide text-primary mb-3">
                Key Learnings
              </h2>
              <ul className="space-y-2">
                {level.learnings.map((learning) => (
                  <li key={learning} className="flex items-start gap-2.5 text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                    <span>{learning}</span>
                  </li>
                ))}
              </ul>
            </section>

            {toolbox && toolbox.length > 0 && (
              <section id="toolbox" className="scroll-mt-28 rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-5">
                <h2 className="font-sans text-sm font-semibold tracking-wide text-primary mb-3">
                  Toolbox
                </h2>
                <ul className="space-y-2">
                  {toolbox.map((tool) => (
                    <li key={tool.name} className="flex items-start gap-2.5 text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
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
                        {tool.description && <>{" "}- {tool.description}</>}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Mobile CTA - visible only below lg, after Key Learnings */}
          <div className="mb-6 lg:hidden">
            <a
              href={level.codespacesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full justify-center"
            >
              Open in Codespaces <ArrowRight size={14} aria-hidden="true" />
              <span className="sr-only"> (opens in new tab)</span>
            </a>
            <p className="mt-2 text-center text-xs text-[hsl(var(--text-faint))] font-mono">
              Free GitHub account required
            </p>
          </div>

          {/* Collapsible sections */}
          {backstory && backstory.length > 0 && (
            <ScenarioSection backstory={backstory} />
          )}
          {(architecture && architecture.length > 0 || architectureDiagram) && (
            <ArchitectureSection architecture={(architecture ?? []).join("\n\n")} diagram={architectureDiagram} />
          )}
          {howToPlay && howToPlay.length > 0 && (
            <WalkthroughSection
              steps={[
                { title: "Get Started", body: `[Open in GitHub Codespaces](${level.codespacesUrl.replace(/[()]/g, (c) => encodeURIComponent(c))}). The devcontainer is pre-configured and starts automatically. GitHub will fork the repo to your account when you make your first commit.\n\nPrefer working locally? Clone the repo and open it in any editor that supports the Dev Containers specification (VS Code, JetBrains IDEs, and others). The devcontainer config will be detected automatically.` },
                ...(howToPlay.filter((s) => !s.body.startsWith("Prefer working locally"))),
              ]}
            />
          )}

          {/* Completion section */}
          <section id="completion" className="mb-6 scroll-mt-28 rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-5">
            <h2 className="font-sans text-sm font-semibold tracking-wide text-primary mb-3">
              Complete Your Challenge
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                {verification ? (
                  <span>
                    Verify your solution:
                    <pre tabIndex={0} className="mt-2 overflow-x-auto rounded-lg border border-[hsl(var(--surface-border))] bg-background/60 px-4 py-3 font-mono text-sm text-foreground">
                      <code>{verification.command}</code>
                    </pre>
                    <span className="mt-2 block text-[hsl(var(--text-faint))]">If it passes, it generates a Certificate of Completion you can paste into the discussion.</span>
                  </span>
                ) : (
                  <span>Commit and push your changes, then trigger the verification workflow on GitHub Actions.</span>
                )}
              </li>
              <li className="flex items-start gap-2.5 text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                <span>
                  Share your solutions in the{" "}
                  <a
                    href={level.discussionUrl}
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
          </section>
        </div>

        {/* Sidebar */}
        <aside
          aria-label="Challenge sidebar"
          className="mt-10 lg:mt-0 space-y-4 lg:sticky lg:top-28 lg:self-start"
        >
          {/* CTA panel - hidden on mobile where it shows above content */}
          <div className="hidden lg:block rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-5">
            <a
              href={level.codespacesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full justify-center"
            >
              Open in Codespaces <ArrowRight size={14} aria-hidden="true" />
              <span className="sr-only"> (opens in new tab)</span>
            </a>
            <p className="mt-2.5 text-center text-xs text-[hsl(var(--text-faint))] font-mono">
              Free GitHub account required
            </p>
          </div>

          {/* Section outline nav */}
          {outlineSections.length > 2 && (
            <nav aria-label="Page sections" className="rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-4">
              <p className="font-mono text-[0.65rem] uppercase tracking-widest text-[hsl(var(--text-faint))] mb-2.5">
                On this page
              </p>
              <ul className="space-y-1">
                {outlineSections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-xs text-[hsl(var(--text-secondary))] hover:text-foreground hover:bg-background/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                    >
                      {section.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

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
  );
};

const ChallengeDetail = (): JSX.Element => {
  const { id, levelId } = useParams<{ id: string; levelId: string }>();
  const adventure = ADVENTURES.find((adventure) => adventure.id === id);
  const level = adventure?.levels.find((level) => level.id === levelId);

  if (!adventure || !level) {
    return <NotFoundPage title="Challenge not found" message="The challenge you're looking for doesn't exist." />;
  }

  const intro = level.intro;
  const backstory = level.backstory;
  const architecture = level.architecture;
  const architectureDiagram = level.architectureDiagram;
  const objective = level.objective;
  const toolbox = level.toolbox;
  const howToPlay = level.howToPlay;
  const verification = level.verification;

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
            <StructuredLayout
              adventure={adventure}
              level={level}
              intro={intro}
              objective={objective}
              toolbox={toolbox}
              backstory={backstory}
              architecture={architecture}
              architectureDiagram={architectureDiagram}
              howToPlay={howToPlay}
              verification={verification}
            />
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
