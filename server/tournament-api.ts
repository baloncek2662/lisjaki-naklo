import { z } from "zod";
import type { TournamentState } from "../src/lib/tournament";

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
const score = z.number().int().min(0).max(15).nullable();

const playerSchema = z.object({
  id: identifier,
  name: z.string().trim().min(1).max(120),
  gender: z.enum(["male", "female"]).default("male"),
  checkedIn: z.boolean(),
  paid: z.boolean(),
  withdrawn: z.boolean(),
}).strict();

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
    if (match.locked && (match.scoreA === null || match.scoreB === null || match.scoreA + match.scoreB !== state.targetCombinedScore)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "A confirmed score must total 15.", path: [...path, "locked"] });
    }
  };

  state.rounds.forEach((round, roundIndex) => {
    if (round.status === "completed" && round.matches.some((match) => !match.locked)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Completed rounds require confirmed matches.", path: ["rounds", roundIndex, "status"] });
    }
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
