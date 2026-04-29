import { type JSX } from "react";
import { useParams, Link } from "react-router";
import type { MetaFunction } from "react-router";
import { ArrowLeft } from "lucide-react";
import { ADVENTURES } from "@/data/adventures";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LevelCard } from "@/components/LevelCard";
import { VerificationSection } from "@/components/VerificationSection";
import { DiscussionSection } from "@/components/DiscussionSection";
import { TechFilterSection } from "@/components/TechFilterSection";
import { SITE_URL, BRAND_NAME } from "@/data/constants";
import { buildPageMeta } from "@/lib/meta";

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
  });
};

const ChallengeDetail = (): JSX.Element => {
  const { id, levelId } = useParams<{ id: string; levelId: string }>();
  const adventure = ADVENTURES.find((adventure) => adventure.id === id);
  const level = adventure?.levels.find((level) => level.id === levelId);

  if (!adventure || !level) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main id="main-content" className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
          <img src={`${import.meta.env.BASE_URL}offon_mascot_3_transparent.png`} alt="" aria-hidden="true" width={120} height={120} loading="lazy" className="mb-6 w-24 opacity-80" />
          <h1 className="text-2xl font-bold text-foreground mb-3">Challenge not found</h1>
          <p className="text-muted-foreground">The challenge you're looking for doesn't exist.</p>
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

        <TechFilterSection />
      </div>
      </main>
      <Footer />
    </div>
  );
};

export default ChallengeDetail;
