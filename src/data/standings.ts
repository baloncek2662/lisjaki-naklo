export interface StandingRow {
  pos: number;
  team: string;
  played: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  isHighlighted?: boolean;
}

export const standingsData: StandingRow[] = [
  { pos: 1, team: "Smola", played: 10, won: 8, draw: 1, lost: 1, points: 25 },
  { pos: 2, team: "ŠD Podnart", played: 10, won: 7, draw: 2, lost: 1, points: 23 },
  { pos: 3, team: "Vrbnje", played: 10, won: 6, draw: 2, lost: 2, points: 20 },
  { pos: 4, team: "Elmont Bled", played: 10, won: 5, draw: 3, lost: 2, points: 18 },
  { pos: 5, team: "NK Kropa", played: 10, won: 4, draw: 3, lost: 3, points: 15 },
  { pos: 6, team: "Radovljica B", played: 10, won: 3, draw: 3, lost: 4, points: 12 },
  { pos: 7, team: "Gorje United", played: 10, won: 2, draw: 2, lost: 6, points: 8 },
  { pos: 8, team: "Lisjaki Naklo", played: 10, won: 2, draw: 1, lost: 7, points: 7, isHighlighted: true },
  { pos: 9, team: "Škofja Loka B", played: 10, won: 1, draw: 2, lost: 7, points: 5 },
  { pos: 10, team: "Tržič", played: 10, won: 0, draw: 3, lost: 7, points: 3 },
];
