import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ChallengesGrid } from "@/components/ChallengesGrid";
import { CommunityVoicesSection } from "@/components/CommunityVoicesSection";
import { ConnectSection } from "@/components/ConnectSection";
import { BottomCTA } from "@/components/BottomCTA";
import { Footer } from "@/components/Footer";

const Index = () => {
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
      <Hero />
      <ChallengesGrid />
      <section className="bg-primary py-16 px-6 md:px-16">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-background">
            Got an idea<br />for an adventure?
          </h2>
          <div className="flex flex-col gap-4">
            <p className="font-mono text-sm leading-relaxed text-background/90">
              Adventures are community-shaped. If you have an idea for a hands-on challenge, submit a concept and help decide what the community learns next.
            </p>
            <div className="flex gap-3 flex-wrap mt-2">
              <a
                href="https://github.com/dynatrace-oss/open-ecosystem-challenges/blob/main/docs/contributing/adventure-ideas.md"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-background text-primary font-bold text-sm px-5 py-2.5 rounded-md border-2 border-primary transition-all hover:bg-primary hover:border-primary-foreground hover:text-primary-foreground hover:scale-[1.02] active:scale-[0.97]"
              >
                Propose an adventure idea ↗<span className="sr-only"> (opens in new tab)</span>
              </a>
            </div>
          </div>
        </div>
      </section>
      <CommunityVoicesSection />
      <ConnectSection />
      <BottomCTA />
      <Footer />
    </div>
  );
};

export default Index;
