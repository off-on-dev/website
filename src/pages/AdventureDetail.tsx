import { type JSX } from "react";
import { useParams, Link } from "react-router";
import type { MetaFunction } from "react-router";
import { ArrowRight } from "lucide-react";
import { ADVENTURES } from "@/data/adventures";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { TechFilterSection } from "@/components/TechFilterSection";
import { SITE_URL, BRAND_NAME } from "@/data/constants";
import { buildPageMeta } from "@/lib/meta";

export const meta: MetaFunction = ({ params }) => {
  const adventure = ADVENTURES.find((a) => a.id === params.id);
  if (!adventure) {
    return [
      { title: `Adventure Not Found - ${BRAND_NAME}` },
      { name: "robots", content: "noindex, nofollow" },
    ];
  }
  const tagsSummary = adventure.tags.slice(0, 3).join(", ");
  return buildPageMeta({
    title: `${adventure.title} - ${BRAND_NAME} Adventures`,
    description: `Tackle ${adventure.title} on ${BRAND_NAME}, a hands-on open source adventure. Work with ${tagsSummary} in a real-world scenario, directly in your browser.`.slice(0, 160),
    url: `${SITE_URL}/adventures/${adventure.id}`,
    ogType: "article",
  });
};

const AdventureDetail = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const adventure = ADVENTURES.find((adventure) => adventure.id === id);

  if (!adventure) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main id="main-content" className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
          <img src={`${import.meta.env.BASE_URL}offon_mascot_3_transparent.webp`} alt="" aria-hidden="true" width={120} height={120} loading="lazy" className="mb-6 w-24 opacity-80" />
          <h1 className="text-2xl font-bold text-foreground mb-3">Adventure not found</h1>
          <p className="text-muted-foreground">The adventure you're looking for doesn't exist.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content" className="px-6 md:px-16 pt-28 pb-24">
      <div className="mx-auto max-w-6xl">
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

        <TechFilterSection />
      </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdventureDetail;
