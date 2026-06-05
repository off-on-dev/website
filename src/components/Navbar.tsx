import { useState, useEffect, useRef, type JSX } from "react";
import { Link, useLocation } from "react-router";
import { Sun, Moon, Menu, X, ExternalLink } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useTheme } from "@/hooks/useTheme";
import { COMMUNITY_URL } from "@/data/constants";
import { cn } from "@/lib/utils";
import logoDark from "@/assets/offon-logo-dark-color.svg";
import logoLight from "@/assets/offon-logo-light-color.svg";

const linkCls = "inline-flex items-center gap-1 min-h-[44px] text-sm font-medium text-[hsl(var(--text-secondary))] hover:text-primary transition-colors underline underline-offset-4 decoration-[3px] decoration-transparent rounded px-1.5 -mx-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
const activeCls = "text-primary underline decoration-primary underline-offset-4";

type NavThemeToggleProps = { theme: "dark" | "light"; onToggle: () => void; className?: string };

const NavThemeToggle = ({ theme, onToggle, className }: NavThemeToggleProps): JSX.Element => (
  <button
    onClick={onToggle}
    className={cn(
      "flex h-11 w-11 items-center justify-center rounded-md border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] text-foreground/70 hover:text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
  >
    {theme === "dark" ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
  </button>
);

type NavLinksProps = {
  homeActive: boolean;
  onNavigate?: () => void;
};

const NavLinks = ({ homeActive, onNavigate }: NavLinksProps): JSX.Element => (
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
    <NavLink to="/challenges/" className={linkCls} activeClassName={activeCls} onClick={onNavigate}>Challenges</NavLink>
    <NavLink to="/about/" className={linkCls} activeClassName={activeCls} onClick={onNavigate}>About</NavLink>
    <a
      href={COMMUNITY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={linkCls}
      onClick={onNavigate}
    >
      Community <ExternalLink size={12} aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span>
    </a>
    <NavLink to="/contribute/" className={linkCls} activeClassName={activeCls} onClick={onNavigate}>Contribute</NavLink>
    <NavLink to="/handbook/" className={linkCls} activeClassName={activeCls} onClick={onNavigate}>Handbook</NavLink>
    <NavLink to="/sponsors/" className={linkCls} activeClassName={activeCls} onClick={onNavigate}>Sponsors</NavLink>
  </>
);

export const Navbar = (): JSX.Element => {
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const homeActive = location.pathname === "/";

  const triggerRef = useRef<HTMLButtonElement>(null);

  const closeMenu = (): void => setMenuOpen(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  // Trap Tab focus within the mobile menu so keyboard users cannot navigate
  // to obscured content while the drawer is open.
  useEffect(() => {
    if (!menuOpen) return;
    const menu = document.getElementById("mobile-menu");
    if (!menu) return;
    const focusable = Array.from(
      menu.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
    if (focusable.length > 0) focusable[0].focus();

    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key !== "Tab") return;
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

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
      className="fixed top-0 left-0 right-0 z-50 border-b border-[hsl(var(--surface-border))] bg-background"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-1.5">
        <Link to="/" aria-label="offon.dev" className="logo-link flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm">
          {/* Both always in DOM so React Router preloads both; CSS controls visibility. */}
          <img src={logoDark} alt="" aria-hidden="true" width={130} height={33} loading="eager" fetchPriority="high" className="h-8 dark:block hidden" />
          <img src={logoLight} alt="" aria-hidden="true" width={130} height={33} loading="eager" fetchPriority="high" className="h-8 block dark:hidden" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <NavLinks homeActive={homeActive} />
          <NavThemeToggle theme={theme} onToggle={toggle} className="hover:border-primary/30" />
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <NavThemeToggle theme={theme} onToggle={toggle} />
          <button
            ref={triggerRef}
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-11 w-11 items-center justify-center rounded-md border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] text-foreground/70 hover:text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-[hsl(var(--surface-border))] bg-background px-6 py-2 flex flex-col gap-1"
        >
          <NavLinks homeActive={homeActive} onNavigate={closeMenu} />
        </div>
      )}
    </nav>
  );
};
