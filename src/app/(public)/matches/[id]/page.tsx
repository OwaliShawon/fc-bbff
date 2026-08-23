import { notFound } from "next/navigation";
import { getMatchById } from "@/actions/match-actions";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, getMatchStatusColor } from "@/lib/utils";
import { ArrowLeft, MapPin, User, Clock } from "lucide-react";
import Link from "next/link";

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = await getMatchById(id) as any;
  if (!match) notFound();

  return (
    <div className="min-h-screen bg-neutral-950">
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-950 via-emerald-950/20 to-neutral-950 py-16">
        <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
          <Link href="/matches" className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to Matches
          </Link>
          {match.competition && (
            <p className="mb-4 text-sm font-medium uppercase tracking-wider text-emerald-400">{match.competition.name}</p>
          )}
          <div className="flex flex-col items-center gap-8 md:flex-row md:justify-center">
            <div className="text-center md:flex-1 md:text-right">
              <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-xl font-bold text-white md:ml-auto">
                {match.homeTeam?.name?.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-white">{match.homeTeam?.name}</h2>
            </div>
            <div className="px-8 text-center">
              {match.status === "COMPLETED" ? (
                <div className="rounded-2xl bg-emerald-600/20 px-8 py-4">
                  <p className="text-4xl font-black text-emerald-400">{match.homeScore} - {match.awayScore}</p>
                  <Badge variant="secondary" className={`mt-2 ${getMatchStatusColor(match.status)}`}>{match.status}</Badge>
                </div>
              ) : (
                <div className="rounded-2xl bg-white/10 px-8 py-4">
                  <p className="text-2xl font-bold text-neutral-400">VS</p>
                  <Badge variant="secondary" className={`mt-2 ${getMatchStatusColor(match.status)}`}>{match.status}</Badge>
                </div>
              )}
            </div>
            <div className="text-center md:flex-1 md:text-left">
              <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-xl font-bold text-white md:mr-auto">
                {match.awayTeam?.name?.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-white">{match.awayTeam?.name}</h2>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-neutral-400">
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{formatDateTime(match.matchDate)}</span>
            {match.venue && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{match.venue}</span>}
            {match.referee && <span className="flex items-center gap-1"><User className="h-4 w-4" />Ref: {match.referee}</span>}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Match Events */}
            {match.events && match.events.length > 0 && (
              <div className="lg:col-span-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <h3 className="mb-4 text-lg font-bold text-white">Match Events</h3>
                  <div className="space-y-3">
                    {match.events.map((event: any) => (
                      <div key={event.id} className="flex items-center gap-3 border-b border-white/5 pb-3 last:border-0">
                        <span className="w-12 text-right font-mono text-sm font-bold text-emerald-400">{event.minute}&apos;</span>
                        <Badge variant="secondary" className="text-xs">
                          {event.eventType.replace("_", " ")}
                        </Badge>
                        <span className="text-sm text-white">{event.player?.firstName} {event.player?.lastName}</span>
                        {event.description && <span className="text-xs text-neutral-500">— {event.description}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Match Report */}
            {match.matchReport && (
              <div className={match.events?.length > 0 ? "" : "lg:col-span-2"}>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <h3 className="mb-4 text-lg font-bold text-white">Match Report</h3>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-300">{match.matchReport}</div>
                </div>
              </div>
            )}

            {/* Player of the Match */}
            {match.playerOfMatch && (
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-amber-900/20 to-amber-800/10 p-6">
                <h3 className="mb-4 text-lg font-bold text-amber-400">⭐ Player of the Match</h3>
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20 text-2xl font-bold text-amber-400">
                    {match.playerOfMatch.jerseyNumber || "?"}
                  </div>
                  <p className="font-bold text-white">{match.playerOfMatch.firstName} {match.playerOfMatch.lastName}</p>
                  <p className="text-sm text-neutral-400">{match.playerOfMatch.position}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
