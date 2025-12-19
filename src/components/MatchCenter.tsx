import { Calendar, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import logo from "@/assets/lisjaki-logo.jpg";
import { playedMatches, upcomingMatches } from "@/data/matches";

const MatchCenter = () => {
  const nextMatch = upcomingMatches[0];
  const lastResult = playedMatches[0];

  // Determine if Lisjaki is home or away for display purposes
  const isLisjakiHome = lastResult?.home === "Lisjaki Naklo";

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
              {nextMatch ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-center flex-1">
                      <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-secondary flex items-center justify-center">
                        {nextMatch.home === "Lisjaki Naklo" ? (
                          <img
                            src={logo}
                            alt={nextMatch.home}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-bold text-muted-foreground">
                            {nextMatch.home.substring(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-foreground text-sm">
                        {nextMatch.home}
                      </p>
                    </div>

                    <div className="px-4">
                      <span className="text-2xl font-bold text-muted-foreground">
                        VS
                      </span>
                    </div>

                    <div className="text-center flex-1">
                      <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-secondary flex items-center justify-center">
                        {nextMatch.away === "Lisjaki Naklo" ? (
                          <img
                            src={logo}
                            alt={nextMatch.away}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-bold text-muted-foreground">
                            {nextMatch.away.substring(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-foreground text-sm">
                        {nextMatch.away}
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
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Trenutno ni načrtovanih tekem</p>
                </div>
              )}
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
              {lastResult ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-center flex-1">
                      <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-secondary flex items-center justify-center">
                        {lastResult.home === "Lisjaki Naklo" ? (
                          <img
                            src={logo}
                            alt={lastResult.home}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-bold text-muted-foreground">
                            {lastResult.home.substring(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-foreground text-sm">
                        {lastResult.home}
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
                        {lastResult.away === "Lisjaki Naklo" ? (
                          <img
                            src={logo}
                            alt={lastResult.away}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-bold text-muted-foreground">
                            {lastResult.away.substring(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-foreground text-sm">
                        {lastResult.away}
                      </p>
                    </div>
                  </div>

                  <div className="text-center text-sm text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <Calendar size={16} className="text-primary" />
                      <span>{lastResult.date}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Ni preteklih tekem</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default MatchCenter;
