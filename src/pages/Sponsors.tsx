import { Navbar } from "@/components/Navbar";
import { Helmet } from "react-helmet-async";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { BottomCTA } from "@/components/BottomCTA";
import { COMMUNITY_URL, SITE_URL, BRAND_NAME } from "@/data/constants";

const currentSponsors = [
  { name: "Dynatrace", role: "Founding Sponsor", url: "https://dynatrace.com" },
];

const Sponsors = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{`Sponsors - ${BRAND_NAME}`}</title>
        <link rel="canonical" href={SITE_URL + "/sponsors"} />
        <meta name="description" content="Sponsors provide financial support and participate as community members, but do not control technical direction or governance." />
        <meta property="og:title" content={`Sponsors - ${BRAND_NAME}`} />
        <meta property="og:description" content="Sponsors provide financial support and participate as community members, but do not control technical direction or governance." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/sponsors`} />
        <meta property="og:image" content={`${SITE_URL}/og.png`} />
        <meta name="twitter:title" content={`Sponsors - ${BRAND_NAME}`} />
        <meta name="twitter:description" content="Sponsors provide financial support and participate as community members, but do not control technical direction or governance." />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`${SITE_URL}/og.png`} />
      </Helmet>
      <Navbar />
      <PageHero
        eyebrow="Sponsors"
        title="Sponsorship and Independence"
        description="Sponsors provide financial support and participate as community members, but do not control technical direction, content priorities, or governance. This community belongs to its members."
        primaryCta={{ label: "Get in touch →", href: `${COMMUNITY_URL}/groups/moderators`, external: true }}
        secondaryCta={{ label: "Join the community →", href: COMMUNITY_URL, external: true }}
      />

      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Founding Sponsor */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-primary mb-4">Founding Sponsor</h2>
          <p className="text-muted-foreground leading-relaxed mb-8 max-w-2xl">
            Dynatrace is the founding sponsor of Open Ecosystem. There is Dynatrace-related content in one dedicated category which you can choose to join, but the rest of the content is vendor-neutral and community-driven.
          </p>
          <div className="flex flex-wrap gap-5">
            {currentSponsors.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card-glow flex items-center gap-4 rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-lg font-bold text-primary">
                  {s.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{s.role}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Independence note */}
        <section className="card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-8">
          <h2 className="text-xl font-bold text-primary mb-4">How We Maintain Trust</h2>
          <ul className="space-y-3">
            {[
              "Sponsors do not control technical direction, content priorities, or community governance.",
              "Promotional content is not permitted. Technical product mentions are welcome only when neutral and reproducible.",
              "Our moderation policies and decision-making processes are documented and accessible.",
              "Community input directly shapes how we evolve.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <BottomCTA />
      <Footer />
    </div>
  );
};

export default Sponsors;
