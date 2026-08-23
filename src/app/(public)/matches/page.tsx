import Link from "next/link";
import { getMatches } from "@/actions/match-actions";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, getMatchStatusColor } from "@/lib/utils";
import { MapPin, Clock, Trophy } from "lucide-react";

export default async function MatchesPage() {
  const upcoming = await getMatches({ status: "SCHEDULED", pageSize: 20 });
  const completed = await getMatches({ status: "COMPLETED", pageSize: 20 });

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-950 via-emerald-950/20 to-neutral-950 py-20">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 text-center lg:px-8">
          <h1 className="text-4xl font-black text-white md:text-6xl">Matches</h1>
          <p className="mt-4 text-neutral-400">Fixtures, results, and match details</p>
        </div>
      </section>

      <section className="bg-neutral-950 py-16">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          {/* Upcoming */}
          {upcoming.data.length > 0 && (
            <div className="mb-12">
              <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-white">
                <Clock className="h-6 w-6 text-emerald-400" /> Upcoming Fixtures
              </h2>
              <div className="space-y-4">
                {upcoming.data.map((match: any) => (
                  <Link key={match.id} href={`/matches/${match.id}`}
                    className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5">
                    <div className="flex flex-1 items-center gap-4">
                      <div className="text-right flex-1">
                        <p className="font-bold text-white">{match.homeTeam?.name}</p>
                      </div>
                      <div className="px-6 py-2 rounded-xl bg-white/10 text-center">
                        <p className="text-lg font-bold text-neutral-400">VS</p>
                        <p className="text-xs text-neutral-500">{formatDateTime(match.matchDate)}</p>
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-bold text-white">{match.awayTeam?.name}</p>
                      </div>
                    </div>
                    <div className="ml-4 hidden sm:block">
                      {match.venue && <p className="text-xs text-neutral-500 flex items-center gap-1"><MapPin className="h-3 w-3" />{match.venue}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {completed.data.length > 0 && (
            <div>
              <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-white">
                <Trophy className="h-6 w-6 text-amber-400" /> Results
              </h2>
              <div className="space-y-4">
                {completed.data.map((match: any) => (
                  <Link key={match.id} href={`/matches/${match.id}`}
                    className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5">
                    <div className="flex flex-1 items-center gap-4">
                      <div className="text-right flex-1">
                        <p className="font-bold text-white">{match.homeTeam?.name}</p>
                      </div>
                      <div className="px-6 py-2 rounded-xl bg-emerald-600/20 text-center">
                        <p className="text-2xl font-black text-emerald-400">{match.homeScore} - {match.awayScore}</p>
                        <p className="text-xs text-neutral-500">{formatDateTime(match.matchDate)}</p>
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-bold text-white">{match.awayTeam?.name}</p>
                      </div>
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
