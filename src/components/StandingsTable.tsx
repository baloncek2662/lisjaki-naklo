import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FormStrip from "@/components/FormStrip";
import { Trophy } from "lucide-react";
import { standingsBySeason } from "@/data/standings";
import { matchesURL } from "@/lib/football-results";
import { activeSeason } from "@/data/matches";

const StandingsTable = ({ season = activeSeason, showSeasonLink = true }: { season?: string; showSeasonLink?: boolean }) => {
  const [details, setDetails] = useState(false);
  const table = standingsBySeason[season];
  return (
    <section id="standings" className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Trophy className="w-8 h-8 text-primary" />
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Lestvica</h2>
        </div>
        {!table ? <p className="text-center text-muted-foreground">Lestvica za to sezono še ni na voljo.</p> : <>
          <p className="max-w-4xl mx-auto mb-4 text-sm text-muted-foreground">
            Stanje na dan {new Date(table.asOf + "T12:00:00Z").toLocaleDateString("sl-SI", { timeZone: "Europe/Ljubljana" })} · <a href={table.source} target="_blank" rel="noopener noreferrer" className="text-primary underline">Športna zveza Radovljica</a>
          </p>
          <Card className="max-w-4xl mx-auto shadow-elevated border-0 overflow-hidden">
            <CardHeader className="bg-charcoal text-primary-foreground px-4 sm:px-6">
              <CardTitle className="text-lg md:text-xl">Liga malega nogometa {table.season} · Liga {table.group}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full table-fixed md:table-auto text-sm tabular-nums">
                <caption className="sr-only">Lestvica sezone {table.season}, liga {table.group}</caption>
                <thead className="bg-secondary text-foreground">
                  <tr className="border-b border-border">
                    <th scope="col" className="w-8 md:w-12 py-4 text-center">#</th>
                    <th scope="col" className="px-2 py-4 text-left">Klub</th>
                    <th scope="col" className="w-8 md:w-12 py-4" title="Odigrane tekme">T</th>
                    <th scope="col" className="hidden md:table-cell w-12 py-4" title="Zmage">Z</th>
                    <th scope="col" className="hidden md:table-cell w-12 py-4" title="Neodločeno">N</th>
                    <th scope="col" className="hidden md:table-cell w-12 py-4" title="Porazi">P</th>
                    <th scope="col" className="hidden md:table-cell w-12 py-4" title="Doseženi zadetki">DZ</th>
                    <th scope="col" className="hidden md:table-cell w-12 py-4" title="Prejeti zadetki">PZ</th>
                    <th scope="col" className="w-10 md:w-12 py-4" title="Gol razlika">GR</th>
                    <th scope="col" className="w-14 md:w-16 py-4">Točke</th>
                    <th scope="col" className="hidden md:table-cell w-28 lg:w-32 px-2 py-4 text-left">Forma</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {table.rows.map(row => (
                    <tr key={row.team} className={row.isHighlighted ? "bg-accent text-primary" : "hover:bg-secondary/50"}>
                      <td className={`py-4 text-center font-bold ${row.pos <= 2 ? "shadow-[inset_3px_0_0_0] shadow-green-600" : row.pos > table.rows.length - 2 ? "shadow-[inset_3px_0_0_0] shadow-red-600" : ""}`}>
                        <span className="sr-only">{row.pos <= 2 ? "Mesto za napredovanje: " : row.pos > table.rows.length - 2 ? "Mesto za izpad: " : ""}</span>{row.pos}
                      </td>
                      <td className="px-2 py-4 font-semibold break-words">
                        <Link to={matchesURL(season, row.team)} className="underline decoration-current/30 underline-offset-4 hover:decoration-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={row.isHighlighted ? `Vse tekme Lisjakov, ${season}` : `Tekme Lisjakov proti ${row.team}, ${season}`}>{row.team}</Link>
                        <div className="md:hidden mt-1.5"><FormStrip form={row.form} season={season} club={row.team} /></div>
                        {details && <div className="md:hidden mt-1 text-xs font-normal text-muted-foreground">Z {row.won} · N {row.draw} · P {row.lost}<br />Zadetki {row.goalsFor}:{row.goalsAgainst}</div>}
                      </td>
                      <td className="py-4 text-center text-muted-foreground">{row.played}</td>
                      <td className="hidden md:table-cell py-4 text-center text-muted-foreground">{row.won}</td>
                      <td className="hidden md:table-cell py-4 text-center text-muted-foreground">{row.draw}</td>
                      <td className="hidden md:table-cell py-4 text-center text-muted-foreground">{row.lost}</td>
                      <td className="hidden md:table-cell py-4 text-center text-muted-foreground">{row.goalsFor}</td>
                      <td className="hidden md:table-cell py-4 text-center text-muted-foreground">{row.goalsAgainst}</td>
                      <td className={`py-4 text-center ${row.goalDiff > 0 ? "text-green-600" : row.goalDiff < 0 ? "text-red-600" : "text-muted-foreground"}`}>{row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}</td>
                      <td className="py-4 text-center font-bold">{row.points}</td>
                      <td className="hidden md:table-cell px-2 py-4"><FormStrip form={row.form} season={season} club={row.team} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button type="button" className="md:hidden w-full border-t border-border px-4 py-3 text-sm font-medium text-primary hover:bg-secondary/50" aria-expanded={details} onClick={() => setDetails(value => !value)}>
                {details ? "Skrij podrobnosti" : "Pokaži podrobnosti"}
              </button>
            </CardContent>
          </Card>
          <div className="max-w-4xl mx-auto mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs">
            <span className="flex items-center gap-2"><span className="h-3 w-1 bg-green-600" aria-hidden="true" />1.–2. mesto · napredovanje</span>
            <span className="flex items-center gap-2"><span className="h-3 w-1 bg-red-600" aria-hidden="true" />{table.rows.length - 1}.–{table.rows.length}. mesto · izpad</span>
          </div>
          <p className="max-w-4xl mx-auto mt-3 text-xs text-muted-foreground">T – tekme · GR – gol razlika<span className="hidden md:inline"> · Z – zmage · N – neodločeno · P – porazi · DZ – doseženi zadetki · PZ – prejeti zadetki</span></p>
          <p className="max-w-4xl mx-auto mt-2 text-xs text-muted-foreground">Forma: zadnjih pet tekem, od starejše do zadnje → · Z – zmaga · N – neodločeno · P – poraz</p>
          {showSeasonLink && <div className="max-w-4xl mx-auto mt-4"><Link to="/tekme?view=standings" className="text-sm font-medium text-primary hover:underline">Tekme in lestvice vseh sezon →</Link></div>}
        </>}
      </div>
    </section>
  );
};

export default StandingsTable;
