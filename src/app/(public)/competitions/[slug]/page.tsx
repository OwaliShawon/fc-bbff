import { notFound } from "next/navigation";
import Link from "next/link";
import { getCompetitionBySlug, getLeagueTable } from "@/actions/competition-actions";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Calendar, ArrowLeft, Swords, Clock, MapPin } from "lucide-react";
import { formatDateTime, getMatchStatusColor } from "@/lib/utils";

export default async function CompetitionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const competition = await getCompetitionBySlug(slug);

  if (!competition) notFound();

  const leagueTable = await getLeagueTable(competition.id);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-950 via-emerald-950/20 to-neutral-950 py-16">
        <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
          <Link
            href="/competitions"
            className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Competitions
          </Link>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-white md:text-5xl">{competition.name}</h1>
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400">
                  {competition.status}
                </Badge>
              </div>
              {competition.description && (
                <p className="mt-2 text-neutral-400">{competition.description}</p>
              )}
              {competition.season && (
                <p className="mt-2 text-xs text-neutral-500 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Season: {competition.season.name}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="bg-neutral-950 py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 space-y-12">
          {/* League Standings */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 lg:p-8">
            <h2 className="mb-6 text-xl font-bold text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-400" /> League Standings
            </h2>

            {leagueTable.length === 0 ? (
              <p className="py-6 text-center text-sm text-neutral-500">No standings data available yet.</p>
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
                    {leagueTable.map((row) => (
                      <TableRow
                        key={row.teamId}
                        className={`border-white/5 transition-colors ${
                          row.teamName.includes("FC BBFF")
                            ? "bg-emerald-950/40 hover:bg-emerald-950/60 font-semibold"
                            : "hover:bg-white/5"
                        }`}
                      >
                        <TableCell className="font-mono text-sm text-neutral-400">{row.position}</TableCell>
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
                        <TableCell className="text-center font-mono font-bold text-emerald-400">{row.points}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Fixtures & Results */}
          {competition.matches && competition.matches.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 lg:p-8">
              <h2 className="mb-6 text-xl font-bold text-white flex items-center gap-2">
                <Swords className="h-5 w-5 text-emerald-400" /> Matches & Fixtures
              </h2>
              <div className="space-y-3">
                {competition.matches.map((match: any) => (
                  <Link
                    key={match.id}
                    href={`/matches/${match.id}`}
                    className="flex flex-col gap-2 rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-white">{match.homeTeam?.name}</span>
                      {match.status === "COMPLETED" ? (
                        <span className="font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">
                          {match.homeScore} - {match.awayScore}
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-500 font-bold">vs</span>
                      )}
                      <span className="font-semibold text-white">{match.awayTeam?.name}</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDateTime(match.matchDate)}
                      </span>
                      {match.venue && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {match.venue}
                        </span>
                      )}
                      <Badge variant="secondary" className={getMatchStatusColor(match.status)}>
                        {match.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
