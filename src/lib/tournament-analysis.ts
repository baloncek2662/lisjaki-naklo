import { calculateRankings, type TournamentMatch, type TournamentState } from "./tournament";

const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
const resultOf = (match: TournamentMatch): number | null => {
  if (!match.locked || match.phase !== "preliminary") return null;
  return match.scoreA === null || match.scoreB === null ? null :
    match.scoreA === match.scoreB ? 0.5 : Number(match.scoreA > match.scoreB);
};

/** For each focal player, estimate everyone else only from matches without them. */
export function analyzeTournament(state: TournamentState) {
  const rounds = [...state.rounds].filter((round) => round.status !== "scheduled")
    .sort((a, b) => a.number - b.number);
  const rankings = calculateRankings({ ...state, rounds });
  const history = rounds.map((round, index) => ({
    round: round.number,
    complete: round.status === "completed",
    rankings: calculateRankings({ ...state, rounds: rounds.slice(0, index + 1) }),
  }));
  const qualified = new Set(state.finals?.teams.flatMap((team) => team.playerIds) ?? []);
  const players = rankings.map((row) => {
    // Exclude every match involving the focal player, including their joker appearances.
    const independentRankings = calculateRankings({ ...state, rounds: rounds.map((round) => ({
      ...round,
      matches: round.matches.filter((match) =>
        ![...match.teamA.playerIds, ...match.teamB.playerIds].includes(row.playerId)),
    })) });
    const estimates = new Map(independentRankings.map((entry) => [entry.playerId, entry]));
    const average = (ids: string[]) => ids.every((id) => estimates.has(id))
      ? mean(ids.map((id) => estimates.get(id)!.average)) : null;
    const road = rounds.flatMap((round) => round.matches.flatMap((match) => {
      if (resultOf(match) === null) return [];
      const own = [match.teamA, match.teamB].find((team) => team.playerIds.includes(row.playerId));
      if (!own || own.jokerPlayerIds?.includes(row.playerId)) return [];
      const opponents = own === match.teamA ? match.teamB : match.teamA;
      return [{ round: round.number, opponentPoints: average(opponents.playerIds),
        teammatePoints: average(own.playerIds.filter((id) => id !== row.playerId)),
        minSamples: Math.min(...[...opponents.playerIds, ...own.playerIds.filter((id) => id !== row.playerId)].map((id) => estimates.get(id)?.matches ?? 0)) }];
    }));
    // Do not silently drop unknown players or substitute zero for missing evidence.
    const complete = road.length > 0 && road.every((match) => match.opponentPoints !== null && match.teammatePoints !== null);
    const opponentPoints = complete ? mean(road.map((match) => match.opponentPoints!)) : null;
    const teammatePoints = complete ? mean(road.map((match) => match.teammatePoints!)) : null;
    return { ...row, name: row.name.replace(/\s+/g, " ").trim(),
      qualified: qualified.has(row.playerId), opponentPoints, teammatePoints,
      difficulty: opponentPoints !== null && teammatePoints !== null ? opponentPoints - teammatePoints : null,
      minSamples: road.length ? Math.min(...road.map((match) => match.minSamples)) : 0, road,
      history: history.map((snapshot) => {
        const standing = snapshot.rankings.find((entry) => entry.playerId === row.playerId);
        return { round: snapshot.round, complete: snapshot.complete, points: standing?.points ?? 0, rank: standing?.rank ?? null };
      }),
    };
  }).sort((a, b) => (b.difficulty ?? -Infinity) - (a.difficulty ?? -Infinity) || a.rank - b.rank);
  return { players, roundCount: rounds.length };
}
