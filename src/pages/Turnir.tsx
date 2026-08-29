import { useState } from "react";
import { CalendarDays, ChevronRight, CircleDot, Medal, Trophy, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTournament } from "@/hooks/use-tournament";
import {
  calculateRankings,
  getPlayerName,
  getTournamentProgress,
  TournamentMatch,
  TournamentTeam,
} from "@/lib/tournament";

const phaseLabel = {
  registration: "Prijave",
  preliminary: "Predtekmovanje",
  finals: "Zaključni del",
  finished: "Zaključeno",
};

const matchPhaseLabel = {
  preliminary: "Predtekmovanje",
  semifinal: "Polfinale",
  bronze: "Tekma za 3. mesto",
  final: "Finale",
};

const TeamPlayers = ({ team, names }: { team: TournamentTeam; names: (id: string) => string }) => (
  <div>
    <p className="font-bold text-foreground">{team.label}</p>
    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
      {team.playerIds.map((id) => `${names(id)}${team.jokerPlayerIds?.includes(id) ? " (joker)" : ""}`).join(" · ")}
    </p>
  </div>
);

const PublicMatch = ({ match, names }: { match: TournamentMatch; names: (id: string) => string }) => (
  <Card className="overflow-hidden border-border/80 shadow-sm">
    <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      <span>{matchPhaseLabel[match.phase]}</span>
      <span>Termin {match.wave} · Igrišče {match.court}</span>
    </div>
    <CardContent className="grid gap-4 p-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
      <TeamPlayers team={match.teamA} names={names} />
      <div className="flex min-w-24 items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-2xl font-black text-background">
        {match.locked ? (
          <><span>{match.scoreA}</span><span className="opacity-40">:</span><span>{match.scoreB}</span></>
        ) : (
          <span className="text-sm font-semibold uppercase tracking-wider opacity-70">še ni rezultata</span>
        )}
      </div>
      <div className="sm:text-right">
        <TeamPlayers team={match.teamB} names={names} />
      </div>
    </CardContent>
  </Card>
);

const winnerOf = (match?: TournamentMatch) => {
  if (!match?.locked || match.scoreA === null || match.scoreB === null) return null;
  return match.scoreA > match.scoreB ? match.teamA : match.teamB;
};

const Turnir = () => {
  const { tournament, loaded, syncError } = useTournament();
  const [selectedView, setSelectedView] = useState<number | "finals" | null>(null);
  const rankings = calculateRankings(tournament);
  const progress = getTournamentProgress(tournament);
  const currentRound = tournament.rounds.find((round) => round.status === "active") ??
    [...tournament.rounds].reverse().find((round) => round.status === "completed") ??
    tournament.rounds[0];
  const selectedRound = typeof selectedView === "number"
    ? tournament.rounds.find((round) => round.number === selectedView)
    : undefined;
  const showingFinals = Boolean(tournament.finals) && (selectedView === "finals" || selectedView === null);
  const displayedRound = showingFinals ? undefined : selectedRound ?? currentRound;
  const visibleMatches = showingFinals ? tournament.finals?.matches ?? [] : displayedRound?.matches ?? [];
  const playerName = (id: string) => getPlayerName(tournament, id);
  const champion = winnerOf(tournament.finals?.matches.find((match) => match.phase === "final"));
  const bronzeWinner = winnerOf(tournament.finals?.matches.find((match) => match.phase === "bronze"));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16 md:pt-20">
        <section className="relative overflow-hidden bg-foreground text-background">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full border-[48px] border-primary/10" />
          <div className="container relative mx-auto px-4 py-14 md:py-20">
            <div className="max-w-4xl">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <Badge className="gap-2 border-primary/30 bg-primary/15 text-orange-200 hover:bg-primary/15">
                  <CircleDot size={14} className="text-primary" />
                  {phaseLabel[tournament.phase]}
                </Badge>
                <span className="text-sm text-background/60">{progress.activePlayerCount} igralcev · 2 igrišči · 15 skupnih točk</span>
              </div>
              <h1 className="max-w-3xl text-balance text-4xl font-black tracking-tight md:text-6xl">
                Turnir odbojke <span className="text-primary">na mivki</span>
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-background/70">
                Naključne trojke, toliko predtekmovalnih krogov, kolikor dopušča čas, in osebna lestvica. Jokerjeva dodatna tekma se mu ne šteje v osebni rezultat.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="shadow-orange">
                  <a href="#lestvica">Poglej lestvico <ChevronRight size={18} /></a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {!loaded && (
          <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Nalaganje turnirja …</div>
        )}

        {loaded && (
          <>
            <section className="border-b bg-muted/30">
              <div className="container mx-auto grid gap-4 px-4 py-8 sm:grid-cols-3">
                <div className="flex items-center gap-4 rounded-xl bg-background p-4 shadow-sm">
                  <div className="rounded-xl bg-primary/10 p-3 text-primary"><Users size={24} /></div>
                  <div><p className="text-2xl font-black">{progress.activePlayerCount}</p><p className="text-sm text-muted-foreground">aktivnih igralcev</p></div>
                </div>
                <div className="flex items-center gap-4 rounded-xl bg-background p-4 shadow-sm">
                  <div className="rounded-xl bg-primary/10 p-3 text-primary"><CalendarDays size={24} /></div>
                  <div><p className="text-2xl font-black">{progress.completedRounds}</p><p className="text-sm text-muted-foreground">zaključenih krogov</p></div>
                </div>
                <div className="flex items-center gap-4 rounded-xl bg-background p-4 shadow-sm">
                  <div className="rounded-xl bg-primary/10 p-3 text-primary"><Trophy size={24} /></div>
                  <div><p className="text-2xl font-black">12</p><p className="text-sm text-muted-foreground">mest v polfinalu</p></div>
                </div>
              </div>
            </section>

            {syncError && (
              <div className="container mx-auto px-4 pt-8 text-sm font-medium text-destructive">{syncError}</div>
            )}

            <section className="container mx-auto px-4 py-12 md:py-16">
              {tournament.rounds.length > 0 && (
                <div className="mb-8 rounded-2xl border bg-muted/30 p-3">
                  <p className="mb-3 px-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">Izberi krog</p>
                  <div className="flex flex-wrap gap-2">
                    {tournament.rounds.map((round) => (
                      <Button
                        key={round.id}
                        size="sm"
                        variant={!showingFinals && displayedRound?.id === round.id ? "default" : "outline"}
                        onClick={() => setSelectedView(round.number)}
                        aria-current={!showingFinals && displayedRound?.id === round.id ? "page" : undefined}
                        className="gap-2"
                      >
                        <span className={`h-2 w-2 rounded-full ${round.status === "completed" ? "bg-emerald-500" : round.status === "active" ? "bg-amber-400" : "bg-muted-foreground/35"}`} />
                        {round.number}. krog
                      </Button>
                    ))}
                    {tournament.finals && (
                      <Button
                        size="sm"
                        variant={showingFinals ? "default" : "outline"}
                        onClick={() => setSelectedView("finals")}
                        aria-current={showingFinals ? "page" : undefined}
                      >
                        <Trophy size={15} /> Zaključni del
                      </Button>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 px-1 text-xs text-muted-foreground">
                    <span><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-emerald-500" />Zaključen</span>
                    <span><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-amber-400" />V teku</span>
                    <span><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-muted-foreground/35" />Načrtovan</span>
                  </div>
                </div>
              )}

              <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-primary">
                    {showingFinals ? "Zaključni del" : displayedRound ? `${displayedRound.number}. krog` : "Razpored"}
                  </p>
                  <h2 className="mt-2 text-3xl font-black">Tekme in rezultati</h2>
                </div>
                {displayedRound && (
                  <Badge variant="outline">Žreb {displayedRound.seed.slice(-8)}</Badge>
                )}
              </div>

              {showingFinals && champion && (
                <div className="mb-8 grid gap-4 md:grid-cols-2">
                  <Card className="overflow-hidden border-amber-300 bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 text-foreground">
                    <CardContent className="flex items-center gap-5 p-6">
                      <div className="rounded-full bg-amber-400 p-4 text-amber-950 shadow-lg shadow-amber-300/40"><Trophy size={30} /></div>
                      <div><p className="text-xs font-bold uppercase tracking-widest text-amber-700">Zmagovalci turnirja</p><h3 className="mt-1 text-2xl font-black">{champion.label}</h3><p className="mt-1 text-sm text-muted-foreground">{champion.playerIds.map(playerName).join(" · ")}</p></div>
                    </CardContent>
                  </Card>
                  {bronzeWinner && (
                    <Card className="border-orange-300 bg-orange-50">
                      <CardContent className="flex items-center gap-5 p-6">
                        <div className="flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-full bg-[#b46d35] text-2xl font-black text-white shadow-lg shadow-orange-300/40">3</div>
                        <div><p className="text-xs font-bold uppercase tracking-widest text-[#8a4b22]">3. mesto</p><h3 className="mt-1 text-2xl font-black">{bronzeWinner.label}</h3><p className="mt-1 text-sm text-muted-foreground">{bronzeWinner.playerIds.map(playerName).join(" · ")}</p></div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {visibleMatches.length > 0 ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  {visibleMatches.map((match) => <PublicMatch key={match.id} match={match} names={playerName} />)}
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="py-14 text-center">
                    <Users className="mx-auto mb-4 text-primary" size={36} />
                    <h3 className="text-xl font-bold">Čakamo na prvi žreb</h3>
                    <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
                      Ko organizator potrdi prijave in izžreba ekipe, se bo razpored prikazal tukaj.
                    </p>
                  </CardContent>
                </Card>
              )}
            </section>

            <section id="lestvica" className="bg-muted/40 py-12 md:py-16">
              <div className="container mx-auto px-4">
                <div className="mb-8 flex items-center gap-3">
                  <Medal className="text-primary" size={30} />
                  <div><p className="text-sm font-bold uppercase tracking-widest text-primary">Osebne točke</p><h2 className="text-3xl font-black">Lestvica igralcev</h2></div>
                </div>
                <Card className="overflow-hidden">
                  <CardHeader className="border-b bg-background">
                    <CardTitle className="text-base font-medium text-muted-foreground">
                      Lestvica se posodobi samo s potrjenimi rezultati. Prvih 12 napreduje.
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {rankings.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px] text-left">
                          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                            <tr><th className="px-5 py-3">Mesto</th><th className="px-5 py-3">Igralec</th><th className="px-5 py-3 text-center">Tekme</th><th className="px-5 py-3 text-center">Joker</th><th className="px-5 py-3 text-center">Zmage</th><th className="px-5 py-3 text-right">Točke</th></tr>
                          </thead>
                          <tbody className="divide-y">
                            {rankings.map((row) => (
                              <tr key={row.playerId} className={row.rank <= 12 ? "bg-primary/[0.04]" : "bg-background"}>
                                <td className="px-5 py-4"><span className={`inline-flex h-8 w-8 items-center justify-center rounded-full font-black ${row.rank <= 12 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{row.rank}</span></td>
                                <td className="px-5 py-4 font-bold">{row.name}{row.rank <= 12 && <span className="ml-2 text-xs font-semibold text-primary">POLFINALE</span>}</td>
                                <td className="px-5 py-4 text-center text-muted-foreground">{row.matches}</td>
                                <td className="px-5 py-4 text-center text-muted-foreground">{row.jokerAppearances}</td>
                                <td className="px-5 py-4 text-center text-muted-foreground">{row.wins}</td>
                                <td className="px-5 py-4 text-right text-xl font-black">{row.points}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-14 text-center text-muted-foreground">Lestvica bo vidna po prvih potrjenih rezultatih.</div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Turnir;
