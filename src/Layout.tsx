import { Outlet, useLocation } from "react-router";
import { useEffect, useRef, useState, type JSX } from "react";
import { ThemeProvider, useTheme } from "@/hooks/useTheme";
import { ConsentBanner } from "@/components/ConsentBanner";
import { ConsentProvider, useConsent } from "@/hooks/useConsent";
import { useClickTracking } from "@/hooks/useClickTracking";

// On route change, either scroll to the top of the page or, when the URL has
// a hash, scroll the matching element into view. React Router does not handle
// hash anchor scrolling on client-side navigation by default, so cross-route
// links like /about#board would otherwise leave the user at the wrong scroll
// position.
const ScrollToTop = (): null => {
  const { pathname, hash } = useLocation();
  const prevPathname = useRef<string | null>(null);

  useEffect(() => {
    const prev = prevPathname.current;
    prevPathname.current = pathname;

    if (hash) {
      const id = hash.slice(1);
      // Defer past commit so the target element exists in the new route.
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ block: "start" });
      });
      return;
    }

    // Suppress scroll reset when navigating between /challenges and
    // /challenges/:tag (e.g. clicking a TagChip or direct-linking to a tag).
    // Filter interactions (topic/difficulty toggles) never change the pathname,
    // so they don't reach this guard at all.
    if (prev !== null && prev.startsWith("/challenges") && pathname.startsWith("/challenges")) return;

    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
};

// Fires gtag page_view on every SPA route change, but only when consent is
// granted. Pushing page_view events to dataLayer while gtag.js is not loaded
// would queue them; the moment the user later clicks Accept, gtag.js drains
// the queue and retroactively sends pageviews for every route the visitor
// browsed while consent was undecided or denied. Gating prevents that.
const PageViewTracker = (): null => {
  const { pathname } = useLocation();
  const { consent } = useConsent();
  useEffect(() => {
    if (consent !== "granted") return;
    if (typeof window.gtag !== "function") return;
    window.gtag("event", "page_view", {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, consent]);
  return null;
};

const ClickTracker = (): null => {
  useClickTracking();
  return null;
};

// Moves focus to #main-content after each SPA route change so keyboard and
// AT users land in the main content area rather than on <body>.
// All page <main> elements already carry id="main-content" tabIndex={-1}.
// Skips the initial mount (same pattern as RouteAnnouncer) to avoid an
// intrusive focus jump on first page load.
const FocusReset = (): null => {
  const { pathname } = useLocation();
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    const raf = requestAnimationFrame(() => {
      (document.getElementById("main-content") as HTMLElement | null)?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);
  return null;
};

// Announces page title to screen readers on SPA navigation. Skips the initial
// mount so users don't hear an announcement when they first load the page.
const RouteAnnouncer = (): JSX.Element => {
  const { pathname } = useLocation();
  const [announcement, setAnnouncement] = useState("");
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    const raf = requestAnimationFrame(() => {
      setAnnouncement(document.title || pathname);
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return (
    <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {announcement}
    </span>
  );
};

// Announces theme changes to screen readers. Skips the initial mount to avoid
// announcing the default theme on page load.
const ThemeAnnouncer = (): JSX.Element => {
  const { theme } = useTheme();
  const [announcement, setAnnouncement] = useState("");
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    setAnnouncement(theme === "dark" ? "Switched to dark mode" : "Switched to light mode");
    const t = setTimeout(() => setAnnouncement(""), 1000);
    return () => clearTimeout(t);
  }, [theme]);

  return (
    <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {announcement}
    </span>
  );
};

export function Layout(): JSX.Element {
  return (
    <ThemeProvider>
      <ConsentProvider>
        <a href="#main-content" className="skip-nav">
          Skip to main content
        </a>
        <ScrollToTop />
        <FocusReset />
        <RouteAnnouncer />
        <ThemeAnnouncer />
        <PageViewTracker />
        <ClickTracker />
        <ConsentBanner />
        <Outlet />
      </ConsentProvider>
    </ThemeProvider>
  );
}

export default Layout;
