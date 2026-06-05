import { Outlet, useLocation } from "react-router";
import { useEffect, useRef, useState, type JSX } from "react";
import { ThemeProvider } from "@/hooks/useTheme";
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

export function Layout(): JSX.Element {
  return (
    <ThemeProvider>
      <ConsentProvider>
        <a href="#main-content" className="skip-nav">
          Skip to main content
        </a>
        <ScrollToTop />
        <RouteAnnouncer />
        <PageViewTracker />
        <ClickTracker />
        <ConsentBanner />
        <Outlet />
      </ConsentProvider>
    </ThemeProvider>
  );
}

export default Layout;
