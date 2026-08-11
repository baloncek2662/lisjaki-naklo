import { TournamentState } from "@/lib/tournament";

const DATABASE_NAME = "lisjaki-turnir-v1";
const DATABASE_VERSION = 1;
const CURRENT_STORE = "current";
const SNAPSHOT_STORE = "snapshots";
const CURRENT_KEY = "active-tournament";

const openDatabase = () => new Promise<IDBDatabase>((resolve, reject) => {
  const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
  request.onupgradeneeded = () => {
    const database = request.result;
    if (!database.objectStoreNames.contains(CURRENT_STORE)) database.createObjectStore(CURRENT_STORE);
    if (!database.objectStoreNames.contains(SNAPSHOT_STORE)) database.createObjectStore(SNAPSHOT_STORE);
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

const requestAsPromise = <T,>(request: IDBRequest<T>) => new Promise<T>((resolve, reject) => {
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

export const loadTournament = async () => {
  const database = await openDatabase();
  const transaction = database.transaction(CURRENT_STORE, "readonly");
  const state = await requestAsPromise<TournamentState | undefined>(
    transaction.objectStore(CURRENT_STORE).get(CURRENT_KEY),
  );
  database.close();
  return state;
};

export const saveTournament = async (state: TournamentState) => {
  const database = await openDatabase();
  const transaction = database.transaction([CURRENT_STORE, SNAPSHOT_STORE], "readwrite");
  transaction.objectStore(CURRENT_STORE).put(state, CURRENT_KEY);
  transaction.objectStore(SNAPSHOT_STORE).put(state, state.updatedAt);

  const snapshotStore = transaction.objectStore(SNAPSHOT_STORE);
  const keys = await requestAsPromise<IDBValidKey[]>(snapshotStore.getAllKeys());
  if (keys.length > 50) {
    keys
      .map(String)
      .sort()
      .slice(0, keys.length - 50)
      .forEach((key) => snapshotStore.delete(key));
  }

  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
  database.close();
};

export const clearTournamentStorage = async () => {
  const database = await openDatabase();
  const transaction = database.transaction([CURRENT_STORE, SNAPSHOT_STORE], "readwrite");
  transaction.objectStore(CURRENT_STORE).clear();
  transaction.objectStore(SNAPSHOT_STORE).clear();
  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
};
