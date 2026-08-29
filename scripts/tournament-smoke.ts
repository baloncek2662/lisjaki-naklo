import {
  calculateRankings,
  createDefaultTournament,
  generateFinals,
  generatePreliminaryRound,
  TournamentRound,
  TournamentState,
} from "../src/lib/tournament";
import { isOrganizerHost } from "../src/hooks/use-organizer-access";

if (!isOrganizerHost("localhost") || !isOrganizerHost("127.0.0.1") || isOrganizerHost("lisjaki-naklo.si")) {
  throw new Error("Omejitev organizatorskega dostopa ni pravilno nastavljena.");
}

const createState = (playerCount: number): TournamentState => ({
  ...createDefaultTournament(),
  players: Array.from({ length: playerCount }, (_, index) => ({
    id: `player-${index + 1}`,
    name: `Igralec ${String(index + 1).padStart(2, "0")}`,
    checkedIn: true,
    paid: true,
    withdrawn: false,
  })),
});

const verifyRound = (round: TournamentRound, playerCount: number) => {
  const appearances = round.matches.flatMap((match) => [match.teamA, match.teamB])
    .flatMap((team) => team.playerIds.map((playerId) => ({
      playerId,
      joker: team.jokerPlayerIds?.includes(playerId) ?? false,
    })));
  const official = appearances.filter((appearance) => !appearance.joker);
  const jokers = appearances.filter((appearance) => appearance.joker);
  const expectedSlots = Math.ceil(playerCount / 6) * 6;

  if (appearances.length !== expectedSlots) throw new Error(`Krog nima ${expectedSlots} nastopov.`);
  if (official.length !== playerCount || new Set(official.map((entry) => entry.playerId)).size !== playerCount) {
    throw new Error("Vsak igralec mora imeti natanko en uradni nastop v krogu.");
  }
  if (jokers.length !== expectedSlots - playerCount || new Set(jokers.map((entry) => entry.playerId)).size !== jokers.length) {
    throw new Error("Število oziroma izbira jokerjev ni pravilna.");
  }

  const byWave = new Map<number, string[]>();
  for (const match of round.matches) {
    const ids = byWave.get(match.wave) ?? [];
    ids.push(...match.teamA.playerIds, ...match.teamB.playerIds);
    byWave.set(match.wave, ids);
  }
  for (const ids of byWave.values()) {
    if (new Set(ids).size !== ids.length) throw new Error("Igralec je razporejen na dve sočasni tekmi.");
  }
  if (playerCount >= 30 && Math.max(...byWave.keys()) !== Math.ceil(round.matches.length / 2)) {
    throw new Error("Žreb uporablja več terminov, kot je potrebno na dveh igriščih.");
  }

};

const completeRound = (state: TournamentState, scoreA = 9, scoreB = 6) => {
  const round = state.rounds[state.rounds.length - 1];
  for (const match of round.matches) {
    match.scoreA = scoreA;
    match.scoreB = scoreB;
    match.locked = true;
  }
  round.status = "completed";
};

for (let playerCount = 30; playerCount <= 36; playerCount += 1) {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const state = generatePreliminaryRound(createState(playerCount), `count-${playerCount}-${attempt}`);
    verifyRound(state.rounds[0], playerCount);
  }
}

let state = createState(33);
const teammateCounts = new Map<string, number>();
const firstRoundTeams: string[] = [];

for (let roundNumber = 1; roundNumber <= 8; roundNumber += 1) {
  state = generatePreliminaryRound(state, `round-${roundNumber}`);
  const round = state.rounds[state.rounds.length - 1];
  verifyRound(round, 33);

  for (const match of round.matches) {
    for (const team of [match.teamA, match.teamB]) {
      if (roundNumber === 1) firstRoundTeams.push(JSON.stringify(team));
      for (let first = 0; first < team.playerIds.length; first += 1) {
        for (let second = first + 1; second < team.playerIds.length; second += 1) {
          const pair = [team.playerIds[first], team.playerIds[second]].sort().join("|");
          teammateCounts.set(pair, (teammateCounts.get(pair) ?? 0) + 1);
        }
      }
    }
  }
  completeRound(state);
}

const rankingsBeforeCorrection = calculateRankings(state);
if (rankingsBeforeCorrection.length !== 33 || rankingsBeforeCorrection.some((row) => row.matches !== 8)) {
  throw new Error("Vsak od 33 igralcev mora imeti osem uradnih rezultatov.");
}

const correctedMatch = state.rounds[0].matches[0];
const previousScoreA = correctedMatch.scoreA;
correctedMatch.locked = false;
correctedMatch.scoreA = 7;
correctedMatch.scoreB = 8;
correctedMatch.locked = true;
const currentFirstRoundTeams = state.rounds[0].matches
  .flatMap((match) => [match.teamA, match.teamB])
  .map((team) => JSON.stringify(team));
if (JSON.stringify(firstRoundTeams) !== JSON.stringify(currentFirstRoundTeams)) {
  throw new Error("Popravek rezultata je spremenil ekipe preteklega kroga.");
}
const correctedTeamPlayer = correctedMatch.teamA.playerIds.find((id) => !correctedMatch.teamA.jokerPlayerIds?.includes(id));
const correctedRanking = calculateRankings(state).find((row) => row.playerId === correctedTeamPlayer);
const originalRanking = rankingsBeforeCorrection.find((row) => row.playerId === correctedTeamPlayer);
if (!correctedRanking || !originalRanking || correctedRanking.points !== originalRanking.points - ((previousScoreA ?? 0) - 7)) {
  throw new Error("Popravek rezultata ni pravilno preračunal lestvice.");
}

const jokerCounts = rankingsBeforeCorrection.map((row) => row.jokerAppearances);
if (Math.max(...jokerCounts) - Math.min(...jokerCounts) > 1) {
  throw new Error("Joker zadolžitve niso razporejene dovolj enakomerno.");
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
  rankedPlayers: rankingsBeforeCorrection.length,
  finalists: finalists.length,
  jokerAppearances: jokerCounts.reduce((sum, count) => sum + count, 0),
  jokerSpread: Math.max(...jokerCounts) - Math.min(...jokerCounts),
  repeatTeammatePairs,
  highestRepeat,
  pastRoundTeamsPreserved: true,
}, null, 2));
