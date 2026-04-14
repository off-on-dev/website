import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ADVENTURES } from "@/data/adventures";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LevelCard } from "@/components/LevelCard";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { VerificationSection } from "@/components/VerificationSection";
import { DiscussionSection } from "@/components/DiscussionSection";
import { SITE_URL, BRAND_NAME } from "@/data/constants";

const ChallengeDetail = (): JSX.Element => {
  const { id, levelId } = useParams<{ id: string; levelId: string }>();
  const adventure = ADVENTURES.find((a) => a.id === id);
  const level = adventure?.levels.find((l) => l.id === levelId);
  const [activeTech, setActiveTech] = useState<string | null>(null);

  if (!adventure || !level) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Challenge not found.</p>
      </div>
    );
  }

  const learningsSummary = level.learnings.slice(0, 2).join("; ");
  const pageTitle = `${level.name} - ${adventure.title} - ${BRAND_NAME}`;
  const pageDesc = `${level.difficulty} challenge: ${learningsSummary}.`.slice(0, 160);
  const pageUrl = `${SITE_URL}/adventures/${adventure.id}/levels/${level.id}`;

  const relatedLevels = ADVENTURES
    .filter((a) =>
      (activeTech ? a.tags.includes(activeTech) : false)
    )
    .flatMap((a) =>
      a.levels.map((lvl) => ({
        level: lvl,
        adventureId: a.id,
        adventureTitle: a.title,
      }))
    );

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{pageTitle}</title>
        <link rel="canonical" href={pageUrl} />
        <meta name="description" content={pageDesc} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={`${SITE_URL}/og.png`} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`${SITE_URL}/og.png`} />
      </Helmet>
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 pt-28 pb-24">
        {/* Breadcrumb */}
        <Link
          to={`/adventures/${adventure.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--text-faint))] hover:text-primary transition-colors mb-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1 rounded-sm"
        >
          ← {adventure.title}
        </Link>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-foreground mb-2">{level.name}</h1>
          <p className="text-sm font-mono text-[hsl(var(--text-faint))] mb-4">{adventure.title}</p>
          <div className="flex flex-wrap gap-1.5">
            {Array.from(new Set(ADVENTURES.flatMap((a) => a.tags))).sort().map((tag) => (
              <span
                key={tag}
                className="rounded-sm border border-[hsl(var(--surface-border))] px-2.5 py-1 text-xs text-[hsl(var(--text-faint))]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Level card */}
        <div className="mb-10">
          <LevelCard level={level} />
        </div>

        {/* Verification */}
        <div className="mb-10">
          <VerificationSection />
        </div>

        {/* Discussion */}
        <div className="mb-16">
          <DiscussionSection discussionUrls={[level.discussionUrl]} />
        </div>

        {/* Find challenges by technology */}
        <div>
          <h2 className="font-mono text-xs font-medium uppercase tracking-widest text-primary mb-4">
            Find challenges by technology
          </h2>
          <div className="mb-6 flex flex-wrap gap-2">
            {Array.from(new Set(ADVENTURES.flatMap((a) => a.tags))).sort().map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTech(activeTech === tag ? null : tag)}
                className={activeTech === tag ? "pill-active" : "pill-inactive"}
                aria-pressed={activeTech === tag}
              >
                {tag}
              </button>
            ))}
          </div>
          {activeTech && relatedLevels.length > 0 && (
            <div key={activeTech} className="animate-fade-up grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {relatedLevels.map(({ level: relLevel, adventureId, adventureTitle }) => (
                <Link
                  key={`${adventureId}-${relLevel.id}`}
                  to={`/adventures/${adventureId}/levels/${relLevel.id}`}
                  className="group card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6 transition-all duration-200 hover:-translate-y-[3px] flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 animate-fade-up-delay-1"
                >
                  <div className="mb-3">
                    <DifficultyBadge difficulty={relLevel.difficulty} showDot />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {relLevel.name}
                  </h3>
                  <ul className="mt-3 space-y-1.5">
                    {relLevel.learnings.slice(0, 3).map((learning, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                        {learning}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-4 flex flex-wrap gap-1.5 items-center justify-between">
                    <span className="font-mono text-xs text-muted-foreground">Challenge</span>
                    <span className="rounded-sm border border-[hsl(var(--surface-border))] px-2 py-0.5 text-xs text-[hsl(var(--text-faint))]">
                      {adventureTitle}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ChallengeDetail;
