import { Navbar } from "@/components/Navbar";
import { Helmet } from "react-helmet-async";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { COMMUNITY_URL } from "@/data/constants";

const CommunityGuide = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Community Guide - Offon Docs</title>
        <meta name="description" content="Welcome, quick start, posting guidelines, leaderboards, and contact for the Offon community." />
        <meta property="og:title" content="Community Guide - Offon Docs" />
        <meta property="og:description" content="Welcome, quick start, posting guidelines, leaderboards, and contact for the Offon community." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://off-on-dev.github.io/website/docs/community-guide" />
        <meta property="og:image" content="https://off-on-dev.github.io/website/og.png" />
        <meta name="twitter:title" content="Community Guide - Offon Docs" />
        <meta name="twitter:description" content="Welcome, quick start, posting guidelines, leaderboards, and contact for the Offon community." />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://off-on-dev.github.io/website/og.png" />
      </Helmet>
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 pt-28 pb-24">

        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-sm text-[hsl(var(--text-faint))]">
          <Link to="/docs" className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1 rounded-sm">Docs</Link>
          <span aria-hidden="true">/</span>
          <span className="text-[hsl(var(--text-secondary))]">Community Guide</span>
        </div>

        <span className="font-mono text-xs font-medium uppercase tracking-widest text-primary">Community Guide</span>
        <h1 className="mt-3 text-4xl font-bold text-foreground md:text-5xl">
          Community Guide
        </h1>
        <p className="mt-5 text-lg text-[hsl(var(--text-secondary))] leading-relaxed">
          A practical, friendly space for builders working with open standards and cloud-native tools. We focus on reproducible, hands-on knowledge: tutorials, Q&A with accepted solutions, and recurring challenges.
        </p>

        <div className="mt-12 space-y-10">

          {/* Quick start */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Quick start</h2>
            <ul className="space-y-2">
              <li>
                <a href={`${COMMUNITY_URL}/t/what-is-the-community-about-and-who-is-it-for/35`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1 rounded-sm">
                  What the community is about, and who it's for →
                </a>
              </li>
              <li>
                <a href={`${COMMUNITY_URL}/t/getting-started/36`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1 rounded-sm">
                  Getting started in the community →
                </a>
              </li>
            </ul>
          </section>

          {/* Docs index */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Docs index</h2>
            <ul className="space-y-2">
              {[
                { label: "Posting Guidelines", href: `${COMMUNITY_URL}/t/posting-guidelines/30` },
                { label: "Code of Conduct", href: `${COMMUNITY_URL}/t/code-of-conduct/31` },
                { label: "Categories", href: `${COMMUNITY_URL}/categories` },
                { label: "Stay in the Loop", href: `${COMMUNITY_URL}/t/stay-in-the-loop/33` },
                { label: "Questions & Feedback", href: `${COMMUNITY_URL}/t/questions-feedback/34` },
              ].map((item) => (
                <li key={item.label} className="flex items-center gap-2 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" aria-hidden="true" />
                  <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--text-secondary))] hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1 rounded-sm">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>

          {/* Vendor-agnostic policy */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Vendor-agnostic policy</h2>
            <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
              We're vendor-agnostic. Technical product mentions are welcome when neutral and reproducible. Avoid promotional content. Marketing posts will be removed; repeated violations may lead to moderation actions. See{" "}
              <a href={`${COMMUNITY_URL}/t/posting-guidelines/30`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1 rounded-sm">Posting Guidelines</a>.
            </p>
          </section>

          {/* Leaderboards */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Leaderboards &amp; Recognition</h2>
            <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed mb-3">
              Progress through the contributor ladder, earn badges, and appear on leaderboards. Periodic highlights showcase outstanding solutions and tutorials.
            </p>
            <ul className="space-y-2">
              <li>
                <a href={`${COMMUNITY_URL}/leaderboard/8`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1 rounded-sm">
                  Hall of Fame →
                </a>
              </li>
              <li>
                <a href={`${COMMUNITY_URL}/leaderboard/6`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1 rounded-sm">
                  Leaderboards →
                </a>
              </li>
            </ul>
          </section>

          {/* Contact & Reporting */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Contact &amp; Reporting</h2>
            <ul className="space-y-2 text-sm text-[hsl(var(--text-secondary))]">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" aria-hidden="true" />
                Flag posts that violate policy using the flag button on any post
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" aria-hidden="true" />
                DM{" "}
                <a href={`${COMMUNITY_URL}/groups/moderators`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1 rounded-sm">
                  @moderators
                </a>{" "}
                for sensitive issues
              </li>
            </ul>
          </section>

        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-[hsl(var(--surface-border))] flex flex-wrap gap-3">
          <Link to="/docs" className="btn-ghost">
            ← Back to Docs
          </Link>
          <a href={COMMUNITY_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">
            Open the community →
          </a>
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default CommunityGuide;
