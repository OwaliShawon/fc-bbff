import Link from "next/link";
import { getPlayerStatistics } from "@/actions/settings-actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Trophy, Flame, ShieldAlert, Award, Star } from "lucide-react";
import { getPlayerPositionColor } from "@/lib/utils";

export default async function StatisticsPage() {
  const stats = await getPlayerStatistics();

  // Full squad sorted strictly by goals max to min, then assists, then POTM
  const squadPerformance = [...stats].sort((a, b) => {
    if (b.goals !== a.goals) return b.goals - a.goals;
    if (b.assists !== a.assists) return b.assists - a.assists;
    if (b.playerOfMatchAwards !== a.playerOfMatchAwards) return b.playerOfMatchAwards - a.playerOfMatchAwards;
    return b.matchesPlayed - a.matchesPlayed;
  });

  // Top Scorers
  const topScorers = [...stats].sort((a, b) => b.goals - a.goals);
  // Top Assists
  const topAssists = [...stats].sort((a, b) => b.assists - a.assists);
  // Most Player of the Match awards
  const topAwards = [...stats].sort((a, b) => b.playerOfMatchAwards - a.playerOfMatchAwards);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-950 via-emerald-950/20 to-neutral-950 py-20">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 text-center lg:px-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
            <BarChart3 className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-black text-white md:text-6xl">Club Statistics</h1>
          <p className="mt-4 text-neutral-400">Squad performance leaderboards, top goalscorers, playmakers, and disciplinary records</p>
        </div>
      </section>

      {/* Main Leaderboards */}
      <section className="bg-neutral-950 py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 space-y-16">
          {/* Highlights Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Top Scorer Card */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Top Goalscorer</h3>
                  <p className="text-xs text-neutral-400">Golden Boot Leader</p>
                </div>
              </div>
              {topScorers[0] && (
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div>
                    <Link href={`/players/${topScorers[0].playerSlug}`} className="font-bold text-lg text-white hover:text-emerald-400 transition-colors">
                      {topScorers[0].playerName}
                    </Link>
                    <p className="text-xs text-neutral-400">{topScorers[0].position}</p>
                  </div>
                  <span className="text-3xl font-black text-amber-400">{topScorers[0].goals} <span className="text-xs text-neutral-500">GOALS</span></span>
                </div>
              )}
            </div>

            {/* Top Assist Card */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Top Playmaker</h3>
                  <p className="text-xs text-neutral-400">Most Assists</p>
                </div>
              </div>
              {topAssists[0] && (
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div>
                    <Link href={`/players/${topAssists[0].playerSlug}`} className="font-bold text-lg text-white hover:text-emerald-400 transition-colors">
                      {topAssists[0].playerName}
                    </Link>
                    <p className="text-xs text-neutral-400">{topAssists[0].position}</p>
                  </div>
                  <span className="text-3xl font-black text-blue-400">{topAssists[0].assists} <span className="text-xs text-neutral-500">ASSISTS</span></span>
                </div>
              )}
            </div>

            {/* Awards Card */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Player of the Match</h3>
                  <p className="text-xs text-neutral-400">Most Awards</p>
                </div>
              </div>
              {topAwards[0] && (
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div>
                    <Link href={`/players/${topAwards[0].playerSlug}`} className="font-bold text-lg text-white hover:text-emerald-400 transition-colors">
                      {topAwards[0].playerName}
                    </Link>
                    <p className="text-xs text-neutral-400">{topAwards[0].position}</p>
                  </div>
                  <span className="text-3xl font-black text-emerald-400">{topAwards[0].playerOfMatchAwards} <span className="text-xs text-neutral-500">POTM</span></span>
                </div>
              )}
            </div>
          </div>

          {/* Full Squad Performance (Sorted by Goals Max to Min) */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 lg:p-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Flame className="h-5 w-5 text-amber-400" /> Full Squad Performance
                </h2>
                <p className="text-xs text-neutral-400 mt-1">Ranked by total goals scored (max to min)</p>
              </div>
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 w-fit">
                {squadPerformance.length} Squad Members
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="w-12 text-center text-neutral-400">Rank</TableHead>
                    <TableHead className="w-12 text-center text-neutral-400">#</TableHead>
                    <TableHead className="text-neutral-400">Player</TableHead>
                    <TableHead className="text-neutral-400">Position</TableHead>
                    <TableHead className="text-center text-neutral-400">Apps</TableHead>
                    <TableHead className="text-center font-bold text-amber-400">⚽ Goals</TableHead>
                    <TableHead className="text-center font-bold text-blue-400">🅰️ Assists</TableHead>
                    <TableHead className="text-center text-neutral-400">⭐ POTM</TableHead>
                    <TableHead className="text-center text-neutral-400">🟨 Yellow</TableHead>
                    <TableHead className="text-center text-neutral-400">🟥 Red</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {squadPerformance.map((p, index) => (
                    <TableRow
                      key={p.playerId}
                      className={`border-white/5 transition-colors ${
                        index === 0 && p.goals > 0
                          ? "bg-amber-500/10 hover:bg-amber-500/15"
                          : index < 3 && p.goals > 0
                          ? "bg-white/[0.03] hover:bg-white/[0.07]"
                          : "hover:bg-white/5"
                      }`}
                    >
                      <TableCell className="text-center font-mono font-bold text-xs text-neutral-400">
                        {index === 0 && p.goals > 0 ? (
                          <span className="text-base">🥇</span>
                        ) : index === 1 && p.goals > 0 ? (
                          <span className="text-base">🥈</span>
                        ) : index === 2 && p.goals > 0 ? (
                          <span className="text-base">🥉</span>
                        ) : (
                          index + 1
                        )}
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs text-neutral-500">
                        {p.jerseyNumber ? `#${p.jerseyNumber}` : "—"}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/players/${p.playerSlug}`}
                          className="font-medium text-white hover:text-emerald-400 transition-colors"
                        >
                          {p.playerName}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] ${getPlayerPositionColor(p.position)}`}
                        >
                          {p.position}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs text-neutral-300">
                        {p.matchesPlayed}
                      </TableCell>
                      <TableCell className="text-center font-mono font-black text-amber-400 text-base">
                        {p.goals}
                      </TableCell>
                      <TableCell className="text-center font-mono font-bold text-blue-400">
                        {p.assists}
                      </TableCell>
                      <TableCell className="text-center font-mono text-emerald-400">
                        {p.playerOfMatchAwards}
                      </TableCell>
                      <TableCell className="text-center font-mono text-yellow-500">
                        {p.yellowCards}
                      </TableCell>
                      <TableCell className="text-center font-mono text-red-500">
                        {p.redCards}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
