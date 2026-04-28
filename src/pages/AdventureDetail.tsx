import { useState, type JSX } from "react";
import { useParams, Link } from "react-router";
import type { MetaFunction } from "react-router";
import { ArrowRight } from "lucide-react";
import { ADVENTURES } from "@/data/adventures";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { SITE_URL, BRAND_NAME } from "@/data/constants";

const ALL_TAGS = Array.from(new Set(ADVENTURES.flatMap((a) => a.tags))).sort();

export const meta: MetaFunction = ({ params }) => {
  const adventure = ADVENTURES.find((a) => a.id === params.id);
  if (!adventure) {
    return [
      { title: `Adventure Not Found - ${BRAND_NAME}` },
      { name: "robots", content: "noindex, nofollow" },
    ];
  }
  const pageTitle = `${adventure.title} - ${BRAND_NAME} Adventures`;
  const tagsSummary = adventure.tags.slice(0, 3).join(", ");
  const pageDesc = `Join ${adventure.title} on ${BRAND_NAME} with ${adventure.levels.length} hands-on challenge levels. Topics include ${tagsSummary}.`.slice(0, 160);
  const pageUrl = `${SITE_URL}/adventures/${adventure.id}`;
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

const AdventureDetail = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const adventure = ADVENTURES.find((a) => a.id === id);
  const [activeTech, setActiveTech] = useState<string | null>(null);

  if (!adventure) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main id="main-content" className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-3">Adventure not found</h1>
          <p className="text-muted-foreground">The adventure you're looking for doesn't exist.</p>
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
        {/* Header */}
        <div className="mb-10">
          <span className="inline-block mb-4 rounded-sm border border-[hsl(var(--surface-border))] px-2 py-0.5 font-mono text-xs text-[hsl(var(--text-faint))] uppercase tracking-wider">
            {adventure.month}
          </span>
          <h1 className="text-4xl font-bold text-foreground mb-4">{adventure.title}</h1>
          <p className="text-[hsl(var(--text-secondary))] leading-relaxed">{adventure.story}</p>
        </div>

        {/* Challenges */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Challenges
          </h2>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {adventure.levels.map((level) => (
              <Link
                key={level.id}
                to={`/adventures/${adventure.id}/levels/${level.id}`}
                className="group card-glow relative rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6 transition-all duration-200 hover:-translate-y-[3px] flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <div className="mb-3">
                  <DifficultyBadge difficulty={level.difficulty} showDot />
                </div>
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-3">
                  {level.name}
                </h3>
                <ul className="space-y-1.5 flex-1">
                  {level.learnings.slice(0, 3).map((learning, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                      <span className="line-clamp-1">{learning}</span>
                    </li>
                  ))}
                  {level.learnings.length > 3 && (
                    <li className="text-xs text-[hsl(var(--text-faint))] pl-3">
                      +{level.learnings.length - 3} more
                    </li>
                  )}
                </ul>
                <span className="mt-5 inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:underline">
                  Start challenge <ArrowRight size={12} aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
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
              {relatedLevels.map(({ level, adventureId, adventureTitle }) => (
                <Link
                  key={`${adventureId}-${level.id}`}
                  to={`/adventures/${adventureId}/levels/${level.id}`}
                  className="group card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6 transition-all duration-200 hover:-translate-y-[3px] flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-fade-up-delay-1"
                >
                  <div className="mb-3">
                    <DifficultyBadge difficulty={level.difficulty} showDot />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {level.name}
                  </h3>
                  <ul className="mt-3 space-y-1.5">
                    {level.learnings.slice(0, 3).map((learning, i) => (
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

export default AdventureDetail;
