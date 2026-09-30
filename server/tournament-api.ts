import { z } from "zod";
import {
  isValidCombinedScore,
  isValidFinalScore,
  isValidSemifinalScore,
  type TournamentState,
} from "../src/lib/tournament";

export interface TournamentEnv {
  TOURNAMENT_DB: D1Database;
  ACCESS_TEAM_DOMAIN: string;
  ACCESS_AUD: string;
}

export interface TournamentDocument {
  tournament: TournamentState;
  revision: number;
}

interface TournamentRow {
  state_json: string;
  revision: number;
  updated_at: string;
}

const identifier = z.string().min(1).max(200);
const timestamp = z.string().datetime({ offset: true });
const score = z.number().int().min(0).max(999).nullable();
const setScoreSchema = z.object({
  scoreA: score,
  scoreB: score,
}).strict();

const playerSchema = z.object({
  id: identifier,
  name: z.string().trim().min(1).max(120),
  gender: z.enum(["male", "female"]).default("male"),
  checkedIn: z.boolean(),
  // Read legacy backups without retaining the retired payment field.
  paid: z.boolean().optional(),
  withdrawn: z.boolean(),
}).strict().transform((player) => ({
  id: player.id, name: player.name, gender: player.gender,
  checkedIn: player.checkedIn, withdrawn: player.withdrawn,
}));

const teamSchema = z.object({
  id: identifier,
  label: z.string().min(1).max(120),
  playerIds: z.array(identifier).min(1).max(12),
  jokerPlayerIds: z.array(identifier).max(12).optional(),
}).strict();

const matchSchema = z.object({
  id: identifier,
  phase: z.enum(["preliminary", "semifinal", "bronze", "final"]),
  roundNumber: z.number().int().positive().nullable(),
  wave: z.number().int().positive().max(100),
  court: z.number().int().positive().max(16),
  teamA: teamSchema,
  teamB: teamSchema,
  scoreA: score,
  scoreB: score,
  setScores: z.array(setScoreSchema).max(3).optional(),
  locked: z.boolean(),
}).strict();

const roundSchema = z.object({
  id: identifier,
  number: z.number().int().positive().max(100),
  seed: z.string().min(1).max(300),
  createdAt: timestamp,
  status: z.enum(["scheduled", "active", "completed"]),
  matches: z.array(matchSchema).max(100),
}).strict();

const finalsSchema = z.object({
  seed: z.string().min(1).max(300),
  teams: z.array(teamSchema).max(16),
  matches: z.array(matchSchema).max(32),
}).strict();

const tournamentSchema = z.object({
  version: z.literal(1),
  id: identifier,
  name: z.string().min(1).max(200),
  createdAt: timestamp,
  updatedAt: timestamp,
  phase: z.enum(["registration", "preliminary", "finals", "finished"]),
  targetCombinedScore: z.literal(15),
  courts: z.number().int().positive().max(16),
  players: z.array(playerSchema).max(100),
  rounds: z.array(roundSchema).max(100),
  finals: finalsSchema.nullable(),
}).strict().superRefine((state, context) => {
  const playerIds = new Set(state.players.map((player) => player.id));
  if (playerIds.size !== state.players.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Player IDs must be unique.", path: ["players"] });
  }

  const validateMatch = (match: z.infer<typeof matchSchema>, path: Array<string | number>) => {
    const teamA = new Set(match.teamA.playerIds);
    const teamB = new Set(match.teamB.playerIds);
    if (teamA.size !== match.teamA.playerIds.length || teamB.size !== match.teamB.playerIds.length) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Team members must be unique.", path });
    }
    if ([...teamA].some((playerId) => teamB.has(playerId))) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "A player cannot be on both teams.", path });
    }
    for (const [team, key] of [[match.teamA, "teamA"], [match.teamB, "teamB"]] as const) {
      if (team.playerIds.some((playerId) => !playerIds.has(playerId))) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Match contains an unknown player.", path: [...path, key] });
      }
      if (team.jokerPlayerIds?.some((playerId) => !team.playerIds.includes(playerId))) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Jokers must belong to their team.", path: [...path, key, "jokerPlayerIds"] });
      }
    }
    if (match.phase === "preliminary" && (
      (match.scoreA !== null && match.scoreA > state.targetCombinedScore) ||
      (match.scoreB !== null && match.scoreB > state.targetCombinedScore)
    )) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "A preliminary score cannot exceed 15.", path });
    }
    const validLockedScore = match.phase === "preliminary"
      ? isValidCombinedScore(match.scoreA, match.scoreB, state.targetCombinedScore)
      : match.phase === "semifinal"
        ? isValidSemifinalScore(match.setScores)
        : isValidFinalScore(match.scoreA, match.scoreB);
    if (match.locked && !validLockedScore) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: match.phase === "preliminary"
          ? "A confirmed preliminary score must total 15."
          : match.phase === "semifinal"
            ? "A confirmed semifinal must be won in two valid sets."
            : "A confirmed finals score must be won at 21 or later by two points.",
        path: [...path, "locked"],
      });
    }
  };

  state.rounds.forEach((round, roundIndex) => {
    round.matches.forEach((match, matchIndex) => validateMatch(match, ["rounds", roundIndex, "matches", matchIndex]));
  });
  state.finals?.matches.forEach((match, matchIndex) => validateMatch(match, ["finals", "matches", matchIndex]));
});

export const parseTournament = (value: unknown): TournamentState | null => {
  const result = tournamentSchema.safeParse(value);
  return result.success ? result.data : null;
};

export const tournamentEtag = (revision: number) => `"tournament-${revision}"`;

export const jsonResponse = (value: unknown, init: ResponseInit = {}) => {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(value), { ...init, headers });
};

export const loadTournamentDocument = async (database: D1Database): Promise<TournamentDocument | null> => {
  const row = await database
    .prepare("SELECT state_json, revision, updated_at FROM tournament_state WHERE id = 'active'")
    .first<TournamentRow>();
  if (!row) return null;

  let value: unknown;
  try {
    value = JSON.parse(row.state_json);
  } catch {
    return null;
  }
  const tournament = parseTournament(value);
  return tournament ? { tournament, revision: row.revision } : null;
};

export const tournamentResponse = (document: TournamentDocument, status = 200) => jsonResponse(document, {
  status,
  headers: {
    "Cache-Control": "no-cache",
    ETag: tournamentEtag(document.revision),
  },
});
