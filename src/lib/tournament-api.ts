import { TournamentState, validateImportedTournament } from "@/lib/tournament";

export interface TournamentDocument {
  tournament: TournamentState;
  revision: number;
  etag: string | null;
}

export interface TournamentFetchResult {
  document: TournamentDocument | null;
  notModified: boolean;
}

export class TournamentApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "TournamentApiError";
  }
}

const responseError = async (response: Response, fallback: string) => {
  try {
    const body = await response.json() as { error?: unknown };
    if (typeof body.error === "string") return body.error;
  } catch {
    // The fallback below also covers non-JSON proxy and network responses.
  }
  return fallback;
};

const parseDocument = async (response: Response): Promise<TournamentDocument> => {
  const body = await response.json() as { tournament?: unknown; revision?: unknown };
  if (!validateImportedTournament(body.tournament) || !Number.isInteger(body.revision)) {
    throw new TournamentApiError("Strežnik je vrnil neveljavne podatke turnirja.", 502);
  }
  return {
    tournament: body.tournament,
    revision: body.revision as number,
    etag: response.headers.get("ETag"),
  };
};

export const fetchTournament = async (etag?: string | null): Promise<TournamentFetchResult> => {
  const headers = new Headers();
  if (etag) headers.set("If-None-Match", etag);

  const response = await fetch("/api/tournament", {
    method: "GET",
    headers,
    credentials: "same-origin",
  });
  if (response.status === 304) return { document: null, notModified: true };
  if (!response.ok) {
    throw new TournamentApiError(
      await responseError(response, "Turnirja ni bilo mogoče naložiti."),
      response.status,
    );
  }
  return { document: await parseDocument(response), notModified: false };
};

export const publishTournament = async (
  tournament: TournamentState,
  revision: number,
): Promise<TournamentDocument> => {
  const response = await fetch("/api/admin/tournament", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ tournament, revision }),
  });
  if (!response.ok) {
    throw new TournamentApiError(
      await responseError(response, "Sprememb ni bilo mogoče objaviti."),
      response.status,
    );
  }
  return parseDocument(response);
};
