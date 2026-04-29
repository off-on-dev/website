import type { JSX } from "react";
import type { MetaFunction } from "react-router";
import { Navbar } from "@/components/Navbar";
import { ArrowUpRight } from "lucide-react";
import { Footer } from "@/components/Footer";
import { COMMUNITY_URL, SITE_URL, BRAND_NAME } from "@/data/constants";
import { buildPageMeta } from "@/lib/meta";

const extLink = "docs-ext-link inline-flex items-center gap-1 underline decoration-2 underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm";

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: `Handbook - ${BRAND_NAME}`,
    description: `Everything you need to participate and grow in the ${BRAND_NAME} community: quick start, docs, policies, and how to get involved.`,
    url: `${SITE_URL}/handbook`,
  });

const CommunityGuide = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content" className="mx-auto max-w-3xl px-6 pt-28 pb-24">

        <span className="section-label font-sans text-sm font-medium uppercase tracking-widest text-primary">Handbook</span>
        <h1 className="mt-3 text-4xl font-bold text-foreground md:text-5xl">
          Handbook
        </h1>
        <p className="mt-5 text-lg text-[hsl(var(--text-secondary))] leading-relaxed">
          Everything you need to get started, participate, and grow in the {BRAND_NAME} community.
        </p>

        <div className="mt-12 space-y-12">

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

              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">Participation</h3>
                <ul className="space-y-1.5">
                  {[
                    { label: "Categories", href: `${COMMUNITY_URL}/categories` },
                    { label: "Posting Guidelines", href: `${COMMUNITY_URL}/t/posting-guidelines/30` },
                    { label: "Stay in the Loop", href: `${COMMUNITY_URL}/t/stay-in-the-loop/33` },
                    { label: "Questions & Feedback", href: `${COMMUNITY_URL}/t/questions-feedback/34` },
                  ].map((item) => (
                    <li key={item.label} className="flex items-center gap-2.5 text-sm">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                      <a href={item.href} target="_blank" rel="noopener noreferrer" className={extLink}>
                        {item.label} <ArrowUpRight size={12} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">Policies</h3>
                <ul className="space-y-1.5">
                  {[
                    { label: "Code of Conduct", href: `${COMMUNITY_URL}/t/code-of-conduct/31` },
                    { label: "FAQ and Guidelines", href: `${COMMUNITY_URL}/t/faq-guidelines/4` },
                    { label: "Privacy Policy", href: `${COMMUNITY_URL}/t/privacy-policy/22` },
                  ].map((item) => (
                    <li key={item.label} className="flex items-center gap-2.5 text-sm">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                      <a href={item.href} target="_blank" rel="noopener noreferrer" className={extLink}>
                        {item.label} <ArrowUpRight size={12} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">Challenges</h3>
                <ul className="space-y-1.5">
                  {[
                    { label: "Browse adventures", href: `${COMMUNITY_URL}/c/challenges/11` },
                    { label: "Propose an adventure idea", href: "https://github.com/dynatrace-oss/open-ecosystem-challenges/blob/main/docs/contributing/adventure-ideas.md" },
                  ].map((item) => (
                    <li key={item.label} className="flex items-center gap-2.5 text-sm">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                      <a href={item.href} target="_blank" rel="noopener noreferrer" className={extLink}>
                        {item.label} <ArrowUpRight size={12} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </section>

          {/* Vendor-agnostic Policy */}
          <section aria-labelledby="vendor-agnostic">
            <h2 id="vendor-agnostic" className="text-2xl font-bold text-foreground mb-3">Vendor-agnostic Policy</h2>
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

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-[hsl(var(--surface-border))]">
          <a href={COMMUNITY_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">
            Open the community <ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
          </a>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default CommunityGuide;
