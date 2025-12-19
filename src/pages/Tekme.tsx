import { Calendar, MapPin, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { playedMatches, upcomingMatches } from "@/data/matches";

const MatchCard = ({ match, isPlayed }: { match: any; isPlayed: boolean }) => {
  const isLisjakiHome = match.home === "Lisjaki Naklo";
  const lisjakiWon = isPlayed && (
    (isLisjakiHome && match.homeScore > match.awayScore) ||
    (!isLisjakiHome && match.awayScore > match.homeScore)
  );
  const isDraw = isPlayed && match.homeScore === match.awayScore;

  return (
    <Card className="border-border hover:shadow-elevated transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Calendar size={16} />
            {match.date}
            {!isPlayed && match.time && <span>• {match.time}</span>}
          </div>
          {isPlayed && (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              lisjakiWon ? "bg-green-100 text-green-700" : isDraw ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
            }`}>
              {lisjakiWon ? "Zmaga" : isDraw ? "Neodločeno" : "Poraz"}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1 text-center">
            <p className={`font-bold text-lg ${match.home === "Lisjaki Naklo" ? "text-primary" : "text-foreground"}`}>
              {match.home}
            </p>
          </div>
          
          <div className="px-6">
            {isPlayed ? (
              <div className="flex items-center gap-2 text-2xl font-bold">
                <span className={match.home === "Lisjaki Naklo" ? "text-primary" : "text-foreground"}>
                  {match.homeScore}
                </span>
                <span className="text-muted-foreground">:</span>
                <span className={match.away === "Lisjaki Naklo" ? "text-primary" : "text-foreground"}>
                  {match.awayScore}
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground font-medium">vs</span>
            )}
          </div>

          <div className="flex-1 text-center">
            <p className={`font-bold text-lg ${match.away === "Lisjaki Naklo" ? "text-primary" : "text-foreground"}`}>
              {match.away}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-4 text-muted-foreground text-sm">
          <MapPin size={14} />
          {match.location}
        </div>
      </CardContent>
    </Card>
  );
};

const Tekme = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-16 md:pt-20">
        {/* Header */}
        <section className="bg-secondary py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-secondary-foreground mb-4">
              Tekme
            </h1>
            <p className="text-muted-foreground text-lg">
              Pregled vseh tekem kluba Lisjaki Naklo
            </p>
          </div>
        </section>

        {/* Upcoming Matches */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-8">
              <Calendar className="text-primary" size={28} />
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Prihajajoče Tekme
              </h2>
            </div>
            {upcomingMatches.length > 0 ? (
              <div className="grid gap-4">
                {upcomingMatches.map((match) => (
                  <MatchCard key={match.id} match={match} isPlayed={false} />
                ))}
              </div>
            ) : (
              <Card className="border-border">
                <CardContent className="p-8 text-center text-muted-foreground">
                  Trenutno ni načrtovanih tekem
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Played Matches */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-8">
              <Trophy className="text-primary" size={28} />
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Odigrane Tekme
              </h2>
            </div>
            <div className="grid gap-4">
              {playedMatches.map((match) => (
                <MatchCard key={match.id} match={match} isPlayed={true} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Tekme;