import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AboutSection } from "@/components/AboutSection";
import { PageHero } from "@/components/PageHero";
import { BottomCTA } from "@/components/BottomCTA";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageHero
        eyebrow="About"
        title="Creating the contributors and maintainers of tomorrow"
        description="Focused on what matters: helping people grow from curious users to confident contributors, and from contributors to sustainable maintainers. Vendor-neutral. Open source. Community-driven."
        primaryCta={{ label: "Our mission ↓", href: "#about" }}
        secondaryCta={{ label: "Join the community →", href: "https://community.open-ecosystem.com", external: true }}
      />
      <AboutSection />
      <BottomCTA />
      <Footer />
    </div>
  );
};

export default About;
