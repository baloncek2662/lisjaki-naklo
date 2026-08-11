import { useEffect, useRef, useState } from "react";
import { createDefaultTournament, TournamentState } from "@/lib/tournament";
import { clearTournamentStorage, loadTournament, saveTournament } from "@/lib/tournament-storage";

const CHANNEL_NAME = "lisjaki-turnir-posodobitve";

export const useTournament = () => {
  const [tournament, setTournament] = useState<TournamentState>(() => createDefaultTournament());
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const lastSavedUpdate = useRef<string | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    let active = true;
    loadTournament()
      .then((stored) => {
        if (!active) return;
        if (stored) {
          lastSavedUpdate.current = stored.updatedAt;
          setTournament(stored);
        }
        setLoaded(true);
      })
      .catch(() => {
        if (!active) return;
        setStorageError("Lokalne shrambe ni bilo mogoče odpreti.");
        setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return undefined;
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;
    channel.onmessage = (event: MessageEvent<TournamentState>) => {
      if (!event.data || event.data.updatedAt === lastSavedUpdate.current) return;
      lastSavedUpdate.current = event.data.updatedAt;
      setTournament(event.data);
    };
    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!loaded || tournament.updatedAt === lastSavedUpdate.current) return;
    const timeout = window.setTimeout(() => {
      saveTournament(tournament)
        .then(() => {
          lastSavedUpdate.current = tournament.updatedAt;
          channelRef.current?.postMessage(tournament);
          setStorageError(null);
        })
        .catch(() => setStorageError("Sprememb ni bilo mogoče shraniti lokalno."));
    }, 150);
    return () => window.clearTimeout(timeout);
  }, [loaded, tournament]);

  const resetTournament = async () => {
    await clearTournamentStorage();
    const fresh = createDefaultTournament();
    lastSavedUpdate.current = null;
    setTournament(fresh);
  };

  return { tournament, setTournament, loaded, storageError, resetTournament };
};
