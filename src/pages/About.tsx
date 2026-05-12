import type { JSX } from "react";
import type { LinksFunction, MetaFunction } from "react-router";
import { Mail } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AboutSection } from "@/components/AboutSection";
import { BoardSection } from "@/components/BoardSection";
import { ChallengeBuildersSection } from "@/components/ChallengeBuildersSection";
import { BrandStory } from "@/components/BrandStory";
import { PageHero } from "@/components/PageHero";
import { BottomCTA } from "@/components/BottomCTA";
import { SITE_URL, BRAND_NAME, CONTACT_EMAIL } from "@/data/constants";
import { buildPageMeta, interBoldPreload } from "@/lib/meta";

export const links: LinksFunction = () => interBoldPreload;

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: `About ${BRAND_NAME} - Building the contributors and maintainers of tomorrow`,
    description: `${BRAND_NAME} is the home for open source enthusiasts. Learn about our mission, who we're for, and the values that make this community different.`,
    url: `${SITE_URL}/about`,
  });

const About = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content">
      <PageHero
        eyebrow="About"
        title="The Home for Open Source Enthusiasts"
        description="Our mission, vision, who we're for, and the values that shape everything we build."
        primaryCta={{ label: <span className="inline-flex items-center gap-2"><Mail size={14} aria-hidden="true" /> Contact Us</span>, href: `mailto:${CONTACT_EMAIL}` }}
      />
      <AboutSection />
      <BrandStory />
      <BoardSection />
      <ChallengeBuildersSection />
      <BottomCTA />
      </main>
      <Footer />
    </div>
  );
};

export default About;
