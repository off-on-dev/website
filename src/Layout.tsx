import { Outlet, useLocation } from "react-router";
import { useEffect, type JSX } from "react";
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
  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      // Defer past commit so the target element exists in the new route.
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ block: "start" });
      });
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
};

const PageViewTracker = (): null => {
  const { pathname } = useLocation();
  const { consent } = useConsent();
  useEffect(() => {
    if (consent === "granted" && typeof window.gtag === "function") {
      window.gtag("event", "page_view", {
        page_path: pathname,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  }, [pathname, consent]);
  return null;
};

const ClickTracker = (): null => {
  useClickTracking();
  return null;
};

export function Layout(): JSX.Element {
  return (
    <ThemeProvider>
      <ConsentProvider>
        <a href="#main-content" className="skip-nav">
          Skip to main content
        </a>
        <ScrollToTop />
        <PageViewTracker />
        <ClickTracker />
        <ConsentBanner />
        <Outlet />
      </ConsentProvider>
    </ThemeProvider>
  );
}

export default Layout;
