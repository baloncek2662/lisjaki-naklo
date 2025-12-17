import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MatchCenter from "@/components/MatchCenter";
import StandingsTable from "@/components/StandingsTable";
import NewsSection from "@/components/NewsSection";
import ActivitiesSection from "@/components/ActivitiesSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <MatchCenter />
        <StandingsTable />
        <NewsSection />
        <ActivitiesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
