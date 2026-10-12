import { Link } from "react-router-dom";
import { playedMatches } from "@/data/matches";
import type { StandingRow } from "@/data/standings";
import { matchesURL } from "@/lib/football-results";

const outcomes = {
  win: { label: "Zmaga", letter: "Z", style: "bg-green-100 text-green-800 border-green-300" },
  draw: { label: "Neodločeno", letter: "N", style: "bg-yellow-100 text-yellow-900 border-yellow-400" },
  loss: { label: "Poraz", letter: "P", style: "bg-red-100 text-red-800 border-red-300" },
};

const FormStrip = ({ form, season, club }: { form?: StandingRow["form"]; season: string; club: string }) => {
  if (!form?.length) return <span className="text-xs font-normal text-muted-foreground">—</span>;
  return (
    <span className="flex flex-wrap gap-0.5" aria-label={`Forma ${club}, od starejše do zadnje tekme`}>
      {form.map((entry, index) => {
        const outcome = outcomes[entry.outcome];
        const match = playedMatches.find(match => match.season === season && match.id === entry.matchId);
        const description = `${outcome.label}${match ? `: ${match.home} ${match.homeScore}:${match.awayScore} ${match.away}, ${match.date}` : ""}${index === form.length - 1 ? ", zadnja tekma" : ""}`;
        const style = `inline-flex h-4 w-4 lg:h-5 lg:w-5 shrink-0 items-center justify-center rounded-sm border text-[10px] lg:text-xs font-semibold ${outcome.style}`;
        return match
          ? <Link key={entry.matchId} to={matchesURL(season, undefined, match.id)} title={description} aria-label={description} className={`${style} hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}>{outcome.letter}</Link>
          : <span key={entry.matchId} title={description} aria-label={description} className={style}>{outcome.letter}</span>;
      })}
    </span>
  );
};

export default FormStrip;
