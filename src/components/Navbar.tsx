import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useTheme } from "@/hooks/useTheme";
import { COMMUNITY_URL } from "@/data/constants";
import logoDark from "@/assets/offon-logo-dark-color.svg";
import logoLight from "@/assets/offon-logo-light-color.svg";

export const Navbar = (): JSX.Element => {
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const linkCls = "text-sm font-medium text-[hsl(var(--text-secondary))] hover:text-primary transition-colors underline underline-offset-4 decoration-[3px] decoration-transparent rounded px-1.5 py-0.5 -mx-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2";
  const activeCls = "text-primary";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[hsl(var(--surface-border))] bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="logo-link flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 rounded-sm">
          <img
            src={theme === "dark" ? logoDark : logoLight}
            alt="offon.dev"
            width={130}
            height={33}
            className="h-8"
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/" className={linkCls} activeClassName={activeCls} end>Home</NavLink>
          <Link to="/#challenges" className={linkCls}>Challenges</Link>
          <a href={COMMUNITY_URL} target="_blank" rel="noopener noreferrer" className={linkCls}>Community</a>
          <NavLink to="/docs" className={linkCls} activeClassName={activeCls}>Docs</NavLink>
          <NavLink to="/about" className={linkCls} activeClassName={activeCls}>About</NavLink>
          <NavLink to="/sponsors" className={linkCls} activeClassName={activeCls}>Sponsors</NavLink>
          <button
            onClick={toggle}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] text-foreground/70 hover:text-foreground hover:border-primary/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>
          <a href="https://github.com/dynatrace-oss/open-ecosystem-challenges" target="_blank" rel="noopener noreferrer" className="rounded-md border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] px-4 py-2 text-sm font-medium text-foreground/70 hover:text-primary hover:border-primary/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 inline-flex items-center gap-1">
            GitHub <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>

        {/* Mobile right: theme toggle + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={toggle}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] text-foreground/70 hover:text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] text-foreground/70 hover:text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className="md:hidden border-t border-[hsl(var(--surface-border))] bg-background px-6 py-4 flex flex-col gap-4">
          <NavLink to="/" className={linkCls} activeClassName={activeCls} end onClick={() => setMenuOpen(false)}>Home</NavLink>
          <Link to="/#challenges" className={linkCls} onClick={() => setMenuOpen(false)}>Challenges</Link>
          <a href={COMMUNITY_URL} target="_blank" rel="noopener noreferrer" className={linkCls} onClick={() => setMenuOpen(false)}>Community</a>
          <NavLink to="/docs" className={linkCls} activeClassName={activeCls} onClick={() => setMenuOpen(false)}>Docs</NavLink>
          <NavLink to="/about" className={linkCls} activeClassName={activeCls} onClick={() => setMenuOpen(false)}>About</NavLink>
          <NavLink to="/sponsors" className={linkCls} activeClassName={activeCls} onClick={() => setMenuOpen(false)}>Sponsors</NavLink>
          <a href="https://github.com/dynatrace-oss/open-ecosystem-challenges" target="_blank" rel="noopener noreferrer" className="rounded-md border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] px-4 py-2 text-sm font-medium text-foreground/70 hover:text-primary hover:border-primary/30 transition-all text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 inline-flex items-center justify-center gap-1">
            GitHub <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
      )}
    </nav>
  );
};
