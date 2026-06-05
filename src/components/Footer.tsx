import type { JSX } from "react";
import { Link } from "react-router";
import { Zap, ExternalLink } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { BRAND_NAME, BRAND_SHORT_DESCRIPTION, BRAND_SLOGAN_PARTS, COMMUNITY_URL, CONTACT_EMAIL, CURRENT_YEAR, LINKEDIN_URL, BLUESKY_URL, X_URL, SITE_NAME } from "@/data/constants";
import logoDark from "@/assets/offon-logo-dark-color.svg";
import logoLight from "@/assets/offon-logo-light-color.svg";

export const Footer = (): JSX.Element => {
  const { theme } = useTheme();

  const linkCls = "flex items-center gap-1 min-h-[48px] font-sans text-sm text-[hsl(var(--text-secondary))] hover:text-primary transition-colors underline underline-offset-4 decoration-[3px] decoration-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm";

  return (
    <footer className="bg-background border-t border-[hsl(var(--surface-border))] px-6 sm:px-8 md:px-16 lg:px-20">
      <div className="mx-auto max-w-6xl py-16 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">

        {/* Brand */}
        <div>
          <div className="mb-4">
            <img src={theme === "dark" ? logoDark : logoLight} alt={SITE_NAME} width={104} height={26} loading="lazy" className="h-5" />
          </div>
          <p className="font-sans text-sm text-[hsl(var(--text-secondary))] leading-relaxed md:max-w-xs">
            {BRAND_SHORT_DESCRIPTION}
          </p>
        </div>

        {/* Nav columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12">
            {/* Explore */}
            <nav aria-label="Explore">
              <p className="text-xs uppercase tracking-widest text-[hsl(var(--text-faint))] mb-3">Explore</p>
              <div className="flex flex-col">
                <Link to="/challenges/" className={linkCls}>Challenges</Link>
                <Link to="/contribute/" className={linkCls}>Contribute</Link>
                <Link to="/handbook/" className={linkCls}>Handbook</Link>
                <Link to="/about/" className={linkCls}>About</Link>
                <Link to="/sponsors/" className={linkCls}>Sponsors</Link>
              </div>
            </nav>
            {/* Community */}
            <nav aria-label="Community">
              <p className="text-xs uppercase tracking-widest text-[hsl(var(--text-faint))] mb-3">Community</p>
              <div className="flex flex-col">
                <a href={COMMUNITY_URL} target="_blank" rel="noopener noreferrer" className={linkCls}>Hub <ExternalLink size={12} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span></a>
                <a href={`${COMMUNITY_URL}/t/code-of-conduct/31/1`} target="_blank" rel="noopener noreferrer" className={linkCls}>Code of Conduct <ExternalLink size={12} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span></a>
                <Link to="/privacy/" className={linkCls}>Privacy Policy</Link>
                <Link to="/accessibility/" className={linkCls}>Accessibility</Link>
                <a href={`mailto:${CONTACT_EMAIL}`} className={linkCls}>Contact</a>
              </div>
            </nav>
          </div>
      </div>

      {/* Bottom strip */}
      <div className="border-t border-[hsl(var(--surface-border))] py-4">
        <div className="mx-auto max-w-6xl flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <span className="text-xs text-[hsl(var(--text-faint))] shrink-0 sm:order-1">© {CURRENT_YEAR} {BRAND_NAME}. All rights reserved.</span>
          <span className="inline-flex items-center justify-center gap-1.5 text-xs text-[hsl(var(--text-faint))] sm:order-2 sm:flex-1">
              <Zap size={10} aria-hidden="true" />
              <span>{BRAND_SLOGAN_PARTS[0]}</span>
              <Zap size={10} aria-hidden="true" />
              <span>{BRAND_SLOGAN_PARTS[1]}</span>
              <Zap size={10} aria-hidden="true" />
              <span>{BRAND_SLOGAN_PARTS[2]}</span>
            </span>
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
            <a
              href={BLUESKY_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Bluesky (opens in new tab)"
              className="flex items-center justify-center p-3 text-[hsl(var(--text-faint))] hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" className="w-3.5 h-3.5" fill="currentColor">
                <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.479 0-.689-.139-1.861-.902-2.203-.659-.299-1.664-.621-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z" />
              </svg>
            </a>
            <a
              href={X_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X / Twitter (opens in new tab)"
              className="flex items-center justify-center p-3 text-[hsl(var(--text-faint))] hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" className="w-3.5 h-3.5" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
