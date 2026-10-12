import { leagueSeasons } from "@/data/matches";

const SeasonSelect = ({ value, onChange, includeAll = false }: { value: string; onChange: (season: string) => void; includeAll?: boolean }) => (
  <div className="flex flex-wrap items-center gap-3">
    <label htmlFor="season" className="font-medium">Sezona</label>
    <select id="season" value={value} onChange={event => onChange(event.target.value)} className="max-w-full rounded-md border border-border bg-background px-3 py-2 text-foreground">
      {includeAll && <option value="all">Vse sezone</option>}
      {leagueSeasons.map(({ season, group }) => <option key={season} value={season}>{season} · Liga {group}</option>)}
    </select>
  </div>
);

export default SeasonSelect;
