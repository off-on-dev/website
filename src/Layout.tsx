import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, useEffect } from "react";
import { ThemeProvider } from "@/hooks/useTheme";
import { ConsentBanner } from "@/components/ConsentBanner";
import { ConsentProvider, useConsent } from "@/hooks/useConsent";

const queryClient = new QueryClient();

const ScrollToTop = (): null => {
  const { pathname } = useLocation();
  const { consent } = useConsent();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  useEffect(() => {
    if (consent === "granted" && typeof window.gtag === "function") {
      window.gtag("event", "page_view", { page_path: pathname });
    }
  }, [pathname, consent]);
  return null;
};

export function Layout(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ConsentProvider>
            <a href="#main-content" className="skip-nav">
              Skip to main content
            </a>
            <ScrollToTop />
            <ConsentBanner />
            <Suspense fallback={null}>
              <Outlet />
            </Suspense>
          </ConsentProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
