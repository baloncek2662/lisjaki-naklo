export interface GoalEvent {
  player: string;
  minute?: number;
}

export interface TeamDetails {
  goalscorers: GoalEvent[];
  lineup: string[];
  substitutions?: string[];
}

export interface MatchDetails {
  home: TeamDetails;
  away: TeamDetails;
}

export interface PlayedMatch {
  id: number;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  date: string;
  location: string;
  details?: MatchDetails;
}

export interface UpcomingMatch {
  id: number;
  home: string;
  away: string;
  date: string;
  time: string;
  location: string;
}

export const playedMatches: PlayedMatch[] = [
  {
    id: 9,
    home: "Lisjaki Naklo",
    away: "Baffi Brezje",
    homeScore: 4,
    awayScore: 2,
    date: "31. maj 2026",
    location: "Športni park Radovljica",
    details: {
      home: {
        goalscorers: [
          { player: "UM" },
          { player: "JJ" },
          { player: "TH" },
          { player: "BL" },
        ],
        lineup: ["GA", "UM", "JJ", "TH", "BL", "TK", "GM", "DN", "MP", "BŽ"],
        substitutions: [],
      },
      away: {
        goalscorers: [],
        lineup: [],
        substitutions: [],
      },
    },
  },
  {
    id: 11,
    home: "KMN Utrip",
    away: "Lisjaki Naklo",
    homeScore: 4,
    awayScore: 2,
    date: "17. maj 2026",
    location: "Nomenj",
    details: {
      home: {
        goalscorers: [],
        lineup: [],
        substitutions: [],
      },
      away: {
        goalscorers: [
          { player: "MP" },
          { player: "DN" },
        ],
        lineup: ["GA", "UM", "TH", "EP", "MP", "DN", "TK", "BŽ"],
        substitutions: [],
      },
    },
  },
  {
    id: 10,
    home: "Lisjaki Naklo",
    away: "Smola",
    homeScore: 1,
    awayScore: 13,
    date: "10. maj 2026",
    location: "Športni park Radovljica",
    details: {
      home: {
        goalscorers: [
          { player: "GP" },
        ],
        lineup: ["GA", "UM", "BL", "TH", "GP", "DN", "BŽ", "GM"],
        substitutions: [],
      },
      away: {
        goalscorers: [],
        lineup: [],
        substitutions: [],
      },
    },
  },
  {
    id: 8,
    home: "Lisjaki Naklo",
    away: "Na'Klani",
    homeScore: 3,
    awayScore: 2,
    date: "28. feb. 2026",
    location: "Športni park Naklo",
    details: {
      home: {
        goalscorers: [
          { player: "GM" },
          { player: "GP" },
          { player: "JJ" },
        ],
        lineup: ["GA", "UM", "BL", "MG", "EP", "GP", "JJ", "DP", "TC", "GM", "MP", "DN"],
        substitutions: ["TP", "TH", "AŠ", "NŠ", "AL"],
      },
      away: {
        goalscorers: [
          {player: "O_ES"},
          {player: "O_ES"},
        ],
        lineup: [
          // TODO: "Ime Priimek",
        ],
        substitutions: [],
      },
    },
  },
  { id: 1, home: "Baffi Brezje", away: "Lisjaki Naklo", homeScore: 2, awayScore: 0, date: "26. okt. 2025", location: "Črnivec" },
  { id: 2, home: "MST-Activity", away: "Lisjaki Naklo", homeScore: 9, awayScore: 6, date: "19. okt. 2025", location: "Hrušica" },
  { id: 3, home: "Lisjaki Naklo", away: "ŠD Podnart", homeScore: 4, awayScore: 4, date: "12. okt. 2025", location: "Športni park Radovljica" },
  { id: 4, home: "Vrbnje", away: "Lisjaki Naklo", homeScore: 3, awayScore: 2, date: "28. sep. 2025", location: "Športni park Vrbnje" },
  { id: 5, home: "Lisjaki Naklo", away: "KMN Utrip", homeScore: 3, awayScore: 5, date: "21. sep. 2025", location: "Športni park Radovljica" },
  { id: 6, home: "Smola", away: "Lisjaki Naklo", homeScore: 11, awayScore: 1, date: "14. sep. 2025", location: "Športni park Radovljica" },
  { id: 7, home: "Lisjaki Naklo", away: "Elmont Bled", homeScore: 0, awayScore: 4, date: "7. sep. 2025", location: "Športni park Radovljica" },
];

export const upcomingMatches: UpcomingMatch[] = [
  // Add upcoming matches when available from the schedule
];
