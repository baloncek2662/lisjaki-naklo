import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import Tekme from "./pages/Tekme";
import Novice from "./pages/Novice";
import NovicaDetail from "./pages/NovicaDetail";
import Galerija from "./pages/Galerija";
import GalerijaEvent from "./pages/GalerijaEvent";
import Statistika from "./pages/Statistika";
import Turnir from "./pages/Turnir";
import TurnirAdmin from "./pages/TurnirAdmin";
import NotFound from "./pages/NotFound";
import Zasebnost from "./pages/Zasebnost";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/tekme" element={<Tekme />} />
          <Route path="/novice" element={<Novice />} />
          <Route path="/novice/:slug" element={<NovicaDetail />} />
          <Route path="/galerija" element={<Galerija />} />
          <Route path="/galerija/:slug" element={<GalerijaEvent />} />
          <Route path="/statistika" element={<Statistika />} />
          <Route path="/zasebnost" element={<Zasebnost />} />
          <Route path="/turnir" element={<Turnir />} />
          <Route path="/turnir/vodenje" element={<TurnirAdmin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
