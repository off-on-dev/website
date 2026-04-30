import { Outlet, useLocation } from "react-router";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, type JSX } from "react";
import { ThemeProvider } from "@/hooks/useTheme";
import { ConsentBanner } from "@/components/ConsentBanner";
import { ConsentProvider, useConsent } from "@/hooks/useConsent";

const ScrollToTop = (): null => {
  const { pathname, hash } = useLocation();
  const { consent } = useConsent();
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  useEffect(() => {
    if (consent === "granted" && typeof window.gtag === "function") {
      window.gtag("event", "page_view", { page_path: pathname });
    }
  }, [pathname, consent]);
  return null;
};

export function Layout(): JSX.Element {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <Sonner />
        <ConsentProvider>
          <a href="#main-content" className="skip-nav">
            Skip to main content
          </a>
          <ScrollToTop />
          <ConsentBanner />
          <Outlet />
        </ConsentProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default Layout;
