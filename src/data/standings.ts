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

export const standingsData: StandingRow[] = [
  { pos: 1, team: "Smola", played: 7, won: 6, draw: 1, lost: 0, goalsFor: 40, goalsAgainst: 14, goalDiff: 26, points: 19 },
  { pos: 2, team: "ŠD Podnart", played: 7, won: 5, draw: 1, lost: 1, goalsFor: 35, goalsAgainst: 22, goalDiff: 13, points: 16 },
  { pos: 3, team: "Vrbnje", played: 7, won: 4, draw: 0, lost: 3, goalsFor: 20, goalsAgainst: 16, goalDiff: 4, points: 12 },
  { pos: 4, team: "Elmont Bled", played: 7, won: 4, draw: 0, lost: 3, goalsFor: 28, goalsAgainst: 29, goalDiff: -1, points: 12 },
  { pos: 5, team: "Baffi Brezje", played: 7, won: 3, draw: 0, lost: 4, goalsFor: 22, goalsAgainst: 24, goalDiff: -2, points: 9 },
  { pos: 6, team: "KMN Utrip", played: 7, won: 2, draw: 1, lost: 4, goalsFor: 25, goalsAgainst: 30, goalDiff: -5, points: 7 },
  { pos: 7, team: "MST-Activity", played: 7, won: 2, draw: 0, lost: 5, goalsFor: 33, goalsAgainst: 46, goalDiff: -13, points: 6 },
  { pos: 8, team: "Lisjaki Naklo", played: 7, won: 0, draw: 1, lost: 6, goalsFor: 16, goalsAgainst: 38, goalDiff: -22, points: 1, isHighlighted: true },
];
