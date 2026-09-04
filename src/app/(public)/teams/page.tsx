import Link from "next/link";
import { getTeams } from "@/actions/team-actions";
import { Badge } from "@/components/ui/badge";
import { UsersRound, User, ArrowRight } from "lucide-react";

export default async function TeamsPage() {
  const { data: teams } = await getTeams({ pageSize: 50, status: "ACTIVE", isExternal: false });

  // Always put the main team "FC BBFF" at the top row / first card
  const sortedTeams = [...teams].sort((a: any, b: any) => {
    const aIsFcBbff = a.name.trim().toUpperCase() === "FC BBFF";
    const bIsFcBbff = b.name.trim().toUpperCase() === "FC BBFF";
    if (aIsFcBbff && !bIsFcBbff) return -1;
    if (!aIsFcBbff && bIsFcBbff) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-950 via-emerald-950/20 to-neutral-950 py-20">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 text-center lg:px-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
            <UsersRound className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-black text-white md:text-6xl">Our Teams</h1>
          <p className="mt-4 text-neutral-400">First XI, Reserves, and Youth Squads representing FC BBFF</p>
        </div>
      </section>

      {/* Teams Grid */}
      <section className="bg-neutral-950 py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {sortedTeams.map((team: any) => {
              const isMainFcBbff = team.name.trim().toUpperCase() === "FC BBFF";
              return (
                <Link
                  key={team.id}
                  href={`/teams/${team.slug}`}
                  className={`group flex flex-col justify-between rounded-2xl border p-8 backdrop-blur-sm transition-all ${
                    isMainFcBbff
                      ? "border-emerald-500/50 bg-gradient-to-br from-emerald-950/30 via-neutral-900 to-neutral-950 shadow-xl shadow-emerald-950/40 hover:border-emerald-400"
                      : "border-white/10 bg-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5"
                  }`}
                >
                  <div>
                    <div className="mb-6 flex items-start justify-between">
                      {team.logoUrl ? (
                        <img
                          src={team.logoUrl}
                          alt={team.name}
                          className="h-16 w-16 rounded-full object-cover border-2 border-emerald-500/40"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600/20 text-2xl font-black text-emerald-400 border border-emerald-500/30">
                          {team.name.charAt(0)}
                        </div>
                      )}
                      {isMainFcBbff ? (
                        <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                          🛡️ Main Club Team
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400">
                          {team.status}
                        </Badge>
                      )}
                    </div>

                    <h2 className="mb-2 text-2xl font-bold text-white transition-colors group-hover:text-emerald-400">
                      {team.name}
                    </h2>

                    {team.description && (
                      <p className="mb-6 text-sm leading-relaxed text-neutral-400">
                        {team.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 border-t border-white/5 pt-6 text-sm text-neutral-400">
                    {team.manager && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-emerald-500" />
                        <span>Manager: <strong className="text-white">{team.manager}</strong></span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <UsersRound className="h-4 w-4 text-emerald-500" />
                        <span>{team._count?.teamPlayers || 0} Registered Squad Members</span>
                      </span>
                      <ArrowRight className="h-4 w-4 text-emerald-400 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
