import { Calendar, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import logo from "@/assets/lisjaki-logo.jpg";

const MatchCenter = () => {
  // Mock data for next match
  const nextMatch = {
    homeTeam: "Lisjaki Naklo",
    awayTeam: "ŠD Podnart",
    date: "22. december 2024",
    time: "18:00",
    location: "Športni Park Radovljica",
    isUpcoming: true,
  };

  // Mock data for last result
  const lastResult = {
    homeTeam: "Smola",
    awayTeam: "Lisjaki Naklo",
    homeScore: 3,
    awayScore: 1,
    date: "15. december 2024",
  };

  return (
    <section id="matches" className="py-16 md:py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
          Tekme
        </h2>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Next Match Card */}
          <Card className="overflow-hidden shadow-elevated border-0">
            <div className="bg-primary px-6 py-3">
              <span className="text-sm font-semibold text-primary-foreground uppercase tracking-wide">
                Naslednja Tekma
              </span>
            </div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="text-center flex-1">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-secondary flex items-center justify-center">
                    <img
                      src={logo}
                      alt={nextMatch.homeTeam}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  </div>
                  <p className="font-semibold text-foreground text-sm">
                    {nextMatch.homeTeam}
                  </p>
                </div>

                <div className="px-4">
                  <span className="text-2xl font-bold text-muted-foreground">
                    VS
                  </span>
                </div>

                <div className="text-center flex-1">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-secondary flex items-center justify-center">
                    <span className="text-2xl font-bold text-muted-foreground">
                      ŠD
                    </span>
                  </div>
                  <p className="font-semibold text-foreground text-sm">
                    {nextMatch.awayTeam}
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-primary" />
                  <span>{nextMatch.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-primary" />
                  <span>{nextMatch.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-primary" />
                  <span>{nextMatch.location}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Last Result Card */}
          <Card className="overflow-hidden shadow-elevated border-0">
            <div className="bg-charcoal px-6 py-3">
              <span className="text-sm font-semibold text-primary-foreground uppercase tracking-wide">
                Zadnji Rezultat
              </span>
            </div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="text-center flex-1">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-secondary flex items-center justify-center">
                    <span className="text-2xl font-bold text-muted-foreground">
                      SM
                    </span>
                  </div>
                  <p className="font-semibold text-foreground text-sm">
                    {lastResult.homeTeam}
                  </p>
                </div>

                <div className="px-4 text-center">
                  <div className="text-4xl font-extrabold text-foreground">
                    {lastResult.homeScore}{" "}
                    <span className="text-muted-foreground">:</span>{" "}
                    {lastResult.awayScore}
                  </div>
                  <span className="text-xs text-muted-foreground uppercase">
                    Končni rezultat
                  </span>
                </div>

                <div className="text-center flex-1">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-secondary flex items-center justify-center">
                    <img
                      src={logo}
                      alt={lastResult.awayTeam}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  </div>
                  <p className="font-semibold text-foreground text-sm">
                    {lastResult.awayTeam}
                  </p>
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <Calendar size={16} className="text-primary" />
                  <span>{lastResult.date}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default MatchCenter;
