import type { JSX } from "react";
import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SITE_URL, BRAND_NAME } from "@/data/constants";

const links = [
  {
    label: "Handbook",
    desc: "Your guide to getting started, posting, and growing in the community.",
    to: "/handbook",
  },
  {
    label: "Adventures",
    desc: "Browse hands-on challenges with real-world scenarios.",
    to: "/adventures",
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
      <main id="main-content" className="flex min-h-[80vh] items-center px-6 md:px-16 py-20">
        <div className="mx-auto max-w-6xl w-full">

          {/* Top row: mascot + 404 content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-12">
            <div className="flex justify-center md:justify-start">
              <img src={`${import.meta.env.BASE_URL}offon_mascot_3_transparent.png`} alt="" aria-hidden="true" width={280} height={280} loading="lazy" className="w-48 md:w-64 lg:w-72 opacity-90" />
            </div>
            <div>
              <span className="section-label font-sans text-sm font-medium uppercase tracking-widest text-primary mb-4 block">404</span>
              <h1 className="text-4xl font-bold text-foreground mb-3">Page Not Found</h1>
              <p className="text-muted-foreground mb-2 leading-relaxed">
                This is not the page you were looking for.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Try one of these instead.
              </p>
            </div>
          </div>

          {/* Cards + CTA — full width */}
          <nav aria-label="Helpful links">
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              {links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="flex flex-col gap-2 rounded-xl bg-primary p-7 h-full hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <span className="text-base font-semibold text-primary-foreground">{link.label}</span>
                    <span className="text-sm text-background/90 leading-relaxed">{link.desc}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
