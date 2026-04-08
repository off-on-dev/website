import { Link } from "react-router-dom";
import logoDark from "@/assets/logo-dark.png";

export const Footer = () => {
  return (
    <footer className="bg-background border-t border-[hsl(var(--surface-border))]">
      <div className="mx-auto max-w-6xl px-6 md:px-16 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Col 1 — brand */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <img src={logoDark} alt="offon.dev" className="h-5" />
          </div>
          <p className="font-mono text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
            Vendor-neutral. Open source. Community-driven. Hands-on learning for developers who care about doing things right.
          </p>
        </div>

        {/* Col 2 — project */}
        <div>
          <p className="text-xs uppercase tracking-widest text-[hsl(var(--text-faint))] mb-3">Project</p>
          <a href="#challenges" className="block font-mono text-xs text-[hsl(var(--text-secondary))] hover:text-foreground mb-2 transition-colors">Challenges</a>
          <Link to="/docs" className="block font-mono text-xs text-[hsl(var(--text-secondary))] hover:text-foreground mb-2 transition-colors">Docs</Link>
          <a href="https://github.com/dynatrace-oss/offon-challenges" target="_blank" rel="noopener noreferrer" className="block font-mono text-xs text-[hsl(var(--text-secondary))] hover:text-foreground mb-2 transition-colors">Changelog</a>
        </div>

        {/* Col 3 — community */}
        <div>
          <p className="text-xs uppercase tracking-widest text-[hsl(var(--text-faint))] mb-3">Community</p>
          <a href="https://community.offon.dev" target="_blank" rel="noopener noreferrer" className="block font-mono text-xs text-[hsl(var(--text-secondary))] hover:text-foreground mb-2 transition-colors">Forum</a>
          <a href="https://github.com/dynatrace-oss/offon-challenges/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer" className="block font-mono text-xs text-[hsl(var(--text-secondary))] hover:text-foreground mb-2 transition-colors">Contributing</a>
          <a href="https://github.com/dynatrace-oss/offon-challenges/blob/main/CODE_OF_CONDUCT.md" target="_blank" rel="noopener noreferrer" className="block font-mono text-xs text-[hsl(var(--text-secondary))] hover:text-foreground mb-2 transition-colors">Code of Conduct</a>
        </div>

        {/* Col 4 — links */}
        <div>
          <p className="text-xs uppercase tracking-widest text-[hsl(var(--text-faint))] mb-3">Links</p>
          <a href="https://github.com/dynatrace-oss/offon-challenges" target="_blank" rel="noopener noreferrer" className="block font-mono text-xs text-[hsl(var(--text-secondary))] hover:text-foreground mb-2 transition-colors">GitHub ↗</a>
          <Link to="/about" className="block font-mono text-xs text-[hsl(var(--text-secondary))] hover:text-foreground mb-2 transition-colors">About</Link>
          <Link to="/sponsors" className="block font-mono text-xs text-[hsl(var(--text-secondary))] hover:text-foreground mb-2 transition-colors">Sponsors</Link>
        </div>

      </div>

      {/* Bottom strip */}
      <div className="border-t border-[hsl(var(--surface-border))] px-6 md:px-16 py-3 flex items-center justify-center">
        <span className="text-xs text-[hsl(var(--text-faint))]">Vendor-neutral · Open source · Community-driven</span>
      </div>
    </footer>
  );
};
