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

// Group B, checked against Športna zveza Radovljica on 27 September 2026.
export const standingsData: StandingRow[] = [
  {
    "pos": 1,
    "team": "ŠD Beli Gumb",
    "played": 3,
    "won": 3,
    "draw": 0,
    "lost": 0,
    "goalsFor": 20,
    "goalsAgainst": 6,
    "goalDiff": 14,
    "points": 9
  },
  {
    "pos": 2,
    "team": "ŠD Dvorska vas",
    "played": 3,
    "won": 1,
    "draw": 2,
    "lost": 0,
    "goalsFor": 9,
    "goalsAgainst": 6,
    "goalDiff": 3,
    "points": 5
  },
  {
    "pos": 3,
    "team": "ŠD Gorje",
    "played": 3,
    "won": 1,
    "draw": 1,
    "lost": 1,
    "goalsFor": 9,
    "goalsAgainst": 10,
    "goalDiff": -1,
    "points": 4
  },
  {
    "pos": 4,
    "team": "Realj Madrid",
    "played": 3,
    "won": 1,
    "draw": 1,
    "lost": 1,
    "goalsFor": 9,
    "goalsAgainst": 11,
    "goalDiff": -2,
    "points": 4
  },
  {
    "pos": 5,
    "team": "Lisjaki Naklo",
    "played": 3,
    "won": 1,
    "draw": 1,
    "lost": 1,
    "goalsFor": 9,
    "goalsAgainst": 12,
    "goalDiff": -3,
    "points": 4,
    "isHighlighted": true
  },
  {
    "pos": 6,
    "team": "ŠD Lancovo",
    "played": 3,
    "won": 1,
    "draw": 0,
    "lost": 2,
    "goalsFor": 17,
    "goalsAgainst": 14,
    "goalDiff": 3,
    "points": 3
  },
  {
    "pos": 7,
    "team": "NK Hom",
    "played": 3,
    "won": 1,
    "draw": 0,
    "lost": 2,
    "goalsFor": 7,
    "goalsAgainst": 13,
    "goalDiff": -6,
    "points": 3
  },
  {
    "pos": 8,
    "team": "Čpinarji Ljubno",
    "played": 3,
    "won": 0,
    "draw": 1,
    "lost": 2,
    "goalsFor": 8,
    "goalsAgainst": 16,
    "goalDiff": -8,
    "points": 1
  }
];
