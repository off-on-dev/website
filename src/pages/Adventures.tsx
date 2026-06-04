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

type Step = { step: string; icon: JSX.Element; title: string; desc: string };

const HOW_IT_WORKS: Step[] = [
  {
    step: "01",
    icon: <BookOpen size={22} aria-hidden="true" />,
    title: "Pick a Scenario",
    desc: "Each adventure is a self-contained story focused on one open source technology. Choose a difficulty — Beginner, Intermediate, or Expert — and start where you are.",
  },
  {
    step: "02",
    icon: <Laptop size={22} aria-hidden="true" />,
    title: "Launch in Codespaces",
    desc: "A pre-configured GitHub Codespace spins up with everything installed. No local setup, no Docker, no dependency conflicts — ready in a few clicks.",
  },
  {
    step: "03",
    icon: <GitFork size={22} aria-hidden="true" />,
    title: "Apply, Fork, and Build",
    desc: "Complete real-world scenarios, bring the knowledge into your own projects, fork the challenge repo, and share your solutions with the community.",
  },
];

const Adventures = (): JSX.Element => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main id="main-content">
      <PageHero
        eyebrow="Adventures"
        title="Real-World Scenarios. Practical Skills."
        description="Hands-on challenges and practical knowledge you can apply, fork, and build on. Each adventure runs entirely in GitHub Codespaces — a working environment in a few clicks, no local setup needed."
        primaryCta={{ label: "Browse All Challenges", href: "/challenges/" }}
      />

      {/* How Adventures Work */}
      <section
        aria-label="How adventures work"
        className="bg-card py-16 px-6 md:px-16 border-y border-[hsl(var(--surface-border))]"
      >
        <div className="mx-auto max-w-6xl">
          <p className="font-sans text-sm font-medium uppercase tracking-widest text-muted-foreground mb-8">
            How Adventures Work
          </p>
          <div className="grid gap-8 sm:grid-cols-3">
            {HOW_IT_WORKS.map(({ step, icon, title, desc }) => (
              <div key={step} className="flex gap-4">
                <span className="mt-0.5 shrink-0 text-primary">{icon}</span>
                <div>
                  <span className="font-mono text-xs text-primary/60 block mb-1">{step}</span>
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
            sections={["top-challenge-solvers", "challenge-grand-builders", "challenge-builders"]}
          />
        }
      />
      <BottomCTA />
    </main>
    <Footer />
  </div>
);

export default Adventures;
