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
}

import records from './content/standings.json';
export const standingsData: StandingRow[] = records.rows;
export const standingsMetadata = records;
