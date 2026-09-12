import {
  calculateRankings,
  createDefaultTournament,
  generateFinals,
  generatePreliminaryRound,
  TournamentRound,
  TournamentState,
} from "../src/lib/tournament";
import { parseTournament, tournamentEtag } from "../server/tournament-api";

const defaultTournament = createDefaultTournament();
if (!parseTournament(defaultTournament) || parseTournament({ ...defaultTournament, courts: 0 })) {
  throw new Error("Strežniško preverjanje podatkov turnirja ni pravilno nastavljeno.");
}
const parsedLegacyTournament = parseTournament({
  ...defaultTournament,
  players: [{ id: "legacy", name: "Legacy", checkedIn: true, paid: false, withdrawn: false }],
});
if (parsedLegacyTournament?.players[0].gender !== "male" || parseTournament({
  ...defaultTournament,
  players: [{ id: "invalid", name: "Invalid", gender: "unknown", checkedIn: true, paid: false, withdrawn: false }],
})) {
  throw new Error("Stari igralci niso pravilno nadgrajeni oziroma neveljaven spol ni zavrnjen.");
}
if (tournamentEtag(12) !== '"tournament-12"') {
  throw new Error("Revizijska oznaka turnirja ni pravilno ustvarjena.");
}

const createState = (playerCount: number, femaleCount = 0): TournamentState => ({
  ...createDefaultTournament(),
  players: Array.from({ length: playerCount }, (_, index) => ({
    id: `player-${index + 1}`,
    name: `Igralec ${String(index + 1).padStart(2, "0")}`,
    gender: index < femaleCount ? "female" : "male",
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

const verifyGenderBalance = (state: TournamentState, round: TournamentRound) => {
  const femaleIds = new Set(state.players.filter((player) => player.gender === "female").map((player) => player.id));
  const teams = round.matches.flatMap((match) => [match.teamA, match.teamB]);
  const femaleAppearances = teams.reduce(
    (count, team) => count + team.playerIds.filter((playerId) => femaleIds.has(playerId)).length,
    0,
  );
  const maximumPerTeam = femaleAppearances <= teams.length ? 1 : 2;
  for (const match of round.matches) {
    const countWomen = (playerIds: string[]) => playerIds.filter((playerId) => femaleIds.has(playerId)).length;
    const first = countWomen(match.teamA.playerIds);
    const second = countWomen(match.teamB.playerIds);
    if (first > maximumPerTeam || second > maximumPerTeam || Math.abs(first - second) > 1) {
      throw new Error("Ženske niso pravilno razporejene med ekipe.");
    }
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

for (const [playerCount, femaleCount] of [[26, 7], [12, 5], [13, 9]] as const) {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const genderState = generatePreliminaryRound(
      createState(playerCount, femaleCount),
      `gender-${playerCount}-${femaleCount}-${attempt}`,
    );
    verifyRound(genderState.rounds[0], playerCount);
    verifyGenderBalance(genderState, genderState.rounds[0]);
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


let mixedFinalsState = createState(12, 5);
mixedFinalsState = generatePreliminaryRound(mixedFinalsState, "mixed-finals-round");
verifyGenderBalance(mixedFinalsState, mixedFinalsState.rounds[0]);
completeRound(mixedFinalsState);
mixedFinalsState = generateFinals(mixedFinalsState, "mixed-finals");
const mixedFinalTeams = mixedFinalsState.finals?.teams ?? [];
const mixedFinalFemaleIds = new Set(mixedFinalsState.players.filter((player) => player.gender === "female").map((player) => player.id));
const mixedFinalFemaleCounts = mixedFinalTeams.map(
  (team) => team.playerIds.filter((playerId) => mixedFinalFemaleIds.has(playerId)).length,
);
if (mixedFinalFemaleCounts.some((count) => count < 1 || count > 2)) {
  throw new Error("Ženske niso pravilno razporejene v zaključnih ekipah.");
}
for (const match of mixedFinalsState.finals?.matches ?? []) {
  const first = match.teamA.playerIds.filter((playerId) => mixedFinalFemaleIds.has(playerId)).length;
  const second = match.teamB.playerIds.filter((playerId) => mixedFinalFemaleIds.has(playerId)).length;
  if (Math.abs(first - second) > 1) throw new Error("Zaključna tekma ima nedovoljeno razliko med spoloma.");
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
