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

  const events = match.matchEvents || [];
  const goals = events.filter((e: any) => e.eventType === "GOAL" || e.eventType === "PENALTY" || e.eventType === "OWN_GOAL");
  const assists = events.filter((e: any) => e.eventType === "ASSIST");
  const cards = events.filter((e: any) => e.eventType === "YELLOW_CARD" || e.eventType === "RED_CARD");

  // Also extract assist providers from goal events with relatedPlayer
  const goalAssists = events
    .filter((e: any) => (e.eventType === "GOAL" || e.eventType === "PENALTY") && e.relatedPlayer)
    .map((e: any) => ({ ...e, player: e.relatedPlayer, eventType: "ASSIST" as const }));

  const allAssists = [...assists, ...goalAssists];

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

            {/* Left Column — Events breakdown */}
            <div className="space-y-6 lg:col-span-2">
              {/* Goalscorers */}
              {goals.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
                    <span className="text-xl">⚽</span> Goalscorers
                  </h3>
                  <div className="space-y-3">
                    {goals.map((event: any) => (
                      <div key={event.id} className="flex items-center gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                        <span className="w-12 text-right font-mono text-sm font-bold text-emerald-400">{event.minute}&apos;</span>
                        <div className="flex-1">
                          <span className="font-medium text-white">{event.player?.firstName} {event.player?.lastName}</span>
                          {event.eventType === "PENALTY" && (
                            <Badge variant="secondary" className="ml-2 bg-emerald-500/10 text-xs text-emerald-400">Pen</Badge>
                          )}
                          {event.eventType === "OWN_GOAL" && (
                            <Badge variant="secondary" className="ml-2 bg-orange-500/10 text-xs text-orange-400">OG</Badge>
                          )}
                          {event.relatedPlayer && (
                            <span className="ml-2 text-sm text-neutral-500">
                              (assist: {event.relatedPlayer.firstName} {event.relatedPlayer.lastName})
                            </span>
                          )}
                        </div>
                        {event.description && (
                          <span className="text-xs text-neutral-500">{event.description}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assists */}
              {allAssists.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
                    <span className="text-xl">🅰️</span> Assists
                  </h3>
                  <div className="space-y-3">
                    {allAssists.map((event: any, idx: number) => (
                      <div key={event.id + "-assist-" + idx} className="flex items-center gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                        <span className="w-12 text-right font-mono text-sm font-bold text-blue-400">{event.minute}&apos;</span>
                        <span className="font-medium text-white">{event.player?.firstName} {event.player?.lastName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cards */}
              {cards.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
                    <span className="text-xl">📋</span> Disciplinary
                  </h3>
                  <div className="space-y-3">
                    {cards.map((event: any) => (
                      <div key={event.id} className="flex items-center gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                        <span className="w-12 text-right font-mono text-sm font-bold text-neutral-400">{event.minute}&apos;</span>
                        <span className="text-lg">
                          {event.eventType === "YELLOW_CARD" ? "🟨" : "🟥"}
                        </span>
                        <span className="font-medium text-white">{event.player?.firstName} {event.player?.lastName}</span>
                        {event.description && (
                          <span className="text-xs text-neutral-500">— {event.description}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Events Timeline */}
              {events.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <h3 className="mb-4 text-lg font-bold text-white">Full Match Timeline</h3>
                  <div className="space-y-3">
                    {events.map((event: any) => {
                      const icons: Record<string, string> = {
                        GOAL: "⚽", ASSIST: "🅰️", YELLOW_CARD: "🟨", RED_CARD: "🟥",
                        OWN_GOAL: "⚽", PENALTY: "⚽", PENALTY_MISSED: "❌", SUBSTITUTION: "🔄",
                      };
                      return (
                        <div key={event.id} className="flex items-center gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                          <span className="w-12 text-right font-mono text-sm font-bold text-emerald-400">{event.minute}&apos;</span>
                          <span className="text-base">{icons[event.eventType] || "📌"}</span>
                          <Badge variant="secondary" className="text-xs">
                            {event.eventType.replace(/_/g, " ")}
                          </Badge>
                          <span className="text-sm text-white">{event.player?.firstName} {event.player?.lastName}</span>
                          {event.relatedPlayer && (
                            <span className="text-xs text-neutral-500">
                              → {event.relatedPlayer.firstName} {event.relatedPlayer.lastName}
                            </span>
                          )}
                          {event.description && <span className="text-xs text-neutral-500">— {event.description}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Match Report */}
              {match.matchReport && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <h3 className="mb-4 text-lg font-bold text-white">Match Report</h3>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-300">{match.matchReport}</div>
                </div>
              )}
            </div>

            {/* Right Column — Player of the Match + info */}
            <div className="space-y-6">
              {/* Player of the Match */}
              {match.playerOfMatch && (
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-amber-900/20 to-amber-800/10 p-6">
                  <h3 className="mb-4 text-lg font-bold text-amber-400">⭐ Player of the Match</h3>
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20 text-2xl font-bold text-amber-400">
                      {match.playerOfMatch.jerseyNumber || "?"}
                    </div>
                    <Link href={`/players/${match.playerOfMatch.slug}`} className="text-lg font-bold text-white hover:text-amber-400 transition-colors">
                      {match.playerOfMatch.firstName} {match.playerOfMatch.lastName}
                    </Link>
                    <p className="text-sm text-neutral-400">{match.playerOfMatch.position}</p>
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              {events.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <h3 className="mb-4 text-lg font-bold text-white">Match Stats</h3>
                  <div className="space-y-3">
                    {goals.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-400">⚽ Goals</span>
                        <span className="font-bold text-white">{goals.length}</span>
                      </div>
                    )}
                    {allAssists.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-400">🅰️ Assists</span>
                        <span className="font-bold text-white">{allAssists.length}</span>
                      </div>
                    )}
                    {cards.filter((c: any) => c.eventType === "YELLOW_CARD").length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-400">🟨 Yellow Cards</span>
                        <span className="font-bold text-white">{cards.filter((c: any) => c.eventType === "YELLOW_CARD").length}</span>
                      </div>
                    )}
                    {cards.filter((c: any) => c.eventType === "RED_CARD").length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-400">🟥 Red Cards</span>
                        <span className="font-bold text-white">{cards.filter((c: any) => c.eventType === "RED_CARD").length}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t border-white/10 pt-2">
                      <span className="text-sm text-neutral-400">Total Events</span>
                      <span className="font-bold text-white">{events.length}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
