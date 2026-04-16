import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ChallengesGrid } from "@/components/ChallengesGrid";
import { CommunityVoicesSection } from "@/components/CommunityVoicesSection";
import { ConnectSection } from "@/components/ConnectSection";
import { BottomCTA } from "@/components/BottomCTA";
import { Footer } from "@/components/Footer";
import { SITE_URL, BRAND_NAME } from "@/data/constants";

const Index = (): JSX.Element => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
      }
    }
  }, [hash]);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{`${BRAND_NAME} - Vendor-neutral. Open Source. Community Driven.`}</title>
        <link rel="canonical" href={SITE_URL + "/"} />
        <meta name="description" content="Hands-on challenges with broken Kubernetes clusters, misconfigured pipelines, and invisible failures. Real tools, real scenarios, cloud dev environments." />
        <meta property="og:title" content={`${BRAND_NAME} - Vendor-neutral. Open Source. Community Driven.`} />
        <meta property="og:description" content="Hands-on challenges with broken Kubernetes clusters, misconfigured pipelines, and invisible failures. Real tools, real scenarios, cloud dev environments." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/`} />
        <meta property="og:image" content={`${SITE_URL}/og.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={`${BRAND_NAME} - Vendor-neutral. Open Source. Community Driven.`} />
        <meta property="og:site_name" content={BRAND_NAME} />
        <meta property="og:locale" content="en_GB" />
        <meta name="twitter:title" content={`${BRAND_NAME} - Vendor-neutral. Open Source. Community Driven.`} />
        <meta name="twitter:description" content="Hands-on challenges with broken Kubernetes clusters, misconfigured pipelines, and invisible failures. Real tools, real scenarios, cloud dev environments." />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`${SITE_URL}/og.png`} />
        <meta name="twitter:image:alt" content={`${BRAND_NAME} - Vendor-neutral. Open Source. Community Driven.`} />
      </Helmet>
      <Navbar />
      <main id="main-content">
        <Hero />
        <ChallengesGrid />
        <section className="bg-primary py-16 px-6 md:px-16">
          <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-background">
              Got an idea<br />for an adventure?
            </h2>
            <div className="flex flex-col gap-4">
              <p className="font-sans text-base leading-relaxed text-background/90">
                Shape what the community learns next. Got a scenario worth exploring? Submit a concept and help it become the next adventure.
              </p>
              <div className="flex gap-3 flex-wrap mt-2">
                <a
                  href="https://github.com/dynatrace-oss/open-ecosystem-challenges/blob/main/docs/contributing/adventure-ideas.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-inverse"
                >
                  Propose an adventure idea <ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
                </a>
              </div>
            </div>
          </div>
        </section>
        <CommunityVoicesSection />
        <ConnectSection />
        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
