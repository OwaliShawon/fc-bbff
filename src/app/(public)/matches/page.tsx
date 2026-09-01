import Link from "next/link";
import { getMatches } from "@/actions/match-actions";
import { getCompetitions } from "@/actions/competition-actions";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { MapPin, Clock, Trophy } from "lucide-react";
import { MatchesFilterBar } from "@/components/matches/matches-filter-bar";

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const filterType = (params.type as string) || "all";

  // Determine query parameters based on filter type
  let competitionIdParam = "";
  if (filterType === "independent") {
    competitionIdParam = "INDEPENDENT";
  } else if (filterType.startsWith("comp_")) {
    competitionIdParam = filterType.replace("comp_", "");
  }

  const [competitionsData, upcomingRaw, completedRaw] = await Promise.all([
    getCompetitions({ pageSize: 100 }),
    getMatches({
      status: "SCHEDULED",
      pageSize: 30,
      competitionId: competitionIdParam || undefined,
    }),
    getMatches({
      status: "COMPLETED",
      pageSize: 30,
      competitionId: competitionIdParam || undefined,
    }),
  ]);

  const competitions = competitionsData.data || [];

  // If filterType === "competition", client requested any match tied to an official competition
  let upcoming = upcomingRaw.data;
  let completed = completedRaw.data;

  if (filterType === "competition") {
    upcoming = upcoming.filter((m: any) => m.competitionId !== null);
    completed = completed.filter((m: any) => m.competitionId !== null);
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-950 via-emerald-950/20 to-neutral-950 py-16 sm:py-20">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 text-center lg:px-8">
          <h1 className="text-4xl font-black text-white md:text-6xl">Matches & Fixtures</h1>
          <p className="mt-4 text-sm sm:text-base text-neutral-400">
            Official league tournaments, friendly exhibition matches, and squad results
          </p>
        </div>
      </section>

      <section className="bg-neutral-950 py-12">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          {/* Frontend Filter Bar */}
          <MatchesFilterBar competitions={competitions} currentFilter={filterType} />

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div className="mb-12">
              <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-white">
                <Clock className="h-6 w-6 text-emerald-400" /> Upcoming Fixtures
              </h2>
              <div className="space-y-4">
                {upcoming.map((match: any) => (
                  <Link
                    key={match.id}
                    href={`/matches/${match.id}`}
                    className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-1 items-center gap-4">
                      <div className="text-right flex-1">
                        <p className="font-bold text-white">{match.homeTeam?.name}</p>
                      </div>
                      <div className="px-6 py-2 rounded-xl bg-white/10 text-center shrink-0">
                        <p className="text-lg font-bold text-neutral-400">VS</p>
                        <p className="text-[10px] text-neutral-400 font-mono">{formatDateTime(match.matchDate)}</p>
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-bold text-white">{match.awayTeam?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 border-t border-white/5 pt-3 sm:border-0 sm:pt-0">
                      {match.competition ? (
                        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs">
                          🏆 {match.competition.name}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-xs">
                          🤝 Independent / Friendly
                        </Badge>
                      )}
                      {match.venue && (
                        <p className="text-xs text-neutral-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {match.venue}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {completed.length > 0 && (
            <div>
              <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-white">
                <Trophy className="h-6 w-6 text-amber-400" /> Match Results
              </h2>
              <div className="space-y-4">
                {completed.map((match: any) => (
                  <Link
                    key={match.id}
                    href={`/matches/${match.id}`}
                    className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-1 items-center gap-4">
                      <div className="text-right flex-1">
                        <p className="font-bold text-white">{match.homeTeam?.name}</p>
                      </div>
                      <div className="px-6 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-center shrink-0">
                        <p className="text-2xl font-black text-emerald-400 font-mono">{match.homeScore} - {match.awayScore}</p>
                        <p className="text-[10px] text-neutral-400 font-mono">{formatDateTime(match.matchDate)}</p>
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-bold text-white">{match.awayTeam?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 border-t border-white/5 pt-3 sm:border-0 sm:pt-0">
                      {match.competition ? (
                        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs">
                          🏆 {match.competition.name}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-xs">
                          🤝 Independent / Friendly
                        </Badge>
                      )}
                      {match.venue && (
                        <p className="text-xs text-neutral-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {match.venue}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {upcoming.length === 0 && completed.length === 0 && (
            <div className="py-16 text-center text-neutral-500 border border-white/5 rounded-2xl bg-white/[0.02]">
              <p className="text-base font-semibold">No matches found for this filter selection.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
