import type { JSX } from "react";
import type { MetaFunction } from "react-router";
import { ExternalLink, Mail } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { BottomCTA } from "@/components/BottomCTA";
import { BulletList } from "@/components/BulletList";
import { COMMUNITY_URL, SITE_URL, BRAND_NAME, CONTACT_EMAIL } from "@/data/constants";
import { SPONSORS, SUPPORT_WAYS } from "@/data/sponsors";
import { useTheme } from "@/hooks/useTheme";
import { buildPageMeta } from "@/lib/meta";

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: `Sponsorship and Independence - ${BRAND_NAME}`,
    description: `Find out who supports ${BRAND_NAME}, what sponsorship involves, and how we keep the community vendor-neutral and editorially independent.`,
    url: `${SITE_URL}/sponsors`,
  });

const Sponsors = (): JSX.Element => {
  const { theme } = useTheme();

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main id="main-content" tabIndex={-1}>
      <PageHero
        eyebrow="Sponsors"
        title="Sponsorship and Independence"
        description="Sponsors provide financial support and participate as community members, but do not control editorial direction, content priorities, or governance. This community belongs to its members."
        primaryCta={{ label: <span className="inline-flex items-center gap-2"><Mail size={14} aria-hidden="true" /> Become a Sponsor</span>, href: `mailto:${CONTACT_EMAIL}` }}
        secondaryCta={{ label: <span className="inline-flex items-center gap-2">Join the Community <ExternalLink size={14} aria-hidden="true" /></span>, href: COMMUNITY_URL, external: true }}
      />

      <div className="px-6 md:px-16 py-16">
        <div className="mx-auto max-w-6xl">
          {/* Founding Sponsor */}
          <section aria-labelledby="founding-sponsor">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <h2 id="founding-sponsor" className="text-2xl font-bold text-foreground">Founding Sponsor</h2>
              <div>
                {SPONSORS.map((sponsor) => {
                  const logoSrc = sponsor.logoDark && sponsor.logoLight
                    ? (theme === "dark" ? sponsor.logoDark : sponsor.logoLight)
                    : null;
                  return (
                    <a
                      key={sponsor.name}
                      href={sponsor.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center focus-ring rounded-sm"
                    >
                      {logoSrc ? (
                        <img src={logoSrc} alt={sponsor.name} width={200} height={36} className="h-10 w-auto max-w-full group-hover:opacity-80 transition-opacity" loading="lazy" decoding="async" />
                      ) : (
                        <span className="text-base font-semibold text-foreground group-hover:text-foreground/80 transition-colors">{sponsor.name}</span>
                      )}
                      <span className="sr-only"> (opens in new tab)</span>
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 max-w-2xl mb-8">
              <p className="text-muted-foreground leading-relaxed">
                Dynatrace's roots, like much of modern software, are deeply tied to open source. The company builds on it, contributes to it, and depends on the long-term health of the open source ecosystem. Sponsoring {BRAND_NAME} is a way of giving back to that ecosystem in a form that is genuinely useful to the people who sustain it: individual contributors and maintainers.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Most corporate open source investment today flows toward foundations, enterprise programs, and large strategic projects. Far less of it reaches the individuals who write the code, maintain the projects, mentor new contributors, and keep open source alive day to day.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Dynatrace sponsors {BRAND_NAME} because supporting the people behind open source is not a marketing exercise. It is part of being a responsible participant in the ecosystem we all rely on.
              </p>
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-3">What Dynatrace Provides</h3>
            <div className="max-w-2xl mb-8">
              <BulletList
                marker="check"
                spacing="loose"
                items={[
                  "Funding to keep the platform running and accessible",
                  "Engineering and developer advocacy time from individuals who take part as community members",
                  "Infrastructure, tooling, and operational support where useful",
                  "Visibility through Dynatrace's own channels, when it helps the community rather than the company",
                ]}
              />
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-3">What Dynatrace Does Not Do</h3>
            <div className="max-w-2xl mb-8">
              <BulletList
                marker="x"
                spacing="loose"
                items={[
                  `Use ${BRAND_NAME} as a sales, marketing, or lead generation channel`,
                  `Promote Dynatrace products, launches, or campaigns through ${BRAND_NAME}`,
                  "Gate content, learning paths, or contributor opportunities behind any commercial relationship",
                ]}
              />
            </div>

            <p className="text-muted-foreground leading-relaxed max-w-2xl">
              {BRAND_NAME} is not a Dynatrace property dressed up as a community. It is a vendor-neutral space that Dynatrace helps fund because the work matters.
            </p>
          </section>
        </div>
      </div>

      {/* How Sponsorship Works */}
      <div className="bg-card border-y border-border px-6 md:px-16 py-16">
        <div className="mx-auto max-w-6xl">
          <section aria-labelledby="how-sponsorship-works">
            <h2 id="how-sponsorship-works" className="text-2xl font-bold text-foreground mb-4">How Sponsorship Works</h2>
            <p className="text-muted-foreground leading-relaxed mb-8 max-w-2xl">
              Sponsorship at {BRAND_NAME} is a partnership. The boundaries are clear, our policies are public, and community input shapes how we evolve.
            </p>

            <h3 className="text-lg font-semibold text-foreground mb-3">What Sponsors Receive</h3>
            <div className="max-w-2xl mb-8">
              <BulletList
                marker="check"
                spacing="loose"
                items={[
                  "Your logo and link featured on this page",
                  "Quarterly social posts thanking you for your support",
                  "Recognition of your contributions in our weekly community digest",
                  "The opportunity to support specific initiatives, such as challenges, events, or learning paths",
                  `A direct line to the ${BRAND_NAME} team for coordination and collaboration`,
                ]}
              />
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-3">What We Ask in Return</h3>
            <div className="max-w-2xl mb-8">
              <BulletList
                marker="check"
                spacing="loose"
                items={[
                  "Respect for our community guidelines and code of conduct",
                  "Restraint on promotional content. Technical mentions are welcome only when vendor-neutral and reproducible",
                  "Engagement as a community member, not as a marketing presence",
                ]}
              />
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-3">What Sponsorship Does Not Include</h3>
            <div className="max-w-2xl mb-8">
              <BulletList
                marker="x"
                spacing="loose"
                items={[
                  "Editorial control over challenges, content, or community direction",
                  "Voting power in governance decisions",
                  "Influence over moderation or community policies",
                  "Access to community member data for marketing or sales purposes",
                  "Exclusivity over topics, technologies, or audience segments",
                ]}
              />
            </div>

            <p className="text-muted-foreground leading-relaxed max-w-2xl">
              Sponsors enable the work; they do not direct it.
            </p>
          </section>
        </div>
      </div>

      {/* Becoming a Sponsor */}
      <div className="px-6 md:px-16 py-16">
        <div className="mx-auto max-w-6xl">
          <section aria-labelledby="becoming-a-sponsor">
            <h2 id="becoming-a-sponsor" className="text-2xl font-bold text-foreground mb-4">Becoming a Sponsor</h2>
            <p className="text-muted-foreground leading-relaxed mb-8 max-w-2xl">
              {BRAND_NAME} welcomes additional sponsors who share this model. If your organisation wants to support open source contributors and maintainers without attaching commercial expectations, we would like to hear from you.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 mb-8">
              {SUPPORT_WAYS.map((way) => (
                <div
                  key={way.title}
                  className="card-glow rounded-xl border border-border bg-[hsl(var(--surface))] p-6"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-2">{way.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{way.description}</p>
                </div>
              ))}
            </div>
            <a href={`mailto:${CONTACT_EMAIL}`} className="btn-primary">
              <Mail size={14} aria-hidden="true" />
              Get in Touch
            </a>
          </section>
        </div>
      </div>

      <BottomCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Sponsors;
