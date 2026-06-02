import { type JSX } from "react";
import type { MetaFunction, LinksFunction } from "react-router";
import { ExternalLink } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ChallengesGrid } from "@/components/ChallengesGrid";
import { ChallengeHighlights } from "@/components/ChallengeHighlights";
import { CommunitySection } from "@/components/CommunitySection";
import { CommunityLeaders } from "@/components/CommunityLeaders";
import { SponsorStrip } from "@/components/SponsorStrip";
import { BottomCTA } from "@/components/BottomCTA";
import { Footer } from "@/components/Footer";
import { BRAND_NAME, BRAND_SHORT_DESCRIPTION, BRAND_SLOGAN, SITE_URL } from "@/data/constants";
import { buildPageMeta } from "@/lib/meta";

export const links: LinksFunction = () => [
  { rel: "preload", href: `${import.meta.env.BASE_URL}fonts/jetbrains-mono-latin-400-normal.woff2`, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
  { rel: "preload", href: `${import.meta.env.BASE_URL}fonts/jetbrains-mono-latin-600-normal.woff2`, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
];

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: `${BRAND_NAME} - ${BRAND_SLOGAN}`,
    description: BRAND_SHORT_DESCRIPTION,
    url: SITE_URL,
  });

const Index = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content">
        <Hero />
        <ChallengesGrid limit={6} />
        <ChallengeHighlights />
        <section aria-labelledby="adventure-idea-heading" className="bg-primary py-16 px-6 md:px-16">
          <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <h2 id="adventure-idea-heading" className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-primary-foreground">
              <span className="block">Got an Idea</span>
              <span className="block">for an Adventure?</span>
            </h2>
            <div className="flex flex-col gap-4">
              <p className="font-sans text-base leading-relaxed text-background/90">
                Shape what the community learns next. Submit a scenario and help it become the next adventure.
              </p>
              <div className="flex gap-3 flex-wrap mt-2">
                <a
                  href="https://github.com/off-on-dev/open-source-challenges/blob/main/CONTRIBUTING.md#propose-an-adventure-idea"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-inverse"
                >
                  Propose an Adventure Idea <ExternalLink size={14} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
                </a>
              </div>
            </div>
          </div>
        </section>
        <CommunitySection
          aside={
            <CommunityLeaders
              sections={["top-contributors", "top-challenge-solvers", "most-liked"]}
            />
          }
        />
        <SponsorStrip />
        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
