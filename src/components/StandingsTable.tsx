import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

const standingsData = [
  { pos: 1, team: "Smola", played: 10, won: 8, draw: 1, lost: 1, points: 25 },
  { pos: 2, team: "ŠD Podnart", played: 10, won: 7, draw: 2, lost: 1, points: 23 },
  { pos: 3, team: "Vrbnje", played: 10, won: 6, draw: 2, lost: 2, points: 20 },
  { pos: 4, team: "Elmont Bled", played: 10, won: 5, draw: 3, lost: 2, points: 18 },
  { pos: 5, team: "NK Kropa", played: 10, won: 4, draw: 3, lost: 3, points: 15 },
  { pos: 6, team: "Radovljica B", played: 10, won: 3, draw: 3, lost: 4, points: 12 },
  { pos: 7, team: "Gorje United", played: 10, won: 2, draw: 2, lost: 6, points: 8 },
  { pos: 8, team: "Lisjaki Naklo", played: 10, won: 2, draw: 1, lost: 7, points: 7, isHighlighted: true },
  { pos: 9, team: "Škofja Loka B", played: 10, won: 1, draw: 2, lost: 7, points: 5 },
  { pos: 10, team: "Tržič", played: 10, won: 0, draw: 3, lost: 7, points: 3 },
];

const StandingsTable = () => {
  return (
    <section id="standings" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-3 mb-12">
          <Trophy className="w-8 h-8 text-primary" />
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Lestvica
          </h2>
        </div>

        <Card className="max-w-4xl mx-auto shadow-elevated border-0 overflow-hidden">
          <CardHeader className="bg-charcoal text-primary-foreground">
            <CardTitle className="text-lg md:text-xl">
              Divja Liga — Skupina A
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary hover:bg-secondary">
                    <TableHead className="w-12 text-center font-semibold text-foreground">
                      #
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      Klub
                    </TableHead>
                    <TableHead className="w-12 text-center font-semibold text-foreground">
                      T
                    </TableHead>
                    <TableHead className="w-12 text-center font-semibold text-foreground">
                      Z
                    </TableHead>
                    <TableHead className="w-12 text-center font-semibold text-foreground">
                      N
                    </TableHead>
                    <TableHead className="w-12 text-center font-semibold text-foreground">
                      P
                    </TableHead>
                    <TableHead className="w-16 text-center font-semibold text-foreground">
                      Točke
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {standingsData.map((row) => (
                    <TableRow
                      key={row.pos}
                      className={
                        row.isHighlighted
                          ? "bg-accent hover:bg-accent/80 border-l-4 border-l-primary"
                          : "hover:bg-secondary/50"
                      }
                    >
                      <TableCell className="text-center font-bold text-muted-foreground">
                        {row.pos}
                      </TableCell>
                      <TableCell
                        className={`font-semibold ${
                          row.isHighlighted ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {row.team}
                        {row.isHighlighted && (
                          <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                            Mi
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {row.played}
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {row.won}
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {row.draw}
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {row.lost}
                      </TableCell>
                      <TableCell
                        className={`text-center font-bold ${
                          row.isHighlighted ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {row.points}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default StandingsTable;
