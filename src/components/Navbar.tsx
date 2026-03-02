import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[hsl(var(--surface-border))] bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary font-mono text-sm">
            ⟐
          </div>
          <span className="text-sm font-medium text-foreground">Open Ecosystem</span>
        </Link>
        <div className="flex items-center gap-6">
          <a href="#challenges" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Challenges
          </a>
          <a href="https://community.open-ecosystem.com" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Community
          </a>
          <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            About
          </a>
          <a href="#" className="rounded-md border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] px-4 py-1.5 font-mono text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all">
            Sign in
          </a>
        </div>
      </div>
    </nav>
  );
};
