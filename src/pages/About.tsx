import type { JSX } from "react";
import type { MetaFunction } from "react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AboutSection } from "@/components/AboutSection";
import { PageHero } from "@/components/PageHero";
import { BottomCTA } from "@/components/BottomCTA";
import { SITE_URL, BRAND_NAME } from "@/data/constants";

export const meta: MetaFunction = () => {
  const pageTitle = `About ${BRAND_NAME} - Building the contributors and maintainers of tomorrow`;
  const desc = `Learn about ${BRAND_NAME}'s mission and values for a vendor-agnostic open source community.`;
  return [
    { title: pageTitle },
    { tagName: "link", rel: "canonical", href: `${SITE_URL}/about` },
    { name: "description", content: desc },
    { property: "og:title", content: pageTitle },
    { property: "og:description", content: desc },
    { property: "og:type", content: "website" },
    { property: "og:url", content: `${SITE_URL}/about` },
    { property: "og:image", content: `${SITE_URL}/og.png` },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: pageTitle },
    { property: "og:site_name", content: BRAND_NAME },
    { property: "og:locale", content: "en_GB" },
    { name: "twitter:title", content: pageTitle },
    { name: "twitter:description", content: desc },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: `${SITE_URL}/og.png` },
    { name: "twitter:image:alt", content: pageTitle },
  ];
};

const About = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content">
      <PageHero
        eyebrow="About"
        title="Building the contributors and maintainers of tomorrow"
        description="Vendor-neutral. Open source. Community-driven."
      />
      <AboutSection />
      <BottomCTA />
      </main>
      <Footer />
    </div>
  );
};

export default About;
