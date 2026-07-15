import type { JSX } from "react";
import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { ExternalLink } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { BottomCTA } from "@/components/BottomCTA";
import { SectionLabel } from "@/components/SectionLabel";
import { COMMUNITY_URL, SITE_URL, BRAND_NAME, CONTACT_EMAIL, LINKEDIN_URL, BLUESKY_URL, X_URL } from "@/data/constants";
import { Abbr } from "@/components/Abbr";
import { buildPageMeta } from "@/lib/meta";

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: `How to Contribute - ${BRAND_NAME}`,
    description: `From code and content to community discussion and advocacy, there are many ways to contribute to ${BRAND_NAME}. Find the path that fits you.`,
    url: `${SITE_URL}/contribute`,
  });

const extLink = "docs-ext-link";

const Contribute = (): JSX.Element => {
  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <PageHero
          eyebrow="Contribute"
          title="Every Contribution Counts"
          description={`${BRAND_NAME} is built by the community, for the community. Whether you code, write, teach, or advocate, your work moves the community forward.`}
          primaryCta={{
            label: <span className="inline-flex items-center gap-2">Join the Community <ExternalLink size={14} aria-hidden="true" /></span>,
            href: COMMUNITY_URL,
            external: true,
          }}
        />

        {/* Ways to contribute */}
        <div className="px-6 md:px-16 py-16">
          <div className="mx-auto max-w-6xl">
            <section aria-labelledby="ways-to-contribute">
              <SectionLabel>get involved</SectionLabel>
              <h2 id="ways-to-contribute" className="text-2xl font-bold text-foreground mb-4">How to Get Involved</h2>
              <p className="text-muted-foreground leading-relaxed mb-8 max-w-2xl">
                Explore the platform, play an adventure, join discussions, follow the weekly digest, shape or build a challenge, improve the docs, or spread the word. Every action here is a genuine contribution.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Row 1: discover, learn */}
                <div className="p-5 rounded-lg border border-border bg-card flex flex-col gap-3">
                  <h3 className="font-semibold text-foreground">Explore {BRAND_NAME}</h3>
                  <p className="text-sm text-dim leading-relaxed flex-1">
                    Browse the forum, see what the community is building, and sign up to get started. Introduce yourself and get a feel for how {BRAND_NAME} works.
                  </p>
                  <a href={`${COMMUNITY_URL}/signup`} target="_blank" rel="noopener noreferrer" className={extLink}>
                    Create an account <ExternalLink size={12} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
                  </a>
                </div>

                <div className="p-5 rounded-lg border border-border bg-card flex flex-col gap-3">
                  <h3 className="font-semibold text-foreground">Play an Adventure</h3>
                  <p className="text-sm text-dim leading-relaxed flex-1">
                    Take on a hands-on challenge, debug a broken environment, and learn by doing. Tell us what worked, what confused you, and where you got stuck. Your experience helps us improve the challenges.
                  </p>
                  <Link to="/challenges/" className={extLink}>
                    Browse challenges
                  </Link>
                </div>

                {/* Row 2: shape, engage */}
                <div className="p-5 rounded-lg border border-border bg-card flex flex-col gap-3">
                  <h3 className="font-semibold text-foreground">Shape the Challenges</h3>
                  <p className="text-sm text-dim leading-relaxed flex-1">
                    Have a scenario that would make a great challenge? Submit your idea on GitHub. Ready to go further? Pick up an approved idea and implement the full adventure.
                  </p>
                  <a href="https://github.com/off-on-dev/open-source-challenges/blob/main/CONTRIBUTING.md#propose-an-adventure-idea" target="_blank" rel="noopener noreferrer" className={extLink}>
                    Read the adventure ideas guide <ExternalLink size={12} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
                  </a>
                  <a href="https://github.com/off-on-dev/open-source-challenges/issues?q=is%3Aissue+is%3Aopen+label%3A%22adventure+idea%22" target="_blank" rel="noopener noreferrer" className={extLink}>
                    Browse open adventure ideas <ExternalLink size={12} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
                  </a>
                </div>

                <div className="p-5 rounded-lg border border-border bg-card flex flex-col gap-3">
                  <h3 className="font-semibold text-foreground">Join the Conversation</h3>
                  <p className="text-sm text-dim leading-relaxed flex-1">
                    <a href={`${COMMUNITY_URL}/c/public-categories/q-a/10`} target="_blank" rel="noopener noreferrer" className={extLink}>Ask a question <ExternalLink size={12} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span></a>{" "}or answer one, take part in discussions, and support newcomers getting started. Share tutorials, post tips, and write about what you have learned. Introduce the community to open source tools you use or maintain.
                  </p>
                  <a href={`${COMMUNITY_URL}/c/community-voices/38`} target="_blank" rel="noopener noreferrer" className={extLink}>
                    Post in Community Voices <ExternalLink size={12} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
                  </a>
                </div>

                {/* Row 3: stay informed, local community */}
                <div className="p-5 rounded-lg border border-border bg-card flex flex-col gap-3">
                  <h3 className="font-semibold text-foreground">Follow the Weekly Digest</h3>
                  <p className="text-sm text-dim leading-relaxed flex-1">
                    Stay up to date with what is happening across the open source community. Answer the question of the week and tell us what topics you would like to see covered next.
                  </p>
                  <a href={`${COMMUNITY_URL}/tag/weekly-digest/95`} target="_blank" rel="noopener noreferrer" className={extLink}>
                    Read the weekly digest <ExternalLink size={12} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
                  </a>
                </div>

                <div className="p-5 rounded-lg border border-border bg-card flex flex-col gap-3">
                  <h3 className="font-semibold text-foreground">Meetups and Groups</h3>
                  <p className="text-sm text-dim leading-relaxed flex-1">
                    Running a local meetup, user group, or open source community? Use {BRAND_NAME} as a vendor-agnostic home for your discussions and announcements. Find existing groups, join as a speaker, or bring open source to your local community.
                  </p>
                  <a href={`${COMMUNITY_URL}/c/local-meetups-and-groups/19`} target="_blank" rel="noopener noreferrer" className={extLink}>
                    Explore meetups and groups <ExternalLink size={12} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
                  </a>
                </div>

                {/* Row 4: advocate, improve */}
                <div className="p-5 rounded-lg border border-border bg-card flex flex-col gap-3">
                  <h3 className="font-semibold text-foreground">Spread the Word</h3>
                  <p className="text-sm text-dim leading-relaxed flex-1">
                    Follow us, repost what we share, and mention {BRAND_NAME} to your network. Writing about us in a blog post or podcast episode? <a href={`mailto:${CONTACT_EMAIL}`} className={extLink}>Share it with us by email</a> or mention us on social media and we would love to repost.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn (opens in new tab)" className="social-icon-link">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="w-4 h-4" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                    <a href={BLUESKY_URL} target="_blank" rel="noopener noreferrer" aria-label="Bluesky (opens in new tab)" className="social-icon-link">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="w-4 h-4" fill="currentColor">
                        <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.479 0-.689-.139-1.861-.902-2.203-.659-.299-1.664-.621-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z" />
                      </svg>
                    </a>
                    <a href={X_URL} target="_blank" rel="noopener noreferrer" aria-label="X / Twitter (opens in new tab)" className="social-icon-link">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="w-4 h-4" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                  </div>
                </div>

                <div className="p-5 rounded-lg border border-border bg-card flex flex-col gap-3">
                  <h3 className="font-semibold text-foreground">Fix Bugs and Improve Docs</h3>
                  <p className="text-sm text-dim leading-relaxed flex-1">
                    Each adventure has level guides and missing solution walkthroughs. If you have solved a level, write it up. You can also improve this website by reporting an issue or contributing to the site. Typos and broken links across either repo need no issue, just open a <Abbr title="pull request">PR</Abbr>.
                  </p>
                  <a href="https://github.com/off-on-dev/open-source-challenges/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer" className={extLink}>
                    See the challenges contributing guide <ExternalLink size={12} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
                  </a>
                  <a href="https://github.com/off-on-dev/website/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer" className={extLink}>
                    Contribute to the website <ExternalLink size={12} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
                  </a>
                </div>

              </div>
            </section>

            <div className="mt-8">
              <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                <span className="font-medium text-foreground">This site is a community project too.</span>{" "}
                Found a gap or something that could work better? Your feedback shapes what we build next.
              </p>
              <div className="flex flex-col gap-1.5">
                <a href={`${COMMUNITY_URL}/c/general/site-feedback/2`} target="_blank" rel="noopener noreferrer" className={extLink}>
                  Post in Site Feedback <ExternalLink size={12} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
                </a>
                <a href="https://github.com/off-on-dev/website/issues" target="_blank" rel="noopener noreferrer" className={extLink}>
                  Open a GitHub issue <ExternalLink size={12} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Sponsor callout */}
        <div className="bg-card border-y border-border px-6 md:px-16 py-16">
          <div className="mx-auto max-w-6xl">
            <section aria-labelledby="sponsor-callout">
              <div className="max-w-2xl">
                <SectionLabel>organisations</SectionLabel>
                <h2 id="sponsor-callout" className="text-2xl font-bold text-foreground mb-4">Support the Community as a Sponsor</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  If your organisation wants to invest in the open source ecosystem without commercial strings attached, sponsorship is how you do it. Sponsors provide financial and operational support while the community retains full editorial independence.
                </p>
                <Link to="/sponsors#becoming-a-sponsor" className="btn-primary">
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
