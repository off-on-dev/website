import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ThemeProvider } from "@/hooks/useTheme";

const Index = lazy(() => import("./pages/Index"));
const AdventureDetail = lazy(() => import("./pages/AdventureDetail"));
const ChallengeDetail = lazy(() => import("./pages/ChallengeDetail"));
const Sponsors = lazy(() => import("./pages/Sponsors"));
const About = lazy(() => import("./pages/About"));
const Docs = lazy(() => import("./pages/Docs"));
const CommunityGuide = lazy(() => import("./pages/CommunityGuide"));
const TopicPage = lazy(() => import("./pages/TopicPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();
const basename = import.meta.env.BASE_URL.replace(/\/+$/, "");

const App = (): JSX.Element => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={basename} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/adventures/:id" element={<AdventureDetail />} />
            <Route path="/adventures/:id/levels/:levelId" element={<ChallengeDetail />} />
            <Route path="/sponsors" element={<Sponsors />} />
            <Route path="/about" element={<About />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/docs/community-guide" element={<CommunityGuide />} />
            <Route path="/topics/:tag" element={<TopicPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
