import { useEffect, type JSX } from "react";
import { useLocation } from "react-router";
import type { MetaFunction } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ChallengesGrid } from "@/components/ChallengesGrid";
import { CommunityVoicesSection } from "@/components/CommunityVoicesSection";
import { ConnectSection } from "@/components/ConnectSection";
import { BottomCTA } from "@/components/BottomCTA";
import { Footer } from "@/components/Footer";
import { SITE_URL, BRAND_NAME } from "@/data/constants";

export const meta: MetaFunction = () => {
  const pageTitle = `${BRAND_NAME} - Vendor-neutral. Open Source. Community Driven.`;
  const desc = "A welcoming open source community. Learn through hands-on challenges to build skills. Share expertise and projects. Ask for help anytime.";
  return [
    { title: pageTitle },
    { tagName: "link", rel: "canonical", href: `${SITE_URL}/` },
    { name: "description", content: desc },
    { property: "og:title", content: pageTitle },
    { property: "og:description", content: desc },
    { property: "og:type", content: "website" },
    { property: "og:url", content: `${SITE_URL}/` },
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
      <Navbar />
      <main id="main-content">
        <Hero />
        <ChallengesGrid />
        <section className="bg-primary py-16 px-6 md:px-16">
          <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-background">
              <span className="block">Got an idea</span>
              <span className="block">for an adventure?</span>
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
