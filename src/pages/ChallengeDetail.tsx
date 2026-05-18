import { type JSX } from "react";
import { useParams, Link } from "react-router";
import type { LinksFunction, MetaFunction } from "react-router";
import { ArrowLeft } from "lucide-react";
import { ADVENTURES } from "@/data/adventures";
import { ContributorBadge } from "@/components/ContributorBadge";
import { NotFoundPage } from "@/components/NotFoundPage";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LevelCard } from "@/components/LevelCard";
import { ChallengeContextSection } from "@/components/ChallengeContextSection";
import { DiscussionSection } from "@/components/DiscussionSection";
import { TechFilterSection } from "@/components/TechFilterSection";
import { SITE_URL, BRAND_NAME } from "@/data/constants";
import { buildPageMeta, syneBoldPreload } from "@/lib/meta";

export const links: LinksFunction = () => syneBoldPreload;

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

const ChallengeDetail = (): JSX.Element => {
  const { id, levelId } = useParams<{ id: string; levelId: string }>();
  const adventure = ADVENTURES.find((adventure) => adventure.id === id);
  const level = adventure?.levels.find((level) => level.id === levelId);

  if (!adventure || !level) {
    return <NotFoundPage title="Challenge not found" message="The challenge you're looking for doesn't exist." />;
  }

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
          {adventure.contributor && (
            <div className="mt-3">
              <ContributorBadge name={adventure.contributor.name} url={adventure.contributor.url} glow />
            </div>
          )}
        </div>

        {/* Level card */}
        <div className="mb-10">
          <LevelCard level={level} headingLevel="none" />
        </div>

        {/* Context: objective, toolbox, how to play */}
        {(level.howToPlay?.length || level.objective?.length || level.toolbox?.length) ? (
          <div className="mb-10">
            <ChallengeContextSection
              intro={level.intro}
              backstory={level.backstory}
              architecture={level.architecture}
              architectureDiagram={level.architectureDiagram}
              howToPlay={level.howToPlay}
              toolbox={level.toolbox}
              objective={level.objective}
              codespacesUrl={level.codespacesUrl}
              verificationUrl="https://github.com/dynatrace-oss/open-ecosystem-challenges/blob/main/docs/verification.md"
              discussionUrl={level.discussionUrl}
            />
          </div>
        ) : null}

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
