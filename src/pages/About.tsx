import { Navbar } from "@/components/Navbar";
import { Helmet } from "react-helmet-async";
import { Footer } from "@/components/Footer";
import { AboutSection } from "@/components/AboutSection";
import { PageHero } from "@/components/PageHero";
import { BottomCTA } from "@/components/BottomCTA";
import { COMMUNITY_URL } from "@/data/constants";

const About = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>About - Offon</title>
        <meta name="description" content="Creating the contributors and maintainers of tomorrow. Vendor-neutral, open source, community-driven." />
        <meta property="og:title" content="About - Offon" />
        <meta property="og:description" content="Creating the contributors and maintainers of tomorrow. Vendor-neutral, open source, community-driven." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://off-on-dev.github.io/website/about" />
        <meta property="og:image" content="https://off-on-dev.github.io/website/og.png" />
        <meta name="twitter:title" content="About - Offon" />
        <meta name="twitter:description" content="Creating the contributors and maintainers of tomorrow. Vendor-neutral, open source, community-driven." />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://off-on-dev.github.io/website/og.png" />
      </Helmet>
      <Navbar />
      <PageHero
        eyebrow="About"
        title="Creating the contributors and maintainers of tomorrow"
        description="Focused on what matters: helping people grow from curious users to confident contributors, and from contributors to sustainable maintainers. Vendor-neutral. Open source. Community-driven."
        primaryCta={{ label: "Our mission ↓", href: "#about" }}
        secondaryCta={{ label: "Join the community →", href: COMMUNITY_URL, external: true }}
      />
      <AboutSection />
      <BottomCTA />
      <Footer />
    </div>
  );
};

export default About;
