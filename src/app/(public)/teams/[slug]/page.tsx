import { notFound } from "next/navigation";
import Link from "next/link";
import { getTeamBySlug } from "@/actions/team-actions";
import { getHeadToHeadStats } from "@/actions/h2h-actions";
import { DownloadableH2HCard } from "@/components/cards/downloadable-h2h-card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, UsersRound, Swords, MapPin } from "lucide-react";

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const team = (await getTeamBySlug(slug)) as any;

  if (!team) notFound();

  // If this team is not FC BBFF itself, fetch H2H record vs FC BBFF
  const h2hSummary = !team.name.toUpperCase().includes("BBFF")
    ? await getHeadToHeadStats(team.id)
    : null;

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-950 via-emerald-950/20 to-neutral-950 py-16 border-b border-white/10">
        <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
          <Link
            href="/teams"
            className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Teams
          </Link>

          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            {team.logoUrl ? (
              <img
                src={team.logoUrl}
                alt={team.name}
                className="h-24 w-24 rounded-2xl object-cover border-2 border-emerald-500/30"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-emerald-600/20 text-4xl font-black text-emerald-400 border border-emerald-500/30">
                {team.name.charAt(0)}
              </div>
            )}
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

      {/* Main Content */}
      <section className="bg-neutral-950 py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 space-y-12">
          {/* Head-to-Head Record Card vs FC BBFF */}
          {h2hSummary && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-4 sm:p-6 flex flex-col items-center justify-center">
              <h2 className="mb-6 text-xl font-bold text-white flex items-center gap-2">
                <Swords className="h-5 w-5 text-amber-400" /> Head-to-Head vs FC BBFF
              </h2>
              <DownloadableH2HCard summary={h2hSummary} />
            </div>
          )}

          {/* Squad List */}
          <div>
            <h2 className="mb-8 text-2xl font-bold text-white flex items-center gap-2">
              <UsersRound className="h-6 w-6 text-emerald-400" /> Squad Roster ({team.teamPlayers?.length || 0})
            </h2>

            {!team.teamPlayers || team.teamPlayers.length === 0 ? (
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
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 text-xl font-bold text-white group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-all">
                      {player.photoUrl ? (
                        <img
                          src={player.photoUrl}
                          alt={`${player.firstName} ${player.lastName}`}
                          className="h-full w-full rounded-xl object-cover"
                        />
                      ) : (
                        player.jerseyNumber ? `#${player.jerseyNumber}` : player.firstName.charAt(0)
                      )}
                    </div>
                    <p className="font-bold text-white group-hover:text-emerald-400 transition-colors text-sm">
                      {player.firstName} {player.lastName}
                    </p>
                    <p className="text-xs text-neutral-400 font-medium mt-1">{player.position}</p>
                    {player.currentCity && (
                      <p className="text-[11px] text-amber-300 font-semibold mt-1 flex items-center justify-center gap-0.5">
                        <MapPin className="h-3 w-3 text-amber-400 shrink-0" />
                        <span className="truncate">{player.currentCity}</span>
                      </p>
                    )}
                    {(isCaptain || isViceCaptain) && (
                      <Badge className="mt-2 text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {isCaptain ? "C" : "VC"}
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
