import type { JSX } from "react";
import type { LinksFunction, MetaFunction } from "react-router";
import { Link } from "react-router";
import { Navbar } from "@/components/Navbar";
import { ArrowUpRight } from "lucide-react";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { BottomCTA } from "@/components/BottomCTA";
import { SectionLabel } from "@/components/SectionLabel";
import { COMMUNITY_URL, SITE_URL, BRAND_NAME, CONTACT_EMAIL } from "@/data/constants";
import { buildPageMeta, interBoldPreload } from "@/lib/meta";

const extLink = "docs-ext-link inline-flex items-center gap-1 underline decoration-2 underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm";

export const links: LinksFunction = () => interBoldPreload;

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: `Handbook - ${BRAND_NAME}`,
    description: `Everything you need to participate in the ${BRAND_NAME} community. Get involved, take on challenges, and find community policies and resources.`,
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
        <div className="max-w-3xl space-y-8">

          {/* Get Involved */}
          <section aria-labelledby="get-involved">
            <SectionLabel>start here</SectionLabel>
            <h2 id="get-involved" className="text-2xl font-bold text-foreground mb-6">Get Involved</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-lg border border-border bg-card flex flex-col gap-3">
                <h3 className="font-semibold text-foreground">Join the Community</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed flex-1">
                  Create your account to access challenges, Q&amp;A, community discussions, and everything else.
                </p>
                <a href={`${COMMUNITY_URL}/signup`} target="_blank" rel="noopener noreferrer" className={extLink}>
                  Create an account <ArrowUpRight size={13} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
                </a>
              </div>

              <div className="p-5 rounded-lg border border-border bg-card flex flex-col gap-3">
                <h3 className="font-semibold text-foreground">Introduce Yourself</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed flex-1">
                  Say hello and tell the community who you are and what you're working on. It's the first step.
                </p>
                <a href={`${COMMUNITY_URL}/c/general/introductions/18`} target="_blank" rel="noopener noreferrer" className={extLink}>
                  Say hello <ArrowUpRight size={13} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
                </a>
              </div>

              <div className="p-5 rounded-lg border border-border bg-card flex flex-col gap-3">
                <h3 className="font-semibold text-foreground">Q&amp;A</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed flex-1">
                  Stuck on a technical problem? Post a clear question and get answers from the community. No question is too basic.
                </p>
                <a href={`${COMMUNITY_URL}/c/public-categories/q-a/10`} target="_blank" rel="noopener noreferrer" className={extLink}>
                  Ask a question <ArrowUpRight size={13} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
                </a>
              </div>

              <div className="p-5 rounded-lg border border-border bg-card flex flex-col gap-3">
                <h3 className="font-semibold text-foreground">Community Voices</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed flex-1">
                  Share a tutorial, showcase a project, or write about what you've learned. Every contribution makes the community stronger.
                </p>
                <a href={`${COMMUNITY_URL}/c/community-voices/38`} target="_blank" rel="noopener noreferrer" className={extLink}>
                  Share something <ArrowUpRight size={13} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
                </a>
              </div>
            </div>
          </section>

          {/* Take on a Challenge */}
          <section aria-labelledby="challenges">
            <h2 id="challenges" className="text-2xl font-bold text-foreground mb-5">Take on a Challenge</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-lg border border-border bg-card flex flex-col gap-3">
                <h3 className="font-semibold text-foreground">Learn by Doing</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed flex-1">
                  Hands-on scenarios with broken environments, misconfigured pipelines, and real-world failures to debug and fix. Post your solution and see how others approached it.
                </p>
                <a href={`${COMMUNITY_URL}/c/challenges/11`} target="_blank" rel="noopener noreferrer" className={extLink}>
                  Start a challenge <ArrowUpRight size={13} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
                </a>
              </div>

              <div className="p-5 rounded-lg border border-border bg-card flex flex-col gap-3">
                <h3 className="font-semibold text-foreground">Propose an Adventure Idea</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed flex-1">
                  Bring your expertise and experience. Help build adventures for others to learn from open source tech with a broken scenario, a real-world failure, or a skill gap. Shape the next adventure.
                </p>
                <a href="https://github.com/dynatrace-oss/open-ecosystem-challenges/blob/main/docs/contributing/adventure-ideas.md" target="_blank" rel="noopener noreferrer" className={extLink}>
                  Submit an idea <ArrowUpRight size={13} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
                </a>
              </div>
            </div>
          </section>

          {/* Policies */}
          <section aria-labelledby="policies">
            <h2 id="policies" className="text-2xl font-bold text-foreground mb-4">Policies</h2>
            <ul className="space-y-1.5">
              {[
                { label: "Trust Levels", href: `${COMMUNITY_URL}/t/trust-level-guide/1475` },
                { label: "Questions & Feedback", href: `${COMMUNITY_URL}/t/questions-feedback/34` },
                { label: "Code of Conduct", href: `${COMMUNITY_URL}/t/code-of-conduct/31` },
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
          </section>

          {/* Vendor-agnostic Policy */}
          <section aria-labelledby="vendor-agnostic">
            <h2 id="vendor-agnostic" className="text-2xl font-bold text-foreground mb-3">Vendor-Agnostic Policy</h2>
            <p className="text-base text-[hsl(var(--text-secondary))] leading-relaxed">
              {BRAND_NAME} is vendor-agnostic. Technical product mentions are welcome when neutral and reproducible. Avoid promotional content. Marketing posts will be removed and repeated violations may lead to moderation actions.
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
                For sensitive issues, <Link to="/about#board" className={extLink}>reach out to the board</Link>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                Email <a href={`mailto:${CONTACT_EMAIL}`} className={extLink}>{CONTACT_EMAIL}</a>
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
