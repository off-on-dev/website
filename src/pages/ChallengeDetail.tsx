import { useState, type JSX } from "react";
import { useParams, Link } from "react-router";
import type { MetaFunction } from "react-router";
import { ArrowLeft } from "lucide-react";
import { ADVENTURES } from "@/data/adventures";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LevelCard } from "@/components/LevelCard";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { VerificationSection } from "@/components/VerificationSection";
import { DiscussionSection } from "@/components/DiscussionSection";
import { SITE_URL, BRAND_NAME } from "@/data/constants";

const ALL_TAGS = Array.from(new Set(ADVENTURES.flatMap((a) => a.tags))).sort();

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
  const pageTitle = `${level.name} - ${adventure.title} - ${BRAND_NAME}`;
  const pageDesc = `Build skills with ${level.name}, a ${level.difficulty.toLowerCase()} challenge in ${adventure.title}. Learn ${learningsSummary} in a hands-on scenario on ${BRAND_NAME}.`.slice(0, 160);
  const pageUrl = `${SITE_URL}/adventures/${adventure.id}/levels/${level.id}`;
  return [
    { title: pageTitle },
    { tagName: "link", rel: "canonical", href: pageUrl },
    { name: "description", content: pageDesc },
    { property: "og:title", content: pageTitle },
    { property: "og:description", content: pageDesc },
    { property: "og:type", content: "article" },
    { property: "og:url", content: pageUrl },
    { property: "og:image", content: `${SITE_URL}/og.png` },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: pageTitle },
    { property: "og:site_name", content: BRAND_NAME },
    { property: "og:locale", content: "en_GB" },
    { name: "twitter:title", content: pageTitle },
    { name: "twitter:description", content: pageDesc },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: `${SITE_URL}/og.png` },
    { name: "twitter:image:alt", content: pageTitle },
  ];
};

const ChallengeDetail = (): JSX.Element => {
  const { id, levelId } = useParams<{ id: string; levelId: string }>();
  const adventure = ADVENTURES.find((a) => a.id === id);
  const level = adventure?.levels.find((l) => l.id === levelId);
  const [activeTech, setActiveTech] = useState<string | null>(null);

  if (!adventure || !level) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main id="main-content" className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-3">Challenge not found</h1>
          <p className="text-muted-foreground">The challenge you're looking for doesn't exist.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const relatedLevels = activeTech
    ? ADVENTURES
        .filter((a) => a.tags.includes(activeTech))
        .flatMap((a) =>
          a.levels.map((lvl) => ({
            level: lvl,
            adventureId: a.id,
            adventureTitle: a.title,
          }))
        )
    : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content" className="mx-auto max-w-4xl px-6 md:px-16 pt-28 pb-24">
        {/* Breadcrumb */}
        <Link
          to={`/adventures/${adventure.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--text-faint))] hover:text-primary transition-colors mb-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm"
        >
          <ArrowLeft size={14} aria-hidden="true" /> {adventure.title}
        </Link>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-foreground mb-2">{level.name}</h1>
          <p className="text-sm font-mono text-[hsl(var(--text-faint))] mb-4">{adventure.title}</p>
          <div className="flex flex-wrap gap-1.5">
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

        {/* Level card */}
        <div className="mb-10">
          <LevelCard level={level} headingLevel="none" />
        </div>

        {/* Verification */}
        <div className="mb-10">
          <VerificationSection />
        </div>

        {/* Discussion */}
        <div className="mb-16">
          <DiscussionSection discussionUrl={level.discussionUrl} />
        </div>

        {/* Find challenges by technology */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Find challenges by technology
          </h2>
          <div className="mb-6 flex flex-wrap gap-2">
            {ALL_TAGS.map((tag) => (
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
          <div aria-live="polite" aria-atomic="true">
          {activeTech && relatedLevels.length > 0 && (
            <div key={activeTech} className="animate-fade-up grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {relatedLevels.map(({ level: relLevel, adventureId, adventureTitle }) => (
                <Link
                  key={`${adventureId}-${relLevel.id}`}
                  to={`/adventures/${adventureId}/levels/${relLevel.id}`}
                  className="group card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6 transition-all duration-200 hover:-translate-y-[3px] flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-fade-up-delay-1"
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
      </main>
      <Footer />
    </div>
  );
};

export default ChallengeDetail;
