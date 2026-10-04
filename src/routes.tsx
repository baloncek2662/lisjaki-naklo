import { Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import ScrollToTop from "@/components/ScrollToTop";
import PageTitle from "@/components/PageTitle";
import Index from "@/pages/Index";
import Tekme from "@/pages/Tekme";
import Statistika from "@/pages/Statistika";
import Novice from "@/pages/Novice";
import NovicaDetail from "@/pages/NovicaDetail";
import Galerija from "@/pages/Galerija";
import GalerijaEvent from "@/pages/GalerijaEvent";
import Turnir from "@/pages/Turnir";
import TurnirAdmin from "@/pages/TurnirAdmin";
import NotFound from "@/pages/NotFound";
import Zasebnost from "@/pages/Zasebnost";
import { newsData } from "@/data/news";
import { galleryEvents } from "@/data/gallery";
import type { RouteRecord } from "vite-react-ssg";

const queryClient = new QueryClient();

const AppLayout = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ScrollToTop />
      <PageTitle />
      <Outlet />
    </TooltipProvider>
  </QueryClientProvider>
);

export const routes: RouteRecord[] = [
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Index /> },
      { path: "tekme", element: <Tekme /> },
      { path: "statistika", element: <Statistika /> },
      { path: "zasebnost", element: <Zasebnost /> },
      { path: "novice", element: <Novice /> },
      {
        path: "novice/:slug",
        element: <NovicaDetail />,
        getStaticPaths: () => newsData.map((n) => `/novice/${n.slug}`),
      },
      { path: "galerija", element: <Galerija /> },
      { path: "turnir", element: <Turnir /> },
      { path: "turnir/vodenje", element: <TurnirAdmin /> },
      {
        path: "galerija/:slug",
        element: <GalerijaEvent />,
        getStaticPaths: () => galleryEvents.map((e) => `/galerija/${e.slug}`),
      },
      { path: "*", element: <NotFound /> },
    ],
  },
];
