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
      <CommunityVoicesSection />
      <ConnectSection />
      <BottomCTA />
      <Footer />
    </div>
  );
};

export default Index;
