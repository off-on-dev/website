import { type JSX, type ReactNode, useEffect } from "react";
import { useLoaderData, Link } from "react-router";
import type { MetaFunction, LoaderFunctionArgs, LinksFunction } from "react-router";
import {
  ArrowLeft,
  ExternalLink,
  Lock,
  Lightbulb,
  TriangleAlert,
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
import { CodeBlock } from "@/components/CodeBlock";
import { ContributorBadge } from "@/components/ContributorBadge";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { CodespacesButton } from "@/components/CodespacesButton";
import {
  SITE_URL,
  BRAND_NAME,
  COMMUNITY_URL,
} from "@/data/constants";
import { buildPageMeta } from "@/lib/meta";
import { isSolutionUnlocked, formatDeadline, resolveDiscussionUrl } from "@/lib/utils";

export const links: LinksFunction = () => [
  { rel: "preload", href: `${import.meta.env.BASE_URL}fonts/jetbrains-mono-latin-400-normal.woff2`, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
  { rel: "preload", href: `${import.meta.env.BASE_URL}fonts/jetbrains-mono-latin-600-normal.woff2`, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
];

type LoaderData = {
  adventure: (typeof ADVENTURES)[number] | null;
  level: (typeof ADVENTURES)[number]["levels"][number] | null;
  solutionUnlocked: boolean;
  solution: Solution | null;
  challengeUrl: string;
  discussionUrl: string;
  deadline: string | undefined;
};

export function loader({ params }: LoaderFunctionArgs): LoaderData {
  const adventure = ADVENTURES.find((a) => a.id === params.id) ?? null;
  const level = adventure?.levels.find((l) => l.id === params.levelId) ?? null;
  const deadline = level?.deadline ?? adventure?.rewards?.deadline;
  const solutionUnlocked = isSolutionUnlocked(deadline);
  const solution =
    solutionUnlocked && adventure !== null && level !== null
      ? (SOLUTIONS.find((s) => s.adventureId === params.id && s.levelId === params.levelId) ?? null)
      : null;
  const challengeUrl =
    adventure !== null && level !== null
      ? `/adventures/${adventure.id}/levels/${level.id}/`
      : "/adventures/";
  const discussionUrl = resolveDiscussionUrl(level?.discussionUrl, COMMUNITY_URL);
  return { adventure, level, solutionUnlocked, solution, challengeUrl, discussionUrl, deadline };
}

export const meta: MetaFunction<typeof loader> = ({ loaderData }) => {
  if (!loaderData?.adventure || !loaderData?.level) {
    return [
      { title: `Solution Not Found - ${BRAND_NAME}` },
      { name: "robots", content: "noindex, nofollow" },
    ];
  }
  if (!loaderData.solutionUnlocked) {
    return [
      { title: `${loaderData.level.name} Solution - ${loaderData.adventure.title} - ${BRAND_NAME}` },
      { name: "robots", content: "noindex, nofollow" },
    ];
  }
  if (!loaderData.solution) {
    return [
      { title: `Solution Not Found - ${BRAND_NAME}` },
      { name: "robots", content: "noindex, nofollow" },
    ];
  }
  const { adventure, level, solution } = loaderData;
  const title = `${solution.title} - ${adventure.title} - ${BRAND_NAME}`;
  const description = `Step-by-step solution walkthrough for the ${level.name} challenge in ${adventure.title}.`;
  return buildPageMeta({
    title,
    description,
    url: `${SITE_URL}/adventures/${adventure.id}/levels/${level.id}/solution/`,
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

const calloutConfig = {
  tip: {
    icon: Lightbulb,
    label: "Tip",
    className: "border-primary/30 bg-primary/5",
    iconClass: "text-primary",
  },
  warning: {
    icon: TriangleAlert,
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
      className="w-full rounded-xl border border-border shadow-sm"
      loading="lazy"
      decoding="async"
    />
    {caption && (
      <figcaption className="mt-2 text-xs text-center text-faint">
        {caption}
      </figcaption>
    )}
  </figure>
);

const BlockRenderer = ({ blocks }: { blocks: SolutionBlock[] }): JSX.Element => (
  <div className="space-y-4">
    {blocks.map((block, i) => {
      const key = `${block.type}-${i}`;
      switch (block.type) {
        case "text":
          return (
            <div key={key} className="md-content" dangerouslySetInnerHTML={{ __html: block.html }} />
          );
        case "code":
          return (
            <CodeBlock key={key} language={block.language} title={block.title} code={block.code} />
          );
        case "image":
          return (
            <SolutionImage key={key} src={block.src} alt={block.alt} caption={block.caption} />
          );
        case "callout":
          return <Callout key={key} variant={block.variant} html={block.html} />;
        default: {
          // TypeScript narrows `block` to `never` here — if a new SolutionBlock
          // variant is added to the union, this line becomes a compile error.
          const _exhaustive: never = block;
          void _exhaustive;
          return null;
        }
      }
    })}
  </div>
);

const TakeawaysList = ({ items }: { items?: string[] }): JSX.Element | null => {
  if (!items || items.length === 0) return null;
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
      <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
        Key Takeaways
      </p>
      <ul className="space-y-2" role="list">
        {items.map((item, index) => (
          <li key={`${index}-${item}`} className="flex gap-2 text-sm text-dim leading-relaxed">
            <span className="shrink-0 text-primary mt-0.5" aria-hidden="true">›</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

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

// Shared <summary> chevron
const SummaryChevron = (): JSX.Element => (
  <ChevronDown
    size={16}
    className="shrink-0 text-faint transition-transform motion-reduce:transition-none group-open:rotate-180"
    aria-hidden="true"
  />
);

// Shared summary base classes
const summaryBase =
  "flex cursor-pointer list-none items-center gap-3 focus-ring [&::-webkit-details-marker]:hidden";

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
            className="px-2.5 py-1.5 rounded-full border border-border bg-background/40 text-xs text-dim font-mono hover:border-primary/50 hover:text-foreground transition-colors focus-ring-tight"
          >
            {t}
          </Link>
        </li>
      ))}
    </ul>
  );
};

const SolutionHero = ({ adventure, level, solution }: HeroProps): JSX.Element => {
  // Level backstory takes precedence; fall back to the adventure-level backstory.
  // Both are pre-rendered HTML from the markdown pipeline.
  const backstory = level.backstory?.[0] ?? adventure.backstory?.[0];
  return (
    <div className="rounded-2xl border border-border overflow-hidden mb-8">
      <div className="bg-[hsl(var(--surface))] px-6 md:px-8 pt-7 pb-6">
        {backstory && (
          <div
            role="note"
            className="text-base italic text-dim leading-relaxed md-content [&>p]:mb-0"
            dangerouslySetInnerHTML={{ __html: backstory }}
          />
        )}
      </div>
      <div className="h-0.5 bg-primary" aria-hidden="true" />
      <div className="bg-background/40 px-6 md:px-8 py-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <DifficultyBadge difficulty={level.difficulty} showDot />
          <span className="text-xs text-faint uppercase tracking-wider">
            Solution
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          {solution.title}
        </h1>
        {solution.intro && (
          <p className="text-dim leading-relaxed max-w-3xl">
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
};

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
  children: ReactNode;
}): JSX.Element => (
  <div className="rounded-xl border border-border bg-[hsl(var(--surface))] p-5">
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
    aria-label="What was fixed"
    className={`rounded-xl border border-border bg-[hsl(var(--surface))] p-5 ${className}`}
  >
    <p className="font-sans text-xs font-semibold tracking-wide text-primary uppercase mb-3">
      what was fixed
    </p>
    <ul className="space-y-2" role="list">
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
            className="text-sm text-dim hover:text-foreground transition-colors leading-snug focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            {step.title}
          </a>
        </li>
      ))}
    </ul>
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
      <SidebarCard label="solve along" labelSpacing="mb-2">
        <p className="text-xs text-dim leading-relaxed mb-4">
          Haven&apos;t solved it yet? Open the challenge in Codespaces and follow each step as you go.
        </p>
        <CodespacesButton href={level.codespacesUrl} />
      </SidebarCard>
    )}

    <StepNav steps={steps} className="hidden lg:block" />

    {furtherReading && furtherReading.length > 0 && (
      <SidebarCard label="further reading" labelSpacing="mb-2">
        <FurtherReadingList links={furtherReading} />
      </SidebarCard>
    )}

    <SidebarCard label="challenge">
      <p className="text-sm font-semibold text-foreground mb-0.5">{adventure.title}</p>
      <p className="text-xs text-faint mb-4">{level.name}</p>
      <Link
        to={challengeUrl}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline focus-ring-tight rounded-sm"
      >
        <ArrowLeft size={13} aria-hidden="true" />
        Back to challenge
      </Link>
    </SidebarCard>

    <SidebarCard label="discussion" labelSpacing="mb-2">
      <p className="text-xs text-dim mb-3 leading-relaxed">
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
// Article
// ---------------------------------------------------------------------------

type SolutionArticleProps = {
  solution: Solution;
  discussionUrl: string;
};

const SolutionArticle = ({ solution, discussionUrl }: SolutionArticleProps): JSX.Element => (
  <article aria-label={solution.title}>
    {/* Spoiler warning */}
    {solution.spoilerWarning && (
      <div className="flex gap-3 rounded-xl border border-primary/25 bg-primary/5 p-4 mb-6" role="note">
        <TriangleAlert size={16} className="shrink-0 mt-0.5 text-primary" aria-hidden="true" />
        <p className="text-sm text-dim leading-relaxed">
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
        className="rounded-xl border border-border bg-[hsl(var(--surface))] px-5 py-5 mb-3"
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
              className={`${summaryBase} gap-4 rounded-xl border border-border bg-[hsl(var(--surface))] px-5 py-4 group-open:rounded-b-none group-open:border-b-0`}
            >
              <span
                className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-primary text-[hsl(var(--primary-foreground))] text-sm font-bold tabular-nums"
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-base font-semibold text-foreground flex-1">
                {step.title}
              </h3>
              <SummaryChevron />
            </summary>
            <div className="rounded-b-xl border border-t-0 border-border bg-background/40 px-5 py-5 space-y-5">
              {step.intro && (
                <p className="text-sm text-dim leading-relaxed">
                  {step.intro}
                </p>
              )}
              <BlockRenderer blocks={step.body} />
              <TakeawaysList items={step.takeaways} />
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
            <span className="text-base font-semibold text-foreground leading-snug">
              {solution.completeSolution.title ?? "Complete Solution"}
            </span>
          </div>
          <SummaryChevron />
        </summary>
        <div className="rounded-b-xl border border-t-0 border-primary/25 bg-background/40 px-5 py-5">
          {solution.completeSolution.description && (
            <p className="text-sm text-dim mb-4 leading-relaxed">
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
        className="mt-6 rounded-2xl border border-border overflow-hidden"
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
                className="md-content text-sm text-dim leading-relaxed [&>p:not(:last-child)]:mb-3 [&>p:last-child]:mb-0"
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
);

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const SolutionDetail = (): JSX.Element => {
  const { adventure, level, solutionUnlocked, solution, challengeUrl, discussionUrl, deadline } =
    useLoaderData<ReturnType<typeof loader>>();

  // Open the <details> element that matches the URL hash on mount and on every
  // in-page hash change (sidebar StepNav links). Without this, clicking a step
  // link scrolls to the element but leaves it collapsed.
  useEffect(() => {
    const openMatchingStep = (hash: string): void => {
      if (!hash) return;
      const el = document.getElementById(hash.replace(/^#/, ""));
      if (el instanceof HTMLDetailsElement) {
        el.open = true;
      }
    };

    openMatchingStep(window.location.hash);

    const onHashChange = (): void => openMatchingStep(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  if (!adventure || !level) {
    return (
      <div className="min-h-dvh bg-background">
        <Navbar />
        <main id="main-content" tabIndex={-1} className="px-6 md:px-16 pt-28 pb-24">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-3xl font-bold text-foreground mb-4">Solution not found</h1>
            <p className="text-dim mb-6">
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
              { label: level.name, href: challengeUrl },
              { label: "Solution" },
            ]}
          />

          {/* Not yet available */}
          {!solutionUnlocked && (
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <DifficultyBadge difficulty={level.difficulty} showDot />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                {level.name}: Solution
              </h1>
              <div className="rounded-xl border border-border bg-[hsl(var(--surface))] p-6 flex gap-4">
                <Lock
                  size={20}
                  className="shrink-0 mt-0.5 text-faint"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">Not yet available</p>
                  <p className="text-sm text-dim">
                    This solution will be published after the challenge deadline
                    {deadline ? `: ${formatDeadline(deadline)}` : ""}. Try solving it yourself
                    first.
                  </p>
                  <Link
                    to={challengeUrl}
                    className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-primary hover:underline focus-ring-tight rounded-sm"
                  >
                    <ArrowLeft size={14} aria-hidden="true" />
                    Back to challenge
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Available but no solution authored yet */}
          {solutionUnlocked && !solution && (
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <DifficultyBadge difficulty={level.difficulty} showDot />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {level.name}: Solution
              </h1>
              <p className="text-dim mb-6">
                A solution walkthrough for this challenge hasn&apos;t been published yet.
              </p>
              <Link
                to={challengeUrl}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline focus-ring-tight rounded-sm"
              >
                <ArrowLeft size={14} aria-hidden="true" />
                Back to challenge
              </Link>
            </div>
          )}

          {/* Full solution — Overview + Detail layout */}
          {solutionUnlocked && solution && (
            <>
              <SolutionHero adventure={adventure} level={level} solution={solution} />

              {/* Two-column layout */}
              <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-12">
                <SolutionArticle solution={solution} discussionUrl={discussionUrl} />

                <SolutionSidebar
                  adventure={adventure}
                  level={level}
                  steps={solution.steps}
                  challengeUrl={challengeUrl}
                  discussionUrl={discussionUrl}
                  furtherReading={solution.furtherReading}
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
