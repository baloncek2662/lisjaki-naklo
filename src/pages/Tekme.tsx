import { useState } from "react";
import { Calendar, MapPin, Trophy, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { playedMatches, upcomingMatches, pendingMatches, leagueSources, activeSeason, type PlayedMatch, type UpcomingMatch } from "@/data/matches";
import MatchTeamDetails from "@/components/MatchTeamDetails";

const MatchCard = ({ match }: { match: PlayedMatch | UpcomingMatch }) => {
  const isPlayed = "homeScore" in match;
  const [expanded, setExpanded] = useState(false);

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
            {"time" in match && match.time && <span>• {match.time}</span>}
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

        {isPlayed && match.details && (
          <>
            <div className={expanded ? "mt-4" : "hidden"}>
              <div className="border-t border-border pt-4">
                <div className="flex gap-6">
                  <MatchTeamDetails name={match.home} details={match.details.home} />
                  <div className="w-px bg-border shrink-0" />
                  <MatchTeamDetails name={match.away} details={match.details.away} />
                </div>
              </div>
            </div>

            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-4 w-full flex items-center justify-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {expanded ? (
                <><ChevronUp size={14} /> Skrij podrobnosti</>
              ) : (
                <><ChevronDown size={14} /> Pokaži podrobnosti</>
              )}
            </button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const Tekme = () => {
  const [season, setSeason] = useState<keyof typeof leagueSources>(activeSeason);
  const results = playedMatches.filter((match) => match.season === season);
  const fixtures = upcomingMatches.filter((match) => match.season === season);
  const pending = pendingMatches.filter((match) => match.season === season);
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-16 md:pt-20">
        <section className="bg-secondary py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-secondary-foreground mb-4">
              Tekme
            </h1>
            <p className="text-muted-foreground text-lg">
              Pregled vseh tekem kluba Lisjaki Naklo
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <label htmlFor="season" className="font-medium">Sezona</label>
              <select id="season" value={season} onChange={(event) => setSeason(event.target.value as keyof typeof leagueSources)} className="rounded-md border border-border bg-background px-3 py-2 text-foreground">
                <option value="2026/27">2026/27</option>
                <option value="2025/26">2025/26</option>
              </select>
              <a href={leagueSources[season]} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline">Vir: Športna zveza Radovljica</a>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-8">
              <Calendar className="text-primary" size={28} />
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Prihajajoče Tekme
              </h2>
            </div>
            {fixtures.length > 0 ? (
              <div className="grid gap-4">
                {fixtures.map((match) => (
                  <MatchCard key={match.id} match={match} />
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

        {pending.length > 0 && (
          <section className="pb-12">
            <div className="container mx-auto px-4">
              <h2 className="mb-3 text-2xl font-bold">Čakamo na rezultat</h2>
              <p className="mb-6 text-muted-foreground">Rezultat še ni objavljen pri organizatorju lige.</p>
              <div className="grid gap-4">{pending.map((match) => <MatchCard key={match.id} match={match} />)}</div>
            </div>
          </section>
        )}

        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-8">
              <Trophy className="text-primary" size={28} />
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Odigrane Tekme
              </h2>
            </div>
            <div className="grid gap-4">
              {results.map((match) => (
                <MatchCard key={match.id} match={match} />
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
