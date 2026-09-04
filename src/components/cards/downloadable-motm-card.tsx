"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Download, Sparkles, Award } from "lucide-react";
import { exportElementAsJpeg } from "@/lib/export-image";

export function DownloadableMotmCard({ match, player }: { match?: any; player?: any }) {
  const [isExporting, setIsExporting] = useState(false);

  // Fallback to match.playerOfMatch if player isn't explicitly passed
  const targetPlayer = player || match?.playerOfMatch;
  if (!targetPlayer) return null;

  const cardId = `motm-card-${targetPlayer.id}-${match?.id || "award"}`;
  const fullName = `${targetPlayer.firstName || ""} ${targetPlayer.lastName || ""}`.trim();

  // Find goals/assists by this player in this match if match is present
  const playerGoals = (match?.matchEvents || []).filter(
    (e: any) => e.playerId === targetPlayer.id && (e.eventType === "GOAL" || e.eventType === "PENALTY")
  );
  const playerAssists = (match?.matchEvents || []).filter(
    (e: any) => e.playerId === targetPlayer.id && e.eventType === "ASSIST"
  );

  const handleDownload = async () => {
    setIsExporting(true);
    const pSlug = (fullName || "player").toLowerCase().replace(/\s+/g, "-");
    await exportElementAsJpeg(
      cardId,
      `fc-bbff-motm-${pSlug}.jpg`
    );
    setIsExporting(false);
  };

  return (
    <div className="space-y-4 w-full flex flex-col items-center justify-center">
      {/* Action Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap w-full max-w-[480px]">
        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <Trophy className="h-4 sm:h-5 w-4 sm:w-5 text-amber-400 shrink-0" /> MOTM Award Card
        </h3>
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
              <Download className="h-3.5 w-3.5" /> Download MOTM Card (JPG)
            </>
          )}
        </Button>
      </div>

      {/* Exportable Man of the Match Graphic */}
      <div
        id={cardId}
        className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-b from-neutral-900 via-neutral-950 to-emerald-950/60 p-5 sm:p-6 shadow-2xl text-white w-full max-w-[480px] mx-auto min-h-[480px] flex flex-col justify-between"
      >
        {/* Glow Accents */}
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        {/* Large Watermark Logo */}
        <div className="absolute -right-8 -bottom-6 h-72 w-72 opacity-[0.06] pointer-events-none select-none">
          <img src="/logo.png" alt="Watermark" className="h-full w-full object-contain" crossOrigin="anonymous" />
        </div>

        {/* Header with Official FC BBFF Logo */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-3.5 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-full bg-neutral-900 border-2 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.45)] ring-2 ring-emerald-500/20">
              <img
                src="/logo.png"
                alt="FC BBFF Logo"
                className="h-full w-full object-cover"
                crossOrigin="anonymous"
              />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-black tracking-widest text-white uppercase drop-shadow">
                FC BBFF
              </p>
              <p className="text-[9px] sm:text-[10px] font-black text-amber-400 tracking-wider uppercase">
                MAN OF THE MATCH AWARD
              </p>
            </div>
          </div>
          <div className="rounded-xl bg-amber-500/20 border border-amber-400/50 px-2.5 py-1 flex items-center gap-1.5 text-[10px] font-bold text-amber-300">
            <Trophy className="h-3.5 w-3.5 text-amber-400" /> MOTM
          </div>
        </div>

        {/* Player Spotlight Display */}
        <div className="relative z-10 my-2 flex flex-col items-center text-center">
          {/* Avatar with Golden Frame */}
          <div className="relative mb-3">
            <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-gradient-to-tr from-amber-500 via-amber-300 to-amber-600 p-1 shadow-[0_0_25px_rgba(251,191,36,0.4)]">
              {targetPlayer.photoUrl ? (
                <img
                  src={targetPlayer.photoUrl}
                  alt={fullName}
                  className="h-full w-full rounded-full object-cover border-2 border-neutral-900"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-neutral-900 text-3xl font-black text-amber-400 border-2 border-neutral-900">
                  {targetPlayer.jerseyNumber || fullName.charAt(0)}
                </div>
              )}
            </div>
            {targetPlayer.jerseyNumber && (
              <span className="absolute -bottom-1 -right-1 rounded-full bg-amber-500 border-2 border-neutral-900 px-2 py-0.5 text-xs font-mono font-black text-neutral-950 shadow">
                #{targetPlayer.jerseyNumber}
              </span>
            )}
          </div>

          {/* Name & Position */}
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight drop-shadow">
            {fullName}
          </h2>
          <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mt-0.5">
            {targetPlayer.position || "MIDFIELDER"}
          </p>

          {/* Match Context (if present) */}
          {match && (
            <div className="mt-2 rounded-xl bg-white/[0.05] border border-white/10 px-3 py-1 text-[11px] text-neutral-300 font-semibold">
              {match.homeTeam?.name} vs {match.awayTeam?.name}
              {match.status === "COMPLETED" && ` (${match.homeScore} - ${match.awayScore})`}
            </div>
          )}
        </div>

        {/* Performance Highlights */}
        <div className="relative z-10 grid grid-cols-2 gap-2 mb-4">
          <div className="rounded-2xl bg-amber-500/10 border border-amber-400/30 p-3 text-center">
            <p className="text-[10px] text-amber-300 uppercase font-black tracking-wider">Match Goals</p>
            <p className="text-lg font-mono font-black text-amber-400">
              {playerGoals.length}
            </p>
          </div>
          <div className="rounded-2xl bg-amber-500/10 border border-amber-400/30 p-3 text-center">
            <p className="text-[10px] text-amber-300 uppercase font-black tracking-wider">Match Assists</p>
            <p className="text-lg font-mono font-black text-amber-400">
              {playerAssists.length}
            </p>
          </div>
        </div>

        {/* Card Footer with Miniature Crest */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-3 text-[10px] text-neutral-400 mt-auto">
          <div className="flex items-center gap-1.5">
            <img src="/logo.png" alt="logo" className="h-3.5 w-3.5 object-contain opacity-80" crossOrigin="anonymous" />
            <span>Official Bhai Brother Football Federation MOTM Card</span>
          </div>
          <span className="text-emerald-400 font-mono font-bold">#fcbbff</span>
        </div>
      </div>
    </div>
  );
}
