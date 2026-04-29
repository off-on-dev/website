import type { JSX } from "react";
import type { MetaFunction } from "react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { BottomCTA } from "@/components/BottomCTA";
import { COMMUNITY_URL, SITE_URL, BRAND_NAME } from "@/data/constants";
import { useTheme } from "@/hooks/useTheme";
import { buildPageMeta } from "@/lib/meta";
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
    description: "Give community members access to tools and platforms for hands-on learning and challenges.",
  },
  {
    title: "Distribution",
    description: "Help spread the word through developer newsletters, event partnerships, or social channels.",
  },
  {
    title: "Adventures and Challenges",
    description: "Sponsor an adventure or challenge and help bring new open source learning content to the community.",
  },
];

export const meta: MetaFunction = () =>
  buildPageMeta({
    title: `Sponsorship and Independence - ${BRAND_NAME}`,
    description: `Find out who supports ${BRAND_NAME}, what sponsorship involves, and how we keep the community vendor-neutral and editorially independent.`,
    url: `${SITE_URL}/sponsors`,
  });

const Sponsors = (): JSX.Element => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content">
      <PageHero
        eyebrow="Sponsors"
        title="Sponsorship and Independence"
        description="Sponsors provide financial support and participate as community members, but do not control editorial direction, content priorities, or governance. This community belongs to its members."
        primaryCta={{ label: <span className="inline-flex items-center gap-2">Get in Touch <ArrowUpRight size={14} aria-hidden="true" /></span>, href: `${COMMUNITY_URL}/groups/moderators`, external: true }}
        secondaryCta={{ label: <span className="inline-flex items-center gap-2">Get Involved <ArrowRight size={14} aria-hidden="true" /></span>, href: COMMUNITY_URL, external: true }}
      />

      <div className="px-6 md:px-16 py-16">
      <div className="mx-auto max-w-6xl">
        {/* Founding Sponsor */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6">Founding Sponsor</h2>
          <div className="grid sm:grid-cols-2 gap-8 items-center">
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
                  className="flex items-center justify-start sm:justify-center opacity-80 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                >
                  {logoSrc ? (
                    <img src={logoSrc} alt={s.name} width={200} height={36} className="h-10 w-auto max-w-full" loading="lazy" />
                  ) : (
                    <span className="text-base font-semibold text-foreground">{s.name}</span>
                  )}
                  <span className="sr-only"> (opens in new tab)</span>
                </a>
              );
            })}
          </div>
        </section>

        {/* Ways to support */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-4">Ways to Support {BRAND_NAME}</h2>
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
          <h2 className="text-2xl font-bold text-foreground mb-4">How We Maintain Trust</h2>
          <ul className="space-y-3">
            {[
              "Sponsors do not control editorial direction, content priorities, or community governance.",
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
      </div>

      <BottomCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Sponsors;
