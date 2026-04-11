import { Navbar } from "@/components/Navbar";
import { Helmet } from "react-helmet-async";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { PageHero } from "@/components/PageHero";
import { BottomCTA } from "@/components/BottomCTA";
import { COMMUNITY_URL } from "@/data/constants";

const sitePages = [
  {
    label: "Community Guide",
    description: "Welcome, quick start, posting guidelines, leaderboards, and contact",
    to: "/docs/community-guide",
    external: false,
  },
];

const forumDocs = [
  { label: "Getting Started", href: `${COMMUNITY_URL}/t/getting-started/36` },
  { label: "What the community is about and who it is for", href: `${COMMUNITY_URL}/t/what-is-the-community-about-and-who-is-it-for/35` },
  { label: "Community Guide (forum)", href: `${COMMUNITY_URL}/t/community-guide/29` },
  { label: "Posting Guidelines", href: `${COMMUNITY_URL}/t/posting-guidelines/30` },
  { label: "Code of Conduct", href: `${COMMUNITY_URL}/t/code-of-conduct/31/1` },
  { label: "Stay in the Loop", href: `${COMMUNITY_URL}/t/stay-in-the-loop/33` },
  { label: "Questions and Feedback", href: `${COMMUNITY_URL}/t/questions-feedback/34` },
  { label: "FAQ and Guidelines", href: `${COMMUNITY_URL}/t/faq-guidelines/4` },
  { label: "Privacy Policy", href: `${COMMUNITY_URL}/t/privacy-policy/22` },
];

const Docs = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Docs - Offon</title>
        <meta name="description" content="Guides for getting started, running challenges, contributing, and everything in between." />
        <meta property="og:title" content="Docs - Offon" />
        <meta property="og:description" content="Guides for getting started, running challenges, contributing, and everything in between." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://off-on-dev.github.io/website/docs" />
        <meta property="og:image" content="https://off-on-dev.github.io/website/og.png" />
        <meta name="twitter:title" content="Docs - Offon" />
        <meta name="twitter:description" content="Guides for getting started, running challenges, contributing, and everything in between." />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://off-on-dev.github.io/website/og.png" />
      </Helmet>
      <Navbar />
      <PageHero
        eyebrow="Documentation"
        title="Documentation"
        description="Guides for getting started, running challenges, contributing, and everything in between."
        primaryCta={{ label: "Browse the community", href: COMMUNITY_URL, external: true }}
        secondaryCta={{ label: "View challenges", href: "/#challenges" }}
      />
      <div className="mx-auto max-w-3xl px-6 py-16">

        {/* Main site docs */}
        <div className="card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-8 mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-1">On this site</h2>
          <p className="text-xs text-muted-foreground font-mono mb-5">Pages built into offon.dev</p>
          <ul className="space-y-3">
            {sitePages.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className="flex items-start gap-3 group">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  <div>
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {item.label}
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Community forum docs */}
        <div className="card-glow rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-8">
          <h2 className="text-lg font-semibold text-foreground mb-1">Community forum docs</h2>
          <p className="text-xs text-muted-foreground font-mono mb-5">Hosted on community.open-ecosystem.com</p>
          <ul className="space-y-3">
            {forumDocs.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  <span className="text-sm text-[hsl(var(--text-secondary))] group-hover:text-primary transition-colors">
                    {item.label}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground shrink-0">↗</span>
                  <span className="sr-only"> (opens in new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

      </div>
      <BottomCTA />
      <Footer />
    </div>
  );
};

export default Docs;
