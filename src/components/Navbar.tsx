import { useState, useEffect, useRef, type JSX } from "react";
import { Link } from "react-router";
import { Sun, Moon, Menu, X, ExternalLink } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useTheme } from "@/hooks/useTheme";
import { COMMUNITY_URL } from "@/data/constants";
import { cn } from "@/lib/utils";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { useFocusTrap } from "@/hooks/useFocusTrap";
const logoDark = `${import.meta.env.BASE_URL}brand/offon-logo-dark-color.svg`;
const logoLight = `${import.meta.env.BASE_URL}brand/offon-logo-light-mono.svg`;

const linkCls = "inline-flex items-center gap-1 min-h-[44px] text-sm font-medium text-dim hover:text-foreground dark:hover:text-primary transition-colors underline underline-offset-4 decoration-[3px] decoration-transparent rounded px-1.5 -mx-1.5 focus-ring";
const activeCls = "text-foreground dark:text-primary underline decoration-foreground dark:decoration-primary underline-offset-4";

type NavThemeToggleProps = { theme: "dark" | "light"; onToggle: () => void; className?: string };

const NavThemeToggle = ({ theme, onToggle, className }: NavThemeToggleProps): JSX.Element => (
  <button
    onClick={onToggle}
    className={cn(
      "flex h-11 w-11 items-center justify-center rounded-md border border-border bg-[hsl(var(--surface))] text-foreground/70 hover:text-foreground transition-all focus-ring",
      className
    )}
    aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
  >
    {theme === "dark" ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
  </button>
);

type NavLinksProps = {
  onNavigate?: () => void;
};

const NavLinks = ({ onNavigate }: NavLinksProps): JSX.Element => (
  <ul role="list" className="contents">
    <li className="contents">
      <NavLink to="/challenges/" className={linkCls} activeClassName={activeCls} onClick={onNavigate}>Challenges</NavLink>
    </li>
    <li className="contents">
      <NavLink to="/about/" className={linkCls} activeClassName={activeCls} onClick={onNavigate}>About</NavLink>
    </li>
    <li className="contents">
      <a
        href={COMMUNITY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={linkCls}
        onClick={onNavigate}
      >
        Community <ExternalLink size={12} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
      </a>
    </li>
    <li className="contents">
      <NavLink to="/contribute/" className={linkCls} activeClassName={activeCls} onClick={onNavigate}>Contribute</NavLink>
    </li>
    <li className="contents">
      <NavLink to="/handbook/" className={linkCls} activeClassName={activeCls} onClick={onNavigate}>Handbook</NavLink>
    </li>
    <li className="contents">
      <NavLink to="/sponsors/" className={linkCls} activeClassName={activeCls} onClick={onNavigate}>Sponsors</NavLink>
    </li>
  </ul>
);

export const Navbar = (): JSX.Element => {
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = (): void => {
    setMenuOpen(false);
  };

  useEscapeKey(() => {
    setMenuOpen(false);
    triggerRef.current?.focus();
  }, menuOpen);

  useFocusTrap(menuRef, menuOpen);

  // Hide page content from assistive technologies while the menu is open.
  useEffect(() => {
    if (!menuOpen) return;
    const main = document.getElementById("main-content");
    const footer = document.querySelector<HTMLElement>("footer");
    if (!main) return;
    main.setAttribute("inert", "");
    main.setAttribute("aria-hidden", "true");
    footer?.setAttribute("inert", "");
    footer?.setAttribute("aria-hidden", "true");
    return () => {
      main.removeAttribute("inert");
      main.removeAttribute("aria-hidden");
      footer?.removeAttribute("inert");
      footer?.removeAttribute("aria-hidden");
    };
  }, [menuOpen]);

  return (
    <nav
      aria-label="Main"
      className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-1.5">
        <Link to="/" aria-label="offon.dev home" className="logo-link flex items-center focus-ring rounded-sm">
          {/* Dark logo is high-priority: it's visible in the default (dark) theme. Light logo uses auto priority since it's hidden until the user switches theme. */}
          <img src={logoDark} alt="" width={130} height={33} loading="eager" fetchPriority="high" className="h-8 dark:block hidden" />
          <img src={logoLight} alt="" aria-hidden="true" width={130} height={33} loading="eager" className="h-8 block dark:hidden" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <NavLinks />
          <NavThemeToggle theme={theme} onToggle={toggle} className="hover:border-primary/30" />
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <NavThemeToggle theme={theme} onToggle={toggle} />
          <button
            ref={triggerRef}
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-11 w-11 items-center justify-center rounded-md border border-border bg-[hsl(var(--surface))] text-foreground/70 hover:text-foreground transition-all focus-ring"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile menu drawer — always in the DOM so aria-controls has a valid target.
          Plain <div>, not <nav>: this sits inside the outer <nav aria-label="Main">
          and a nested nav landmark would create two overlapping navigation regions. */}
      <div
        ref={menuRef}
        id="mobile-menu"
        hidden={!menuOpen}
        className={cn(
          "md:hidden border-t border-border bg-background px-6 py-2",
          menuOpen && "flex flex-col gap-1"
        )}
      >
        <NavLinks onNavigate={closeMenu} />
      </div>
    </nav>
  );
};
