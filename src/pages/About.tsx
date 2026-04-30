import type { JSX } from "react";
import type { LinksFunction, MetaFunction } from "react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AboutSection } from "@/components/AboutSection";
import { PageHero } from "@/components/PageHero";
import { BottomCTA } from "@/components/BottomCTA";
import { SITE_URL, BRAND_NAME } from "@/data/constants";
import { buildPageMeta } from "@/lib/meta";

export const links: LinksFunction = () => [
  // Inter 700 is the LCP font for the PageHero h1 on this page.
  { rel: "preload", href: `${import.meta.env.BASE_URL}fonts/inter-latin-700-normal.woff2`, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
];

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
        description="Our mission, who we're for, and the values that shape everything we build."
      />
      <AboutSection />
      <BottomCTA />
      </main>
      <Footer />
    </div>
  );
};

export default About;
