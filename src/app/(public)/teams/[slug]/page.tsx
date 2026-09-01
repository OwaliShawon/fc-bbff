import { notFound } from "next/navigation";
import Link from "next/link";
import { getTeamBySlug } from "@/actions/team-actions";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, UsersRound, Star } from "lucide-react";
import { getPlayerPositionColor } from "@/lib/utils";

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const team = (await getTeamBySlug(slug)) as any;

  if (!team) notFound();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-950 via-emerald-950/20 to-neutral-950 py-16">
        <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
          <Link
            href="/teams"
            className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Teams
          </Link>

          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-emerald-600/20 text-4xl font-black text-emerald-400">
              {team.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-white md:text-5xl">{team.name}</h1>
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400">
                  {team.status}
                </Badge>
              </div>
              {team.description && <p className="mt-2 text-neutral-400">{team.description}</p>}
              {team.manager && (
                <p className="mt-2 text-sm text-emerald-400">
                  Manager: <strong className="text-white">{team.manager}</strong>
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Squad List */}
      <section className="bg-neutral-950 py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold text-white flex items-center gap-2">
            <UsersRound className="h-6 w-6 text-emerald-400" /> Squad Roster ({team.teamPlayers.length})
          </h2>

          {team.teamPlayers.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center text-neutral-400">
              <p className="text-base text-neutral-400">No players currently assigned to this squad.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {team.teamPlayers.map(({ player, isCaptain, isViceCaptain }: any) => (
                <Link
                  key={player.id}
                  href={`/players/${player.slug}`}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 text-center transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5"
                >
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 text-2xl font-bold text-emerald-400">
                    {player.jerseyNumber || "?"}
                  </div>
                  <h3 className="font-bold text-white group-hover:text-emerald-400">
                    {player.firstName} {player.lastName}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center justify-center gap-1">
                    <Badge variant="secondary" className={`text-[10px] ${getPlayerPositionColor(player.position)}`}>
                      {player.position}
                    </Badge>
                    {isCaptain && (
                      <Badge className="bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px]">👑 Captain</Badge>
                    )}
                    {isViceCaptain && (
                      <Badge className="bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[10px]">🛡️ Vice-Captain</Badge>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Recent Matches */}
          {((team as any).homeMatches?.length > 0 || (team as any).awayMatches?.length > 0) && (
            <div className="mt-16">
              <h2 className="mb-6 text-2xl font-bold text-white">Recent Team Matches</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...((team as any).homeMatches || []), ...((team as any).awayMatches || [])]
                  .sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime())
                  .slice(0, 6)
                  .map((match: any) => (
                    <Link
                      key={match.id}
                      href={`/matches/${match.id}`}
                      className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-emerald-500/30 hover:bg-white/[0.08] transition-all"
                    >
                      <div>
                        <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-1">
                          {match.competition?.name || "Match"}
                        </p>
                        <p className="font-semibold text-white text-sm">
                          {match.homeTeam?.name || team.name} vs {match.awayTeam?.name || team.name}
                        </p>
                        <p className="text-xs text-neutral-400 mt-1">
                          {new Date(match.matchDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <div className="text-right">
                        {match.status === "COMPLETED" ? (
                          <span className="font-mono text-lg font-black text-emerald-400">
                            {match.homeScore} - {match.awayScore}
                          </span>
                        ) : (
                          <Badge variant="outline" className="text-xs">{match.status}</Badge>
                        )}
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
