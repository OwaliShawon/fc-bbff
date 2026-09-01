"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DownloadableH2HCard } from "@/components/cards/downloadable-h2h-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { Swords, Trophy, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import type { H2HSummary } from "@/actions/h2h-actions";

export function H2HComparisonClient({
  allSummaries,
  initialSummary,
}: {
  allSummaries: H2HSummary[];
  initialSummary: H2HSummary | null;
}) {
  const router = useRouter();
  const [selectedOpponentId, setSelectedOpponentId] = useState<string>(
    initialSummary?.opponentTeam?.id || allSummaries[0]?.opponentTeam?.id || ""
  );

  const activeSummary =
    allSummaries.find((s) => s.opponentTeam.id === selectedOpponentId) || initialSummary;

  return (
    <div className="space-y-12">
      {/* Selector Control */}
      <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6 text-center shadow-xl">
        <label className="mb-2 block text-xs font-black uppercase tracking-wider text-emerald-400">
          Select Opponent Team to Compare
        </label>
        <Select
          value={selectedOpponentId}
          onValueChange={(val) => {
            setSelectedOpponentId(val);
          }}
        >
          <SelectTrigger className="w-full bg-neutral-900 border-neutral-700 text-white font-bold">
            <SelectValue placeholder="Select opponent..." />
          </SelectTrigger>
          <SelectContent className="bg-neutral-900 border-neutral-700 text-white">
            {allSummaries.map((s) => (
              <SelectItem key={s.opponentTeam.id} value={s.opponentTeam.id}>
                {s.opponentTeam.name} ({s.played} Matches)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active H2H Graphic Card & Breakdown */}
      {activeSummary ? (
        <div className="space-y-12">
          {/* Centered Graphic Card */}
          <div className="flex justify-center">
            <DownloadableH2HCard summary={activeSummary} />
          </div>

          {/* Match Log vs This Opponent */}
          <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-white/5 p-6 lg:p-8">
            <h3 className="mb-6 text-xl font-bold text-white flex items-center gap-2">
              <Swords className="h-5 w-5 text-amber-400" /> Match History vs {activeSummary.opponentTeam.name}
            </h3>

            {activeSummary.recentMatches.length === 0 ? (
              <p className="py-6 text-center text-sm text-neutral-400">No completed matches played against this team yet.</p>
            ) : (
              <div className="space-y-3">
                {activeSummary.recentMatches.map((m) => {
                  const isHome = m.homeTeamId === activeSummary.fcBbffTeam.id;
                  const bbffScore = isHome ? m.homeScore : m.awayScore;
                  const oppScore = isHome ? m.awayScore : m.homeScore;
                  const isWin = bbffScore > oppScore;
                  const isDraw = bbffScore === oppScore;

                  return (
                    <Link
                      key={m.id}
                      href={`/matches/${m.id}`}
                      className="flex flex-col gap-3 rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="secondary"
                          className={
                            isWin
                              ? "bg-emerald-500/20 text-emerald-400 font-black border border-emerald-500/30"
                              : isDraw
                              ? "bg-amber-500/20 text-amber-400 font-black border border-amber-500/30"
                              : "bg-red-500/20 text-red-400 font-black border border-red-500/30"
                          }
                        >
                          {isWin ? "WIN" : isDraw ? "DRAW" : "LOSS"}
                        </Badge>
                        <span className="font-bold text-white">{m.homeTeam?.name}</span>
                        <span className="font-mono font-black text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                          {m.homeScore} - {m.awayScore}
                        </span>
                        <span className="font-bold text-white">{m.awayTeam?.name}</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-neutral-400">
                        {m.competition ? (
                          <span className="text-emerald-400 font-semibold">🏆 {m.competition.name}</span>
                        ) : (
                          <span className="text-amber-400 font-semibold">🤝 Independent</span>
                        )}
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="h-3 w-3" /> {formatDateTime(m.matchDate)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="py-12 text-center text-neutral-400">No opponent data available yet.</div>
      )}
    </div>
  );
}
