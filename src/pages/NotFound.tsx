import type { JSX } from "react";
import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SITE_URL, BRAND_NAME, COMMUNITY_URL } from "@/data/constants";

const links = [
  {
    label: "Handbook",
    desc: "Everything you need to get started, participate, and grow in the community.",
    to: "/handbook",
  },
  {
    label: "Adventures",
    desc: "Browse hands-on challenges with real-world scenarios.",
    to: "/#challenges",
  },
  {
    label: "About",
    desc: `Learn what ${BRAND_NAME} is and who it's for.`,
    to: "/about",
  },
];

export const meta: MetaFunction = ({ location }) => {
  const pageTitle = `Page Not Found - ${BRAND_NAME}`;
  const desc = `This page could not be found. Use ${BRAND_NAME} links to continue exploring challenges, guides, and community resources.`;
  return [
    { title: pageTitle },
    { name: "description", content: desc },
    { property: "og:title", content: pageTitle },
    { property: "og:description", content: desc },
    { property: "og:type", content: "website" },
    { property: "og:url", content: `${SITE_URL}${location.pathname}` },
    { property: "og:image", content: `${SITE_URL}/og.png` },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: pageTitle },
    { property: "og:site_name", content: BRAND_NAME },
    { property: "og:locale", content: "en_GB" },
    { name: "twitter:title", content: pageTitle },
    { name: "twitter:description", content: desc },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: `${SITE_URL}/og.png` },
    { name: "twitter:image:alt", content: pageTitle },
    { name: "robots", content: "noindex, nofollow" },
    { tagName: "link", rel: "canonical", href: `${SITE_URL}${location.pathname}` },
  ];
};

const NotFound = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content" className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
        <span className="section-label font-sans text-sm font-medium uppercase tracking-widest text-primary mb-4">404</span>
        <h1 className="text-4xl font-bold text-foreground mb-3">Page not found</h1>
        <p className="text-muted-foreground mb-2 max-w-sm leading-relaxed">
          This is not the page you were looking for.
        </p>
        <p className="text-muted-foreground mb-10 max-w-sm leading-relaxed">
          Please check the links below for more information.
        </p>

        <nav aria-label="Helpful links">
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-left max-w-2xl w-full">
            {links.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="card-glow flex flex-col gap-1.5 rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] p-5 h-full hover:border-primary/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <span className="text-sm font-semibold text-foreground">{link.label}</span>
                  <span className="text-sm text-muted-foreground leading-relaxed">{link.desc}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <a
          href={COMMUNITY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
        >
          Open the community <ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
        </a>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
