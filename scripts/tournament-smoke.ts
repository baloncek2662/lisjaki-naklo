import {
  calculateRankings,
  createDefaultTournament,
  generateAllPreliminaryRounds,
  generateFinals,
  TournamentState,
} from "../src/lib/tournament";
import { isOrganizerHost } from "../src/hooks/use-organizer-access";

if (!isOrganizerHost("localhost") || !isOrganizerHost("127.0.0.1") || isOrganizerHost("lisjaki-naklo.si")) {
  throw new Error("Omejitev organizatorskega dostopa ni pravilno nastavljena.");
}

let state: TournamentState = {
  ...createDefaultTournament(),
  players: Array.from({ length: 30 }, (_, index) => ({
    id: `player-${index + 1}`,
    name: `Igralec ${String(index + 1).padStart(2, "0")}`,
    checkedIn: true,
    paid: true,
    withdrawn: false,
  })),
};

const teammateCounts = new Map<string, number>();

state = generateAllPreliminaryRounds(state);
if (state.rounds.length !== 6 || state.rounds[0].status !== "active" || state.rounds.slice(1).some((round) => round.status !== "scheduled")) {
  throw new Error("Vseh šest krogov ni bilo pravilno izžrebanih vnaprej.");
}

for (let roundNumber = 1; roundNumber <= 6; roundNumber += 1) {
  const round = state.rounds[roundNumber - 1];
  const roundPlayers = round.matches.flatMap((match) => [
    ...match.teamA.playerIds,
    ...match.teamB.playerIds,
  ]);
  if (roundPlayers.length !== 30 || new Set(roundPlayers).size !== 30) {
    throw new Error(`Krog ${roundNumber} nima natanko 30 različnih igralcev.`);
  }
  if (round.matches.length !== 5) throw new Error(`Krog ${roundNumber} nima petih tekem.`);

  for (const match of round.matches) {
    for (const team of [match.teamA, match.teamB]) {
      for (let first = 0; first < team.playerIds.length; first += 1) {
        for (let second = first + 1; second < team.playerIds.length; second += 1) {
          const pair = [team.playerIds[first], team.playerIds[second]].sort().join("|");
          teammateCounts.set(pair, (teammateCounts.get(pair) ?? 0) + 1);
        }
      }
    }
    match.scoreA = 8 + ((roundNumber + match.wave + match.court) % 5);
    match.scoreB = 15 - match.scoreA;
    match.locked = true;
  }
  round.status = "completed";
  if (state.rounds[roundNumber]) state.rounds[roundNumber].status = "active";
}

const rankings = calculateRankings(state);
if (rankings.length !== 30 || rankings.some((row) => row.matches !== 6)) {
  throw new Error("Lestvica nima 30 igralcev s po šestimi tekmami.");
}

state = generateFinals(state, "smoke-finals");
const finalists = state.finals?.teams.flatMap((team) => team.playerIds) ?? [];
if (finalists.length !== 12 || new Set(finalists).size !== 12) {
  throw new Error("Zaključni žreb nima 12 različnih igralcev.");
}

const repeatTeammatePairs = [...teammateCounts.values()].filter((count) => count > 1).length;
const highestRepeat = Math.max(...teammateCounts.values());

console.log(JSON.stringify({
  rounds: state.rounds.length,
  matches: state.rounds.reduce((sum, round) => sum + round.matches.length, 0),
  rankedPlayers: rankings.length,
  finalists: finalists.length,
  repeatTeammatePairs,
  highestRepeat,
}, null, 2));
