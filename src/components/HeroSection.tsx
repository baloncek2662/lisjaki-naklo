import { Button } from "@/components/ui/button";
import { Trophy, Users } from "lucide-react";
import heroPitch from "@/assets/hero-pitch.jpg";

const HeroSection = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center pt-20"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroPitch}
          alt="Football pitch at sunset"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal/90 via-charcoal/80 to-primary/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground mb-6 animate-fade-in">
            Srce na igrišču, ponos Nakla
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Uradna stran kluba Lisjaki Naklo
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <a href="/tekme">
              <Button variant="default" size="xl" className="gap-2">
                <Trophy size={20} />
                Zadnji Rezultati
              </Button>
            </a>
            <Button variant="hero" size="xl" className="gap-2">
              <Users size={20} />
              Postani Član
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="w-6 h-10 border-2 border-primary-foreground/50 rounded-full flex justify-center">
          <div className="w-1.5 h-3 bg-primary-foreground/70 rounded-full mt-2 animate-pulse-soft" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
