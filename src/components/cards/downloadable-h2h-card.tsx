"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Trophy, Flame, ShieldAlert, Sparkles, Swords } from "lucide-react";
import { exportElementAsJpeg } from "@/lib/export-image";
import type { H2HSummary } from "@/actions/h2h-actions";

export function DownloadableH2HCard({ summary }: { summary: H2HSummary }) {
  const [isExporting, setIsExporting] = useState(false);
  const cardId = `h2h-card-${summary.opponentTeam.id}`;

  const handleDownload = async () => {
    setIsExporting(true);
    await exportElementAsJpeg(
      cardId,
      `${summary.fcBbffTeam?.slug || "fc-bbff"}-vs-${summary.opponentTeam?.slug || "opponent"}-h2h.jpg`
    );
    setIsExporting(false);
  };

  return (
    <div className="space-y-4 w-full flex flex-col items-center justify-center">
      {/* Download Action Button */}
      <div className="flex justify-center w-full max-w-[480px]">
        <Button
          onClick={handleDownload}
          disabled={isExporting}
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 shadow-lg shadow-emerald-950 font-semibold"
        >
          {isExporting ? (
            <>
              <span className="inline-block animate-spin text-sm leading-none">⚽</span> Generating JPG...
            </>
          ) : (
            <>
              <Download className="h-3.5 w-3.5" /> Download H2H Card (JPG)
            </>
          )}
        </Button>
      </div>

      {/* Printable / Exportable Head-to-Head Card */}
      <div
        id={cardId}
        className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-b from-neutral-900 via-neutral-950 to-emerald-950/50 p-4 sm:p-6 shadow-2xl text-white w-full max-w-[480px] mx-auto min-h-[440px]"
      >
        {/* Ambient Glows */}
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        {/* Large Crest Watermark */}
        <div className="absolute -right-8 -bottom-6 h-72 w-72 opacity-[0.06] pointer-events-none select-none">
          <img src={summary.fcBbffTeam?.logoUrl || "/logo.png"} alt="Watermark" className="h-full w-full object-contain" crossOrigin="anonymous" />
        </div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-amber-400" />
            <div>
              <p className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">
                HEAD TO HEAD RECORD
              </p>
              <h3 className="text-sm font-black text-white uppercase tracking-tight">
                {summary.fcBbffTeam?.name || "FC BBFF"} VS {summary.opponentTeam?.name}
              </h3>
            </div>
          </div>
          <span className="rounded-xl bg-emerald-500/15 border border-emerald-400/40 px-2 py-1 text-[10px] font-mono font-bold text-emerald-300">
            {summary.winRate}% Win Rate
          </span>
        </div>

        {/* Matchup Crest Comparison */}
        <div className="relative z-10 grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-2xl bg-white/[0.03] border border-white/10 p-4 mb-4 text-center">
          {/* FC BBFF / Team 1 */}
          <div className="flex flex-col items-center">
            <div className="h-14 w-14 rounded-2xl bg-neutral-900/90 p-1.5 border-2 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] mb-2 flex items-center justify-center">
              <img
                src={summary.fcBbffTeam?.logoUrl || "/logo.png"}
                alt={summary.fcBbffTeam?.name || "FC BBFF"}
                className="h-full w-full object-contain"
                crossOrigin="anonymous"
              />
            </div>
            <p className="text-xs font-black text-white truncate max-w-[100px]">
              {summary.fcBbffTeam?.name || "FC BBFF"}
            </p>
            <p className="text-[10px] text-emerald-400 font-mono font-bold">{summary.wins} Wins</p>
          </div>

          {/* Center VS & Summary */}
          <div className="flex flex-col items-center px-2">
            <span className="text-xl font-black text-amber-400 font-mono">VS</span>
            <div className="mt-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-mono font-bold text-neutral-300">
              {summary.played} Matches
            </div>
          </div>

          {/* Opponent */}
          <div className="flex flex-col items-center">
            {summary.opponentTeam.logoUrl ? (
              <img
                src={summary.opponentTeam.logoUrl}
                alt={summary.opponentTeam.name}
                className="h-14 w-14 rounded-2xl object-cover border-2 border-white/20 mb-2"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="h-14 w-14 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center font-bold text-xl text-amber-400 mb-2">
                {summary.opponentTeam.name.charAt(0)}
              </div>
            )}
            <p className="text-xs font-black text-white truncate max-w-[100px]">{summary.opponentTeam.name}</p>
            <p className="text-[10px] text-red-400 font-mono font-bold">{summary.losses} Wins</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="relative z-10 grid grid-cols-4 gap-2 mb-4">
          <div className="rounded-xl bg-white/[0.04] border border-white/10 p-2 text-center">
            <p className="text-[9px] text-neutral-400 uppercase font-bold">Played</p>
            <p className="text-sm font-mono font-black text-white">{summary.played}</p>
          </div>
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2 text-center">
            <p className="text-[9px] text-emerald-300 uppercase font-bold">Wins</p>
            <p className="text-sm font-mono font-black text-emerald-400">{summary.wins}</p>
          </div>
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-2 text-center">
            <p className="text-[9px] text-amber-300 uppercase font-bold">Draws</p>
            <p className="text-sm font-mono font-black text-amber-400">{summary.draws}</p>
          </div>
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-2 text-center">
            <p className="text-[9px] text-red-300 uppercase font-bold">Losses</p>
            <p className="text-sm font-mono font-black text-red-400">{summary.losses}</p>
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="relative z-10 grid grid-cols-2 gap-2 text-xs mb-4">
          <div className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/5 p-2.5">
            <span className="text-[10px] text-neutral-400 font-semibold">Goals Scored</span>
            <span className="font-mono font-black text-emerald-400">{summary.goalsFor}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/5 p-2.5">
            <span className="text-[10px] text-neutral-400 font-semibold">Goals Conceded</span>
            <span className="font-mono font-black text-red-400">{summary.goalsAgainst}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/5 p-2.5">
            <span className="text-[10px] text-neutral-400 font-semibold">Goal Diff</span>
            <span className="font-mono font-black text-amber-400">
              {summary.goalDifference > 0 ? `+${summary.goalDifference}` : summary.goalDifference}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/5 p-2.5">
            <span className="text-[10px] text-neutral-400 font-semibold">Clean Sheets</span>
            <span className="font-mono font-black text-cyan-400">{summary.cleanSheets}</span>
          </div>
        </div>

        {/* Footer Branding */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-2.5 text-[10px] text-neutral-400">
          <div className="flex items-center gap-1.5">
            <img src="/logo.png" alt="logo" className="h-3.5 w-3.5 object-contain opacity-80" crossOrigin="anonymous" />
            <span>Official Bhai Brother Football Federation Head-to-Head Record</span>
          </div>
          <span className="text-emerald-400 font-mono font-bold">#fcbbff</span>
        </div>
      </div>
    </div>
  );
}
