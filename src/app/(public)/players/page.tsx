import Link from "next/link";
import Image from "next/image";
import { getPlayers } from "@/actions/player-actions";
import { Badge } from "@/components/ui/badge";
import { UserCircle } from "lucide-react";
import { getPlayerPositionColor } from "@/lib/utils";

export default async function PlayersPage() {
  const { data: players } = await getPlayers({ pageSize: 100, status: "ACTIVE" });

  const positions = ["GOALKEEPER", "DEFENDER", "MIDFIELDER", "FORWARD"];
  const grouped = positions.map((pos) => ({
    position: pos,
    players: players.filter((p) => p.position === pos),
  }));

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-950 via-emerald-950/20 to-neutral-950 py-20">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 text-center lg:px-8">
          <h1 className="text-4xl font-black text-white md:text-6xl">Our Players</h1>
          <p className="mt-4 text-neutral-400">Meet the squad that represents FC BBFF</p>
        </div>
      </section>

      {/* Players List */}
      <section className="bg-neutral-950 py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          {grouped.map((group) => (
            group.players.length > 0 && (
              <div key={group.position} className="mb-12">
                <h2 className="mb-6 text-xl font-bold text-white">
                  {group.position === "GOALKEEPER" ? "Goalkeepers" :
                   group.position === "DEFENDER" ? "Defenders" :
                   group.position === "MIDFIELDER" ? "Midfielders" : "Forwards"}
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {group.players.map((player) => (
                    <Link
                      key={player.id}
                      href={`/players/${player.slug}`}
                      className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5 flex flex-col"
                    >
                      <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-emerald-950/40 via-neutral-900 to-neutral-950 flex items-center justify-center">
                        {player.photoUrl ? (
                          <Image
                            src={player.photoUrl}
                            alt={`${player.firstName} ${player.lastName}`}
                            fill
                            className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                            unoptimized
                          />
                        ) : (
                          <span className="text-5xl font-black text-emerald-500/20 group-hover:text-emerald-500/30 transition-colors">
                            {player.jerseyNumber || "?"}
                          </span>
                        )}
                        {player.jerseyNumber && (
                          <div className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 font-mono text-xs font-bold text-emerald-400">
                            #{player.jerseyNumber}
                          </div>
                        )}
                      </div>

                      <div className="p-4 text-center flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                            {player.firstName} {player.lastName}
                          </h3>
                          <div className="flex flex-wrap items-center justify-center gap-1 mt-1.5">
                            <Badge variant="secondary" className={`text-xs ${getPlayerPositionColor(player.position)}`}>
                              {player.position}
                            </Badge>
                            {player.secondaryPosition && (
                              <Badge variant="outline" className="border-white/10 text-[10px] text-neutral-400">
                                Sec: {player.secondaryPosition}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-neutral-500">
                          {[player.nationality, player.currentCity].filter(Boolean).join(" • ")}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </section>
    </div>
  );
}
