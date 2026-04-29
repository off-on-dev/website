import type { JSX } from "react";
import { Link } from "react-router";
import { useTheme } from "@/hooks/useTheme";
import { COMMUNITY_URL, BRAND_NAME, LINKEDIN_URL, CURRENT_YEAR } from "@/data/constants";
import logoDark from "@/assets/offon-logo-dark-color.svg";
import logoLight from "@/assets/offon-logo-light-color.svg";

export const Footer = (): JSX.Element => {
  const { theme } = useTheme();

  const lnk = "flex items-center min-h-[48px] font-sans text-sm text-[hsl(var(--text-secondary))] hover:text-primary transition-colors underline underline-offset-4 decoration-[3px] decoration-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm";

  return (
    <footer className="bg-background border-t border-[hsl(var(--surface-border))] px-6 sm:px-8 md:px-16 lg:px-20">
      <div className="mx-auto max-w-6xl py-16 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">

        {/* Brand */}
        <div>
          <div className="mb-4">
            <img src={theme === "dark" ? logoDark : logoLight} alt="offon.dev" width={104} height={26} loading="lazy" title="offon.dev" className="h-5" />
          </div>
          <p className="font-sans text-sm text-[hsl(var(--text-secondary))] leading-relaxed md:max-w-xs">
            A vendor-neutral space for open source practitioners to learn through challenges, share what they know, and grow together.
          </p>
        </div>

        {/* Nav columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12">
            {/* Explore */}
            <nav aria-label="Explore">
              <p className="text-xs uppercase tracking-widest text-[hsl(var(--text-faint))] mb-3">Explore</p>
              <div className="flex flex-col">
                <Link to="/adventures" className={lnk}>Adventures</Link>
                <Link to="/handbook" className={lnk}>Handbook</Link>
                <Link to="/about" className={lnk}>About</Link>
                <Link to="/sponsors" className={lnk}>Sponsors</Link>
                <a href="https://github.com/dynatrace-oss/open-ecosystem-challenges/blob/main/docs/contributing/adventure-ideas.md" target="_blank" rel="noopener noreferrer" className={lnk}>Propose an Adventure Idea<span className="sr-only"> (opens in new tab)</span></a>
              </div>
            </nav>
            {/* Community */}
            <nav aria-label="Community">
              <p className="text-xs uppercase tracking-widest text-[hsl(var(--text-faint))] mb-3">Community</p>
              <div className="flex flex-col">
                <a href={COMMUNITY_URL} target="_blank" rel="noopener noreferrer" className={lnk}>Hub<span className="sr-only"> (opens in new tab)</span></a>
                <a href={`${COMMUNITY_URL}/c/community-voices/38`} target="_blank" rel="noopener noreferrer" className={lnk}>Community Voices<span className="sr-only"> (opens in new tab)</span></a>
                <a href={`${COMMUNITY_URL}/c/general/q-a/10`} target="_blank" rel="noopener noreferrer" className={lnk}>Q&A<span className="sr-only"> (opens in new tab)</span></a>
                <a href={`${COMMUNITY_URL}/t/code-of-conduct/31/1`} target="_blank" rel="noopener noreferrer" className={lnk}>Code of Conduct<span className="sr-only"> (opens in new tab)</span></a>
                <a href={`${COMMUNITY_URL}/t/posting-guidelines/30`} target="_blank" rel="noopener noreferrer" className={lnk}>Posting Guidelines<span className="sr-only"> (opens in new tab)</span></a>
                <Link to="/privacy" className={lnk}>Privacy Policy</Link>
              </div>
            </nav>
          </div>
      </div>

      {/* Bottom strip */}
      <div className="border-t border-[hsl(var(--surface-border))] py-4">
        <div className="mx-auto max-w-6xl flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <span className="text-xs text-[hsl(var(--text-faint))] shrink-0 sm:order-1">© {CURRENT_YEAR} {BRAND_NAME}. All rights reserved.</span>
          <span className="text-xs text-[hsl(var(--text-faint))] text-center sm:order-2 sm:flex-1">Vendor-neutral <span aria-hidden="true">·</span> Open source <span aria-hidden="true">·</span> Community-driven</span>
          <div className="flex items-center gap-3 shrink-0 sm:order-3">
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn (opens in new tab)"
              className="flex items-center justify-center p-3 text-[hsl(var(--text-faint))] hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" className="w-3.5 h-3.5" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
