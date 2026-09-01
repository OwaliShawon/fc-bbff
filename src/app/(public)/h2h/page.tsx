import { getAllOpponentRecords } from "@/actions/h2h-actions";
import { H2HComparisonClient } from "@/components/h2h/h2h-comparison-client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Swords, Trophy, Shield, Flame } from "lucide-react";
import Link from "next/link";

export default async function H2HPage() {
  const allSummaries = await getAllOpponentRecords();

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-950 via-emerald-950/20 to-neutral-950 py-16 sm:py-20 border-b border-white/10">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 text-center lg:px-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Swords className="h-3.5 w-3.5" /> Head-to-Head Track Record
          </span>
          <h1 className="text-4xl font-black text-white md:text-6xl tracking-tight">
            FC BBFF vs Opponents
          </h1>
          <p className="mt-4 text-neutral-400 max-w-2xl mx-auto text-sm sm:text-base">
            Complete historical track record, head-to-head statistics, win rates, and match logs against all outsider teams.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-neutral-950">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 space-y-16">
          {/* Interactive H2H Card & Match Log */}
          <H2HComparisonClient allSummaries={allSummaries} initialSummary={allSummaries[0] || null} />

          {/* Overall Opponents Head-to-Head Table */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 lg:p-8">
            <h2 className="mb-6 text-xl font-bold text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-400" /> Overall Opponent Records Summary ({allSummaries.length} Teams)
            </h2>

            {allSummaries.length === 0 ? (
              <p className="py-6 text-center text-sm text-neutral-400">No opponent team records recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent text-xs">
                      <TableHead className="text-neutral-400">Opponent Team</TableHead>
                      <TableHead className="text-center text-neutral-400">Played</TableHead>
                      <TableHead className="text-center text-emerald-400 font-bold">Wins</TableHead>
                      <TableHead className="text-center text-amber-400 font-bold">Draws</TableHead>
                      <TableHead className="text-center text-red-400 font-bold">Losses</TableHead>
                      <TableHead className="text-center text-neutral-400">GF</TableHead>
                      <TableHead className="text-center text-neutral-400">GA</TableHead>
                      <TableHead className="text-center text-neutral-400">GD</TableHead>
                      <TableHead className="text-center font-bold text-emerald-400">Win Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allSummaries.map((s) => (
                      <TableRow key={s.opponentTeam.id} className="border-white/5 text-sm hover:bg-white/5">
                        <TableCell>
                          <Link href={`/teams/${s.opponentTeam.slug}`} className="flex items-center gap-2.5 group">
                            {s.opponentTeam.logoUrl ? (
                              <img
                                src={s.opponentTeam.logoUrl}
                                alt={s.opponentTeam.name}
                                className="h-7 w-7 rounded-lg object-cover border border-white/10"
                              />
                            ) : (
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                                {s.opponentTeam.name.charAt(0)}
                              </div>
                            )}
                            <span className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                              {s.opponentTeam.name}
                            </span>
                          </Link>
                        </TableCell>
                        <TableCell className="text-center font-mono font-bold">{s.played}</TableCell>
                        <TableCell className="text-center font-mono font-bold text-emerald-400">{s.wins}</TableCell>
                        <TableCell className="text-center font-mono font-bold text-amber-400">{s.draws}</TableCell>
                        <TableCell className="text-center font-mono font-bold text-red-400">{s.losses}</TableCell>
                        <TableCell className="text-center font-mono text-neutral-300">{s.goalsFor}</TableCell>
                        <TableCell className="text-center font-mono text-neutral-300">{s.goalsAgainst}</TableCell>
                        <TableCell className="text-center font-mono font-bold text-amber-400">
                          {s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference}
                        </TableCell>
                        <TableCell className="text-center font-mono font-black text-emerald-400">{s.winRate}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
