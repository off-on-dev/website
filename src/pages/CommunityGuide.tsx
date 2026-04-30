import type { JSX } from "react";
import type { LinksFunction, MetaFunction } from "react-router";
import { Navbar } from "@/components/Navbar";
import { ArrowUpRight } from "lucide-react";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { BottomCTA } from "@/components/BottomCTA";
import { LinkSection } from "@/components/LinkSection";
import { COMMUNITY_URL, SITE_URL, BRAND_NAME } from "@/data/constants";
import { buildPageMeta } from "@/lib/meta";

const extLink = "docs-ext-link inline-flex items-center gap-1 underline decoration-2 underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm";

export const links: LinksFunction = () => [
  // Inter 700 is the LCP font for the PageHero h1 on this page.
  { rel: "preload", href: `${import.meta.env.BASE_URL}fonts/inter-latin-700-normal.woff2`, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
];

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: `Handbook - ${BRAND_NAME}`,
    description: `Everything you need to participate in the ${BRAND_NAME} community. Getting started, posting guidelines, vendor-agnostic policy, and community challenges.`,
    url: `${SITE_URL}/handbook`,
  });

const CommunityGuide = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content">
      <PageHero
        eyebrow="Handbook"
        title="Everything You Need to Participate"
        description={`Community guidelines, policies, and resources to help get you started and grow in the ${BRAND_NAME} community.`}
        primaryCta={{ label: <span className="inline-flex items-center gap-2">Meet the Community <ArrowUpRight size={14} aria-hidden="true" /></span>, href: COMMUNITY_URL, external: true }}
      />

      <div className="px-6 md:px-16 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl space-y-12">

          {/* Quick Start */}
          <section aria-labelledby="quick-start">
            <h2 id="quick-start" className="text-2xl font-bold text-foreground mb-3">Quick Start</h2>
            <ul className="space-y-2">
              <li>
                <a href={`${COMMUNITY_URL}/t/getting-started-welcome-to-the-open-ecosystem/36`} target="_blank" rel="noopener noreferrer" className={extLink}>
                  Getting started in the {BRAND_NAME} community <ArrowUpRight size={13} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
                </a>
              </li>
            </ul>
          </section>

          {/* Docs */}
          <section aria-labelledby="docs">
            <h2 id="docs" className="text-2xl font-bold text-foreground mb-5">Docs</h2>
            <div className="space-y-6">
              <LinkSection
                heading="Participation"
                links={[
                  { label: "Categories", href: `${COMMUNITY_URL}/categories` },
                  { label: "Posting Guidelines", href: `${COMMUNITY_URL}/t/posting-guidelines/30` },
                  { label: "Stay in the Loop", href: `${COMMUNITY_URL}/t/stay-in-the-loop/33` },
                  { label: "Questions & Feedback", href: `${COMMUNITY_URL}/t/questions-feedback/34` },
                ]}
              />
              <LinkSection
                heading="Policies"
                links={[
                  { label: "Code of Conduct", href: `${COMMUNITY_URL}/t/code-of-conduct/31` },
                  { label: "FAQ and Guidelines", href: `${COMMUNITY_URL}/t/faq-guidelines/4` },
                  { label: "Community Privacy Policy", href: `${COMMUNITY_URL}/t/privacy-policy/22` },
                ]}
              />
              <LinkSection
                heading="Challenges"
                links={[
                  { label: "Browse Adventures", href: `${COMMUNITY_URL}/c/challenges/11` },
                  { label: "Propose an Adventure Idea", href: "https://github.com/dynatrace-oss/open-ecosystem-challenges/blob/main/docs/contributing/adventure-ideas.md" },
                ]}
              />
            </div>
          </section>

          {/* Vendor-agnostic Policy */}
          <section aria-labelledby="vendor-agnostic">
            <h2 id="vendor-agnostic" className="text-2xl font-bold text-foreground mb-3">Vendor-Agnostic Policy</h2>
            <p className="text-base text-[hsl(var(--text-secondary))] leading-relaxed">
              {BRAND_NAME} is vendor-agnostic. Technical product mentions are welcome when neutral and reproducible. Avoid promotional content. Marketing posts will be removed and repeated violations may lead to moderation actions. See{" "}
              <a href={`${COMMUNITY_URL}/t/posting-guidelines/30`} target="_blank" rel="noopener noreferrer" className={extLink}>
                Posting Guidelines <ArrowUpRight size={13} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
              </a>.
            </p>
          </section>

          {/* Contact */}
          <section aria-labelledby="contact">
            <h2 id="contact" className="text-2xl font-bold text-foreground mb-3">Contact</h2>
            <ul className="space-y-2 text-sm text-[hsl(var(--text-secondary))]">
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                Flag posts that violate policy using the flag button on any post
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                DM{" "}
                <a href={`${COMMUNITY_URL}/groups/moderators`} target="_blank" rel="noopener noreferrer" className={extLink}>
                  @moderators <ArrowUpRight size={13} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
                </a>{" "}
                for sensitive issues
              </li>
            </ul>
          </section>

        </div>

      </div>
      </div>
      <BottomCTA />
      </main>
      <Footer />
    </div>
  );
};

export default CommunityGuide;
