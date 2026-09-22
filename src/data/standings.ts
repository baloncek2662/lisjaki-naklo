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

// Group B, as published by Športna zveza Radovljica on 22 September 2026.
export const standingsData: StandingRow[] = [
  {
    "pos": 1,
    "team": "ŠD Beli Gumb",
    "played": 2,
    "won": 2,
    "draw": 0,
    "lost": 0,
    "goalsFor": 15,
    "goalsAgainst": 2,
    "goalDiff": 13,
    "points": 6
  },
  {
    "pos": 2,
    "team": "ŠD Gorje",
    "played": 2,
    "won": 1,
    "draw": 1,
    "lost": 0,
    "goalsFor": 9,
    "goalsAgainst": 7,
    "goalDiff": 2,
    "points": 4
  },
  {
    "pos": 3,
    "team": "ŠD Dvorska vas",
    "played": 2,
    "won": 1,
    "draw": 1,
    "lost": 0,
    "goalsFor": 4,
    "goalsAgainst": 3,
    "goalDiff": 1,
    "points": 4
  },
  {
    "pos": 4,
    "team": "ŠD Lancovo",
    "played": 2,
    "won": 1,
    "draw": 0,
    "lost": 1,
    "goalsFor": 13,
    "goalsAgainst": 9,
    "goalDiff": 4,
    "points": 3
  },
  {
    "pos": 5,
    "team": "NK Hom",
    "played": 2,
    "won": 1,
    "draw": 0,
    "lost": 1,
    "goalsFor": 5,
    "goalsAgainst": 8,
    "goalDiff": -3,
    "points": 3
  },
  {
    "pos": 6,
    "team": "Realj Madrid",
    "played": 2,
    "won": 0,
    "draw": 1,
    "lost": 1,
    "goalsFor": 3,
    "goalsAgainst": 6,
    "goalDiff": -3,
    "points": 1
  },
  {
    "pos": 7,
    "team": "Čpinarji Ljubno",
    "played": 2,
    "won": 0,
    "draw": 1,
    "lost": 1,
    "goalsFor": 3,
    "goalsAgainst": 10,
    "goalDiff": -7,
    "points": 1
  },
  {
    "pos": 8,
    "team": "Lisjaki Naklo",
    "played": 2,
    "won": 0,
    "draw": 0,
    "lost": 2,
    "goalsFor": 1,
    "goalsAgainst": 8,
    "goalDiff": -7,
    "points": 0,
    "isHighlighted": true
  }
];
