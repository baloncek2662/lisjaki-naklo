import {
  calculateRankings,
  completePreliminaryRound,
  createDefaultTournament,
  generateFinals,
  generateInitialRounds,
  generatePreliminaryRound,
  getSemifinalResult,
  isValidFinalScore,
  isValidSemifinalScore,
  MAX_INITIAL_ROUNDS,
  startNextScheduledRound,
  syncFinalMatches,
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
if (
  !isValidFinalScore(21, 0) ||
  !isValidFinalScore(21, 19) ||
  !isValidFinalScore(20, 22) ||
  !isValidFinalScore(23, 21) ||
  isValidFinalScore(null, 21) ||
  isValidFinalScore(20, 18) ||
  isValidFinalScore(21, 20) ||
  isValidFinalScore(22, 19) ||
  isValidFinalScore(25, 2) ||
  isValidFinalScore(21, 21)
) {
  throw new Error("Pravilo zaključne tekme do 21 z dvema točkama razlike ni pravilno.");
}
const twoSetSemifinal = [
  { scoreA: 21, scoreB: 19 },
  { scoreA: 22, scoreB: 20 },
  { scoreA: null, scoreB: null },
];
const threeSetSemifinal = [
  { scoreA: 21, scoreB: 18 },
  { scoreA: 19, scoreB: 21 },
  { scoreA: 21, scoreB: 23 },
];
const threeSetResult = getSemifinalResult(threeSetSemifinal);
if (
  !isValidSemifinalScore(twoSetSemifinal) ||
  !isValidSemifinalScore(threeSetSemifinal) ||
  threeSetResult.winsA !== 1 ||
  threeSetResult.winsB !== 2 ||
  isValidSemifinalScore([{ scoreA: 21, scoreB: 19 }]) ||
  isValidSemifinalScore([
    { scoreA: 21, scoreB: 19 },
    { scoreA: 19, scoreB: 21 },
    { scoreA: null, scoreB: null },
  ]) ||
  isValidSemifinalScore([
    { scoreA: 21, scoreB: 20 },
    { scoreA: 21, scoreB: 19 },
  ]) ||
  isValidSemifinalScore([
    { scoreA: 21, scoreB: 19 },
    { scoreA: 21, scoreB: 18 },
    { scoreA: 21, scoreB: 17 },
  ])
) {
  throw new Error("Polfinale na dva dobljena niza ni pravilno preverjen.");
}

const createState = (playerCount: number, femaleCount = 0): TournamentState => ({
  ...createDefaultTournament(),
  players: Array.from({ length: playerCount }, (_, index) => ({
    id: `player-${index + 1}`,
    name: `Igralec ${String(index + 1).padStart(2, "0")}`,
    gender: index < femaleCount ? "female" : "male",
    checkedIn: true,
    withdrawn: false,
  })),
});

const expectError = (operation: () => unknown, expectedMessage: string) => {
  try {
    operation();
  } catch (error) {
    if (error instanceof Error && error.message.includes(expectedMessage)) return;
    throw error;
  }
  throw new Error(`Pričakovana napaka ni bila sprožena: ${expectedMessage}`);
};

const femaleCountsForTeams = (state: TournamentState, teams: Array<{ playerIds: string[] }>) => {
  const femaleIds = new Set(state.players.filter((player) => player.gender === "female").map((player) => player.id));
  return teams.map((team) => team.playerIds.filter((playerId) => femaleIds.has(playerId)).length);
};

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
  const teams = round.matches.flatMap((match) => [match.teamA, match.teamB]);
  const femaleCounts = femaleCountsForTeams(state, teams);
  const femaleAppearances = femaleCounts.reduce((sum, count) => sum + count, 0);
  const maximumPerTeam = femaleAppearances <= teams.length ? 1 : 2;
  for (let index = 0; index < femaleCounts.length; index += 2) {
    const first = femaleCounts[index];
    const second = femaleCounts[index + 1];
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

const enterRoundResults = (round: TournamentRound, scoreA = 9, scoreB = 6) => {
  for (const match of round.matches) {
    match.scoreA = scoreA;
    match.scoreB = scoreB;
    match.locked = true;
  }
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

for (const [femaleCount, expectedPerTeam] of [[4, 1], [8, 2]] as const) {
  const boundaryState = generatePreliminaryRound(createState(12, femaleCount), `boundary-${femaleCount}`);
  const boundaryTeams = boundaryState.rounds[0].matches.flatMap((match) => [match.teamA, match.teamB]);
  if (femaleCountsForTeams(boundaryState, boundaryTeams).some((count) => count !== expectedPerTeam)) {
    throw new Error(`Mejna razporeditev za ${femaleCount} žensk ni pravilna.`);
  }
}

expectError(
  () => generatePreliminaryRound(createState(12, 9), "too-many-women"),
  "največ dve ženski",
);
expectError(
  () => generatePreliminaryRound(createState(7, 7), "not-enough-jokers"),
  "Jokerjev ni mogoče izbrati",
);

let repeatedMixedState = createState(26, 7);
for (let roundNumber = 1; roundNumber <= 8; roundNumber += 1) {
  repeatedMixedState = generatePreliminaryRound(repeatedMixedState, `mixed-round-${roundNumber}`);
  const round = repeatedMixedState.rounds[repeatedMixedState.rounds.length - 1];
  verifyRound(round, 26);
  verifyGenderBalance(repeatedMixedState, round);
  completeRound(repeatedMixedState);
}
const repeatedMixedJokerCounts = calculateRankings(repeatedMixedState).map((row) => row.jokerAppearances);
if (Math.max(...repeatedMixedJokerCounts) - Math.min(...repeatedMixedJokerCounts) > 1) {
  throw new Error("Jokerji pri mešani zasedbi niso razporejeni dovolj enakomerno skozi več krogov.");
}

expectError(() => generateInitialRounds(createState(26, 7), 0, "zero-rounds"), "med 1 in");
expectError(
  () => generateInitialRounds(createState(26, 7), MAX_INITIAL_ROUNDS + 1, "too-many-rounds"),
  "med 1 in",
);

let plannedState = generateInitialRounds(createState(26, 7), 3, "planned-rounds");
if (
  plannedState.rounds.length !== 3 ||
  plannedState.rounds[0].status !== "active" ||
  plannedState.rounds.slice(1).some((round) => round.status !== "scheduled")
) {
  throw new Error("Začetni paket krogov nima pravilnih statusov.");
}
for (const round of plannedState.rounds) {
  verifyRound(round, 26);
  verifyGenderBalance(plannedState, round);
}
expectError(() => generateInitialRounds(plannedState, 2, "duplicate-plan"), "samo pred prvim krogom");
expectError(() => generatePreliminaryRound(plannedState, "blocked-extra-round"), "zaključite in potrdite");

enterRoundResults(plannedState.rounds[0]);
plannedState = completePreliminaryRound(plannedState, plannedState.rounds[0].id);
if (plannedState.rounds.some((round) => round.status === "active")) {
  throw new Error("Naslednji načrtovani krog se ne sme začeti brez izbire organizatorja.");
}
plannedState.rounds[0].matches[0].locked = false;
if (!parseTournament(plannedState)) {
  throw new Error("Zaključen krog mora ostati veljaven med popravljanjem odklenjenega rezultata.");
}
plannedState.rounds[0].matches[0].locked = true;
const earlyFinalsState = generateFinals(plannedState, "early-finals");
if (!earlyFinalsState.finals || earlyFinalsState.rounds.length !== 1 || earlyFinalsState.rounds[0].status !== "completed") {
  throw new Error("Predčasen prehod v finale ni odstranil neodigranih načrtovanih krogov.");
}

let continuedPlanState = generateInitialRounds(createState(26, 7), 2, "continued-plan");
enterRoundResults(continuedPlanState.rounds[0]);
continuedPlanState = completePreliminaryRound(continuedPlanState, continuedPlanState.rounds[0].id);
continuedPlanState = startNextScheduledRound(continuedPlanState);
if (continuedPlanState.rounds[1].status !== "active") {
  throw new Error("Naslednji načrtovani krog se ni pravilno začel.");
}
enterRoundResults(continuedPlanState.rounds[1]);
continuedPlanState = completePreliminaryRound(continuedPlanState, continuedPlanState.rounds[1].id);
continuedPlanState = generatePreliminaryRound(continuedPlanState, "one-extra-round");
if (continuedPlanState.rounds.length !== 3 || continuedPlanState.rounds[2].status !== "active") {
  throw new Error("Dodatni posamični krog po začetnem paketu ni bil ustvarjen.");
}
enterRoundResults(continuedPlanState.rounds[2]);
continuedPlanState = completePreliminaryRound(continuedPlanState, continuedPlanState.rounds[2].id);
continuedPlanState = generateFinals(continuedPlanState, "finals-after-extra-round");
if (!continuedPlanState.finals || continuedPlanState.rounds.length !== 3) {
  throw new Error("Prehod v finale po dodatnem posamičnem krogu ni uspel.");
}

let thirtyOnePlayerState = generateInitialRounds(createState(31, 8), 8, "thirty-one-player-plan");
if (
  thirtyOnePlayerState.rounds.length !== 8 ||
  thirtyOnePlayerState.rounds[0].status !== "active" ||
  thirtyOnePlayerState.rounds.slice(1).some((round) => round.status !== "scheduled")
) {
  throw new Error("Začetni žreb osmih krogov za 31 igralcev nima pravilnih statusov.");
}

for (let roundIndex = 0; roundIndex < 8; roundIndex += 1) {
  const round = thirtyOnePlayerState.rounds[roundIndex];
  if (round.status !== "active") throw new Error(`${roundIndex + 1}. krog za 31 igralcev ni aktiven.`);
  verifyRound(round, 31);
  verifyGenderBalance(thirtyOnePlayerState, round);
  const jokerAppearances = round.matches
    .flatMap((match) => [match.teamA, match.teamB])
    .reduce((sum, team) => sum + (team.jokerPlayerIds?.length ?? 0), 0);
  if (jokerAppearances !== 5) throw new Error(`${roundIndex + 1}. krog nima natanko petih jokerjev.`);

  enterRoundResults(round, roundIndex % 2 === 0 ? 9 : 7, roundIndex % 2 === 0 ? 6 : 8);
  thirtyOnePlayerState = completePreliminaryRound(thirtyOnePlayerState, round.id);
  if (roundIndex < 7) thirtyOnePlayerState = startNextScheduledRound(thirtyOnePlayerState);
}

const thirtyOnePlayerRankings = calculateRankings(thirtyOnePlayerState);
if (
  thirtyOnePlayerRankings.length !== 31 ||
  thirtyOnePlayerRankings.some((row) => row.matches !== 8) ||
  thirtyOnePlayerRankings.reduce((sum, row) => sum + row.jokerAppearances, 0) !== 40
) {
  throw new Error("Osem krogov za 31 igralcev nima pravilnega števila uradnih nastopov ali jokerjev.");
}
const thirtyOneJokerCounts = thirtyOnePlayerRankings.map((row) => row.jokerAppearances);
if (Math.max(...thirtyOneJokerCounts) - Math.min(...thirtyOneJokerCounts) > 1) {
  throw new Error("Pet jokerjev na krog ni enakomerno razporejenih med 31 igralcev.");
}

thirtyOnePlayerState = generateFinals(thirtyOnePlayerState, "thirty-one-player-finals");
const thirtyOneFinalTeams = thirtyOnePlayerState.finals?.teams ?? [];
const thirtyOneFinalists = thirtyOneFinalTeams.flatMap((team) => team.playerIds);
const thirtyOneFemaleFinalists = femaleCountsForTeams(thirtyOnePlayerState, thirtyOneFinalTeams);
const thirtyOneFemaleFinalistCount = thirtyOneFemaleFinalists.reduce((sum, count) => sum + count, 0);
const thirtyOneFinalMinimum = thirtyOneFemaleFinalistCount > 4 ? 1 : 0;
const thirtyOneFinalMaximum = thirtyOneFemaleFinalistCount <= 4 ? 1 : 2;
if (
  thirtyOneFinalTeams.length !== 4 ||
  thirtyOnePlayerState.finals?.matches.length !== 2 ||
  thirtyOneFinalists.length !== 12 ||
  new Set(thirtyOneFinalists).size !== 12 ||
  thirtyOneFemaleFinalists.some((count) => count < thirtyOneFinalMinimum || count > thirtyOneFinalMaximum)
) {
  throw new Error("Zaključni žreb po osmih krogih za 31 igralcev ni veljaven.");
}
for (const semifinal of thirtyOnePlayerState.finals?.matches ?? []) {
  const [first, second] = femaleCountsForTeams(thirtyOnePlayerState, [semifinal.teamA, semifinal.teamB]);
  if (Math.abs(first - second) > 1) throw new Error("Polfinale za 31 igralcev nima uravnoteženega spola.");
}
if (!parseTournament(thirtyOnePlayerState)) {
  throw new Error("Končno stanje testa z 31 igralci ni prestalo strežniške validacije.");
}

const invalidFinalScoreState = structuredClone(thirtyOnePlayerState);
const invalidSemifinal = invalidFinalScoreState.finals?.matches.find((match) => match.phase === "semifinal");
if (!invalidSemifinal) throw new Error("Manjka polfinale za preverjanje neveljavnega rezultata.");
invalidSemifinal.setScores = [
  { scoreA: 21, scoreB: 20 },
  { scoreA: 21, scoreB: 19 },
  { scoreA: null, scoreB: null },
];
invalidSemifinal.locked = true;
const otherInvalidStateSemifinal = invalidFinalScoreState.finals?.matches.find(
  (match) => match.phase === "semifinal" && match.id !== invalidSemifinal.id,
);
if (!otherInvalidStateSemifinal) throw new Error("Manjka drugi polfinale za preverjanje napredovanja.");
Object.assign(otherInvalidStateSemifinal, { setScores: twoSetSemifinal, locked: true });
if (parseTournament(invalidFinalScoreState)) {
  throw new Error("Strežnik je sprejel potrjen zaključni rezultat brez dveh točk razlike.");
}
if (syncFinalMatches(invalidFinalScoreState).finals?.matches.some((match) => match.phase === "final")) {
  throw new Error("Neveljaven polfinalni rezultat je ustvaril finalno tekmo.");
}

const thirtyOneSemifinals = thirtyOnePlayerState.finals?.matches.filter((match) => match.phase === "semifinal") ?? [];
if (thirtyOneSemifinals.length !== 2) throw new Error("Za test napredovanja morata obstajati dva polfinala.");
const expectedFinalists = [thirtyOneSemifinals[0].teamA.id, thirtyOneSemifinals[1].teamB.id].sort();
const expectedBronzeTeams = [thirtyOneSemifinals[0].teamB.id, thirtyOneSemifinals[1].teamA.id].sort();
Object.assign(thirtyOneSemifinals[0], { setScores: twoSetSemifinal, locked: true });
Object.assign(thirtyOneSemifinals[1], { setScores: threeSetSemifinal, locked: true });
thirtyOnePlayerState = syncFinalMatches(thirtyOnePlayerState);
const thirtyOneFinal = thirtyOnePlayerState.finals?.matches.find((match) => match.phase === "final");
const thirtyOneBronze = thirtyOnePlayerState.finals?.matches.find((match) => match.phase === "bronze");
if (
  !thirtyOneFinal ||
  !thirtyOneBronze ||
  JSON.stringify([thirtyOneFinal.teamA.id, thirtyOneFinal.teamB.id].sort()) !== JSON.stringify(expectedFinalists) ||
  JSON.stringify([thirtyOneBronze.teamA.id, thirtyOneBronze.teamB.id].sort()) !== JSON.stringify(expectedBronzeTeams)
) {
  throw new Error("Zmagovalca polfinalov oziroma poraženca nista napredovala v pravilni tekmi.");
}
Object.assign(thirtyOneBronze, { scoreA: 21, scoreB: 10, locked: true });
Object.assign(thirtyOneFinal, { scoreA: 23, scoreB: 21, locked: true });
if (!parseTournament(thirtyOnePlayerState)) {
  throw new Error("Veljavni zaključni rezultati do 21 niso prestali strežniške validacije.");
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


for (const femaleCount of [0, 4, 5, 8]) {
  let mixedFinalsState = createState(12, femaleCount);
  mixedFinalsState = generatePreliminaryRound(mixedFinalsState, `finals-round-${femaleCount}`);
  verifyGenderBalance(mixedFinalsState, mixedFinalsState.rounds[0]);
  completeRound(mixedFinalsState);
  mixedFinalsState = generateFinals(mixedFinalsState, `finals-${femaleCount}`);
  const mixedFinalTeams = mixedFinalsState.finals?.teams ?? [];
  const mixedFinalFemaleCounts = femaleCountsForTeams(mixedFinalsState, mixedFinalTeams);
  const expectedMinimum = femaleCount > 4 ? 1 : 0;
  const expectedMaximum = femaleCount <= 4 ? 1 : 2;
  if (
    mixedFinalFemaleCounts.reduce((sum, count) => sum + count, 0) !== femaleCount ||
    mixedFinalFemaleCounts.some((count) => count < expectedMinimum || count > expectedMaximum)
  ) {
    throw new Error(`Ženske niso pravilno razporejene v zaključnih ekipah pri številu ${femaleCount}.`);
  }
  for (const match of mixedFinalsState.finals?.matches ?? []) {
    const [first, second] = femaleCountsForTeams(mixedFinalsState, [match.teamA, match.teamB]);
    if (Math.abs(first - second) > 1) throw new Error("Zaključna tekma ima nedovoljeno razliko med spoloma.");
  }
}

let impossibleFinalsState = createState(12, 8);
impossibleFinalsState = generatePreliminaryRound(impossibleFinalsState, "impossible-finals-round");
completeRound(impossibleFinalsState);
impossibleFinalsState.players[8].gender = "female";
expectError(() => generateFinals(impossibleFinalsState, "impossible-finals"), "največ dve ženski");

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
  thirtyOnePlayerScenario: {
    rounds: thirtyOnePlayerState.rounds.length,
    jokers: thirtyOnePlayerRankings.reduce((sum, row) => sum + row.jokerAppearances, 0),
    finalists: thirtyOneFinalists.length,
    femaleFinalists: thirtyOneFemaleFinalistCount,
    womenPerFinalTeam: thirtyOneFemaleFinalists,
  },
}, null, 2));

// Analytics must preserve official rankings and be independent of court ordering.
const { analyzeTournament } = await import("../src/lib/tournament-analysis");
const analyticsState: TournamentState = {
  ...createDefaultTournament(),
  players: Array.from({ length: 6 }, (_, index) => ({ id: `analysis-${index}`, name: `Player ${index}`, checkedIn: true, withdrawn: false })),
  rounds: [{ id: "analysis-round", number: 1, seed: "test", createdAt: "2026-09-13", status: "completed", matches: [{
    id: "analysis-match", phase: "preliminary", roundNumber: 1, wave: 1, court: 1,
    teamA: { id: "a", label: "A", playerIds: ["analysis-0", "analysis-1", "analysis-2"] },
    teamB: { id: "b", label: "B", playerIds: ["analysis-3", "analysis-4", "analysis-5"] },
    scoreA: 9, scoreB: 6, locked: true,
  }] }],
};
const beforeAnalysis = JSON.stringify(analyticsState);
const analytics = analyzeTournament(analyticsState);
const winnerAnalysis = analytics.players.find((player) => player.playerId === "analysis-0")!;
if (winnerAnalysis.opponentPoints !== null || winnerAnalysis.teammatePoints !== null || winnerAnalysis.difficulty !== null || winnerAnalysis.history[0].points !== 9 || JSON.stringify(analyticsState) !== beforeAnalysis) {
  throw new Error("Analytics final points, schedule strength, history or immutability failed.");
}
const pendingAnalysis = structuredClone(analyticsState);
pendingAnalysis.rounds[0].matches[0].locked = false;
if (analyzeTournament(pendingAnalysis).players.length !== 0) throw new Error("Unconfirmed results entered analytics.");
const jokerAnalysis = structuredClone(analyticsState);
jokerAnalysis.rounds[0].matches[0].teamA.jokerPlayerIds = ["analysis-0"];
if (analyzeTournament(jokerAnalysis).players.some((player) => player.playerId === "analysis-0")) throw new Error("Joker appearance counted personally.");
const historyAnalysis = structuredClone(analyticsState);
historyAnalysis.rounds.push({ ...structuredClone(analyticsState.rounds[0]), id: "second", number: 2 });
const twoRounds = analyzeTournament(historyAnalysis);
for (const player of twoRounds.players) {
  const official = calculateRankings(historyAnalysis).find((row) => row.playerId === player.playerId)!;
  if (player.history[1].points !== official.points || player.history[1].rank !== official.rank) throw new Error("History diverged from official standings.");
}
const semifinalAnalysis = structuredClone(analyticsState);
const sampleMatch = semifinalAnalysis.rounds[0].matches[0];
semifinalAnalysis.finals = { seed: "test", teams: [sampleMatch.teamA, sampleMatch.teamB], matches: [{ ...sampleMatch, phase: "semifinal", scoreA: null, scoreB: null, setScores: [{ scoreA: 21, scoreB: 19 }, { scoreA: 19, scoreB: 21 }, { scoreA: 21, scoreB: 19 }] }] };
semifinalAnalysis.finals.matches.push(
  { ...sampleMatch, id: "bronze-analysis", phase: "bronze", scoreA: 21, scoreB: 19 },
  { ...sampleMatch, id: "final-analysis", phase: "final", scoreA: 19, scoreB: 21 },
);
const playoffAnalysis = analyzeTournament(semifinalAnalysis);
for (const player of playoffAnalysis.players) {
  const original = analytics.players.find((entry) => entry.playerId === player.playerId)!;
  if (player.points !== original.points || player.difficulty !== original.difficulty ||
      JSON.stringify(player.history) !== JSON.stringify(original.history) || !player.qualified) {
    throw new Error("Playoffs must not affect final points, draw difficulty or preliminary history.");
  }
}
console.log("Tournament analytics checks passed.");

// A second match without player 0 gives independent evidence for all five others.
const independentState = structuredClone(analyticsState);
independentState.players.push({ ...independentState.players[0], id: "analysis-6", name: "Player 6" });
const independentMatch = structuredClone(independentState.rounds[0].matches[0]);
independentMatch.id = "independent-match";
independentMatch.teamA.playerIds[0] = "analysis-6";
independentMatch.scoreA = 10;
independentMatch.scoreB = 5;
independentState.rounds.push({ ...independentState.rounds[0], id: "independent-round", number: 2, matches: [independentMatch] });
const independentPlayer = analyzeTournament(independentState).players.find((player) => player.playerId === "analysis-0")!;
if (independentPlayer.opponentPoints !== 5 || independentPlayer.teammatePoints !== 10 || independentPlayer.difficulty !== -5 || independentPlayer.minSamples !== 1) {
  throw new Error("Independent match averages or sample counts are wrong.");
}
const changedOwnResult = structuredClone(independentState);
changedOwnResult.rounds[0].matches[0].scoreA = 0;
changedOwnResult.rounds[0].matches[0].scoreB = 15;
const changedPlayer = analyzeTournament(changedOwnResult).players.find((player) => player.playerId === "analysis-0")!;
if (changedPlayer.difficulty !== independentPlayer.difficulty) throw new Error("Own result leaked into draw difficulty.");
const focalJoker = structuredClone(independentState);
focalJoker.rounds[1].matches[0].teamA.playerIds[0] = "analysis-0";
focalJoker.rounds[1].matches[0].teamA.jokerPlayerIds = ["analysis-0"];
if (analyzeTournament(focalJoker).players.find((player) => player.playerId === "analysis-0")!.difficulty !== null) {
  throw new Error("Focal joker appearance leaked into independent estimates.");
}
const reversedAnalysis = analyzeTournament({ ...historyAnalysis, rounds: [...historyAnalysis.rounds].reverse() });
if (JSON.stringify(reversedAnalysis) !== JSON.stringify(twoRounds)) throw new Error("Round storage order changed point-based difficulty.");

if (!parsedLegacyTournament || "paid" in parsedLegacyTournament.players[0]) {
  throw new Error("Legacy payment status must be discarded when loading old data.");
}
console.log("Retired payment field compatibility check passed.");
