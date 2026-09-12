export type TournamentPhase = "registration" | "preliminary" | "finals" | "finished";
export type MatchPhase = "preliminary" | "semifinal" | "bronze" | "final";
export type TournamentGender = "male" | "female";

export interface TournamentPlayer {
  id: string;
  name: string;
  gender?: TournamentGender;
  checkedIn: boolean;
  paid: boolean;
  withdrawn: boolean;
}

export interface TournamentTeam {
  id: string;
  label: string;
  playerIds: string[];
  jokerPlayerIds?: string[];
}

export interface TournamentMatch {
  id: string;
  phase: MatchPhase;
  roundNumber: number | null;
  wave: number;
  court: number;
  teamA: TournamentTeam;
  teamB: TournamentTeam;
  scoreA: number | null;
  scoreB: number | null;
  locked: boolean;
}

export interface TournamentRound {
  id: string;
  number: number;
  seed: string;
  createdAt: string;
  status: "scheduled" | "active" | "completed";
  matches: TournamentMatch[];
}

export interface TournamentFinals {
  seed: string;
  teams: TournamentTeam[];
  matches: TournamentMatch[];
}

export interface TournamentState {
  version: 1;
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  phase: TournamentPhase;
  targetCombinedScore: number;
  courts: number;
  players: TournamentPlayer[];
  rounds: TournamentRound[];
  finals: TournamentFinals | null;
}

export interface PlayerRanking {
  rank: number;
  playerId: string;
  name: string;
  matches: number;
  points: number;
  wins: number;
  average: number;
  scores: number[];
  jokerAppearances: number;
}

const FINAL_TEAM_LABELS = ["Ekipa A", "Ekipa B", "Ekipa C", "Ekipa D"];
export const MAX_INITIAL_ROUNDS = 20;

const makeId = (prefix: string) => {
  const random = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${random}`;
};

export const createDefaultTournament = (): TournamentState => {
  const now = new Date().toISOString();
  return {
    version: 1,
    id: makeId("turnir"),
    name: "Turnir odbojke na mivki – Lisjaki Naklo",
    createdAt: now,
    updatedAt: now,
    phase: "registration",
    targetCombinedScore: 15,
    courts: 2,
    players: [],
    rounds: [],
    finals: null,
  };
};

export const touchTournament = (state: TournamentState): TournamentState => ({
  ...state,
  updatedAt: new Date().toISOString(),
});

export const activePlayers = (state: TournamentState) =>
  state.players.filter((player) => player.checkedIn && !player.withdrawn);

export const isValidCombinedScore = (
  scoreA: number | null,
  scoreB: number | null,
  target = 15,
) =>
  Number.isInteger(scoreA) &&
  Number.isInteger(scoreB) &&
  (scoreA as number) >= 0 &&
  (scoreB as number) >= 0 &&
  (scoreA as number) + (scoreB as number) === target;

const hashString = (value: string) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const createRng = (seed: string) => {
  let state = hashString(seed) || 1;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const shuffle = <T,>(items: T[], rng: () => number) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};

const pairKey = (first: string, second: string) =>
  first < second ? `${first}|${second}` : `${second}|${first}`;

const addCount = (map: Map<string, number>, key: string) =>
  map.set(key, (map.get(key) ?? 0) + 1);

const getInteractionHistory = (state: TournamentState) => {
  const teammateCounts = new Map<string, number>();
  const opponentCounts = new Map<string, number>();
  const previousTeammates = new Set<string>();
  const previousOpponents = new Set<string>();
  const lastRound = state.rounds[state.rounds.length - 1];

  for (const round of state.rounds) {
    for (const match of round.matches) {
      for (const team of [match.teamA, match.teamB]) {
        for (let first = 0; first < team.playerIds.length; first += 1) {
          for (let second = first + 1; second < team.playerIds.length; second += 1) {
            const key = pairKey(team.playerIds[first], team.playerIds[second]);
            addCount(teammateCounts, key);
            if (round.id === lastRound?.id) previousTeammates.add(key);
          }
        }
      }

      for (const playerA of match.teamA.playerIds) {
        for (const playerB of match.teamB.playerIds) {
          const key = pairKey(playerA, playerB);
          addCount(opponentCounts, key);
          if (round.id === lastRound?.id) previousOpponents.add(key);
        }
      }
    }
  }

  return { teammateCounts, opponentCounts, previousTeammates, previousOpponents };
};

const teamPartitionPenalty = (
  teams: string[][],
  teammateCounts: Map<string, number>,
  previousTeammates: Set<string>,
) => {
  let penalty = 0;
  for (const team of teams) {
    for (let first = 0; first < team.length; first += 1) {
      for (let second = first + 1; second < team.length; second += 1) {
        const key = pairKey(team[first], team[second]);
        const repeats = teammateCounts.get(key) ?? 0;
        penalty += repeats * repeats * 1_000;
        if (previousTeammates.has(key)) penalty += 20_000;
      }
    }
  }
  return penalty;
};

const opponentPairingPenalty = (
  firstTeam: string[],
  secondTeam: string[],
  opponentCounts: Map<string, number>,
  previousOpponents: Set<string>,
) => {
  if (firstTeam.some((playerId) => secondTeam.includes(playerId))) {
    return Number.POSITIVE_INFINITY;
  }
  let penalty = 0;
  for (const first of firstTeam) {
    for (const second of secondTeam) {
      const key = pairKey(first, second);
      const repeats = opponentCounts.get(key) ?? 0;
      penalty += repeats * repeats * 40;
      if (previousOpponents.has(key)) penalty += 250;
    }
  }
  return penalty;
};

interface PlayerAppearance {
  playerId: string;
  joker: boolean;
}

const getJokerHistory = (state: TournamentState) => {
  const counts = new Map<string, number>();
  const previous = new Set<string>();
  const lastRound = state.rounds[state.rounds.length - 1];

  for (const round of state.rounds) {
    for (const match of round.matches) {
      for (const team of [match.teamA, match.teamB]) {
        for (const playerId of team.jokerPlayerIds ?? []) {
          addCount(counts, playerId);
          if (round.id === lastRound?.id) previous.add(playerId);
        }
      }
    }
  }

  return { counts, previous };
};

const selectJokers = (
  players: TournamentPlayer[],
  count: number,
  state: TournamentState,
  rng: () => number,
  teamCount: number,
) => {
  const history = getJokerHistory(state);
  const activeFemaleCount = players.filter((player) => player.gender === "female").length;
  const femaleCapacity = activeFemaleCount <= teamCount
    ? teamCount - activeFemaleCount
    : (teamCount * 2) - activeFemaleCount;
  let selectedFemaleCount = 0;
  const selected = shuffle(players, rng)
    .sort((first, second) => {
      const countDifference = (history.counts.get(first.id) ?? 0) - (history.counts.get(second.id) ?? 0);
      if (countDifference !== 0) return countDifference;
      const previousDifference = Number(history.previous.has(first.id)) - Number(history.previous.has(second.id));
      return previousDifference;
    })
    .filter((player) => {
      if (player.gender !== "female") return true;
      if (selectedFemaleCount >= femaleCapacity) return false;
      selectedFemaleCount += 1;
      return true;
    })
    .slice(0, count)
    .map((player) => player.id);

  if (selected.length !== count) {
    throw new Error("Jokerjev ni mogoče izbrati brez kršitve pravila o spolu ekip.");
  }
  return selected;
};

const genderTeamTargets = (femaleCount: number, teamCount: number, rng: () => number) => {
  if (femaleCount > teamCount * 2) {
    throw new Error("Žreba ni mogoče sestaviti: v ekipi so lahko največ dve ženski.");
  }
  const targets = femaleCount <= teamCount
    ? [...Array(femaleCount).fill(1), ...Array(teamCount - femaleCount).fill(0)]
    : [...Array(femaleCount - teamCount).fill(2), ...Array((teamCount * 2) - femaleCount).fill(1)];
  return shuffle(targets, rng);
};

const buildGenderBalancedTeams = (
  appearances: PlayerAppearance[],
  femalePlayerIds: Set<string>,
  teamCount: number,
  rng: () => number,
) => {
  const femaleAppearances = shuffle(
    appearances.filter((appearance) => femalePlayerIds.has(appearance.playerId)),
    rng,
  );
  const maleAppearances = shuffle(
    appearances.filter((appearance) => !femalePlayerIds.has(appearance.playerId)),
    rng,
  );
  const targets = genderTeamTargets(femaleAppearances.length, teamCount, rng);
  let femaleIndex = 0;
  let maleIndex = 0;

  return targets.map((femaleTarget) => {
    const team = [
      ...femaleAppearances.slice(femaleIndex, femaleIndex + femaleTarget),
      ...maleAppearances.slice(maleIndex, maleIndex + (3 - femaleTarget)),
    ];
    femaleIndex += femaleTarget;
    maleIndex += 3 - femaleTarget;
    return shuffle(team, rng);
  });
};

const scheduleMatches = (
  pairs: Array<[number, number]>,
  teams: PlayerAppearance[][],
  courts: number,
  rng: () => number,
) => {
  let bestSchedule: Array<{ pair: [number, number]; wave: number; courtIndex: number }> = [];
  let bestPenalty = Number.POSITIVE_INFINITY;
  const attempts = Math.max(2_000, pairs.length * 1_000);

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const candidate = shuffle(pairs, rng);
    const waves: Array<{ pairs: Array<[number, number]>; playerIds: Set<string> }> = [];

    for (const pair of candidate) {
      const pairPlayerIds = [...teams[pair[0]], ...teams[pair[1]]].map((appearance) => appearance.playerId);
      const availableWaveIndexes = waves
        .map((wave, index) => ({ wave, index }))
        .filter(({ wave }) => wave.pairs.length < courts && pairPlayerIds.every((playerId) => !wave.playerIds.has(playerId)))
        .map(({ index }) => index);
      const selectedWaveIndex = availableWaveIndexes.length > 0
        ? availableWaveIndexes[Math.floor(rng() * availableWaveIndexes.length)]
        : waves.length;
      if (!waves[selectedWaveIndex]) {
        waves.push({ pairs: [], playerIds: new Set<string>() });
      }
      waves[selectedWaveIndex].pairs.push(pair);
      pairPlayerIds.forEach((playerId) => waves[selectedWaveIndex].playerIds.add(playerId));
    }

    const appearances = new Map<string, Array<{ joker: boolean; wave: number }>>();
    waves.forEach((wave, waveIndex) => {
      for (const [first, second] of wave.pairs) {
        for (const appearance of [...teams[first], ...teams[second]]) {
          const entries = appearances.get(appearance.playerId) ?? [];
          entries.push({ joker: appearance.joker, wave: waveIndex + 1 });
          appearances.set(appearance.playerId, entries);
        }
      }
    });
    let orderingPenalty = 0;
    for (const entries of appearances.values()) {
      const official = entries.find((entry) => !entry.joker);
      const joker = entries.find((entry) => entry.joker);
      if (official && joker && joker.wave < official.wave) orderingPenalty += 1;
    }
    const penalty = waves.length * 1_000 + orderingPenalty;

    if (penalty < bestPenalty) {
      bestPenalty = penalty;
      bestSchedule = waves.flatMap((wave, waveIndex) => wave.pairs.map((pair, courtIndex) => ({
        pair,
        wave: waveIndex + 1,
        courtIndex,
      })));
      const minimumWaves = Math.ceil(pairs.length / courts);
      if (waves.length === minimumWaves && orderingPenalty === 0) break;
    }
  }

  if (bestSchedule.length === 0) {
    throw new Error("Jokerjev ni bilo mogoče razporediti v različne termine.");
  }
  return bestSchedule;
};

const bestTeamPairing = (
  teams: string[][],
  opponentCounts: Map<string, number>,
  previousOpponents: Set<string>,
  rng: () => number,
) => {
  let bestPenalty = Number.POSITIVE_INFINITY;
  let bestPairs: Array<[number, number]> = [];
  let tiedSolutions = 0;

  const visit = (remaining: number[], pairs: Array<[number, number]>, penalty: number) => {
    if (penalty > bestPenalty) return;
    if (remaining.length === 0) {
      if (penalty < bestPenalty) {
        bestPenalty = penalty;
        bestPairs = [...pairs];
        tiedSolutions = 1;
      } else if (penalty === bestPenalty) {
        tiedSolutions += 1;
        if (rng() < 1 / tiedSolutions) bestPairs = [...pairs];
      }
      return;
    }

    const [first, ...rest] = remaining;
    for (let index = 0; index < rest.length; index += 1) {
      const second = rest[index];
      const nextRemaining = rest.filter((_, restIndex) => restIndex !== index);
      const nextPenalty = penalty + opponentPairingPenalty(
        teams[first],
        teams[second],
        opponentCounts,
        previousOpponents,
      );
      visit(nextRemaining, [...pairs, [first, second]], nextPenalty);
    }
  };

  visit(teams.map((_, index) => index), [], 0);
  return bestPairs;
};

const appendPreliminaryRound = (
  state: TournamentState,
  seed: string,
  status: TournamentRound["status"],
  allowOpenRounds: boolean,
) => {
  const players = activePlayers(state);
  if (players.length < 6) throw new Error("Za žreb potrebujete najmanj 6 aktivnih igralcev.");
  if (!allowOpenRounds && state.rounds.some((round) => round.status !== "completed" || round.matches.some((match) => !match.locked))) {
    throw new Error("Pred novim žrebom zaključite in potrdite vse rezultate prejšnjih krogov.");
  }
  if (state.finals) throw new Error("Po začetku zaključnega dela novih krogov ni mogoče dodati.");

  const rng = createRng(seed);
  const history = getInteractionHistory(state);
  const playerIds = players.map((player) => player.id);
  const totalSlots = Math.ceil(playerIds.length / 6) * 6;
  const teamCount = totalSlots / 3;
  const femalePlayerIds = new Set(players.filter((player) => player.gender === "female").map((player) => player.id));
  if (femalePlayerIds.size > teamCount * 2) {
    throw new Error("Žreba ni mogoče sestaviti: v ekipi so lahko največ dve ženski.");
  }
  const jokerIds = selectJokers(players, totalSlots - playerIds.length, state, rng, teamCount);
  const appearances: PlayerAppearance[] = [
    ...playerIds.map((playerId) => ({ playerId, joker: false })),
    ...jokerIds.map((playerId) => ({ playerId, joker: true })),
  ];
  const attempts = 20_000;
  let bestPenalty = Number.POSITIVE_INFINITY;
  let bestTeams: PlayerAppearance[][] = [];

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const teams = buildGenderBalancedTeams(appearances, femalePlayerIds, teamCount, rng);
    if (teams.some((team) => new Set(team.map((appearance) => appearance.playerId)).size !== team.length)) continue;
    const penalty = teamPartitionPenalty(
      teams.map((team) => team.map((appearance) => appearance.playerId)),
      history.teammateCounts,
      history.previousTeammates,
    );
    if (penalty < bestPenalty) {
      bestPenalty = penalty;
      bestTeams = teams;
      if (penalty === 0) break;
    }
  }

  if (bestTeams.length === 0) throw new Error("Veljavnega žreba z jokerji ni bilo mogoče sestaviti.");

  const scheduledTeamPairs = scheduleMatches(
    bestTeamPairing(
      bestTeams.map((team) => team.map((appearance) => appearance.playerId)),
      history.opponentCounts,
      history.previousOpponents,
      rng,
    ),
    bestTeams,
    state.courts,
    rng,
  );
  const roundNumber = state.rounds.length + 1;
  const roundId = makeId(`krog-${roundNumber}`);
  const teamObjects = bestTeams.map<TournamentTeam>((appearancesForTeam, index) => ({
    id: `${roundId}-ekipa-${index + 1}`,
    label: `Ekipa ${index + 1}`,
    playerIds: appearancesForTeam.map((appearance) => appearance.playerId),
    jokerPlayerIds: appearancesForTeam.filter((appearance) => appearance.joker).map((appearance) => appearance.playerId),
  }));

  const matches = scheduledTeamPairs.map<TournamentMatch>(({ pair: [first, second], wave, courtIndex }, index) => ({
    id: `${roundId}-tekma-${index + 1}`,
    phase: "preliminary",
    roundNumber,
    wave,
    court: ((courtIndex + roundNumber - 1) % state.courts) + 1,
    teamA: teamObjects[first],
    teamB: teamObjects[second],
    scoreA: null,
    scoreB: null,
    locked: false,
  }));

  const round: TournamentRound = {
    id: roundId,
    number: roundNumber,
    seed,
    createdAt: new Date().toISOString(),
    status,
    matches,
  };

  return touchTournament({
    ...state,
    phase: "preliminary",
    rounds: [...state.rounds, round],
  });
};

export const generatePreliminaryRound = (state: TournamentState, seed = makeId("zreb")) =>
  appendPreliminaryRound(state, seed, "active", false);

export const generateInitialRounds = (
  state: TournamentState,
  count: number,
  seed = makeId("zrebi"),
) => {
  if (!Number.isInteger(count) || count < 1 || count > MAX_INITIAL_ROUNDS) {
    throw new Error(`Začetno število krogov mora biti med 1 in ${MAX_INITIAL_ROUNDS}.`);
  }
  if (state.rounds.length > 0 || state.finals) {
    throw new Error("Začetni paket krogov lahko izžrebate samo pred prvim krogom.");
  }

  let next = state;
  for (let index = 0; index < count; index += 1) {
    next = appendPreliminaryRound(
      next,
      `${seed}-${index + 1}`,
      index === 0 ? "active" : "scheduled",
      true,
    );
  }
  return next;
};

export const completePreliminaryRound = (state: TournamentState, roundId: string) => {
  const currentRound = state.rounds.find((round) => round.id === roundId);
  if (!currentRound || currentRound.status !== "active") {
    throw new Error("Zaključite lahko samo trenutni aktivni krog.");
  }
  if (currentRound.matches.some((match) => !match.locked)) {
    throw new Error("Najprej potrdite vse rezultate trenutnega kroga.");
  }
  return touchTournament({
    ...state,
    rounds: state.rounds.map((round) => round.id === roundId ? { ...round, status: "completed" } : round),
  });
};

export const startNextScheduledRound = (state: TournamentState) => {
  if (state.finals) throw new Error("Po začetku zaključnega dela ni mogoče začeti novega kroga.");
  if (state.rounds.some((round) => round.status === "active")) {
    throw new Error("Trenutni krog je že v teku.");
  }
  const nextRound = state.rounds.find((round) => round.status === "scheduled");
  if (!nextRound) throw new Error("Ni naslednjega načrtovanega kroga.");
  return touchTournament({
    ...state,
    phase: "preliminary",
    rounds: state.rounds.map((round) => round.id === nextRound.id ? { ...round, status: "active" } : round),
  });
};

export const calculateRankings = (state: TournamentState): PlayerRanking[] => {
  const rows = new Map<string, Omit<PlayerRanking, "rank">>();
  for (const player of state.players) {
    rows.set(player.id, {
      playerId: player.id,
      name: player.name,
      matches: 0,
      points: 0,
      wins: 0,
      average: 0,
      scores: [],
      jokerAppearances: 0,
    });
  }

  for (const round of state.rounds) {
    for (const match of round.matches) {
      if (!match.locked || match.scoreA === null || match.scoreB === null) continue;
      for (const [team, score] of [
        [match.teamA, match.scoreA],
        [match.teamB, match.scoreB],
      ] as const) {
        for (const playerId of team.playerIds) {
          const row = rows.get(playerId);
          if (!row) continue;
          if (team.jokerPlayerIds?.includes(playerId)) {
            row.jokerAppearances += 1;
            continue;
          }
          row.matches += 1;
          row.points += score;
          row.wins += score > state.targetCombinedScore / 2 ? 1 : 0;
          row.scores.push(score);
        }
      }
    }
  }

  const sorted = [...rows.values()]
    .filter((row) => row.matches > 0)
    .map((row) => ({ ...row, average: row.points / row.matches }))
    .sort((first, second) => {
      if (second.points !== first.points) return second.points - first.points;
      if (second.wins !== first.wins) return second.wins - first.wins;
      const firstScores = [...first.scores].sort((a, b) => b - a);
      const secondScores = [...second.scores].sort((a, b) => b - a);
      for (let index = 0; index < Math.max(firstScores.length, secondScores.length); index += 1) {
        if ((secondScores[index] ?? -1) !== (firstScores[index] ?? -1)) {
          return (secondScores[index] ?? -1) - (firstScores[index] ?? -1);
        }
      }
      return hashString(`${state.id}-${first.playerId}`) - hashString(`${state.id}-${second.playerId}`);
    });

  return sorted.map((row, index) => ({ ...row, rank: index + 1 }));
};

const permutations = <T,>(items: T[]): T[][] => {
  if (items.length <= 1) return [items];
  return items.flatMap((item, index) =>
    permutations(items.filter((_, itemIndex) => itemIndex !== index)).map((rest) => [item, ...rest]),
  );
};

export const generateFinals = (state: TournamentState, seed = makeId("finale")) => {
  const completedRounds = state.rounds.filter((round) => round.status === "completed");
  if (
    completedRounds.length === 0 ||
    state.rounds.some((round) => round.status === "active") ||
    completedRounds.some((round) => round.matches.some((match) => !match.locked))
  ) {
    throw new Error("Pred zaključnim delom odigrajte in zaključite najmanj en predtekmovalni krog.");
  }
  if (state.finals) throw new Error("Zaključni del je že pripravljen.");
  const stateWithoutScheduledRounds = { ...state, rounds: completedRounds };
  const rankings = calculateRankings(stateWithoutScheduledRounds);
  if (rankings.length < 12) throw new Error("Za zaključni del je potrebnih najmanj 12 uvrščenih igralcev.");

  const topTwelve = rankings.slice(0, 12);
  const femalePlayerIds = new Set(state.players.filter((player) => player.gender === "female").map((player) => player.id));
  const femaleFinalistCount = topTwelve.filter((player) => femalePlayerIds.has(player.playerId)).length;
  if (femaleFinalistCount > 8) {
    throw new Error("Zaključnih ekip ni mogoče sestaviti: v ekipi sta lahko največ dve ženski.");
  }
  const minFemalePlayersPerTeam = femaleFinalistCount > 4 ? 1 : 0;
  const maxFemalePlayersPerTeam = femaleFinalistCount <= 4 ? 1 : 2;
  const pots = [topTwelve.slice(0, 4), topTwelve.slice(4, 8), topTwelve.slice(8, 12)];
  const rng = createRng(seed);
  let bestScore = Number.POSITIVE_INFINITY;
  let bestAssignments: PlayerRanking[][] = [];
  let tied = 0;

  for (const secondPot of permutations(pots[1])) {
    for (const thirdPot of permutations(pots[2])) {
      const assignments = pots[0].map((player, index) => [player, secondPot[index], thirdPot[index]]);
      if (assignments.some((team) => {
        const femaleCount = team.filter((player) => femalePlayerIds.has(player.playerId)).length;
        return femaleCount < minFemalePlayersPerTeam || femaleCount > maxFemalePlayersPerTeam;
      })) {
        continue;
      }
      const pointTotals = assignments.map((team) => team.reduce((sum, player) => sum + player.points, 0));
      const average = pointTotals.reduce((sum, value) => sum + value, 0) / pointTotals.length;
      const variance = pointTotals.reduce((sum, value) => sum + (value - average) ** 2, 0);
      const rankSpread = assignments.reduce(
        (sum, team) => sum + Math.abs(team.reduce((teamSum, player) => teamSum + player.rank, 0) - 19.5),
        0,
      );
      const score = variance * 100 + rankSpread;
      if (score < bestScore) {
        bestScore = score;
        bestAssignments = assignments;
        tied = 1;
      } else if (score === bestScore) {
        tied += 1;
        if (rng() < 1 / tied) bestAssignments = assignments;
      }
    }
  }

  if (bestAssignments.length === 0) {
    throw new Error("Zaključnih ekip ni mogoče uravnotežiti po spolu in uvrstitvi.");
  }

  const finalsId = makeId("zakljucni-del");
  const teams = bestAssignments.map<TournamentTeam>((playersForTeam, index) => ({
    id: `${finalsId}-ekipa-${index + 1}`,
    label: FINAL_TEAM_LABELS[index],
    playerIds: playersForTeam.map((player) => player.playerId),
  }));
  const semifinalOrder = shuffle(teams, rng);
  const matches: TournamentMatch[] = [0, 1].map((index) => ({
    id: `${finalsId}-polfinale-${index + 1}`,
    phase: "semifinal",
    roundNumber: null,
    wave: 1,
    court: index + 1,
    teamA: semifinalOrder[index * 2],
    teamB: semifinalOrder[index * 2 + 1],
    scoreA: null,
    scoreB: null,
    locked: false,
  }));

  return touchTournament({
    ...stateWithoutScheduledRounds,
    phase: "finals",
    finals: { seed, teams, matches },
  });
};

const winningAndLosingTeam = (match: TournamentMatch) => {
  if (!match.locked || match.scoreA === null || match.scoreB === null) return null;
  return match.scoreA > match.scoreB
    ? { winner: match.teamA, loser: match.teamB }
    : { winner: match.teamB, loser: match.teamA };
};

export const syncFinalMatches = (state: TournamentState) => {
  if (!state.finals) return state;
  const semifinals = state.finals.matches.filter((match) => match.phase === "semifinal");
  if (semifinals.length !== 2 || semifinals.some((match) => !match.locked)) return state;
  if (state.finals.matches.some((match) => match.phase === "final")) return state;

  const first = winningAndLosingTeam(semifinals[0]);
  const second = winningAndLosingTeam(semifinals[1]);
  if (!first || !second) return state;
  const finalId = state.finals.teams[0].id.split("-ekipa-")[0];
  const medalMatches: TournamentMatch[] = [
    {
      id: `${finalId}-tretje-mesto`,
      phase: "bronze",
      roundNumber: null,
      wave: 2,
      court: 1,
      teamA: first.loser,
      teamB: second.loser,
      scoreA: null,
      scoreB: null,
      locked: false,
    },
    {
      id: `${finalId}-finale`,
      phase: "final",
      roundNumber: null,
      wave: 2,
      court: 2,
      teamA: first.winner,
      teamB: second.winner,
      scoreA: null,
      scoreB: null,
      locked: false,
    },
  ];

  return touchTournament({
    ...state,
    finals: {
      ...state.finals,
      matches: [...state.finals.matches, ...medalMatches],
    },
  });
};

export const getPlayerName = (state: TournamentState, playerId: string) =>
  state.players.find((player) => player.id === playerId)?.name ?? "Neznan igralec";

export const getTournamentProgress = (state: TournamentState) => ({
  completedRounds: state.rounds.filter((round) => round.status === "completed").length,
  activePlayerCount: activePlayers(state).length,
});

export const validateImportedTournament = (value: unknown): value is TournamentState => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<TournamentState>;
  return candidate.version === 1 &&
    typeof candidate.id === "string" &&
    Array.isArray(candidate.players) &&
    candidate.players.every((player) => player && typeof player === "object" && (
      (player as TournamentPlayer).gender === undefined ||
      (player as TournamentPlayer).gender === "male" ||
      (player as TournamentPlayer).gender === "female"
    )) &&
    Array.isArray(candidate.rounds) &&
    candidate.targetCombinedScore === 15;
};
