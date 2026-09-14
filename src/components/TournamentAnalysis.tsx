import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { analyzeTournament } from "@/lib/tournament-analysis";
import type { TournamentState } from "@/lib/tournament";
import { Button } from "@/components/ui/button";

const number = (value: number | null) => value === null ? "—" : value.toLocaleString("sl-SI", { maximumFractionDigits: 2 });
const signed = (value: number | null) => value === null ? "Premalo podatkov" : `${value > 0 ? "+" : ""}${number(value)}`;

export default function TournamentAnalysis({ tournament }: { tournament: TournamentState }) {
  const analysis = useMemo(() => analyzeTournament(tournament), [tournament]);
  const [selectedId, setSelectedId] = useState("");
  const [compareId, setCompareId] = useState("");
  const [metric, setMetric] = useState<"points" | "rank">("points");
  const [onlyQualified, setOnlyQualified] = useState(false);
  const selected = analysis.players.find((player) => player.playerId === selectedId) ?? analysis.players[0];
  const compare = analysis.players.find((player) => player.playerId === compareId && player.playerId !== selected?.playerId);
  if (!selected) return null;
  const players = analysis.players.filter((player) => !onlyQualified || player.qualified);
  const options = [...analysis.players].sort((a, b) => a.name.localeCompare(b.name, "sl"));
  const chart = selected.history.map((point, index) => ({ round: point.round, selected: point[metric], compare: compare?.history[index]?.[metric] }));
  return (
    <section id="analiza" className="container mx-auto scroll-mt-24 space-y-8 px-4 py-12 md:py-16">
      <div>
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Zgodba turnirja</p>
        <h2 className="mt-2 text-3xl font-black">Kdo je imel najtežjo pot?</h2>
        <p className="mt-3 max-w-3xl text-muted-foreground">Kdo je dobil močnejše nasprotnike in kdo več pomoči soigralcev? Pogledamo, kako so drugi igrali na tekmah brez njega. Tako njegovi lastni rezultati ne vplivajo neposredno na oceno žreba.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Najtežji žreb · vsi", analysis.players.find((player) => player.difficulty !== null)],
          ["Najtežji žreb · polfinalisti", analysis.players.find((player) => player.qualified && player.difficulty !== null)],
          ["Največ točk · predtekmovanje", [...analysis.players].sort((a, b) => b.points - a.points || a.rank - b.rank)[0]],
        ].map(([label, value], index) => {
          const player = typeof value === "object" ? value : undefined;
          return <div key={String(label)} className="rounded-2xl border bg-muted/30 p-5"><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{String(label)}</p><p className="mt-3 text-xl font-black">{player?.name ?? "Premalo podatkov"}</p><p className="mt-1 text-primary">{player ? index === 2 ? `${number(player.points)} točk` : `${signed(player.difficulty)} točke/tekmo razlike` : "—"}</p></div>;
        })}
      </div>
      <div className="rounded-2xl border p-4 sm:p-6">
        <h3 className="text-xl font-bold">Točke in mesto skozi kroge</h3>
        <p className="mt-2 text-sm text-muted-foreground">Predtekmovanje · potrjeni rezultati ob koncu vsakega kroga. Krog v teku je lahko nepopoln. Zaključni del ne spreminja osebnih točk.</p>
        <div className="my-5 flex flex-wrap items-end gap-4">
          <label className="grid gap-1 text-sm font-semibold">Igralec<select className="max-w-full rounded-md border bg-background p-2" value={selected.playerId} onChange={(event) => setSelectedId(event.target.value)}>{options.map((player) => <option key={player.playerId} value={player.playerId}>{player.name}</option>)}</select></label>
          <label className="grid gap-1 text-sm font-semibold">Primerjaj z<select className="max-w-full rounded-md border bg-background p-2" value={compare?.playerId ?? ""} onChange={(event) => setCompareId(event.target.value)}><option value="">Brez primerjave</option>{options.filter((player) => player.playerId !== selected.playerId).map((player) => <option key={player.playerId} value={player.playerId}>{player.name}</option>)}</select></label>
          <div className="flex gap-2"><Button variant={metric === "points" ? "default" : "outline"} aria-pressed={metric === "points"} onClick={() => setMetric("points")}>Točke</Button><Button variant={metric === "rank" ? "default" : "outline"} aria-pressed={metric === "rank"} onClick={() => setMetric("rank")}>Mesto</Button></div>
        </div>
        <div className="mb-3 flex flex-wrap gap-4 text-sm font-semibold"><span style={{ color: "#c2410c" }}>{selected.name}</span>{compare && <span style={{ color: "#0369a1" }}>{compare.name}</span>}</div>
        <div className="h-72 w-full" role="img" aria-label={`${metric === "points" ? "Točke" : "Mesto"} po krogih za ${selected.name}. Podatki so tudi v tabeli spodaj.`}>
          <ResponsiveContainer width="100%" height="100%"><LineChart data={chart} margin={{ top: 15, right: 20, bottom: 15, left: 0 }} accessibilityLayer>
            <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="round" tickFormatter={(value) => `${value}.`} /><YAxis reversed={metric === "rank"} domain={metric === "rank" ? [1, analysis.players.length] : [0, "auto"]} allowDecimals={false} width={40} />
            <Tooltip labelFormatter={(value) => `${value}. krog`} />
            {metric === "rank" && analysis.players.length >= 12 && <ReferenceLine y={12} stroke="#64748b" strokeDasharray="5 5" />}
            <Line dataKey="selected" name={selected.name} stroke="#c2410c" strokeWidth={3} dot={{ r: 4 }} isAnimationActive={false} />
            {compare && <Line dataKey="compare" name={compare.name} stroke="#0369a1" strokeWidth={3} strokeDasharray="6 3" dot={{ r: 4 }} isAnimationActive={false} />}
          </LineChart></ResponsiveContainer>
        </div>
        {metric === "rank" && <p className="text-xs text-muted-foreground">1. mesto je na vrhu. Črtkana meja označuje 12. mesto; končni žreb določa udeležence polfinala.</p>}
        <details className="mt-4 text-sm"><summary className="cursor-pointer font-semibold">Podatki po krogih</summary><div className="mt-3 overflow-x-auto"><table className="w-full text-left"><thead><tr><th className="p-2">Krog</th><th className="p-2">{selected.name} · točke / mesto</th>{compare && <th className="p-2">{compare.name} · točke / mesto</th>}</tr></thead><tbody>{selected.history.map((point, index) => <tr className="border-t" key={point.round}><td className="p-2">{point.round}.{!point.complete && " (v teku)"}</td><td className="p-2">{point.points} / {point.rank ?? "—"}</td>{compare && <td className="p-2">{compare.history[index]?.points} / {compare.history[index]?.rank ?? "—"}</td>}</tr>)}</tbody></table></div></details>
      </div>
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h3 className="text-xl font-bold">Težavnost predtekmovalnega žreba</h3><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={onlyQualified} onChange={(event) => setOnlyQualified(event.target.checked)} />Samo polfinalisti</label></div>
        <div className="mb-5 max-w-3xl space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>Pri oceni igralčevega žreba upoštevamo, kako so njegovi nasprotniki in soigralci igrali na tekmah brez njega. Za vsakega izračunamo povprečne točke na teh tekmah, nato primerjamo moč nasprotnikov s podporo soigralcev.</p>
          <p><strong className="text-foreground">Plus pomeni težji žreb, minus lažjega.</strong> Če imajo igralčevi nasprotniki povprečno oceno 8,2 točke na tekmo, soigralci pa 7,4, je razlika +0,8. Nasprotniki so torej na tekmah brez tega igralca dosegali več točk kot njegovi soigralci.</p>
          <p>To je ocena žreba. Igralčeve dosežene točke in mesto na lestvici ostanejo enaki. Majhne razlike med igralci niso zanesljiv dokaz, kdo je imel več sreče.</p>
        </div>
        <div className="overflow-x-auto rounded-xl border"><table className="w-full min-w-[760px] text-left text-sm"><caption className="sr-only">Igralci od najtežjega do najlažjega žreba. Razlika je povprečje točk na tekmo nasprotnikov minus povprečje soigralcev, samo iz tekem brez analiziranega igralca.</caption><thead className="bg-muted"><tr>{["Igralec", "Mesto v predt.", "Točke", "Nasprotniki · točke/tekmo", "Soigralci · točke/tekmo", "Razlika v točkah na tekmo"].map((label, index) => <th key={label} className={index === 0 ? "p-3" : "p-3 text-center"}>{label}</th>)}</tr></thead><tbody>{players.map((player) => <tr key={player.playerId} className={`border-t ${player.playerId === selected.playerId ? "bg-primary/5" : ""}`}><td className="p-3"><button className="text-left font-bold underline decoration-primary/40 underline-offset-4" onClick={() => { setSelectedId(player.playerId); document.getElementById("analiza")?.scrollIntoView({ behavior: "smooth" }); }}>{player.name}</button>{player.qualified && <span className="block text-xs text-primary">POLFINALE</span>}</td><td className="p-3 text-center">{player.rank}.</td><td className="p-3 text-center">{player.points}</td><td className="p-3 text-center">{number(player.opponentPoints)}</td><td className="p-3 text-center">{number(player.teammatePoints)}</td><td className="p-3 text-center font-bold">{signed(player.difficulty)}</td></tr>)}</tbody></table></div>
      </div>
      <details className="rounded-xl border bg-muted/30 p-5 text-sm leading-relaxed text-muted-foreground"><summary className="cursor-pointer font-bold text-foreground">Podrobnosti izračuna in omejitve</summary><div className="mt-3 space-y-3">
        <p><strong className="text-foreground">1. Ocenimo druge igralce.</strong> Za igralca, čigar žreb ocenjujemo, izločimo vse potrjene predtekmovalne tekme, v katerih je sodeloval na katerikoli strani, tudi kot joker. Za vsakega njegovega soigralca in nasprotnika seštejemo osebne točke iz preostalih tekem in jih delimo s številom njegovih rednih nastopov na teh tekmah. Tako dobimo povprečne točke na tekmo.</p>
        <p><strong className="text-foreground">2. Primerjamo nasprotnike in soigralce.</strong> Za vsak redni nastop igralca izračunamo povprečje ocen treh nasprotnikov in odštejemo povprečje ocen njegovih dveh soigralcev. Nato izračunamo povprečje teh razlik za vse njegove redne nastope. Ponovni nasprotniki in soigralci štejejo vsakič. Ocena istega soigralca je lahko pri drugem igralcu drugačna, ker izločimo druge tekme.</p>
        <p><strong className="text-foreground">Katere tekme štejejo?</strong> Samo potrjene predtekmovalne tekme; polfinale in tekmi za medalje so izključeni. Jokerjeva dodatna tekma ni del njegove osebne poti ali osebnega povprečja. Za druge udeležence te tekme pa uporabimo njegovo oceno iz preostalih rednih nastopov. Med turnirjem računamo s trenutno potrjenimi rezultati.</p>
        <p><strong className="text-foreground">Koliko podatkov imamo?</strong> Ocene temeljijo na preostalih tekmah brez igralca, čigar žreb ocenjujemo. Če za katerega od njegovih soigralcev ali nasprotnikov ni nobene takšne tekme, pokažemo »Premalo podatkov« in skupne težavnosti ne izračunamo.</p>
        <p><strong className="text-foreground">Kaj nam rezultat pove?</strong> Primerjamo žreb za nazaj, brez neposrednega vpliva igralčevih lastnih tekem na ocene drugih. Tudi na preostalih tekmah so igralci imeli različne soigralce in nasprotnike, zato njihove ocene niso natančna mera sposobnosti. Manj tekem pomeni manj zanesljivo oceno. Razlika je izražena v točkah na tekmo in ne prinaša dodatnih točk na uradni lestvici.</p>
      </div></details>
    </section>
  );
}
