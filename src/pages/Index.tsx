import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { StatsBar } from "@/components/StatsBar";
import { ToolsMarquee } from "@/components/ToolsMarquee";
import { HowItWorks } from "@/components/HowItWorks";
import { ChallengesGrid } from "@/components/ChallengesGrid";
import { CommunitySection } from "@/components/CommunitySection";
import { BottomCTA } from "@/components/BottomCTA";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <StatsBar />
      <ToolsMarquee />
      <HowItWorks />
      <ChallengesGrid />
      <CommunitySection />
      <BottomCTA />
      <Footer />
    </div>
  );
};

export default Index;
