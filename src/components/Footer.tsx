import { Link } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo-light.png";

export const Footer = (): JSX.Element => {
  const { theme } = useTheme();

  const lnk = "block font-mono text-xs text-[hsl(var(--text-secondary))] hover:text-primary mb-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1 rounded-sm";

  return (
    <footer className="bg-background border-t border-[hsl(var(--surface-border))] px-6 sm:px-8 md:px-16 lg:px-20">
      <div className="mx-auto max-w-6xl py-16 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">

        {/* Brand */}
        <div>
          <div className="mb-4">
            <img src={theme === "dark" ? logoDark : logoLight} alt="offon.dev" className="h-5" />
          </div>
          <p className="font-mono text-xs text-[hsl(var(--text-secondary))] leading-relaxed max-w-[220px]">
            A welcoming community for open source enthusiasts to learn, share knowledge, and build together.
          </p>
        </div>

        {/* Nav columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">

          {/* Explore */}
          <nav aria-label="Explore">
            <p className="text-xs uppercase tracking-widest text-[hsl(var(--text-faint))] mb-3">Explore</p>
            <Link to="/#challenges" className={lnk}>Adventures</Link>
            <Link to="/docs" className={lnk}>Docs</Link>
            <Link to="/about" className={lnk}>About</Link>
            <Link to="/sponsors" className={lnk}>Sponsors</Link>
            <a href="https://github.com/dynatrace-oss/open-ecosystem-challenges" target="_blank" rel="noopener noreferrer" className={lnk}>GitHub ↗<span className="sr-only"> (opens in new tab)</span></a>
            <a href="https://github.com/dynatrace-oss/open-ecosystem-challenges/blob/main/docs/contributing/adventure-ideas.md" target="_blank" rel="noopener noreferrer" className={lnk}>Propose an adventure idea<span className="sr-only"> (opens in new tab)</span></a>
          </nav>

          {/* Community */}
          <nav aria-label="Community">
            <p className="text-xs uppercase tracking-widest text-[hsl(var(--text-faint))] mb-3">Community</p>
            <a href="https://community.open-ecosystem.com" target="_blank" rel="noopener noreferrer" className={lnk}>Forum<span className="sr-only"> (opens in new tab)</span></a>
            <a href="https://community.open-ecosystem.com/c/community-voices/38" target="_blank" rel="noopener noreferrer" className={lnk}>Community Voices<span className="sr-only"> (opens in new tab)</span></a>
            <a href="https://community.open-ecosystem.com/c/challenges/11" target="_blank" rel="noopener noreferrer" className={lnk}>Challenges<span className="sr-only"> (opens in new tab)</span></a>
            <a href="https://community.open-ecosystem.com/c/general/q-a/10" target="_blank" rel="noopener noreferrer" className={lnk}>Q&amp;A<span className="sr-only"> (opens in new tab)</span></a>
            <a href="https://community.open-ecosystem.com/c/events-and-talks/12" target="_blank" rel="noopener noreferrer" className={lnk}>Events and Talks<span className="sr-only"> (opens in new tab)</span></a>
            <a href="https://community.open-ecosystem.com/c/local-meetups-and-groups/19" target="_blank" rel="noopener noreferrer" className={lnk}>Local Meetups<span className="sr-only"> (opens in new tab)</span></a>
          </nav>

          {/* Policies */}
          <nav aria-label="Legal and policies" className="col-span-2 md:col-span-1">
            <p className="text-xs uppercase tracking-widest text-[hsl(var(--text-faint))] mb-3">Policies</p>
            <a href="https://community.open-ecosystem.com/t/code-of-conduct/31/1" target="_blank" rel="noopener noreferrer" className={lnk}>Code of Conduct<span className="sr-only"> (opens in new tab)</span></a>
            <a href="https://community.open-ecosystem.com/t/posting-guidelines/30" target="_blank" rel="noopener noreferrer" className={lnk}>Posting Guidelines<span className="sr-only"> (opens in new tab)</span></a>
            <a href="https://community.open-ecosystem.com/t/privacy-policy/22" target="_blank" rel="noopener noreferrer" className={lnk}>Privacy Policy<span className="sr-only"> (opens in new tab)</span></a>
            <a href="https://github.com/dynatrace-oss/open-ecosystem-challenges/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer" className={lnk}>Contributing<span className="sr-only"> (opens in new tab)</span></a>
          </nav>

        </div>
      </div>

      {/* Bottom strip */}
      <div className="border-t border-[hsl(var(--surface-border))] py-4">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-4">
          <span className="text-xs text-[hsl(var(--text-faint))]">Vendor-neutral · Open source · Community-driven</span>
          {/* Social icons - add more here as needed */}
          <div className="flex items-center gap-3">
            <a
              href="https://www.linkedin.com/company/open-ecosystem/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn (opens in new tab)"
              className="text-[hsl(var(--text-faint))] hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1 rounded-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            {/* Add more social icons here */}
          </div>
        </div>
      </div>
    </footer>
  );
};
