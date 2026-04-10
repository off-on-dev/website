import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ADVENTURES } from "@/data/adventures";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LevelCard } from "@/components/LevelCard";
import { VerificationSection } from "@/components/VerificationSection";
import { DiscussionSection } from "@/components/DiscussionSection";

const ChallengeDetail = (): JSX.Element => {
  const { id, levelId } = useParams<{ id: string; levelId: string }>();
  const adventure = ADVENTURES.find((a) => a.id === id);
  const level = adventure?.levels.find((l) => l.id === levelId);

  if (!adventure || !level) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Challenge not found.</p>
      </div>
    );
  }

  const learningsSummary = level.learnings.slice(0, 2).join("; ");
  const pageTitle = `${level.name} - ${adventure.title} - Offon`;
  const pageDesc = `${level.difficulty} challenge: ${learningsSummary}.`.slice(0, 160);
  const pageUrl = `https://off-on-dev.github.io/website/adventures/${adventure.id}/levels/${level.id}`;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content="https://off-on-dev.github.io/website/og.png" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://off-on-dev.github.io/website/og.png" />
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
          <p className="text-sm font-mono text-[hsl(var(--text-faint))]">{adventure.title}</p>
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
        <DiscussionSection discussionUrls={[level.discussionUrl]} />
      </div>
      <Footer />
    </div>
  );
};

export default ChallengeDetail;
