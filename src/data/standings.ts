export interface StandingRow {
  pos: number;
  team: string;
  played: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  isHighlighted?: boolean;
  form?: { matchId: number; outcome: "win" | "draw" | "loss" }[];
}

export interface SeasonStandings {
  season: string;
  group: string;
  source: string;
  asOf: string;
  rows: StandingRow[];
}

import records from './content/standings.json';
const tables = [records, ...(records.archives ?? [])] as SeasonStandings[];
export const standingsData = tables[0].rows;
export const standingsMetadata = tables[0];
export const standingsBySeason: Record<string, SeasonStandings> = Object.fromEntries(tables.map(table => [table.season, table]));
