export interface PlayedMatch {
  id: number;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  date: string;
  location: string;
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
