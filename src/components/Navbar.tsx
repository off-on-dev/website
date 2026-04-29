import { useState, type JSX } from "react";
import { Link, useLocation } from "react-router";
import { ArrowUpRight, Sun, Moon, Menu, X } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useTheme } from "@/hooks/useTheme";
import { useActiveSection } from "@/hooks/useActiveSection";
import { COMMUNITY_URL } from "@/data/constants";
import { cn } from "@/lib/utils";
import logoDark from "@/assets/offon-logo-dark-color.svg";
import logoLight from "@/assets/offon-logo-light-color.svg";

const OBSERVED_SECTIONS = ["challenges"];

const linkCls = "text-sm font-medium text-[hsl(var(--text-secondary))] hover:text-primary transition-colors underline underline-offset-4 decoration-[3px] decoration-transparent rounded px-1.5 py-0.5 -mx-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
const activeCls = "text-primary underline decoration-primary underline-offset-4";

type NavLinksProps = {
  homeActive: boolean;
  challengesActive: boolean;
  onNavigate?: () => void;
};

const NavLinks = ({ homeActive, challengesActive, onNavigate }: NavLinksProps): JSX.Element => (
  <>
    <NavLink
      to="/"
      className={cn(linkCls, homeActive && activeCls)}
      aria-current={homeActive ? "page" : undefined}
      end
      onClick={onNavigate}
    >
      Home
    </NavLink>
    <NavLink to="/about" className={linkCls} activeClassName={activeCls} onClick={onNavigate}>About</NavLink>
    <Link
      to="/#challenges"
      className={cn(linkCls, challengesActive && activeCls)}
      aria-current={challengesActive ? "page" : undefined}
      onClick={onNavigate}
    >
      Challenges
    </Link>
    <a
      href={COMMUNITY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={linkCls}
      onClick={onNavigate}
    >
      Community<span className="sr-only"> (opens in new tab)</span>
    </a>
    <NavLink to="/handbook" className={linkCls} activeClassName={activeCls} onClick={onNavigate}>Handbook</NavLink>
    <NavLink to="/sponsors" className={linkCls} activeClassName={activeCls} onClick={onNavigate}>Sponsors</NavLink>
  </>
);

export const Navbar = (): JSX.Element => {
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const activeSection = useActiveSection(OBSERVED_SECTIONS);
  const challengesActive = location.pathname === "/" && activeSection === "challenges";
  const homeActive = location.pathname === "/" && !challengesActive;

  const closeMenu = (): void => setMenuOpen(false);

  return (
    <nav
      aria-label="Main"
      className="fixed top-0 left-0 right-0 z-50 border-b border-[hsl(var(--surface-border))] bg-background"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="logo-link flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm">
          <img
            src={theme === "dark" ? logoDark : logoLight}
            alt="offon.dev"
            width={130}
            height={33}
            loading="eager"
            title="offon.dev"
            className="h-8"
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <NavLinks homeActive={homeActive} challengesActive={challengesActive} />
          <button
            onClick={toggle}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] text-foreground/70 hover:text-foreground hover:border-primary/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
          </button>
          <a
            href="https://github.com/dynatrace-oss/open-ecosystem-challenges"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] px-4 py-2 text-sm font-medium text-foreground/70 hover:text-primary hover:border-primary/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 inline-flex items-center gap-1"
          >
            GitHub<span className="sr-only"> (opens in new tab)</span> <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={toggle}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] text-foreground/70 hover:text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
          </button>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] text-foreground/70 hover:text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? <X size={16} aria-hidden="true" /> : <Menu size={16} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-[hsl(var(--surface-border))] bg-background px-6 py-4 flex flex-col gap-4"
        >
          <NavLinks homeActive={homeActive} challengesActive={challengesActive} onNavigate={closeMenu} />
          <a
            href="https://github.com/dynatrace-oss/open-ecosystem-challenges"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] px-4 py-2 text-sm font-medium text-foreground/70 hover:text-primary hover:border-primary/30 transition-all text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 inline-flex items-center justify-center gap-1"
            onClick={closeMenu}
          >
            GitHub<span className="sr-only"> (opens in new tab)</span> <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
      )}
    </nav>
  );
};
