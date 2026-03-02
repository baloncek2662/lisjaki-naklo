import { useState } from "react";
import { BarChart2, ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { playedMatches } from "@/data/matches";
import { playerMap } from "@/data/team";

interface PlayerStat {
  initials: string;
  name: string;
  number?: number;
  appearances: number;
  goals: number;
}

function calculateStats(): PlayerStat[] {
  const stats = new Map<string, PlayerStat>();

  for (const match of playedMatches) {
    if (!match.details) continue;

    const lisjakiDetails =
      match.home === "Lisjaki Naklo" ? match.details.home : match.details.away;

    const allPlayers = [
      ...lisjakiDetails.lineup,
      ...(lisjakiDetails.substitutions ?? []),
    ];

    for (const initials of allPlayers) {
      const player = playerMap.get(initials);
      if (!player) continue;
      if (!stats.has(initials)) {
        stats.set(initials, { initials, name: player.name, number: player.number, appearances: 0, goals: 0 });
      }
      stats.get(initials)!.appearances++;
    }

    for (const goal of lisjakiDetails.goalscorers) {
      const player = playerMap.get(goal.player);
      if (!player) continue;
      if (!stats.has(goal.player)) {
        stats.set(goal.player, { initials: goal.player, name: player.name, number: player.number, appearances: 0, goals: 0 });
      }
      stats.get(goal.player)!.goals++;
    }
  }

  return Array.from(stats.values());
}

type SortKey = "appearances" | "goals" | "number" | "name";
type SortDir = "desc" | "asc";

const SortIcon = ({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) => {
  if (col !== sortKey) return <ChevronsUpDown size={13} className="text-muted-foreground/40" />;
  return sortDir === "desc" ? <ChevronDown size={13} className="text-primary" /> : <ChevronUp size={13} className="text-primary" />;
};

const Statistika = () => {
  const [sortKey, setSortKey] = useState<SortKey>("appearances");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const allStats = calculateStats();

  const sorted = [...allStats].sort((a, b) => {
    if (sortKey === "name") {
      const cmp = a.name.localeCompare(b.name, "sl");
      return sortDir === "asc" ? cmp : -cmp;
    }
    const diff = sortDir === "desc" ? b[sortKey]! - a[sortKey]! : a[sortKey]! - b[sortKey]!;
    if (diff !== 0) return diff;
    // tiebreakers
    if (sortKey !== "appearances") return b.appearances - a.appearances;
    if (sortKey !== "goals") return b.goals - a.goals;
    return (a.number ?? 99) - (b.number ?? 99);
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  };

  const thClass = (key: SortKey) =>
    `px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer select-none whitespace-nowrap hover:text-primary transition-colors ${
      sortKey === key ? "text-primary" : "text-muted-foreground"
    }`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-16 md:pt-20">
        <section className="bg-secondary py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-2">
              <BarChart2 className="text-primary" size={32} />
              <h1 className="text-3xl md:text-4xl font-bold text-secondary-foreground">
                Statistika
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Sezona 2025/2026 · {playedMatches.filter(m => m.details).length} tekma z evidenco
            </p>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <Card className="border-border shadow-elevated overflow-hidden">
              <div className="bg-charcoal px-6 py-3">
                <span className="text-sm font-semibold text-primary-foreground uppercase tracking-wide">
                  Igralci
                </span>
              </div>
              <CardContent className="p-0">
                {sorted.length === 0 ? (
                  <p className="text-muted-foreground text-center py-12">Ni podatkov</p>
                ) : (
                  <table className="w-full">
                    <thead className="border-b border-border bg-muted/30">
                      <tr>
                        <th
                          className={thClass("number")}
                          onClick={() => handleSort("number")}
                        >
                          <span className="flex items-center gap-1">
                            # <SortIcon col="number" sortKey={sortKey} sortDir={sortDir} />
                          </span>
                        </th>
                        <th
                          className={thClass("name")}
                          onClick={() => handleSort("name")}
                        >
                          <span className="flex items-center gap-1">
                            Ime <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} />
                          </span>
                        </th>
                        <th
                          className={thClass("appearances")}
                          onClick={() => handleSort("appearances")}
                        >
                          <span className="flex items-center gap-1">
                            Nastopi <SortIcon col="appearances" sortKey={sortKey} sortDir={sortDir} />
                          </span>
                        </th>
                        <th
                          className={thClass("goals")}
                          onClick={() => handleSort("goals")}
                        >
                          <span className="flex items-center gap-1">
                            Goli <SortIcon col="goals" sortKey={sortKey} sortDir={sortDir} />
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {sorted.map((p, i) => (
                        <tr
                          key={p.initials}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-3">
                            {p.number != null ? (
                              <span className="inline-flex items-center justify-center w-8 h-6 rounded bg-primary/10 text-primary text-xs font-bold">
                                {p.number}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-sm text-foreground">{p.name}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-sm font-semibold ${sortKey === "appearances" ? "text-primary" : "text-foreground"}`}>
                              {p.appearances}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-sm font-semibold ${sortKey === "goals" ? "text-primary" : p.goals > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                              {p.goals > 0 ? p.goals : "—"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Statistika;
