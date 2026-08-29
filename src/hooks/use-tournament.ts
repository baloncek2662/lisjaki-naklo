import { useCallback, useEffect, useRef, useState } from "react";
import { createDefaultTournament, TournamentState } from "@/lib/tournament";
import { fetchTournament, publishTournament, TournamentApiError } from "@/lib/tournament-api";

const PUBLIC_REFRESH_INTERVAL = 15_000;
const ADMIN_SAVE_DELAY = 750;

interface UseTournamentOptions {
  editable?: boolean;
}

export type TournamentSyncStatus = "loading" | "saved" | "saving" | "error";

export const useTournament = ({ editable = false }: UseTournamentOptions = {}) => {
  const [tournament, setTournament] = useState<TournamentState>(() => createDefaultTournament());
  const [loaded, setLoaded] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<TournamentSyncStatus>("loading");
  const mounted = useRef(true);
  const refreshing = useRef(false);
  const canSave = useRef(false);
  const revision = useRef(0);
  const etag = useRef<string | null>(null);
  const lastSavedUpdate = useRef<string | null>(null);
  const latestTournament = useRef(tournament);
  const saveChain = useRef(Promise.resolve());

  latestTournament.current = tournament;

  const refreshTournament = useCallback(async () => {
    if (refreshing.current) return;
    refreshing.current = true;
    try {
      const result = await fetchTournament(etag.current);
      if (!mounted.current) return;
      if (result.document) {
        revision.current = result.document.revision;
        etag.current = result.document.etag;
        lastSavedUpdate.current = result.document.tournament.updatedAt;
        setTournament(result.document.tournament);
      }
      canSave.current = true;
      setSyncError(null);
      setSyncStatus("saved");
    } catch (error) {
      if (!mounted.current) return;
      const message = error instanceof Error ? error.message : "Turnirja ni bilo mogoče naložiti.";
      setSyncError(message);
      setSyncStatus("error");
    } finally {
      refreshing.current = false;
      if (mounted.current) setLoaded(true);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void refreshTournament();
    return () => {
      mounted.current = false;
    };
  }, [refreshTournament]);

  useEffect(() => {
    if (editable) return undefined;

    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void refreshTournament();
    };
    const interval = window.setInterval(refreshWhenVisible, PUBLIC_REFRESH_INTERVAL);
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [editable, refreshTournament]);

  useEffect(() => {
    if (!editable || !loaded || !canSave.current || tournament.updatedAt === lastSavedUpdate.current) return;
    const timeout = window.setTimeout(() => {
      saveChain.current = saveChain.current.then(async () => {
        const stateToSave = latestTournament.current;
        if (stateToSave.updatedAt === lastSavedUpdate.current || !canSave.current) return;
        if (mounted.current) setSyncStatus("saving");
        try {
          const saved = await publishTournament(stateToSave, revision.current);
          revision.current = saved.revision;
          etag.current = saved.etag;
          lastSavedUpdate.current = stateToSave.updatedAt;
          if (mounted.current) {
            setSyncError(null);
            setSyncStatus("saved");
          }
        } catch (error) {
          if (!mounted.current) return;
          if (error instanceof TournamentApiError && error.status === 409) canSave.current = false;
          setSyncError(error instanceof Error ? error.message : "Sprememb ni bilo mogoče objaviti.");
          setSyncStatus("error");
        }
      });
    }, ADMIN_SAVE_DELAY);
    return () => window.clearTimeout(timeout);
  }, [editable, loaded, tournament]);

  const resetTournament = async () => {
    setTournament(createDefaultTournament());
  };

  return { tournament, setTournament, loaded, syncError, syncStatus, resetTournament };
};
