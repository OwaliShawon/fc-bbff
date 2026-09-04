"use client";

import { useState, useTransition } from "react";
import { DownloadableH2HCard } from "@/components/cards/downloadable-h2h-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { Swords, Trophy, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { getHeadToHeadStats, type H2HSummary } from "@/actions/h2h-actions";

export function H2HComparisonClient({
  allSummaries,
  initialSummary,
  internalTeams = [],
  outsiderTeams = [],
}: {
  allSummaries: H2HSummary[];
  initialSummary: H2HSummary | null;
  internalTeams?: any[];
  outsiderTeams?: any[];
}) {
  const [isPending, startTransition] = useTransition();

  const primaryFcBbff = internalTeams.find((t) => t.name.toUpperCase().includes("BBFF")) || internalTeams[0] || initialSummary?.fcBbffTeam;

  const [team1Id, setTeam1Id] = useState<string>(
    initialSummary?.fcBbffTeam?.id || primaryFcBbff?.id || ""
  );
  const [team2Id, setTeam2Id] = useState<string>(
    initialSummary?.opponentTeam?.id || allSummaries[0]?.opponentTeam?.id || ""
  );

  const [activeSummary, setActiveSummary] = useState<H2HSummary | null>(initialSummary);

  function handleTeamChange(t1: string, t2: string) {
    setTeam1Id(t1);
    setTeam2Id(t2);
    if (t1 === t2) return;

    startTransition(async () => {
      const summary = await getHeadToHeadStats(t1, t2);
      setActiveSummary(summary);
    });
  }

  return (
    <div className="space-y-12">
      {/* Team 1 vs Team 2 Selectors */}
      <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6 text-center shadow-xl">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Swords className="h-5 w-5 text-amber-400" />
          <h3 className="text-sm font-black uppercase tracking-wider text-emerald-400">
            Head-to-Head Comparison Matrix
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-3">
          {/* Team 1 Selector (Internal FC BBFF Teams) */}
          <div className="space-y-1 text-left">
            <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              Team 1 (Internal Squad)
            </label>
            <Select
              value={team1Id}
              onValueChange={(val) => handleTeamChange(val, team2Id)}
            >
              <SelectTrigger className="w-full bg-neutral-900 border-neutral-700 text-white font-bold text-xs">
                <SelectValue placeholder="Select Team 1..." />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-700 text-white">
                {internalTeams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name} (Internal)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="py-1 text-amber-400 font-black text-lg">VS</div>

          {/* Team 2 Selector (Internal or Outsider Teams) */}
          <div className="space-y-1 text-left">
            <label className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
              Team 2 (Internal or Outsider)
            </label>
            <Select
              value={team2Id}
              onValueChange={(val) => handleTeamChange(team1Id, val)}
            >
              <SelectTrigger className="w-full bg-neutral-900 border-neutral-700 text-white font-bold text-xs">
                <SelectValue placeholder="Select Team 2..." />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-700 text-white">
                {internalTeams.length > 0 && (
                  <div className="px-2 py-1 text-[10px] font-bold text-emerald-400 uppercase">
                    — Internal BBFF Squads —
                  </div>
                )}
                {internalTeams.filter((t) => t.id !== team1Id).map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    🟢 {t.name}
                  </SelectItem>
                ))}
                {outsiderTeams.length > 0 && (
                  <div className="px-2 py-1 text-[10px] font-bold text-amber-400 uppercase mt-1">
                    — External / Outsider Opponents —
                  </div>
                )}
                {outsiderTeams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    ⚽ {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {team1Id === team2Id && (
          <p className="mt-3 text-xs text-amber-400 font-semibold">
            Please select two different teams to view Head-to-Head comparison.
          </p>
        )}
      </div>

      {/* Active H2H Graphic Card & Breakdown */}
      {isPending ? (
        <div className="py-16 text-center text-neutral-400 flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          <p className="text-sm font-semibold">Calculating Head-to-Head Statistics...</p>
        </div>
      ) : activeSummary ? (
        <div className="space-y-12">
          {/* Centered Graphic Card */}
          <div className="flex justify-center">
            <DownloadableH2HCard summary={activeSummary} />
          </div>

          {/* Match Log vs This Opponent */}
          <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-white/5 p-6 lg:p-8">
            <h3 className="mb-6 text-xl font-bold text-white flex items-center gap-2">
              <Swords className="h-5 w-5 text-amber-400" /> Match History: {activeSummary.fcBbffTeam?.name} vs {activeSummary.opponentTeam?.name}
            </h3>

            {activeSummary.recentMatches.length === 0 ? (
              <p className="py-6 text-center text-sm text-neutral-400">
                No completed matches played between {activeSummary.fcBbffTeam?.name} and {activeSummary.opponentTeam?.name} yet.
              </p>
            ) : (
              <div className="space-y-3">
                {activeSummary.recentMatches.map((m) => {
                  const isHome = m.homeTeamId === activeSummary.fcBbffTeam.id;
                  const t1Score = isHome ? m.homeScore : m.awayScore;
                  const t2Score = isHome ? m.awayScore : m.homeScore;
                  const isWin = t1Score > t2Score;
                  const isDraw = t1Score === t2Score;

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
                          {isWin ? `${activeSummary.fcBbffTeam?.name} WIN` : isDraw ? "DRAW" : `${activeSummary.opponentTeam?.name} WIN`}
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
        <div className="py-12 text-center text-neutral-400">No head-to-head data available.</div>
      )}
    </div>
  );
}
