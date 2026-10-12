import type { PlayedMatch, UpcomingMatch } from "../data/matches";

export const normalizeClub = (name: string) => name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("sl").replace(/[^a-z0-9]/g, "");
export const isClubMatch = (match: PlayedMatch | UpcomingMatch, club: string) =>
  [match.home, match.away].some(name => normalizeClub(name) === normalizeClub(club));

export function matchOutcome(match: PlayedMatch) {
  const home = normalizeClub(match.home) === normalizeClub("Lisjaki Naklo");
  const difference = home ? match.homeScore - match.awayScore : match.awayScore - match.homeScore;
  return difference > 0 ? "win" : difference < 0 ? "loss" : "draw";
}

export function recentForm(matches: PlayedMatch[], season: string) {
  return matches.filter(match => match.season === season)
    .sort((a, b) => b.kickoff.localeCompare(a.kickoff) || b.id - a.id)
    .slice(0, 5).reverse();
}

export function matchesURL(season: string, club?: string, matchId?: number) {
  const params = new URLSearchParams({ season, view: "matches" });
  if (club && normalizeClub(club) !== normalizeClub("Lisjaki Naklo")) params.set("club", club);
  return `/tekme?${params}${matchId === undefined ? "" : `#tekma-${matchId}`}`;
}
