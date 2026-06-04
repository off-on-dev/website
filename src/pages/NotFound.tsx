import type { JSX } from "react";
import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SectionLabel } from "@/components/SectionLabel";
import { SITE_URL, BRAND_NAME } from "@/data/constants";
import { buildPageMeta } from "@/lib/meta";

const links = [
  {
    label: "Handbook",
    desc: "Your guide to getting started, posting, and growing in the community.",
    to: "/handbook",
  },
  {
    label: "Challenges",
    desc: "Browse hands-on challenges with real-world scenarios.",
    to: "/challenges",
  },
  {
    label: "About",
    desc: `Learn what ${BRAND_NAME} is and who it's for.`,
    to: "/about",
  },
];

export const meta: MetaFunction = () => {
  // Fixed to /404/ regardless of the actual browser URL. GitHub Pages serves
  // this prerendered file for any unknown route, so the canonical must match
  // what was baked into the HTML at build time to prevent a hydration mismatch
  // (React error #418). noindex/nofollow is set so the canonical is moot for SEO.
  return buildPageMeta({
    title: `Page Not Found - ${BRAND_NAME}`,
    description: `This page could not be found. Use ${BRAND_NAME} links to continue exploring challenges, guides, and community resources.`,
    url: `${SITE_URL}/404/`,
    extra: [{ name: "robots", content: "noindex, nofollow" }],
  });
};

const NotFound = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content" className="flex min-h-[80vh] items-center px-6 md:px-16 py-20">
        <div className="mx-auto max-w-6xl w-full">

          <div className="mb-12">
            <SectionLabel>404</SectionLabel>
            <h1 className="text-4xl font-bold text-foreground mb-3">Page Not Found</h1>
            <p className="text-muted-foreground mb-2 leading-relaxed">
              This is not the page you were looking for.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Your search continues. We suggest starting here.
            </p>
          </div>

          {/* Cards + CTA, full width */}
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
