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
  season: string;
  kickoff: string;
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
  season: string;
  kickoff: string;
  home: string;
  away: string;
  date: string;
  time: string;
  location: string;
}

import records from './content/matches.json';
import settings from './content/settings.json';
export const leagueSources: Record<string,string> = Object.fromEntries(Object.entries(settings.seasons).map(([season, value]) => [season, value.source]));
export const playedMatches: PlayedMatch[] = records.played;
export const upcomingMatches: UpcomingMatch[] = records.upcoming;
export const pendingMatches: UpcomingMatch[] = records.pending;
export const activeSeason = settings.activeSeason;
