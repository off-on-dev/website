import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BottomCTA } from "@/components/BottomCTA";
import { ADVENTURES } from "@/data/adventures";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { SITE_URL } from "@/data/constants";

const TopicPage = (): JSX.Element => {
  const { tag } = useParams<{ tag: string }>();
  const decoded = tag ? decodeURIComponent(tag) : "";
  const allTags = Array.from(new Set(ADVENTURES.flatMap((a) => a.tags))).sort();

  useEffect(() => { window.scrollTo(0, 0); }, [decoded]);

  // Flatten to individual challenge levels belonging to adventures with this tag
  const challenges = ADVENTURES
    .filter((a) => a.tags.includes(decoded))
    .flatMap((a) =>
      a.levels.map((level) => ({ level, adventure: a }))
    );

  const pageTitle = decoded ? `${decoded} Challenges - Offon` : "Topic - Offon";
  const pageDesc = decoded ? `Hands-on challenges tagged with ${decoded}. Practice real-world open source skills.` : "Browse challenges by topic.";
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{pageTitle}</title>
        <link rel="canonical" href={`${SITE_URL}/topics/${encodeURIComponent(decoded)}`} />
        <meta name="description" content={pageDesc} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/topics/${encodeURIComponent(decoded)}`} />
        <meta property="og:image" content={`${SITE_URL}/og.png`} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`${SITE_URL}/og.png`} />
      </Helmet>
      <Navbar />

      {/* Hero */}
      <section className="bg-primary pt-24 md:pt-32 pb-20 px-6 md:px-16">
        <div className="mx-auto max-w-4xl">
          <span className="font-mono text-xs font-medium uppercase tracking-widest text-background/90 block mb-4">
            Topic
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight text-background mb-5">
            {decoded}
          </h1>
          <p className="font-mono text-sm leading-relaxed text-background/90 max-w-2xl">
            {challenges.length} challenge{challenges.length !== 1 ? "s" : ""} tagged with &ldquo;{decoded}&rdquo;
          </p>
        </div>
      </section>

      {/* Challenges grid */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-5xl">
          {challenges.length > 0 ? (
            <>
              <h2 className="text-2xl font-bold text-foreground mb-6">Challenges</h2>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {challenges.map(({ level, adventure }) => {
                return (
                  <Link
                    key={`${adventure.id}-${level.id}`}
                    to={`/adventures/${adventure.id}/levels/${level.id}`}
                    className="group card-glow relative rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6 transition-all duration-200 hover:-translate-y-[3px] flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
                  >
                    <div className="mb-3">
                      <DifficultyBadge difficulty={level.difficulty} showDot />
                    </div>

                    <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                      {level.name}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground font-mono">{adventure.title}</p>

                    <ul className="mt-4 space-y-1.5 flex-1">
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
                  </Link>
                );
              })}
            </div>
            </>
          ) : (
            <p className="text-muted-foreground text-center py-16">No challenges found for this topic.</p>
          )}

          {/* Browse other topics */}
          <div className="mt-16 pt-10 border-t border-[hsl(var(--surface-border))]">
            <p className="text-xs font-mono uppercase tracking-widest text-[hsl(var(--text-faint))] mb-4">
              Browse other topics
            </p>
            <div className="flex flex-wrap gap-2">
              {allTags.filter((t) => t !== decoded).map((t) => (
                <Link
                  key={t}
                  to={`/topics/${encodeURIComponent(t)}`}
                  className="pill-inactive"
                >
                  {t}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <BottomCTA />
      <Footer />
    </div>
  );
};

export default TopicPage;
