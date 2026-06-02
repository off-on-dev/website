import type { JSX } from "react";
import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { ExternalLink, Mail } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { BottomCTA } from "@/components/BottomCTA";
import { SectionLabel } from "@/components/SectionLabel";
import { COMMUNITY_URL, SITE_URL, BRAND_NAME, CONTACT_EMAIL } from "@/data/constants";
import { buildPageMeta } from "@/lib/meta";

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: `How to Contribute - ${BRAND_NAME}`,
    description: `You don't need to be a developer to contribute to ${BRAND_NAME}. Discover how writers, advocates, educators, and coders all help the community grow.`,
    url: `${SITE_URL}/contribute`,
  });

const extLink = "docs-ext-link";

const Contribute = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content">
        <PageHero
          eyebrow="Contribute"
          title="Every Contribution Counts"
          description={`You don't need to be a developer to make ${BRAND_NAME} better. Writers, speakers, teachers, advocates, and coders all have a place here.`}
          primaryCta={{
            label: <span className="inline-flex items-center gap-2">Join the Community <ExternalLink size={14} aria-hidden="true" /></span>,
            href: COMMUNITY_URL,
            external: true,
          }}
          secondaryCta={{
            label: <span className="inline-flex items-center gap-2"><Mail size={14} aria-hidden="true" /> Get in Touch</span>,
            href: `mailto:${CONTACT_EMAIL}`,
          }}
        />

        {/* Ways to contribute */}
        <div className="px-6 md:px-16 py-16">
          <div className="mx-auto max-w-6xl">
            <section aria-labelledby="ways-to-contribute">
              <SectionLabel>get involved</SectionLabel>
              <h2 id="ways-to-contribute" className="text-2xl font-bold text-foreground mb-4">How to Get Involved</h2>
              <p className="text-muted-foreground leading-relaxed mb-8 max-w-2xl">
                Open source has always needed more than just code. It needs people who explain, advocate, document, test, and bring others in. Every role matters, and you can start from wherever you are.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="p-5 rounded-lg border border-border bg-card flex flex-col gap-3">
                  <h3 className="font-semibold text-foreground">Join the Conversation</h3>
                  <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed flex-1">
                    Answer questions, help newcomers find their footing, and take part in community discussions. You don't need to be an expert. Sharing your own experience is enough.
                  </p>
                  <a href={`${COMMUNITY_URL}/c/public-categories/q-a/10`} target="_blank" rel="noopener noreferrer" className={extLink}>
                    Explore Q&amp;A <ExternalLink size={12} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
                  </a>
                </div>

                <div className="p-5 rounded-lg border border-border bg-card flex flex-col gap-3">
                  <h3 className="font-semibold text-foreground">Publish in Community Voices</h3>
                  <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed flex-1">
                    Write a tutorial, post a project showcase, or document something you've recently learned. Community Voices is open to everyone, regardless of technical background.
                  </p>
                  <a href={`${COMMUNITY_URL}/c/community-voices/38`} target="_blank" rel="noopener noreferrer" className={extLink}>
                    Post in Community Voices <ExternalLink size={12} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
                  </a>
                </div>

                <div className="p-5 rounded-lg border border-border bg-card flex flex-col gap-3">
                  <h3 className="font-semibold text-foreground">Spread the Word</h3>
                  <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed flex-1">
                    Blog about your open source journey, give a talk at a meetup, start a podcast episode, or mention {BRAND_NAME} to your network. When you do, come back and share it with the community.
                  </p>
                  <a href={`${COMMUNITY_URL}/c/general/introductions/18`} target="_blank" rel="noopener noreferrer" className={extLink}>
                    Introduce yourself <ExternalLink size={12} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
                  </a>
                </div>

                <div className="p-5 rounded-lg border border-border bg-card flex flex-col gap-3">
                  <h3 className="font-semibold text-foreground">Propose an Adventure Idea</h3>
                  <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed flex-1">
                    Got a scenario, failure, or skill gap that would make a great challenge? Submit it as a pull request using the idea template. No code needed. The team reviews and shapes the technical side from there.
                  </p>
                  <a href="https://github.com/off-on-dev/open-source-challenges/blob/main/CONTRIBUTING.md#propose-an-adventure-idea" target="_blank" rel="noopener noreferrer" className={extLink}>
                    Read the adventure ideas guide <ExternalLink size={12} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
                  </a>
                </div>

                <div className="p-5 rounded-lg border border-border bg-card flex flex-col gap-3">
                  <h3 className="font-semibold text-foreground">Fix Bugs and Improve Docs</h3>
                  <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed flex-1">
                    Each adventure has level guides for beginner, intermediate, and expert. Most adventures don't have solution walkthroughs yet — if you've solved a level, writing up how you did it is one of the highest-value contributions you can make. Typos and broken links need no issue, just open a PR.
                  </p>
                  <a href="https://github.com/off-on-dev/open-source-challenges/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer" className={extLink}>
                    See the contributing guide <ExternalLink size={12} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
                  </a>
                </div>

                <div className="p-5 rounded-lg border border-border bg-card flex flex-col gap-3">
                  <h3 className="font-semibold text-foreground">Build a Full Adventure</h3>
                  <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed flex-1">
                    Pick up an approved idea from the issues backlog and implement it: broken environment, level guides, devcontainer, and verification script. Each level ships as its own PR. The contributing guide walks you through every step.
                  </p>
                  <a href="https://github.com/off-on-dev/open-source-challenges/issues?q=is%3Aissue+is%3Aopen+label%3A%22adventure+idea%22" target="_blank" rel="noopener noreferrer" className={extLink}>
                    Browse open adventure ideas <ExternalLink size={12} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
                  </a>
                </div>

              </div>
            </section>
          </div>
        </div>

        {/* Sponsor callout */}
        <div className="bg-card border-y border-[hsl(var(--surface-border))] px-6 md:px-16 py-16">
          <div className="mx-auto max-w-6xl">
            <section aria-labelledby="sponsor-callout">
              <div className="max-w-2xl">
                <SectionLabel>organisations</SectionLabel>
                <h2 id="sponsor-callout" className="text-2xl font-bold text-foreground mb-4">Support the Community as a Sponsor</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  If your organisation wants to invest in the open source ecosystem without commercial strings attached, sponsorship is how you do it. Sponsors provide financial and operational support while the community retains full editorial independence.
                </p>
                <Link to="/sponsors" className="btn-primary">
                  Learn about sponsorship
                </Link>
              </div>
            </section>
          </div>
        </div>

        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Contribute;
