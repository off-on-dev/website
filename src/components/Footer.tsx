import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="border-t border-[hsl(var(--surface-border))] py-10 px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/20 text-primary font-mono text-xs">
            ⟐
          </div>
          <span className="text-sm text-muted-foreground">
            Open Ecosystem · Vendor-neutral platform engineering education
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="https://community.open-ecosystem.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Community</a>
           <a href="https://github.com/dynatrace-oss/open-ecosystem-challenges" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Challenges Repo</a>
           <a href="https://github.com/dynatrace-oss/open-ecosystem-challenge-verifier" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Verifier</a>
          <a href="#about" className="hover:text-foreground transition-colors">About</a>
        </div>
      </div>
    </footer>
  );
};
