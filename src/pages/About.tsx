import type { JSX } from "react";
import type { LinksFunction, MetaFunction } from "react-router";
import { Mail } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AboutSection } from "@/components/AboutSection";
import { BoardSection } from "@/components/BoardSection";
import { ChallengeBuildersSection } from "@/components/ChallengeBuildersSection";
import { BrandStory } from "@/components/BrandStory";
import { BottomCTA } from "@/components/BottomCTA";
import { SITE_URL, BRAND_NAME, CONTACT_EMAIL } from "@/data/constants";
import { buildPageMeta, interBoldPreload } from "@/lib/meta";

export const links: LinksFunction = () => interBoldPreload;

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
      <section
        className="bg-primary pt-32 pb-20 px-6 md:px-16 overflow-hidden min-h-[560px] flex flex-col justify-center bg-[length:8rem] md:bg-[length:12rem]"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}nyx_peek.webp)`, backgroundPosition: '75% bottom', backgroundRepeat: 'no-repeat' }}
      >
        <div className="mx-auto max-w-6xl w-full">
          <div className="max-w-2xl">
            <span className="font-sans text-sm font-medium uppercase tracking-widest text-background/90 block mb-4">
              About
            </span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-primary-foreground mb-5">
              The Home for Open Source Enthusiasts
            </h1>
            <p className="font-sans text-base leading-relaxed text-background/90 max-w-2xl mb-8">
              Our mission, vision, who we're for, and the values that shape everything we build.
            </p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="btn-inverse">
              <span className="inline-flex items-center gap-2"><Mail size={14} aria-hidden="true" /> Contact Us</span>
            </a>
          </div>
        </div>
      </section>
      <AboutSection />
      <BrandStory />
      <BoardSection />
      <ChallengeBuildersSection />
      <BottomCTA />
      </main>
      <Footer />
    </div>
  );
};

export default About;
