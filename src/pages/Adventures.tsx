import type { JSX } from "react";
import { Link } from "react-router";
import type { MetaFunction } from "react-router";
import { ArrowRight, BookOpen, GitFork, Laptop } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { AdventureCard } from "@/components/AdventureCard";
import { ChallengeBuildersSection } from "@/components/ChallengeBuildersSection";
import { CommunityLeaders } from "@/components/CommunityLeaders";
import { BottomCTA } from "@/components/BottomCTA";
import { SITE_URL, BRAND_NAME } from "@/data/constants";
import { ADVENTURE_SUMMARIES } from "@/data/adventures/summaries";
import { buildPageMeta } from "@/lib/meta";

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: `Adventures - Open Source Learning Paths | ${BRAND_NAME}`,
    description: `Real-world scenarios, hands-on challenges, and practical knowledge you can apply, fork, and build on. Runs in GitHub Codespaces in a few clicks.`,
    url: `${SITE_URL}/adventures/`,
  });

const HOW_IT_WORKS = [
  {
    icon: <BookOpen size={22} aria-hidden="true" />,
    title: "Pick a Scenario",
    desc: "Each adventure is a self-contained story focused on one open source technology. Pick the difficulty that fits where you are and start from there.",
  },
  {
    icon: <Laptop size={22} aria-hidden="true" />,
    title: "Launch in Codespaces",
    desc: "A pre-configured GitHub Codespace spins up with everything installed. No local setup, no Docker, no dependency conflicts. Ready in a few clicks.",
  },
  {
    icon: <GitFork size={22} aria-hidden="true" />,
    title: "Apply, Fork, and Build",
    desc: "Complete real-world scenarios, bring the knowledge into your own projects, fork the challenge repo, and share your solutions with the community.",
  },
];

const Adventures = (): JSX.Element => (
  <div className="min-h-dvh bg-background">
    <Navbar />
    <main id="main-content" tabIndex={-1}>
      <PageHero
        eyebrow="Adventures"
        title="Real-World Scenarios. Practical Skills."
        description="Hands-on challenges and practical knowledge you can apply, fork, and build on. Each adventure runs entirely in GitHub Codespaces, a working environment in a few clicks, no local setup needed."
        primaryCta={{ label: "Browse All Challenges", href: "/challenges/" }}
      />

      {/* How Adventures Work */}
      <section
        aria-labelledby="how-it-works-heading"
        className="bg-card py-16 px-6 md:px-16 border-y border-border"
      >
        <div className="mx-auto max-w-6xl">
          <h2 id="how-it-works-heading" className="text-xl font-bold text-foreground mb-8">
            How Adventures Work
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {HOW_IT_WORKS.map(({ icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <span className="mt-0.5 shrink-0 text-primary">{icon}</span>
                <div>
                  <p className="font-semibold text-foreground">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Adventures */}
      <section aria-labelledby="adventures-heading" className="py-24 px-6 md:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-baseline justify-between gap-4 mb-8">
            <h2 id="adventures-heading" className="text-2xl font-bold text-foreground">
              All Adventures
              <span className="ml-2 font-normal text-sm text-muted-foreground">
                &middot; {ADVENTURE_SUMMARIES.length} {ADVENTURE_SUMMARIES.length === 1 ? "adventure" : "adventures"}
              </span>
            </h2>
            <Link to="/challenges/" className="btn-ghost inline-flex items-center gap-2 text-sm">
              Filter challenges by technology
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ADVENTURE_SUMMARIES.map((adventure) => (
              <AdventureCard key={adventure.id} adventure={adventure} />
            ))}
          </div>
        </div>
      </section>

      <ChallengeBuildersSection
        aside={
          <CommunityLeaders
            sections={["challenge-grand-builders", "challenge-builders", "challenge-rockstars", "top-challenge-solvers"]}
          />
        }
      />
      <BottomCTA />
    </main>
    <Footer />
  </div>
);

export default Adventures;
