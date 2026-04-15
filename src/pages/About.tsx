import { ArrowDown, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Helmet } from "react-helmet-async";
import { Footer } from "@/components/Footer";
import { AboutSection } from "@/components/AboutSection";
import { PageHero } from "@/components/PageHero";
import { BottomCTA } from "@/components/BottomCTA";
import { COMMUNITY_URL, SITE_URL, BRAND_NAME } from "@/data/constants";

const About = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{`About - ${BRAND_NAME}`}</title>
        <link rel="canonical" href={SITE_URL + "/about"} />
        <meta name="description" content="Building the contributors and maintainers of tomorrow. Vendor-neutral, open source, community-driven." />
        <meta property="og:title" content={`About - ${BRAND_NAME}`} />
        <meta property="og:description" content="Building the contributors and maintainers of tomorrow. Vendor-neutral, open source, community-driven." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/about`} />
        <meta property="og:image" content={`${SITE_URL}/og.png`} />
        <meta name="twitter:title" content={`About - ${BRAND_NAME}`} />
        <meta name="twitter:description" content="Building the contributors and maintainers of tomorrow. Vendor-neutral, open source, community-driven." />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`${SITE_URL}/og.png`} />
      </Helmet>
      <Navbar />
      <main>
      <PageHero
        eyebrow="About"
        title="Building the contributors and maintainers of tomorrow"
        description="Focused on what matters: helping people grow from curious users to confident contributors, and from contributors to sustainable maintainers. Vendor-neutral. Open source. Community-driven."
        primaryCta={{ label: <span className="inline-flex items-center gap-2">Our mission <ArrowDown size={14} aria-hidden="true" /></span>, href: "#mission" }}
        secondaryCta={{ label: <span className="inline-flex items-center gap-2">Join the community <ArrowRight size={14} aria-hidden="true" /></span>, href: COMMUNITY_URL, external: true }}
      />
      <AboutSection />
      <BottomCTA />
      </main>
      <Footer />
    </div>
  );
};

export default About;
