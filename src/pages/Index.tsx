import { type JSX } from "react";
import type { MetaFunction } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ChallengesGrid } from "@/components/ChallengesGrid";
import { ChallengeHighlights } from "@/components/ChallengeHighlights";
import { CommunitySection } from "@/components/CommunitySection";
import { SponsorStrip } from "@/components/SponsorStrip";
import { BottomCTA } from "@/components/BottomCTA";
import { Footer } from "@/components/Footer";
import { SITE_URL, BRAND_NAME } from "@/data/constants";
import { buildPageMeta } from "@/lib/meta";

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: `${BRAND_NAME} - Vendor-neutral. Open Source. Community Driven.`,
    description: "A vendor-neutral community for open source enthusiasts. Learn through hands-on challenges, share what you know, and connect with people who love open source.",
    url: `${SITE_URL}/`,
  });

const Index = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content">
        <Hero />
        <ChallengesGrid />
        <ChallengeHighlights />
        <section className="bg-primary py-16 px-6 md:px-16">
          <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-primary-foreground">
              <span className="block">Got an Idea</span>
              <span className="block">for an Adventure?</span>
            </h2>
            <div className="flex flex-col gap-4">
              <p className="font-sans text-base leading-relaxed text-background/90">
                Shape what the community learns next. Submit a scenario and help it become the next adventure.
              </p>
              <div className="flex gap-3 flex-wrap mt-2">
                <a
                  href="https://github.com/dynatrace-oss/open-ecosystem-challenges/blob/main/docs/contributing/adventure-ideas.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-inverse"
                >
                  Propose an Adventure Idea <ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
                </a>
              </div>
            </div>
          </div>
        </section>
        <CommunitySection />
        <SponsorStrip />
        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
