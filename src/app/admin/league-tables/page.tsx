import { getCompetitions, getLeagueTable } from "@/actions/competition-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminLeagueTablesPage(props: {
  searchParams: Promise<{ competitionId?: string }>;
}) {
  const searchParams = await props.searchParams;
  const { data: competitions } = await getCompetitions({ pageSize: 50 });
  const activeCompId = searchParams.competitionId || competitions[0]?.id;
  const selectedComp = competitions.find((c) => c.id === activeCompId) || competitions[0];

  const table = selectedComp ? await getLeagueTable(selectedComp.id) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          League Tables & Standings
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Live point standings auto-calculated from match results.
        </p>
      </div>

      {/* Select Competition Tabs */}
      <div className="flex flex-wrap gap-2">
        {competitions.map((comp) => (
          <Link key={comp.id} href={`/admin/league-tables?competitionId=${comp.id}`}>
            <Button
              variant={comp.id === activeCompId ? "default" : "outline"}
              className={comp.id === activeCompId ? "bg-emerald-600 hover:bg-emerald-500 text-white" : ""}
            >
              {comp.name}
            </Button>
          </Link>
        ))}
      </div>

      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-emerald-500" />
            {selectedComp?.name || "Competition"} Standings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Pos</TableHead>
                <TableHead>Club</TableHead>
                <TableHead className="text-center">MP</TableHead>
                <TableHead className="text-center">W</TableHead>
                <TableHead className="text-center">D</TableHead>
                <TableHead className="text-center">L</TableHead>
                <TableHead className="text-center">GF</TableHead>
                <TableHead className="text-center">GA</TableHead>
                <TableHead className="text-center">GD</TableHead>
                <TableHead className="text-center font-bold text-emerald-400">PTS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="py-12 text-center text-neutral-500">
                    No teams or match results in this competition yet.
                  </TableCell>
                </TableRow>
              ) : (
                table.map((row) => (
                  <TableRow key={row.teamId}>
                    <TableCell className="font-bold">{row.position}</TableCell>
                    <TableCell className="font-semibold text-white">{row.teamName}</TableCell>
                    <TableCell className="text-center font-mono">{row.played}</TableCell>
                    <TableCell className="text-center font-mono text-emerald-400">{row.won}</TableCell>
                    <TableCell className="text-center font-mono text-neutral-400">{row.drawn}</TableCell>
                    <TableCell className="text-center font-mono text-red-400">{row.lost}</TableCell>
                    <TableCell className="text-center font-mono text-neutral-400">{row.goalsFor}</TableCell>
                    <TableCell className="text-center font-mono text-neutral-400">{row.goalsAgainst}</TableCell>
                    <TableCell className="text-center font-mono">
                      {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                    </TableCell>
                    <TableCell className="text-center font-mono text-base font-bold text-emerald-400">
                      {row.points}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
