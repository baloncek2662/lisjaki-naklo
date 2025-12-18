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
  { id: 1, home: "Lisjaki Naklo", away: "Smola", homeScore: 1, awayScore: 2, date: "15. Dec 2024", location: "Športni Park Naklo" },
  { id: 2, home: "ŠD Podnart", away: "Lisjaki Naklo", homeScore: 1, awayScore: 3, date: "8. Dec 2024", location: "Igrišče Podnart" },
  { id: 3, home: "Lisjaki Naklo", away: "Vrbnje", homeScore: 2, awayScore: 2, date: "1. Dec 2024", location: "Športni Park Naklo" },
  { id: 4, home: "Elmont Bled", away: "Lisjaki Naklo", homeScore: 0, awayScore: 1, date: "24. Nov 2024", location: "Bled" },
  { id: 5, home: "Lisjaki Naklo", away: "Gorje", homeScore: 4, awayScore: 1, date: "17. Nov 2024", location: "Športni Park Naklo" },
];

export const upcomingMatches: UpcomingMatch[] = [
  { id: 1, home: "Lisjaki Naklo", away: "Žirovnica", date: "22. Dec 2024", time: "15:00", location: "Športni Park Naklo" },
  { id: 2, home: "Bohinjska Bistrica", away: "Lisjaki Naklo", date: "29. Dec 2024", time: "14:00", location: "Bohinjska Bistrica" },
  { id: 3, home: "Lisjaki Naklo", away: "Radovljica B", date: "5. Jan 2025", time: "15:00", location: "Športni Park Naklo" },
];
