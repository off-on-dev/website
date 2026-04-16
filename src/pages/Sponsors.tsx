import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Helmet } from "react-helmet-async";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { BottomCTA } from "@/components/BottomCTA";
import { COMMUNITY_URL, SITE_URL, BRAND_NAME } from "@/data/constants";
import { useTheme } from "@/hooks/useTheme";
import dtLogoDark from "@/assets/Dynatrace_Logo_color_negative_horizontal.svg";
import dtLogoLight from "@/assets/Dynatrace_Logo_color_positive_horizontal.svg";

type Sponsor = {
  name: string;
  url: string;
  logoDark?: string;
  logoLight?: string;
};

const currentSponsors: Sponsor[] = [
  {
    name: "Dynatrace",
    url: "https://dynatrace.com",
    logoDark: dtLogoDark,
    logoLight: dtLogoLight,
  },
];

const supportWays = [
  {
    title: "Swag",
    description: "Provide swag for community members and event attendees.",
  },
  {
    title: "Software Licenses",
    description: "Offer software licenses for open source contributors.",
  },
  {
    title: "Distribution",
    description: "Act as a distribution partner to help reach more developers.",
  },
  {
    title: "Adventures and Challenges",
    description: "Sponsor specific adventures or challenges.",
  },
];

const Sponsors = (): JSX.Element => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{`Sponsors - ${BRAND_NAME}`}</title>
        <link rel="canonical" href={SITE_URL + "/sponsors"} />
        <meta name="description" content={`See how sponsorship supports ${BRAND_NAME} while the community remains independent, vendor-neutral, and member-driven.`} />
        <meta property="og:title" content={`Sponsors - ${BRAND_NAME}`} />
        <meta property="og:description" content={`See how sponsorship supports ${BRAND_NAME} while the community remains independent, vendor-neutral, and member-driven.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/sponsors`} />
        <meta property="og:image" content={`${SITE_URL}/og.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={`Sponsors - ${BRAND_NAME}`} />
        <meta property="og:site_name" content={BRAND_NAME} />
        <meta property="og:locale" content="en_GB" />
        <meta name="twitter:title" content={`Sponsors - ${BRAND_NAME}`} />
        <meta name="twitter:description" content={`See how sponsorship supports ${BRAND_NAME} while the community remains independent, vendor-neutral, and member-driven.`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`${SITE_URL}/og.png`} />
        <meta name="twitter:image:alt" content={`Sponsors - ${BRAND_NAME}`} />
      </Helmet>
      <Navbar />
      <main id="main-content">
      <PageHero
        eyebrow="Sponsors"
        title="Sponsorship and Independence"
        description="Sponsors provide financial support and participate as community members, but do not control technical direction, content priorities, or governance. This community belongs to its members."
        primaryCta={{ label: <span className="inline-flex items-center gap-2">Get in touch <ArrowUpRight size={14} aria-hidden="true" /></span>, href: `${COMMUNITY_URL}/groups/moderators`, external: true }}
        secondaryCta={{ label: <span className="inline-flex items-center gap-2">Join the community <ArrowRight size={14} aria-hidden="true" /></span>, href: COMMUNITY_URL, external: true }}
      />

      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Founding Sponsor */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-primary mb-8">Founding Sponsor</h2>
          <div className="flex flex-col sm:flex-row items-start gap-8">
            <p className="text-muted-foreground leading-relaxed">
              Dynatrace is the founding sponsor of {BRAND_NAME}. There is Dynatrace-related content in one dedicated category which you can choose to join, but the rest of the content is vendor-neutral and community-driven.
            </p>
            {currentSponsors.map((s) => {
              const logoSrc = s.logoDark && s.logoLight
                ? (theme === "dark" ? s.logoDark : s.logoLight)
                : null;
              return (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-glow shrink-0 flex items-center justify-center rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] px-8 py-6 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
                >
                  {logoSrc ? (
                    <img src={logoSrc} alt={s.name} width={240} height={43} className="h-10 w-auto" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-lg font-bold text-primary">
                      {s.name[0]}
                    </div>
                  )}
                  <span className="sr-only"> (opens in new tab)</span>
                </a>
              );
            })}
          </div>
        </section>

        {/* Ways to support */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-primary mb-4">Ways to Support {BRAND_NAME}</h2>
          <p className="text-muted-foreground leading-relaxed mb-8 max-w-2xl">
            There are multiple ways organisations can get involved with the {BRAND_NAME} community, beyond financial sponsorship.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {supportWays.map((way) => (
              <div
                key={way.title}
                className="card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-6"
              >
                <h3 className="text-lg font-semibold text-foreground mb-2">{way.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{way.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Independence note */}
        <section className="card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-8">
          <h2 className="text-2xl font-bold text-primary mb-4">How We Maintain Trust</h2>
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
      </main>
      <Footer />
    </div>
  );
};

export default Sponsors;
