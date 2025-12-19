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
import { standingsData } from "@/data/standings";

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
              Liga malega nogometa 2025/26 - Skupina A
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
                    <TableHead className="w-12 text-center font-semibold text-foreground">
                      DZ
                    </TableHead>
                    <TableHead className="w-12 text-center font-semibold text-foreground">
                      PZ
                    </TableHead>
                    <TableHead className="w-12 text-center font-semibold text-foreground">
                      GR
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
                      <TableCell className="text-center text-muted-foreground">
                        {row.goalsFor}
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {row.goalsAgainst}
                      </TableCell>
                      <TableCell className={`text-center ${row.goalDiff > 0 ? "text-green-600" : row.goalDiff < 0 ? "text-red-600" : "text-muted-foreground"}`}>
                        {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
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
