export type TournamentPhase = "registration" | "preliminary" | "finals" | "finished";
export type MatchPhase = "preliminary" | "semifinal" | "bronze" | "final";

export interface TournamentPlayer {
  id: string;
  name: string;
  checkedIn: boolean;
  paid: boolean;
  withdrawn: boolean;
}

export interface TournamentTeam {
  id: string;
  label: string;
  playerIds: string[];
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
  maxPlayers: number;
  plannedRounds: number;
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
}

const FINAL_TEAM_LABELS = ["Ekipa A", "Ekipa B", "Ekipa C", "Ekipa D"];

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
    maxPlayers: 30,
    plannedRounds: 6,
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

export const generatePreliminaryRound = (state: TournamentState, seed = makeId("zreb")) => {
  const players = activePlayers(state);
  if (players.length < 6 || players.length % 6 !== 0) {
    throw new Error("Število aktivnih igralcev mora biti deljivo s 6.");
  }
  if (state.rounds.some((round) => round.status !== "completed")) {
    throw new Error("Pred novim žrebom zaključite trenutni krog.");
  }
  if (state.rounds.length >= state.plannedRounds) {
    throw new Error("Vsi načrtovani predtekmovalni krogi so že odigrani.");
  }

  const rng = createRng(seed);
  const history = getInteractionHistory(state);
  const playerIds = players.map((player) => player.id);
  const attempts = state.rounds.length === 0 ? 1 : 20_000;
  let bestPenalty = Number.POSITIVE_INFINITY;
  let bestTeams: string[][] = [];

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const candidate = shuffle(playerIds, rng);
    const teams: string[][] = [];
    for (let index = 0; index < candidate.length; index += 3) {
      teams.push(candidate.slice(index, index + 3));
    }
    const penalty = teamPartitionPenalty(
      teams,
      history.teammateCounts,
      history.previousTeammates,
    );
    if (penalty < bestPenalty) {
      bestPenalty = penalty;
      bestTeams = teams;
      if (penalty === 0) break;
    }
  }

  const pairedTeamIndexes = shuffle(
    bestTeamPairing(
      bestTeams,
      history.opponentCounts,
      history.previousOpponents,
      rng,
    ),
    rng,
  );
  const roundNumber = state.rounds.length + 1;
  const roundId = makeId(`krog-${roundNumber}`);
  const teamObjects = bestTeams.map<TournamentTeam>((playerIdsForTeam, index) => ({
    id: `${roundId}-ekipa-${index + 1}`,
    label: `Ekipa ${index + 1}`,
    playerIds: playerIdsForTeam,
  }));

  const matches = pairedTeamIndexes.map<TournamentMatch>(([first, second], index) => ({
    id: `${roundId}-tekma-${index + 1}`,
    phase: "preliminary",
    roundNumber,
    wave: Math.floor(index / state.courts) + 1,
    court: ((index % state.courts + roundNumber - 1) % state.courts) + 1,
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
    status: "active",
    matches,
  };

  return touchTournament({
    ...state,
    phase: "preliminary",
    rounds: [...state.rounds, round],
  });
};

export const generateAllPreliminaryRounds = (state: TournamentState) => {
  if (state.rounds.length > 0) {
    throw new Error("Predtekmovalni razpored je že izžreban.");
  }

  let workingState = state;
  for (let roundNumber = 1; roundNumber <= state.plannedRounds; roundNumber += 1) {
    workingState = generatePreliminaryRound(workingState);
    workingState = {
      ...workingState,
      rounds: workingState.rounds.map((round) => ({ ...round, status: "completed" as const })),
    };
  }

  return touchTournament({
    ...workingState,
    phase: "preliminary",
    rounds: workingState.rounds.map((round, index) => ({
      ...round,
      status: index === 0 ? "active" : "scheduled",
    })),
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
  if (state.rounds.length !== state.plannedRounds || state.rounds.some((round) => round.status !== "completed")) {
    throw new Error("Pred zaključnim delom odigrajte vse predtekmovalne kroge.");
  }
  const rankings = calculateRankings(state);
  if (rankings.length < 12) throw new Error("Za zaključni del je potrebnih najmanj 12 uvrščenih igralcev.");

  const topTwelve = rankings.slice(0, 12);
  const pots = [topTwelve.slice(0, 4), topTwelve.slice(4, 8), topTwelve.slice(8, 12)];
  const rng = createRng(seed);
  let bestScore = Number.POSITIVE_INFINITY;
  let bestAssignments: PlayerRanking[][] = [];
  let tied = 0;

  for (const secondPot of permutations(pots[1])) {
    for (const thirdPot of permutations(pots[2])) {
      const assignments = pots[0].map((player, index) => [player, secondPot[index], thirdPot[index]]);
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
    ...state,
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
  totalRounds: state.plannedRounds,
  activePlayerCount: activePlayers(state).length,
});

export const validateImportedTournament = (value: unknown): value is TournamentState => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<TournamentState>;
  return candidate.version === 1 &&
    typeof candidate.id === "string" &&
    Array.isArray(candidate.players) &&
    Array.isArray(candidate.rounds) &&
    candidate.targetCombinedScore === 15;
};
