import Link from "next/link";
import { getCompetitions, getLeagueTable } from "@/actions/competition-actions";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Calendar, ArrowRight, Shield } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function CompetitionsPage() {
  const { data: competitions } = await getCompetitions({ pageSize: 20 });

  // Fetch league tables for each competition
  const competitionsWithTables = await Promise.all(
    competitions.map(async (comp) => {
      const table = await getLeagueTable(comp.id);
      return { ...comp, table };
    })
  );

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-950 via-emerald-950/20 to-neutral-950 py-20">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 text-center lg:px-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
            <Trophy className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-black text-white md:text-6xl">Competitions & Leagues</h1>
          <p className="mt-4 text-neutral-400">Follow our league standings, tournaments, and season rankings</p>
        </div>
      </section>

      {/* Competitions and Standings */}
      <section className="bg-neutral-950 py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 space-y-16">
          {competitionsWithTables.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center text-neutral-400">
              <Trophy className="mx-auto mb-3 h-10 w-10 text-neutral-500" />
              <p className="text-lg font-medium text-white">No active competitions</p>
              <p className="text-sm text-neutral-500">Check back soon for new season tournaments and league tables.</p>
            </div>
          ) : (
            competitionsWithTables.map((comp) => (
              <div key={comp.id} className="rounded-2xl border border-white/10 bg-white/5 p-6 lg:p-8 backdrop-blur-sm">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-white">{comp.name}</h2>
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400">
                        {comp.status}
                      </Badge>
                    </div>
                    {(comp as any).description && (
                      <p className="mt-1 text-sm text-neutral-400">{(comp as any).description}</p>
                    )}
                    {(comp as any).season && (
                      <p className="mt-1 text-xs text-neutral-500 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> Season: {(comp as any).season.name}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/competitions/${comp.slug}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-400 hover:text-emerald-300"
                  >
                    View Details & Fixtures <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* Standings Table */}
                {comp.table.length === 0 ? (
                  <p className="py-6 text-center text-sm text-neutral-500">
                    No matches played yet in this competition.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10 hover:bg-transparent">
                          <TableHead className="w-12 text-neutral-400">Pos</TableHead>
                          <TableHead className="text-neutral-400">Club</TableHead>
                          <TableHead className="text-center text-neutral-400">P</TableHead>
                          <TableHead className="text-center text-neutral-400">W</TableHead>
                          <TableHead className="text-center text-neutral-400">D</TableHead>
                          <TableHead className="text-center text-neutral-400">L</TableHead>
                          <TableHead className="text-center text-neutral-400">GF</TableHead>
                          <TableHead className="text-center text-neutral-400">GA</TableHead>
                          <TableHead className="text-center text-neutral-400">GD</TableHead>
                          <TableHead className="text-center font-bold text-white">PTS</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {comp.table.map((row) => (
                          <TableRow
                            key={row.teamId}
                            className={`border-white/5 transition-colors ${
                              row.teamName.includes("FC BBFF")
                                ? "bg-emerald-950/40 hover:bg-emerald-950/60 font-semibold"
                                : "hover:bg-white/5"
                            }`}
                          >
                            <TableCell className="font-mono text-sm text-neutral-400">
                              {row.position}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-xs font-bold text-white">
                                  {row.teamName.charAt(0)}
                                </div>
                                <span className={row.teamName.includes("FC BBFF") ? "text-emerald-400" : "text-white"}>
                                  {row.teamName}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-mono text-neutral-300">{row.played}</TableCell>
                            <TableCell className="text-center font-mono text-neutral-300">{row.won}</TableCell>
                            <TableCell className="text-center font-mono text-neutral-300">{row.drawn}</TableCell>
                            <TableCell className="text-center font-mono text-neutral-300">{row.lost}</TableCell>
                            <TableCell className="text-center font-mono text-neutral-400">{row.goalsFor}</TableCell>
                            <TableCell className="text-center font-mono text-neutral-400">{row.goalsAgainst}</TableCell>
                            <TableCell className="text-center font-mono text-neutral-300">
                              {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                            </TableCell>
                            <TableCell className="text-center font-mono font-bold text-emerald-400">
                              {row.points}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
