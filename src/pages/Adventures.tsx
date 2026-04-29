import type { JSX } from "react";
import type { MetaFunction } from "react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { ChallengesGrid } from "@/components/ChallengesGrid";
import { BottomCTA } from "@/components/BottomCTA";
import { SITE_URL, BRAND_NAME } from "@/data/constants";
import { buildPageMeta } from "@/lib/meta";

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: `Adventures - Hands-on open source challenges | ${BRAND_NAME}`,
    description: `Explore all ${BRAND_NAME} adventures. Hands-on scenarios using real open source tools: OpenTelemetry, Argo CD, OpenTofu, GitHub Actions, and more.`,
    url: `${SITE_URL}/adventures`,
  });

const Adventures = (): JSX.Element => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main id="main-content">
      <PageHero
        eyebrow="Adventures"
        title="Hands-on Open Source Challenges"
        description="Real-world scenarios using tools like OpenTelemetry, Argo CD, OpenTofu, GitHub Actions, and more. Everything runs in your browser, no local setup required."
      />
      <ChallengesGrid />
      <BottomCTA />
    </main>
    <Footer />
  </div>
);

export default Adventures;
