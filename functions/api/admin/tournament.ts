import type { PluginData } from "@cloudflare/pages-plugin-cloudflare-access";
import {
  jsonResponse,
  loadTournamentDocument,
  parseTournament,
  tournamentResponse,
  type TournamentDocument,
  type TournamentEnv,
} from "../../../server/tournament-api";

const MAX_REQUEST_BYTES = 1_000_000;
const SNAPSHOTS_TO_KEEP = 50;

interface UpdateRequest {
  tournament?: unknown;
  revision?: unknown;
}

export const onRequestPut: PagesFunction<TournamentEnv, string, PluginData> = async (context) => {
  const contentLength = Number(context.request.headers.get("Content-Length") ?? 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return jsonResponse({ error: "Tournament payload is too large." }, { status: 413 });
  }

  const text = await context.request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_REQUEST_BYTES) {
    return jsonResponse({ error: "Tournament payload is too large." }, { status: 413 });
  }

  let body: UpdateRequest;
  try {
    body = JSON.parse(text) as UpdateRequest;
  } catch {
    return jsonResponse({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const expectedRevision = body.revision;
  const parsed = parseTournament(body.tournament);
  if (!Number.isInteger(expectedRevision) || (expectedRevision as number) < 1 || !parsed) {
    return jsonResponse({ error: "Tournament payload or revision is invalid." }, { status: 400 });
  }

  const current = await loadTournamentDocument(context.env.TOURNAMENT_DB);
  if (!current) {
    return jsonResponse({ error: "Tournament database is not initialized." }, { status: 503 });
  }
  if (current.revision !== expectedRevision) {
    return jsonResponse({ error: "Tournament was updated elsewhere.", revision: current.revision }, { status: 409 });
  }

  const now = new Date().toISOString();
  const tournament = { ...parsed, updatedAt: now };
  const nextRevision = current.revision + 1;
  const updatedBy = context.data.cloudflareAccess.JWT.payload.email ?? "authenticated organizer";
  const stateJson = JSON.stringify(tournament);

  try {
    await context.env.TOURNAMENT_DB.batch([
      context.env.TOURNAMENT_DB.prepare(
        "UPDATE tournament_state SET state_json = ?, revision = ?, updated_at = ?, updated_by = ? WHERE id = 'active' AND revision = ?",
      ).bind(stateJson, nextRevision, now, updatedBy, current.revision),
      context.env.TOURNAMENT_DB.prepare(
        "INSERT INTO tournament_snapshots (revision, state_json, updated_at, updated_by) VALUES (?, ?, ?, ?)",
      ).bind(nextRevision, stateJson, now, updatedBy),
      context.env.TOURNAMENT_DB.prepare(
        "DELETE FROM tournament_snapshots WHERE revision <= ?",
      ).bind(nextRevision - SNAPSHOTS_TO_KEEP),
    ]);
  } catch {
    const latest = await loadTournamentDocument(context.env.TOURNAMENT_DB);
    if (latest && latest.revision !== current.revision) {
      return jsonResponse({ error: "Tournament was updated elsewhere.", revision: latest.revision }, { status: 409 });
    }
    return jsonResponse({ error: "Tournament could not be saved." }, { status: 500 });
  }

  const document: TournamentDocument = { tournament, revision: nextRevision };
  return tournamentResponse(document);
};

export const onRequest: PagesFunction<TournamentEnv> = () => jsonResponse(
  { error: "Method not allowed." },
  { status: 405, headers: { Allow: "PUT" } },
);
