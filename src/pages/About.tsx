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
        <meta name="description" content="Learn about OffOn's mission and values for a vendor-agnostic open source community." />
        <meta property="og:title" content={`About - ${BRAND_NAME}`} />
        <meta property="og:description" content="Learn about OffOn's mission and values for a vendor-agnostic open source community." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/about`} />
        <meta property="og:image" content={`${SITE_URL}/og.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={`About - ${BRAND_NAME}`} />
        <meta property="og:site_name" content={BRAND_NAME} />
        <meta property="og:locale" content="en_GB" />
        <meta name="twitter:title" content={`About - ${BRAND_NAME}`} />
        <meta name="twitter:description" content="Learn about OffOn's mission and values for a vendor-agnostic open source community." />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`${SITE_URL}/og.png`} />
        <meta name="twitter:image:alt" content={`About - ${BRAND_NAME}`} />
      </Helmet>
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
