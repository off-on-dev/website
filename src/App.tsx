import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import Index from "./pages/Index";
import AdventureDetail from "./pages/AdventureDetail";
import Sponsors from "./pages/Sponsors";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import SimulatorRPG from "./pages/SimulatorRPG";
import SimulatorStrategic from "./pages/SimulatorStrategic";
import SimulatorOpenFuture from "./pages/SimulatorOpenFuture";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/adventures/:id" element={<AdventureDetail />} />
            <Route path="/adventures/:id/levels/:levelId" element={<AdventureDetail />} />
            <Route path="/sponsors" element={<Sponsors />} />
            <Route path="/about" element={<About />} />
            <Route path="/simulator/rpg" element={<SimulatorRPG />} />
            <Route path="/simulator/strategic" element={<SimulatorStrategic />} />
            <Route path="/simulator/open-future" element={<SimulatorOpenFuture />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
