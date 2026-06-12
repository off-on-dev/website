import { type JSX, useState } from "react";
import { useParams, Link } from "react-router";
import type { MetaFunction } from "react-router";
import {
  ArrowLeft,
  ExternalLink,
  Lock,
  Copy,
  Check,
  Lightbulb,
  AlertTriangle,
  Info,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import type { SolutionBlock, Solution } from "@/data/solutions/types";
import { ADVENTURES, tagToSlug } from "@/data/adventures";
import { SOLUTIONS } from "@/data/solutions";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ContributorBadge } from "@/components/ContributorBadge";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { CodespacesButton } from "@/components/CodespacesButton";
import {
  SITE_URL,
  BRAND_NAME,
  COMMUNITY_URL,
} from "@/data/constants";
import { buildPageMeta } from "@/lib/meta";
import { isDeadlinePast, formatDeadline } from "@/lib/utils";

export const meta: MetaFunction = ({ params }) => {
  const adventure = ADVENTURES.find((a) => a.id === params.id);
  const level = adventure?.levels.find((l) => l.id === params.levelId);

  if (!adventure || !level) {
    return [
      { title: `Solution Not Found - ${BRAND_NAME}` },
      { name: "robots", content: "noindex, nofollow" },
    ];
  }

  const deadline = level.deadline ?? adventure.rewards?.deadline;
  const available = !deadline || isDeadlinePast(deadline);

  if (!available) {
    return [
      { title: `${level.name} Solution - ${adventure.title} - ${BRAND_NAME}` },
      { name: "robots", content: "noindex, nofollow" },
    ];
  }

  const solution = SOLUTIONS.find(
    (s) => s.adventureId === params.id && s.levelId === params.levelId
  );
  if (!solution) {
    return [
      { title: `Solution Not Found - ${BRAND_NAME}` },
      { name: "robots", content: "noindex, nofollow" },
    ];
  }

  const title = `${solution.title} - ${adventure.title} - ${BRAND_NAME}`;
  const description = `Step-by-step solution walkthrough for the ${level.name} challenge in ${adventure.title}.`;

  return buildPageMeta({
    title,
    description,
    url: `${SITE_URL}/adventures/${adventure.id}/levels/${level.id}/solution`,
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
            { "@type": "ListItem", position: 5, name: "Solution", item: `${SITE_URL}/adventures/${adventure.id}/levels/${level.id}/solution/` },
          ],
        },
      },
    ],
  });
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const CodeBlock = ({
  language,
  title,
  code,
}: {
  language: string;
  title?: string;
  code: string;
}): JSX.Element => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (): void => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {
      // Clipboard write can fail in non-secure contexts or when the document loses focus
    });
  };

  return (
    <div>
      {/* Header bar: label always visible, no copy button here */}
      <div className="flex items-center justify-end rounded-t-lg border border-b-0 border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] px-3 py-2">
        <span className="truncate text-xs font-mono text-[hsl(var(--text-faint))] select-none" aria-hidden="true">
          {title ?? language}
        </span>
      </div>
      {/* Same md-pre-group + md-copy-btn pattern as ChallengeDetail: hover-to-show */}
      <div className="md-content code-block-body">
        <div className="md-pre-group">
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- makes scrollable code block keyboard-reachable per WCAG 2.1 SC 2.1.1 */}
          <pre tabIndex={0} aria-label={title ?? `${language} code block`}>
            <code>{code}</code>
          </pre>
          <button
            type="button"
            className="md-copy-btn"
            onClick={handleCopy}
            aria-label={copied ? "Code copied" : "Copy code"}
          >
            {copied ? (
              <Check size={12} aria-hidden="true" />
            ) : (
              <Copy size={12} aria-hidden="true" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      {/* Live region announces copy confirmation to screen readers without moving focus */}
      <span aria-live="polite" className="sr-only">
        {copied ? "Code copied to clipboard" : ""}
      </span>
    </div>
  );
};

const calloutConfig = {
  tip: {
    icon: Lightbulb,
    label: "Tip",
    className: "border-primary/30 bg-primary/5",
    iconClass: "text-primary",
  },
  warning: {
    icon: AlertTriangle,
    label: "Warning",
    className: "border-orange-500/30 bg-orange-500/5",
    iconClass: "text-orange-400",
  },
  info: {
    icon: Info,
    label: "Info",
    className: "border-blue-400/30 bg-blue-400/5",
    iconClass: "text-blue-400",
  },
};

const Callout = ({
  variant,
  html,
}: {
  variant: "tip" | "warning" | "info";
  html: string;
}): JSX.Element => {
  const config = calloutConfig[variant];
  const Icon = config.icon;
  return (
    <div
      className={`flex gap-3 rounded-lg border p-4 text-[hsl(var(--foreground))] ${config.className}`}
      role="note"
    >
      <Icon size={16} className={`shrink-0 mt-0.5 ${config.iconClass}`} aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider mb-1 opacity-70">
          {config.label}
        </p>
        <div
          className="text-sm leading-relaxed md-content [&>p]:mb-0 [&>p:not(:last-child)]:mb-2"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
};

const SolutionImage = ({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption?: string;
}): JSX.Element => (
  <figure className="my-4">
    <img
      src={src}
      alt={alt}
      className="w-full rounded-xl border border-[hsl(var(--surface-border))] shadow-sm"
      loading="lazy"
      decoding="async"
    />
    {caption && (
      <figcaption className="mt-2 text-xs text-center text-[hsl(var(--text-faint))]">
        {caption}
      </figcaption>
    )}
  </figure>
);

const BlockRenderer = ({ blocks }: { blocks: SolutionBlock[] }): JSX.Element => (
  <div className="space-y-4">
    {blocks.map((block, i) => {
      if (block.type === "text") {
        return (
          <div key={i} className="md-content" dangerouslySetInnerHTML={{ __html: block.html }} />
        );
      }
      if (block.type === "code") {
        return (
          <CodeBlock key={i} language={block.language} title={block.title} code={block.code} />
        );
      }
      if (block.type === "image") {
        return (
          <SolutionImage key={i} src={block.src} alt={block.alt} caption={block.caption} />
        );
      }
      if (block.type === "callout") {
        return <Callout key={i} variant={block.variant} html={block.html} />;
      }
      return null;
    })}
  </div>
);

const TakeawaysList = ({ items }: { items: string[] }): JSX.Element => (
  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
      Key Takeaways
    </p>
    <ul className="space-y-2" role="list">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
          <span className="shrink-0 text-primary mt-0.5" aria-hidden="true">›</span>
          {item}
        </li>
      ))}
    </ul>
  </div>
);

const FurtherReadingList = ({ links }: { links: Array<{ title: string; url: string }> }): JSX.Element => (
  <ul className="space-y-1" role="list">
    {links.map((link) => (
      <li key={link.url}>
        <a href={link.url} target="_blank" rel="noopener noreferrer" className="docs-ext-link text-sm">
          {link.title}
          <ExternalLink size={11} aria-hidden="true" />
          <span className="sr-only"> (opens in new tab)</span>
        </a>
      </li>
    ))}
  </ul>
);

const StepFooter = ({ takeaways }: { takeaways?: string[] }): JSX.Element | null => {
  if (!takeaways || takeaways.length === 0) return null;
  return <TakeawaysList items={takeaways} />;
};

// Shared <summary> chevron
const SummaryChevron = (): JSX.Element => (
  <ChevronDown
    size={16}
    className="shrink-0 text-[hsl(var(--text-faint))] transition-transform motion-reduce:transition-none group-open:rotate-180"
    aria-hidden="true"
  />
);

// Shared summary base classes
const summaryBase =
  "flex cursor-pointer list-none items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden";

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

type HeroProps = {
  adventure: { title: string; backstory?: string[] };
  level: { difficulty: string; topics?: string[]; backstory?: string[] };
  solution: { title: string; intro?: string; contributor?: { name: string; url?: string } };
};

const TopicPills = ({ topics }: { topics?: string[] }): JSX.Element | null => {
  if (!topics || topics.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2 mt-4" role="list" aria-label="Topics covered">
      {topics.map((t) => (
        <li key={t}>
          <Link
            to={`/challenges/${tagToSlug(t)}/`}
            className="px-2.5 py-1 rounded-full border border-[hsl(var(--surface-border))] bg-background/40 text-xs text-[hsl(var(--text-secondary))] font-mono hover:border-primary/50 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          >
            {t}
          </Link>
        </li>
      ))}
    </ul>
  );
};

const SolutionHero = ({ adventure, level, solution }: HeroProps): JSX.Element => (
  <div className="rounded-2xl border border-[hsl(var(--surface-border))] overflow-hidden mb-8">
    <div className="bg-[hsl(var(--surface))] px-6 md:px-8 pt-7 pb-6">
      {/* backstory[0] is pre-rendered HTML from the markdown pipeline */}
      <div
        role="note"
        className="text-base italic text-[hsl(var(--text-secondary))] leading-relaxed [&>p]:mb-0"
        dangerouslySetInnerHTML={{ __html: (level.backstory ?? adventure.backstory ?? [])[0] ?? "" }}
      />
    </div>
    <div className="h-0.5 bg-primary" aria-hidden="true" />
    <div className="bg-background/40 px-6 md:px-8 py-6">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <DifficultyBadge difficulty={level.difficulty} showDot />
        <span className="text-xs text-[hsl(var(--text-faint))] uppercase tracking-wider">
          Solution
        </span>
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
        {solution.title}
      </h1>
      {solution.intro && (
        <p className="text-[hsl(var(--text-secondary))] leading-relaxed max-w-3xl">
          {solution.intro}
        </p>
      )}
      {solution.contributor && (
        <div className="mt-3">
          <ContributorBadge
            name={solution.contributor.name}
            url={solution.contributor.url}
            label="Solution Contributor"
          />
        </div>
      )}
      <TopicPills topics={level.topics} />
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

const SidebarCard = ({
  label,
  labelSpacing = "mb-3",
  children,
}: {
  label: string;
  labelSpacing?: string;
  children: React.ReactNode;
}): JSX.Element => (
  <div className="rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-5">
    <p className={`font-sans text-xs font-semibold tracking-wide text-primary uppercase ${labelSpacing}`}>
      {label}
    </p>
    {children}
  </div>
);

type SolutionSidebarProps = {
  adventure: { title: string };
  level: { name: string; codespacesUrl?: string };
  steps: Array<{ id: string; title: string }>;
  challengeUrl: string;
  discussionUrl: string;
  furtherReading?: Array<{ title: string; url: string }>;
};

const StepNav = ({
  steps,
  className = "",
}: {
  steps: Array<{ id: string; title: string }>;
  className?: string;
}): JSX.Element => (
  <nav
    aria-label="Steps in this solution"
    className={`rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-5 ${className}`}
  >
    <p className="font-sans text-xs font-semibold tracking-wide text-primary uppercase mb-3">
      What Was Fixed
    </p>
    <ol className="space-y-2" role="list">
      {steps.map((step, index) => (
        <li key={step.id} className="flex gap-2.5 items-baseline">
          <span
            className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-primary/15 text-primary text-xs font-bold tabular-nums leading-none"
            aria-hidden="true"
          >
            {index + 1}
          </span>
          <a
            href={`#${step.id}`}
            className="text-sm text-[hsl(var(--text-secondary))] hover:text-foreground transition-colors leading-snug focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            {step.title}
          </a>
        </li>
      ))}
    </ol>
  </nav>
);

const SolutionSidebar = ({
  adventure,
  level,
  steps,
  challengeUrl,
  discussionUrl,
  furtherReading,
}: SolutionSidebarProps): JSX.Element => (
  <aside
    aria-label="Solution navigation"
    className="mt-10 lg:mt-0 space-y-4 lg:sticky lg:top-28 lg:self-start"
  >
    {level.codespacesUrl && (
      <SidebarCard label="Solve Along" labelSpacing="mb-2">
        <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed mb-4">
          Haven&apos;t solved it yet? Open the challenge in Codespaces and follow each step as you go.
        </p>
        <CodespacesButton href={level.codespacesUrl} />
      </SidebarCard>
    )}

    <StepNav steps={steps} className="hidden lg:block" />

    {furtherReading && furtherReading.length > 0 && (
      <SidebarCard label="Further Reading" labelSpacing="mb-2">
        <FurtherReadingList links={furtherReading} />
      </SidebarCard>
    )}

    <SidebarCard label="Challenge">
      <p className="text-sm font-semibold text-foreground mb-0.5">{adventure.title}</p>
      <p className="text-xs text-[hsl(var(--text-faint))] mb-4">{level.name}</p>
      <Link
        to={challengeUrl}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm"
      >
        <ArrowLeft size={13} aria-hidden="true" />
        Back to challenge
      </Link>
    </SidebarCard>

    <SidebarCard label="Discussion" labelSpacing="mb-2">
      <p className="text-xs text-[hsl(var(--text-secondary))] mb-3 leading-relaxed">
        Found a better way? Share your approach and compare notes with others who solved it.
      </p>
      <a
        href={discussionUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="docs-ext-link text-sm font-medium"
      >
        Join the discussion
        <ExternalLink size={12} aria-hidden="true" />
        <span className="sr-only"> (opens in new tab)</span>
      </a>
    </SidebarCard>
  </aside>
);

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const SolutionDetail = (): JSX.Element => {
  const { id, levelId } = useParams<{ id: string; levelId: string }>();

  const adventure = ADVENTURES.find((a) => a.id === id);
  const level = adventure?.levels.find((l) => l.id === levelId);

  if (!adventure || !level) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main id="main-content" tabIndex={-1} className="px-6 md:px-16 pt-28 pb-24">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-3xl font-bold text-foreground mb-4">Solution not found</h1>
            <p className="text-[hsl(var(--text-secondary))] mb-6">
              The challenge you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link
              to="/adventures/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              <ArrowLeft size={14} aria-hidden="true" />
              Browse adventures
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const deadline = level.deadline ?? adventure.rewards?.deadline;
  const available = !deadline || isDeadlinePast(deadline);
  const solution: Solution | undefined = available
    ? SOLUTIONS.find((s) => s.adventureId === id && s.levelId === levelId)
    : undefined;

  const challengeUrl = `/adventures/${adventure.id}/levels/${level.id}/`;
  const discussionUrl = level.discussionUrl
    ? level.discussionUrl.startsWith("http")
      ? level.discussionUrl
      : `${COMMUNITY_URL}${level.discussionUrl}`
    : COMMUNITY_URL;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="px-6 md:px-16 pt-28 pb-24">
        <div className="mx-auto max-w-6xl">
          <Breadcrumb
            className="mb-10"
            items={[
              { label: "Adventures", href: "/adventures/" },
              { label: adventure.title, href: `/adventures/${adventure.id}/` },
              { label: level.name, href: challengeUrl },
              { label: "Solution" },
            ]}
          />

          {/* Not yet available */}
          {!available && (
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <DifficultyBadge difficulty={level.difficulty} showDot />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                {level.name}: Solution
              </h1>
              <div className="rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6 flex gap-4">
                <Lock
                  size={20}
                  className="shrink-0 mt-0.5 text-[hsl(var(--text-faint))]"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">Not yet available</p>
                  <p className="text-sm text-[hsl(var(--text-secondary))]">
                    This solution will be published after the challenge deadline
                    {deadline ? `: ${formatDeadline(deadline)}` : ""}. Try solving it yourself
                    first.
                  </p>
                  <Link
                    to={challengeUrl}
                    className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm"
                  >
                    <ArrowLeft size={14} aria-hidden="true" />
                    Back to challenge
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Available but no solution authored yet */}
          {available && !solution && (
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <DifficultyBadge difficulty={level.difficulty} showDot />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {level.name}: Solution
              </h1>
              <p className="text-[hsl(var(--text-secondary))] mb-6">
                A solution walkthrough for this challenge hasn&apos;t been published yet.
              </p>
              <Link
                to={challengeUrl}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm"
              >
                <ArrowLeft size={14} aria-hidden="true" />
                Back to challenge
              </Link>
            </div>
          )}

          {/* Full solution — Overview + Detail layout */}
          {available && solution && (
            <>
              <SolutionHero adventure={adventure} level={level} solution={solution} />

              {/* Two-column layout */}
              <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-12">
                {/* Main content */}
                <article aria-label={solution.title}>
                  {/* Spoiler warning */}
                  {solution.spoilerWarning && (
                    <div className="flex gap-3 rounded-xl border border-primary/25 bg-primary/5 p-4 mb-6" role="note">
                      <AlertTriangle
                        size={16}
                        className="shrink-0 mt-0.5 text-primary"
                        aria-hidden="true"
                      />
                      <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                        {solution.spoilerWarning}
                      </p>
                    </div>
                  )}

                  {/* What Was Fixed — mobile only; desktop shows this in the sidebar */}
                  <StepNav steps={solution.steps} className="lg:hidden mb-4" />

                  {/* Context */}
                  {solution.context && (
                    <section
                      aria-labelledby="context-heading"
                      className="rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] px-5 py-5 mb-3"
                    >
                      <h2
                        id="context-heading"
                        className="font-sans text-sm font-semibold tracking-wide text-primary uppercase mb-4"
                      >
                        {solution.context.title}
                      </h2>
                      <BlockRenderer blocks={solution.context.body} />
                    </section>
                  )}

                  {/* Step cards */}
                  <ol className="space-y-3 mt-3" aria-label="Solution steps">
                    {solution.steps.map((step, index) => (
                      <li key={step.id}>
                        <details
                          id={step.id}
                          tabIndex={-1}
                          open={index === 0}
                          className="group scroll-mt-28 rounded-xl"
                        >
                          <summary
                            className={`${summaryBase} gap-4 rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] px-5 py-4 group-open:rounded-b-none group-open:border-b-0`}
                          >
                            <span
                              className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-primary text-[hsl(var(--primary-foreground))] text-sm font-bold tabular-nums"
                              aria-hidden="true"
                            >
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <h2
                              id={`step-${step.id}-heading`}
                              className="text-base font-semibold text-foreground flex-1"
                            >
                              {step.title}
                            </h2>
                            <SummaryChevron />
                          </summary>
                          <div className="rounded-b-xl border border-t-0 border-[hsl(var(--surface-border))] bg-background/40 px-5 py-5 space-y-5">
                            {step.intro && (
                              <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                                {step.intro}
                              </p>
                            )}
                            <BlockRenderer blocks={step.body} />
                            <StepFooter takeaways={step.takeaways} />
                          </div>
                        </details>
                      </li>
                    ))}
                  </ol>

                  {/* Complete solution */}
                  {solution.completeSolution && (
                    <details open tabIndex={-1} className="group mt-3 scroll-mt-28 rounded-xl">
                      <summary
                        className={`${summaryBase} rounded-xl border border-primary/30 bg-primary/5 px-5 py-4 group-open:rounded-b-none group-open:border-b-0`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
                            Final Result
                          </p>
                          <h2 className="text-base font-semibold text-foreground leading-snug">
                            {solution.completeSolution.title ?? "Complete Solution"}
                          </h2>
                        </div>
                        <SummaryChevron />
                      </summary>
                      <div className="rounded-b-xl border border-t-0 border-primary/25 bg-background/40 px-5 py-5">
                        {solution.completeSolution.description && (
                          <p className="text-sm text-[hsl(var(--text-secondary))] mb-4 leading-relaxed">
                            {solution.completeSolution.description}
                          </p>
                        )}
                        <CodeBlock
                          language={solution.completeSolution.language}
                          code={solution.completeSolution.code}
                        />
                      </div>
                    </details>
                  )}

                  {/* Narrative ending */}
                  {solution.outro && (
                    <section
                      aria-labelledby="outro-heading"
                      className="mt-6 rounded-2xl border border-[hsl(var(--surface-border))] overflow-hidden"
                    >
                      <div className="h-0.5 bg-primary" aria-hidden="true" />
                      <div className="px-6 py-7 bg-[hsl(var(--surface))]">
                        <div className="flex items-start gap-4">
                          <span
                            className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-primary/15 text-primary mt-0.5"
                            aria-hidden="true"
                          >
                            <Sparkles size={16} />
                          </span>
                          <div className="min-w-0 w-full">
                            <h2
                              id="outro-heading"
                              className="text-base font-semibold text-foreground mb-3"
                            >
                              {solution.outro.heading}
                            </h2>
                            <div
                              className="md-content text-sm text-[hsl(var(--text-secondary))] leading-relaxed [&>p:not(:last-child)]:mb-3 [&>p:last-child]:mb-0"
                              dangerouslySetInnerHTML={{ __html: solution.outro.html }}
                            />
                            <a
                              href={discussionUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="docs-ext-link text-sm font-medium mt-4"
                            >
                              Browse the discussion
                              <ExternalLink size={12} aria-hidden="true" />
                              <span className="sr-only"> (opens in new tab)</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </section>
                  )}
                </article>

                <SolutionSidebar
                  adventure={adventure}
                  level={level}
                  steps={solution.steps}
                  challengeUrl={challengeUrl}
                  discussionUrl={discussionUrl}
                  furtherReading={solution.steps
                    .flatMap((s) => s.furtherReading ?? [])
                    .filter((link, i, arr) => arr.findIndex((l) => l.url === link.url) === i)}
                />
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SolutionDetail;
