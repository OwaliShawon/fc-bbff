import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPlayerBySlug } from "@/actions/player-actions";
import { Badge } from "@/components/ui/badge";
import { getPlayerPositionColor, formatDate } from "@/lib/utils";
import { Calendar, MapPin, Ruler, Weight, Footprints, Star, ArrowLeft, Building2, Shield } from "lucide-react";
import { DownloadablePlayerCard } from "@/components/cards/downloadable-player-card";

export default async function PlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const player = await getPlayerBySlug(slug);
  if (!player) notFound();

  const currentTeam = player.teamPlayers?.[0];

  const details = [
    { icon: Shield, label: "Current Team", value: currentTeam?.team?.name },
    { icon: Calendar, label: "Date of Birth", value: player.dateOfBirth ? formatDate(player.dateOfBirth) : null },
    { icon: MapPin, label: "Nationality", value: player.nationality },
    { icon: Building2, label: "Current City", value: player.currentCity },
    { icon: Shield, label: "Secondary Position", value: player.secondaryPosition },
    { icon: Ruler, label: "Height", value: player.height },
    { icon: Weight, label: "Weight", value: player.weight },
    { icon: Footprints, label: "Preferred Foot", value: player.preferredFoot },
    { icon: Calendar, label: "Date Joined", value: player.dateJoined ? formatDate(player.dateJoined) : null },
  ].filter((d) => d.value);

  return (
    <div className="min-h-screen bg-neutral-950">
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-950 via-emerald-950/20 to-neutral-950 py-20">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
          <Link href="/players" className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to Players
          </Link>
          <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
            <div className="relative h-44 w-44 shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 shadow-2xl shadow-emerald-500/20 flex items-center justify-center">
              {player.photoUrl ? (
                <Image
                  src={player.photoUrl}
                  alt={`${player.firstName} ${player.lastName}`}
                  fill
                  className="object-cover object-top"
                  sizes="176px"
                  priority
                  unoptimized
                />
              ) : (
                <span className="text-6xl font-black text-emerald-400">
                  {player.jerseyNumber || "?"}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-3">
                {player.jerseyNumber && (
                  <span className="font-mono text-2xl font-bold text-emerald-400">
                    #{player.jerseyNumber}
                  </span>
                )}
                <h1 className="text-4xl font-black text-white md:text-5xl">
                  {player.firstName} {player.lastName}
                </h1>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {currentTeam?.team && (
                  <Link href={`/teams/${currentTeam.team.slug}`}>
                    <Badge className="bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 text-sm hover:bg-emerald-600/30 transition-colors">
                      🛡️ {currentTeam.team.name}
                    </Badge>
                  </Link>
                )}
                {currentTeam?.isCaptain && (
                  <Badge className="bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm">
                    👑 Captain
                  </Badge>
                )}
                {currentTeam?.isViceCaptain && (
                  <Badge className="bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-sm">
                    🛡️ Vice-Captain
                  </Badge>
                )}
                <Badge className={`${getPlayerPositionColor(player.position)} text-sm`}>
                  {player.position}
                </Badge>
                {player.secondaryPosition && (
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-300 text-sm">
                    Sec: {player.secondaryPosition}
                  </Badge>
                )}
                <Badge className={player.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}>
                  {player.status}
                </Badge>
                {player.isFeatured && (
                  <Badge className="bg-amber-500/10 text-amber-400">
                    <Star className="mr-1 h-3 w-3" /> Featured
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              {player.bio && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
                  <h2 className="mb-4 text-xl font-bold text-white">About</h2>
                  <p className="leading-relaxed text-neutral-300">{player.bio}</p>
                </div>
              )}

              {player.matchLineups && player.matchLineups.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
                  <h2 className="mb-4 text-xl font-bold text-white">Recent Match Appearances</h2>
                  <div className="space-y-3">
                    {player.matchLineups.map((lineup) => (
                      <Link
                        key={lineup.id}
                        href={`/matches/${lineup.matchId}`}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] transition-colors border border-white/5"
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {lineup.match?.homeTeam?.name} vs {lineup.match?.awayTeam?.name}
                          </p>
                          <p className="text-xs text-neutral-400">
                            {lineup.match?.competition?.name || "Match"} • {lineup.type === "STARTING" ? "Starter" : "Substitute"}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono text-emerald-400">
                            {lineup.match?.status === "COMPLETED" ? `${lineup.match.homeScore} - ${lineup.match.awayScore}` : lineup.match?.status}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-6">
              {/* Official Downloadable Player Card */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <DownloadablePlayerCard player={player} team={currentTeam} />
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="mb-4 text-lg font-bold text-white">Player Details</h3>
                <div className="space-y-3">
                  {details.map((d) => (
                    <div key={d.label} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0">
                      <span className="flex items-center gap-2 text-sm text-neutral-400">
                        <d.icon className="h-4 w-4 text-emerald-500" /> {d.label}
                      </span>
                      <span className="text-sm font-medium text-white">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
