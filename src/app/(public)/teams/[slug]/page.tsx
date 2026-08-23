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
  const team = await getTeamBySlug(slug);

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
            <UsersRound className="h-6 w-6 text-emerald-400" /> Squad Roster
          </h2>

          {team.teamPlayers.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center text-neutral-400">
              <p className="text-base text-neutral-400">No players currently assigned to this squad.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {team.teamPlayers.map(({ player, isCaptain, isViceCaptain }) => (
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
                      <Badge className="bg-amber-500/20 text-amber-300 text-[10px]">Captain (C)</Badge>
                    )}
                    {isViceCaptain && (
                      <Badge className="bg-blue-500/20 text-blue-300 text-[10px]">Vice Captain (VC)</Badge>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
