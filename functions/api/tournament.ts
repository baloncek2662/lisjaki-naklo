import {
  jsonResponse,
  loadTournamentDocument,
  tournamentEtag,
  tournamentResponse,
  type TournamentEnv,
} from "../../server/tournament-api";

export const onRequestGet: PagesFunction<TournamentEnv> = async ({ env, request }) => {
  const document = await loadTournamentDocument(env.TOURNAMENT_DB);
  if (!document) {
    return jsonResponse({ error: "Tournament database is not initialized." }, {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }

  if (request.headers.get("If-None-Match") === tournamentEtag(document.revision)) {
    return new Response(null, {
      status: 304,
      headers: {
        "Cache-Control": "no-cache",
        ETag: tournamentEtag(document.revision),
      },
    });
  }

  return tournamentResponse(document);
};

export const onRequest: PagesFunction<TournamentEnv> = () => jsonResponse(
  { error: "Method not allowed." },
  { status: 405, headers: { Allow: "GET" } },
);
