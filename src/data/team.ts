export interface Player {
  name: string;
  number?: number;
  initials: string;
  opponent?: boolean;
}

import records from './content/players.json';
export const teamData: Player[] = records;
export const playerMap = new Map<string, Player>(teamData.map(p => [p.initials,p]));
export const ownPlayers = teamData.filter(p => !p.opponent);
