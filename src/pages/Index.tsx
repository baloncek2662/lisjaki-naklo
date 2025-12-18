import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MatchCenter from "@/components/MatchCenter";
import StandingsTable from "@/components/StandingsTable";
import TeamSection from "@/components/TeamSection";
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
        <TeamSection />
        <NewsSection />
        <ActivitiesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
