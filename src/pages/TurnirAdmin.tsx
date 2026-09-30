import { ChangeEvent, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ClipboardList,
  Download,
  FileJson,
  LockKeyhole,
  Plus,
  RotateCcw,
  Save,
  Settings2,
  Shuffle,
  Trash2,
  Trophy,
  UnlockKeyhole,
  Upload,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useTournament } from "@/hooks/use-tournament";
import {
  activePlayers,
  calculateRankings,
  completePreliminaryRound,
  generateInitialRounds,
  generatePreliminaryRound,
  generateFinals,
  getPlayerName,
  getSemifinalResult,
  isValidFinalScore,
  isValidCombinedScore,
  isValidSemifinalScore,
  MAX_INITIAL_ROUNDS,
  startNextScheduledRound,
  syncFinalMatches,
  touchTournament,
  TournamentMatch,
  TournamentPlayer,
  TournamentState,
  validateImportedTournament,
} from "@/lib/tournament";

const createPlayer = (name: string, gender: TournamentPlayer["gender"] = "male"): TournamentPlayer => ({
  id: `igralec-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
  name,
  gender,
  checkedIn: true,
  withdrawn: false,
});

const downloadFile = (contents: string, filename: string, type: string) => {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const csvCell = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;

const phaseLabels = {
  registration: "Prijave",
  preliminary: "Predtekmovanje",
  finals: "Zaključni del",
  finished: "Turnir zaključen",
};

const phaseMatchLabels = {
  preliminary: "Predtekmovanje",
  semifinal: "Polfinale",
  bronze: "3. mesto",
  final: "Finale",
};

interface MatchEditorProps {
  match: TournamentMatch;
  state: TournamentState;
  onScore: (matchId: string, side: "A" | "B", value: number | null, setIndex?: number) => void;
  onLock: (matchId: string) => void;
  onUnlock: (matchId: string) => void;
  editable?: boolean;
}

const MatchEditor = ({ match, state, onScore, onLock, onUnlock, editable = true }: MatchEditorProps) => {
  const preliminary = match.phase === "preliminary";
  const semifinal = match.phase === "semifinal";
  const valid = preliminary
    ? isValidCombinedScore(match.scoreA, match.scoreB, state.targetCombinedScore)
    : semifinal
      ? isValidSemifinalScore(match.setScores)
      : isValidFinalScore(match.scoreA, match.scoreB);
  const semifinalSets = match.setScores ?? Array.from({ length: 3 }, () => ({ scoreA: null, scoreB: null }));
  const semifinalResult = getSemifinalResult(semifinalSets);
  const teamNames = (team: TournamentMatch["teamA"]) => team.playerIds
    .map((id) => `${getPlayerName(state, id)}${team.jokerPlayerIds?.includes(id) ? " (joker)" : ""}`)
    .join(" · ");
  const scoreHint = !editable
    ? "Rezultat bo mogoče vnesti, ko bo ta krog na vrsti."
    : match.locked
      ? semifinal
        ? `Rezultat je shranjen (${semifinalResult.winsA} : ${semifinalResult.winsB} v nizih).`
        : "Rezultat je varno shranjen."
      : valid
        ? preliminary
          ? "Vsota je 15 – rezultat je pripravljen."
          : semifinal
            ? "Ekipa je dobila dva niza – rezultat je pripravljen."
            : "Doseženih je najmanj 21 točk z dvema točkama prednosti."
        : preliminary
          ? "Rezultata morata imeti skupno 15 točk."
          : semifinal
            ? "Polfinale se igra na dva dobljena niza; vsak niz je do najmanj 21 z dvema točkama razlike."
            : "Igra se do najmanj 21 z dvema točkama razlike.";

  return (
    <Card className={match.locked ? "border-emerald-200 bg-emerald-50/40" : "border-border"}>
      <CardHeader className="flex-row items-center justify-between space-y-0 border-b p-4">
        <div>
          <Badge variant="outline">{phaseMatchLabels[match.phase]}</Badge>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Termin {match.wave} · Igrišče {match.court}
          </p>
        </div>
        {match.locked && <Badge className="gap-1 bg-emerald-600 hover:bg-emerald-600"><Check size={13} /> Potrjeno</Badge>}
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid gap-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <div>
            <p className="font-black">{match.teamA.label}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{teamNames(match.teamA)}</p>
          </div>
          {semifinal ? (
            <div className="grid gap-2">
              {semifinalSets.map((set, setIndex) => (
                <div key={setIndex} className="grid grid-cols-[3.5rem_4.5rem_auto_4.5rem] items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Niz {setIndex + 1}</span>
                  <Input
                    aria-label={`${setIndex + 1}. niz, rezultat ${match.teamA.label}`}
                    type="number"
                    min={0}
                    max={999}
                    value={set.scoreA ?? ""}
                    disabled={match.locked || !editable}
                    onChange={(event) => onScore(
                      match.id,
                      "A",
                      event.target.value === "" ? null : Number(event.target.value),
                      setIndex,
                    )}
                    className="h-11 text-center text-lg font-black"
                  />
                  <span className="font-black text-muted-foreground">:</span>
                  <Input
                    aria-label={`${setIndex + 1}. niz, rezultat ${match.teamB.label}`}
                    type="number"
                    min={0}
                    max={999}
                    value={set.scoreB ?? ""}
                    disabled={match.locked || !editable}
                    onChange={(event) => onScore(
                      match.id,
                      "B",
                      event.target.value === "" ? null : Number(event.target.value),
                      setIndex,
                    )}
                    className="h-11 text-center text-lg font-black"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Input
                aria-label={`Rezultat ${match.teamA.label}`}
                type="number"
                min={0}
                max={preliminary ? state.targetCombinedScore : 999}
                value={match.scoreA ?? ""}
                disabled={match.locked || !editable}
                onChange={(event) => onScore(match.id, "A", event.target.value === "" ? null : Number(event.target.value))}
                className="h-14 w-20 text-center text-2xl font-black"
              />
              <span className="text-xl font-black text-muted-foreground">:</span>
              <Input
                aria-label={`Rezultat ${match.teamB.label}`}
                type="number"
                min={0}
                max={preliminary ? state.targetCombinedScore : 999}
                value={match.scoreB ?? ""}
                disabled={match.locked || !editable}
                onChange={(event) => onScore(match.id, "B", event.target.value === "" ? null : Number(event.target.value))}
                className="h-14 w-20 text-center text-2xl font-black"
              />
            </div>
          )}
          <div className="sm:text-right">
            <p className="font-black">{match.teamB.label}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{teamNames(match.teamB)}</p>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between gap-3 border-t pt-4">
          <p className={`text-xs font-medium ${!editable || valid || match.locked ? "text-muted-foreground" : "text-destructive"}`}>
            {scoreHint}
          </p>
          {!editable ? (
            <Badge variant="outline">Načrtovano</Badge>
          ) : match.locked ? (
            <Button size="sm" variant="ghost" onClick={() => onUnlock(match.id)}><UnlockKeyhole size={15} /> Popravi</Button>
          ) : (
            <Button size="sm" disabled={!valid} onClick={() => onLock(match.id)}><LockKeyhole size={15} /> Potrdi</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const TurnirAdmin = () => {
  const { tournament, setTournament, loaded, syncError, syncStatus, resetTournament } = useTournament({ editable: true });
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerIsFemale, setNewPlayerIsFemale] = useState(false);
  const [bulkNames, setBulkNames] = useState("");
  const [bulkPlayersAreFemale, setBulkPlayersAreFemale] = useState(false);
  const [initialRoundCount, setInitialRoundCount] = useState(6);
  const [activeTab, setActiveTab] = useState("prijave");
  const [selectedRoundNumber, setSelectedRoundNumber] = useState<number | null>(null);
  const importInput = useRef<HTMLInputElement>(null);
  const rankings = useMemo(() => calculateRankings(tournament), [tournament]);
  const activeCount = activePlayers(tournament).length;
  const activeFemaleCount = activePlayers(tournament).filter((player) => player.gender === "female").length;
  const activeMaleCount = activeCount - activeFemaleCount;
  const currentRound = tournament.rounds.find((round) => round.status === "active");
  const nextScheduledRound = tournament.rounds.find((round) => round.status === "scheduled");
  const lastRound = tournament.rounds[tournament.rounds.length - 1];
  const displayedRound = tournament.rounds.find((round) => round.number === selectedRoundNumber) ?? currentRound ?? lastRound;
  const completedRounds = tournament.rounds.filter((round) => round.status === "completed").length;
  const rosterHasHistory = tournament.rounds.length > 0;
  const availabilityLocked = Boolean(currentRound || nextScheduledRound || tournament.finals);

  const updateState = (updater: (state: TournamentState) => TournamentState) => {
    setTournament((previous) => touchTournament(updater(previous)));
  };

  const addPlayer = () => {
    const name = newPlayerName.trim();
    if (!name) return;
    if (tournament.players.some((player) => player.name.toLocaleLowerCase("sl") === name.toLocaleLowerCase("sl"))) {
      toast.error("Igralec s tem imenom je že na seznamu.");
      return;
    }
    updateState((state) => ({ ...state, players: [...state.players, createPlayer(name, newPlayerIsFemale ? "female" : "male")] }));
    setNewPlayerName("");
  };

  const addBulkPlayers = () => {
    const existing = new Set(tournament.players.map((player) => player.name.toLocaleLowerCase("sl")));
    const names = bulkNames
      .split(/\r?\n|,/)
      .map((name) => name.trim())
      .filter((name) => name && !existing.has(name.toLocaleLowerCase("sl")));
    const accepted = names;
    if (accepted.length === 0) {
      toast.error("Ni novih imen za dodajanje.");
      return;
    }
    const gender = bulkPlayersAreFemale ? "female" : "male";
    updateState((state) => ({ ...state, players: [...state.players, ...accepted.map((name) => createPlayer(name, gender))] }));
    setBulkNames("");
    toast.success(`Dodanih igralcev: ${accepted.length}.`);
  };

  const updatePlayer = (playerId: string, changes: Partial<TournamentPlayer>) => {
    updateState((state) => ({
      ...state,
      players: state.players.map((player) => player.id === playerId ? { ...player, ...changes } : player),
    }));
  };

  const removePlayer = (playerId: string) => {
    updateState((state) => ({ ...state, players: state.players.filter((player) => player.id !== playerId) }));
  };

  const drawNextRound = () => {
    try {
      setTournament((state) => generatePreliminaryRound(state));
      setSelectedRoundNumber(tournament.rounds.length + 1);
      setActiveTab("krog");
      toast.success(`${tournament.rounds.length + 1}. krog je izžreban.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Žreb ni uspel.");
    }
  };

  const drawInitialRounds = () => {
    try {
      setTournament((state) => generateInitialRounds(state, initialRoundCount));
      setSelectedRoundNumber(1);
      setActiveTab("krog");
      toast.success(initialRoundCount === 1 ? "Prvi krog je izžreban." : `Izžrebanih je ${initialRoundCount} krogov.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Začetni žreb ni uspel.");
    }
  };

  const startNextRound = () => {
    if (!nextScheduledRound) return;
    try {
      setTournament((state) => startNextScheduledRound(state));
      setSelectedRoundNumber(nextScheduledRound.number);
      setActiveTab("krog");
      toast.success(`${nextScheduledRound.number}. krog je v teku.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Kroga ni bilo mogoče začeti.");
    }
  };

  const updatePreliminaryScore = (matchId: string, side: "A" | "B", value: number | null) => {
    updateState((state) => ({
      ...state,
      rounds: state.rounds.map((round) => ({
        ...round,
        matches: round.matches.map((match) => match.id === matchId
          ? { ...match, [side === "A" ? "scoreA" : "scoreB"]: value }
          : match),
      })),
    }));
  };

  const setPreliminaryLock = (matchId: string, locked: boolean) => {
    if (!locked && !window.confirm("Želite odkleniti rezultat? Lestvica se bo takoj preračunala.")) return;
    updateState((state) => ({
      ...state,
      rounds: state.rounds.map((round) => ({
        ...round,
        matches: round.matches.map((match) => match.id === matchId ? { ...match, locked } : match),
      })),
    }));
  };

  const completeCurrentRound = () => {
    if (!currentRound || currentRound.matches.some((match) => !match.locked)) {
      toast.error("Najprej potrdite vse rezultate trenutnega kroga.");
      return;
    }
    setTournament((state) => completePreliminaryRound(state, currentRound.id));
    setSelectedRoundNumber(currentRound.number);
    setActiveTab("lestvica");
    toast.success(`${currentRound.number}. krog je zaključen in lestvica posodobljena.`);
  };

  const createFinalStage = () => {
    const scheduledWarning = nextScheduledRound
      ? " Neodigrani načrtovani krogi bodo odstranjeni."
      : "";
    if (!window.confirm(
      `Ali ste prepričani, da želite zaključiti predtekmovanje in izžrebati zaključne ekipe? Po tem ne bo več mogoče dodajati novih krogov.${scheduledWarning}`,
    )) return;
    try {
      setTournament((state) => generateFinals(state));
      setActiveTab("finale");
      toast.success("Zaključne ekipe in polfinala so pripravljeni.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Žreb zaključnih ekip ni uspel.");
    }
  };

  const updateFinalScore = (matchId: string, side: "A" | "B", value: number | null, setIndex?: number) => {
    updateState((state) => ({
      ...state,
      finals: state.finals ? {
        ...state.finals,
        matches: state.finals.matches.map((match) => {
          if (match.id !== matchId) return match;
          if (match.phase !== "semifinal" || setIndex === undefined) {
            return { ...match, [side === "A" ? "scoreA" : "scoreB"]: value };
          }
          const setScores = match.setScores
            ? match.setScores.map((set) => ({ ...set }))
            : Array.from({ length: 3 }, () => ({ scoreA: null, scoreB: null }));
          setScores[setIndex] = {
            ...setScores[setIndex],
            [side === "A" ? "scoreA" : "scoreB"]: value,
          };
          return { ...match, scoreA: null, scoreB: null, setScores };
        }),
      } : null,
    }));
  };

  const setFinalLock = (matchId: string, locked: boolean) => {
    if (!locked && !window.confirm("Želite odkleniti rezultat zaključne tekme? Lestvica oziroma razpored se bosta takoj posodobila.")) return;
    setTournament((previous) => {
      if (!previous.finals) return previous;
      const editedMatch = previous.finals.matches.find((match) => match.id === matchId);
      const removingMedalMatches = !locked && editedMatch?.phase === "semifinal";
      let next = touchTournament({
        ...previous,
        phase: !locked && previous.phase === "finished" ? "finals" : previous.phase,
        finals: {
          ...previous.finals,
          matches: previous.finals.matches
            .filter((match) => !removingMedalMatches || match.phase === "semifinal")
            .map((match) => match.id === matchId ? { ...match, locked } : match),
        },
      });
      next = syncFinalMatches(next);
      const medalMatches = next.finals?.matches.filter((match) => match.phase === "bronze" || match.phase === "final") ?? [];
      if (medalMatches.length === 2 && medalMatches.every((match) => match.locked)) {
        next = touchTournament({ ...next, phase: "finished" });
      }
      return next;
    });
  };

  const exportJson = () => {
    downloadFile(JSON.stringify(tournament, null, 2), "turnir-lisjaki-varnostna-kopija.json", "application/json");
    toast.success("Varnostna kopija je prenesena.");
  };

  const exportCsv = () => {
    const header = ["Mesto", "Igralec", "Tekme", "Joker nastopi", "Zmage", "Točke", "Povprečje"];
    const rows = rankings.map((row) => [row.rank, row.name, row.matches, row.jokerAppearances, row.wins, row.points, row.average.toFixed(2)]);
    const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
    downloadFile(`\ufeff${csv}`, "turnir-lisjaki-lestvica.csv", "text/csv;charset=utf-8");
  };

  const importJson = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!validateImportedTournament(parsed)) throw new Error("Datoteka ni veljavna varnostna kopija turnirja.");
      if (!window.confirm(
        "Ali ste prepričani, da želite obnoviti turnir iz izbrane varnostne kopije? Trenutni igralci, žrebi in rezultati bodo zamenjani s podatki iz kopije.",
      )) return;
      setTournament(touchTournament({
        ...parsed,
        players: parsed.players.map(({ id, name, gender, checkedIn, withdrawn }) => ({
          id, name, gender, checkedIn, withdrawn,
        })),
      }));
      toast.success("Turnir je obnovljen iz varnostne kopije.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Uvoz ni uspel.");
    }
  };

  const reset = async () => {
    if (!window.confirm("Izbrisali boste turnir, igralce in rezultate za vse obiskovalce. Imate varnostno kopijo?")) return;
    await resetTournament();
    setActiveTab("prijave");
    toast.success("Ustvarjen je nov prazen turnir.");
  };

  if (!loaded) {
    return <div className="flex min-h-screen items-center justify-center bg-muted/30 text-muted-foreground">Nalaganje osrednjih podatkov turnirja …</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 border-b bg-foreground text-background shadow-lg">
        <div className="container mx-auto flex min-h-16 flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="text-background hover:bg-background/10 hover:text-background">
              <Link to="/turnir" aria-label="Nazaj na javno stran"><ArrowLeft /></Link>
            </Button>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Organizatorska konzola</p>
              <h1 className="text-base font-black sm:text-lg">Turnir odbojke na mivki</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary hover:bg-primary">{phaseLabels[tournament.phase]}</Badge>
            <Button asChild variant="outline" size="sm" className="border-background/20 bg-transparent text-background hover:bg-background/10 hover:text-background">
              <Link to="/turnir">Javni prikaz</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {syncError && <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive">{syncError}</div>}

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card><CardContent className="flex items-center gap-4 p-5"><Users className="text-primary" /><div><p className="text-2xl font-black">{activeCount}</p><p className="text-sm text-muted-foreground">aktivnih igralcev</p></div></CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 p-5"><ClipboardList className="text-primary" /><div><p className="text-2xl font-black">{completedRounds}</p><p className="text-sm text-muted-foreground">zaključenih krogov</p></div></CardContent></Card>
          <Card><CardContent className="flex items-center gap-4 p-5"><Save className="text-primary" /><div><p className="text-2xl font-black">{syncStatus === "saving" ? "Objavljanje …" : syncStatus === "error" ? "Napaka" : "Objavljeno"}</p><p className="text-sm text-muted-foreground">osrednja baza rezultatov</p></div></CardContent></Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 grid h-auto w-full grid-cols-2 gap-1 p-1 sm:grid-cols-5">
            <TabsTrigger value="prijave" className="py-2.5">Prijave</TabsTrigger>
            <TabsTrigger value="krog" className="py-2.5">Krog</TabsTrigger>
            <TabsTrigger value="lestvica" className="py-2.5">Lestvica</TabsTrigger>
            <TabsTrigger value="finale" className="py-2.5">Finale</TabsTrigger>
            <TabsTrigger value="podatki" className="py-2.5">Podatki</TabsTrigger>
          </TabsList>

          <TabsContent value="prijave" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="text-primary" /> Dodaj igralce</CardTitle></CardHeader>
              <CardContent className="grid gap-5 lg:grid-cols-2">
                <div>
                  <Label htmlFor="novo-ime">Posamezni igralec</Label>
                  <div className="mt-2 flex gap-2">
                    <Input id="novo-ime" placeholder="Ime in priimek" value={newPlayerName} disabled={availabilityLocked} onChange={(event) => setNewPlayerName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") addPlayer(); }} />
                    <label className="flex shrink-0 items-center gap-2 rounded-md border px-3 text-sm"><Checkbox checked={newPlayerIsFemale} disabled={availabilityLocked} onCheckedChange={(checked) => setNewPlayerIsFemale(checked === true)} /> Ženska</label>
                    <Button onClick={addPlayer} disabled={availabilityLocked || !newPlayerName.trim()}><Plus size={18} /> Dodaj</Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="seznam-imen">Več imen naenkrat</Label>
                  <Textarea id="seznam-imen" className="mt-2 min-h-28" placeholder={'Vsako ime v svojo vrstico\nAna Novak\nBlaž Kralj'} value={bulkNames} disabled={availabilityLocked} onChange={(event) => setBulkNames(event.target.value)} />
                  <div className="mt-2 flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm"><Checkbox checked={bulkPlayersAreFemale} disabled={availabilityLocked} onCheckedChange={(checked) => setBulkPlayersAreFemale(checked === true)} /> Ženska</label>
                    <Button variant="outline" onClick={addBulkPlayers} disabled={availabilityLocked || !bulkNames.trim()}>Dodaj seznam</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div><CardTitle>Seznam igralcev</CardTitle><p className="mt-1 text-sm text-muted-foreground">Aktivnih je lahko poljubno število igralcev (najmanj 6). Sistem manjkajoča mesta sam zapolni z jokerji.</p></div>
                <div className="flex flex-wrap justify-end gap-2">
                  <Badge variant="outline">{activeFemaleCount} žensk · {activeMaleCount} moških</Badge>
                  <Badge variant={activeCount >= 6 ? "default" : "outline"}>{activeCount} aktivnih</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {tournament.players.length > 0 ? (
                  <div className="divide-y rounded-lg border">
                    {tournament.players.map((player, index) => (
                      <div key={player.id} className="grid items-center gap-3 p-3 sm:grid-cols-[2rem_1fr_auto_auto_auto_auto]">
                        <span className="text-sm font-bold text-muted-foreground">{index + 1}.</span>
                        <Input value={player.name} disabled={availabilityLocked} onChange={(event) => updatePlayer(player.id, { name: event.target.value })} className="font-semibold" />
                        <label className="flex items-center gap-2 text-sm"><Checkbox checked={player.gender === "female"} disabled={availabilityLocked} onCheckedChange={(checked) => updatePlayer(player.id, { gender: checked === true ? "female" : "male" })} /> Ženska</label>
                        <label className="flex items-center gap-2 text-sm"><Checkbox checked={player.checkedIn} disabled={availabilityLocked} onCheckedChange={(checked) => updatePlayer(player.id, { checkedIn: checked === true })} /> Aktiven</label>
                        <Button variant="ghost" size="icon" disabled={rosterHasHistory || availabilityLocked} onClick={() => removePlayer(player.id)} aria-label={`Odstrani ${player.name}`}><Trash2 size={17} /></Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed py-12 text-center text-muted-foreground">Dodajte imena igralcev, da lahko pripravimo prvi žreb.</div>
                )}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="max-w-2xl text-sm text-muted-foreground">Na začetku lahko pripravite več krogov. Po vsakem zaključenem krogu izberete nadaljevanje ali zaključni del; ko zmanjka načrtovanih krogov, jih lahko dodajate po enega.</p>
                  {!tournament.finals && tournament.rounds.length === 0 && (
                    <div className="flex items-end gap-2">
                      <div>
                        <Label htmlFor="zacetno-stevilo-krogov">Število krogov</Label>
                        <Input
                          id="zacetno-stevilo-krogov"
                          type="number"
                          min={1}
                          max={MAX_INITIAL_ROUNDS}
                          value={initialRoundCount}
                          onChange={(event) => setInitialRoundCount(Math.min(MAX_INITIAL_ROUNDS, Math.max(1, Number(event.target.value) || 1)))}
                          className="mt-1 w-24"
                        />
                      </div>
                      <Button size="lg" disabled={activeCount < 6} onClick={drawInitialRounds}><Shuffle size={18} /> {initialRoundCount === 1 ? "Izžrebaj 1. krog" : `Izžrebaj ${initialRoundCount} krogov`}</Button>
                    </div>
                  )}
                  {!tournament.finals && !currentRound && nextScheduledRound && (
                    <div className="flex flex-wrap gap-2">
                      <Button size="lg" variant="outline" onClick={startNextRound}><Shuffle size={18} /> Začni {nextScheduledRound.number}. krog</Button>
                      <Button size="lg" onClick={createFinalStage}><Trophy size={18} /> Pripravi zaključni del</Button>
                    </div>
                  )}
                  {!tournament.finals && !currentRound && !nextScheduledRound && tournament.rounds.length > 0 && (
                    <Button size="lg" onClick={drawNextRound}><Shuffle size={18} /> Izžrebaj {tournament.rounds.length + 1}. krog</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="krog" className="space-y-6">
            {displayedRound ? (
              <>
                <div className="flex flex-wrap gap-2">
                  {tournament.rounds.map((round) => (
                    <Button
                      key={round.id}
                      size="sm"
                      variant={round.id === displayedRound.id ? "default" : "outline"}
                      onClick={() => setSelectedRoundNumber(round.number)}
                    >
                      {round.number}. krog
                    </Button>
                  ))}
                </div>
                <Card>
                  <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                    <div><p className="text-sm font-bold uppercase tracking-widest text-primary">Razpored kroga</p><h2 className="mt-1 text-2xl font-black">{displayedRound.number}. krog</h2><p className="mt-1 text-sm text-muted-foreground">Žreb: {displayedRound.seed}</p></div>
                    <Badge variant={displayedRound.status === "completed" ? "default" : "outline"}>
                      {displayedRound.status === "completed" ? "Zaključen" : displayedRound.status === "active" ? "V teku" : "Načrtovan"}
                    </Badge>
                  </CardContent>
                </Card>
                <div className="grid gap-4 lg:grid-cols-2">
                  {displayedRound.matches.map((match) => (
                    <MatchEditor key={match.id} match={match} state={tournament} editable={displayedRound.status !== "scheduled"} onScore={updatePreliminaryScore} onLock={(id) => setPreliminaryLock(id, true)} onUnlock={(id) => setPreliminaryLock(id, false)} />
                  ))}
                </div>
                <div className="flex flex-wrap justify-end gap-3">
                  {displayedRound.id === currentRound?.id && <Button size="lg" disabled={currentRound.matches.some((match) => !match.locked)} onClick={completeCurrentRound}><CheckCircle2 size={18} /> Zaključi {currentRound.number}. krog</Button>}
                  {!currentRound && nextScheduledRound && !tournament.finals && <Button size="lg" variant="outline" onClick={startNextRound}><Shuffle size={18} /> Začni {nextScheduledRound.number}. krog</Button>}
                  {!currentRound && !nextScheduledRound && completedRounds > 0 && !tournament.finals && <Button size="lg" variant="outline" onClick={drawNextRound}><Shuffle size={18} /> Izžrebaj {tournament.rounds.length + 1}. krog</Button>}
                  {!currentRound && completedRounds > 0 && !tournament.finals && <Button size="lg" onClick={createFinalStage}><Trophy size={18} /> Pripravi zaključni del</Button>}
                </div>
              </>
            ) : (
              <Card><CardContent className="py-14 text-center"><Shuffle className="mx-auto mb-3 text-primary" size={36} /><h2 className="text-xl font-bold">Krog še ni izžreban</h2><p className="mt-2 text-muted-foreground">Najprej vnesite najmanj 6 aktivnih igralcev.</p></CardContent></Card>
            )}
          </TabsContent>

          <TabsContent value="lestvica">
            <Card className="overflow-hidden">
              <CardHeader className="flex-row items-center justify-between space-y-0"><div><CardTitle>Osebna lestvica</CardTitle><p className="mt-1 text-sm text-muted-foreground">Točke iz vseh potrjenih tekem. Prvih 12 napreduje.</p></div><Trophy className="text-primary" /></CardHeader>
              <CardContent className="p-0">
                {rankings.length > 0 ? (
                  <div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left"><thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-5 py-3">#</th><th className="px-5 py-3">Igralec</th><th className="px-5 py-3 text-center">Tekme</th><th className="px-5 py-3 text-center">Joker</th><th className="px-5 py-3 text-center">Zmage</th><th className="px-5 py-3 text-center">Povprečje</th><th className="px-5 py-3 text-right">Točke</th></tr></thead><tbody className="divide-y">{rankings.map((row) => <tr key={row.playerId} className={row.rank <= 12 ? "bg-primary/[0.05]" : "bg-background"}><td className="px-5 py-4 font-black">{row.rank}</td><td className="px-5 py-4 font-bold">{row.name}{row.rank <= 12 && <Badge className="ml-2">Top 12</Badge>}</td><td className="px-5 py-4 text-center">{row.matches}</td><td className="px-5 py-4 text-center">{row.jokerAppearances}</td><td className="px-5 py-4 text-center">{row.wins}</td><td className="px-5 py-4 text-center">{row.average.toFixed(1)}</td><td className="px-5 py-4 text-right text-xl font-black">{row.points}</td></tr>)}</tbody></table></div>
                ) : <div className="py-14 text-center text-muted-foreground">Lestvica bo pripravljena po prvem potrjenem rezultatu.</div>}
              </CardContent>
            </Card>
            {!currentRound && completedRounds > 0 && !tournament.finals && (
              <Card className="mt-5 border-primary/30 bg-primary/[0.04]">
                <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                  <div><p className="font-black">Kako želite nadaljevati?</p><p className="mt-1 text-sm text-muted-foreground">Začnite naslednji krog ali zaključite predtekmovanje.</p></div>
                  <div className="flex flex-wrap gap-2">
                    {nextScheduledRound ? (
                      <Button variant="outline" onClick={startNextRound}><Shuffle size={18} /> Začni {nextScheduledRound.number}. krog</Button>
                    ) : (
                      <Button variant="outline" onClick={drawNextRound}><Shuffle size={18} /> Izžrebaj {tournament.rounds.length + 1}. krog</Button>
                    )}
                    <Button onClick={createFinalStage}><Trophy size={18} /> Pripravi zaključni del</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="finale" className="space-y-6">
            {tournament.finals ? (
              <>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {tournament.finals.teams.map((team) => <Card key={team.id}><CardHeader><CardTitle className="text-lg">{team.label}</CardTitle></CardHeader><CardContent className="space-y-2">{team.playerIds.map((id) => <p key={id} className="rounded-md bg-muted px-3 py-2 text-sm font-semibold">{getPlayerName(tournament, id)}</p>)}</CardContent></Card>)}
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  {tournament.finals.matches.map((match) => <MatchEditor key={match.id} match={match} state={tournament} onScore={updateFinalScore} onLock={(id) => setFinalLock(id, true)} onUnlock={(id) => setFinalLock(id, false)} />)}
                </div>
                {tournament.phase === "finished" && <Card className="border-primary bg-primary/5"><CardContent className="flex items-center gap-4 p-6"><Trophy className="text-primary" size={40} /><div><h2 className="text-2xl font-black">Turnir je zaključen</h2><p className="text-muted-foreground">Vsi rezultati so shranjeni. Prenesite končno varnostno kopijo.</p></div></CardContent></Card>}
              </>
            ) : (
              <Card><CardContent className="py-14 text-center"><Trophy className="mx-auto mb-3 text-primary" size={40} /><h2 className="text-xl font-bold">Zaključni del še ni pripravljen</h2><p className="mx-auto mt-2 max-w-lg text-muted-foreground">Po zaključenem krogu lahko sistem najboljših 12 razdeli v štiri uravnotežene ekipe. Neodigrani načrtovani krogi bodo odstranjeni.</p>{!currentRound && completedRounds > 0 && <Button className="mt-5" onClick={createFinalStage}><Shuffle size={18} /> Izžrebaj zaključne ekipe</Button>}</CardContent></Card>
            )}
          </TabsContent>

          <TabsContent value="podatki" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><FileJson className="text-primary" /> Varnostne kopije in izvoz</CardTitle></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Button variant="outline" className="h-auto justify-start gap-3 p-5" onClick={exportJson}><Download className="text-primary" /><span className="text-left"><strong className="block">Prenesi varnostno kopijo</strong><small className="text-muted-foreground">Vsi igralci, žrebi in rezultati</small></span></Button>
                <Button variant="outline" className="h-auto justify-start gap-3 p-5" onClick={exportCsv} disabled={rankings.length === 0}><Download className="text-primary" /><span className="text-left"><strong className="block">Izvozi lestvico CSV</strong><small className="text-muted-foreground">Za Excel ali arhiv</small></span></Button>
                <Button variant="outline" className="h-auto justify-start gap-3 p-5" onClick={() => importInput.current?.click()}><Upload className="text-primary" /><span className="text-left"><strong className="block">Obnovi iz kopije</strong><small className="text-muted-foreground">Uvozi datoteko JSON</small></span></Button>
                <input ref={importInput} className="hidden" type="file" accept="application/json,.json" onChange={importJson} />
              </CardContent>
            </Card>
            <Card className="border-destructive/30">
              <CardHeader><CardTitle className="flex items-center gap-2 text-destructive"><Settings2 /> Nov turnir</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-4"><p className="max-w-2xl text-sm text-muted-foreground">Pred izbrisom prenesite varnostno kopijo. Lokalnih podatkov po ponastavitvi ni mogoče obnoviti brez datoteke JSON.</p><Button variant="destructive" onClick={reset}><RotateCcw size={18} /> Ponastavi turnir</Button></CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TurnirAdmin;
