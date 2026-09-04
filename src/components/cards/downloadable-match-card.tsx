"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Loader2, Sparkles, MapPin, Clock, Trophy, Flame } from "lucide-react";
import { exportElementAsJpeg } from "@/lib/export-image";
import { formatDateTime, getMatchStatusColor } from "@/lib/utils";

export function DownloadableMatchCard({ match }: { match: any }) {
  const [isExporting, setIsExporting] = useState(false);
  const cardId = `match-card-${match.id}`;

  const handleDownload = async () => {
    setIsExporting(true);
    const home = (match.homeTeam?.name || "home").toLowerCase().replace(/\s+/g, "-");
    const away = (match.awayTeam?.name || "away").toLowerCase().replace(/\s+/g, "-");
    await exportElementAsJpeg(
      cardId,
      `fc-bbff-match-${home}-vs-${away}.jpg`
    );
    setIsExporting(false);
  };

  const goals = (match.matchEvents || []).filter(
    (e: any) => e.eventType === "GOAL" || e.eventType === "PENALTY"
  );

  return (
    <div className="space-y-4 w-full flex flex-col items-center justify-center">
      {/* Action Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap w-full max-w-[460px]">
        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="h-4 sm:h-5 w-4 sm:w-5 text-emerald-400 shrink-0" /> Official Match Card
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
              <Download className="h-3.5 w-3.5" /> Download Match Card (JPG)
            </>
          )}
        </Button>
      </div>

      {/* Responsive Printable / Exportable Match Card */}
      <div
        id={cardId}
        className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-b from-neutral-900 via-neutral-950 to-emerald-950/50 p-4 sm:p-6 shadow-2xl text-white w-full max-w-[460px] mx-auto min-h-[440px]"
      >
        {/* Glow Accents */}
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        {/* Large Watermark Logo in Background */}
        <div className="absolute right-[-25px] bottom-[-25px] h-64 w-64 opacity-[0.08] pointer-events-none select-none">
          <img
            src="/logo.png"
            alt="BBFF Background Watermark"
            className="h-full w-full object-contain"
            crossOrigin="anonymous"
          />
        </div>

        {/* Card Header with Prominent FC BBFF Branding */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-3 sm:pb-4 mb-4 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* Highlighted BBFF Official Logo */}
            <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-2xl bg-neutral-900/90 p-1.5 border-2 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.45)] ring-2 ring-emerald-500/20">
              <img
                src="/logo.png"
                alt="FC BBFF Logo"
                className="h-full w-full object-contain drop-shadow-[0_2px_8px_rgba(16,185,129,0.6)]"
                crossOrigin="anonymous"
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-black tracking-widest text-white uppercase drop-shadow truncate">
                FC BBFF
              </p>
              <p className="text-[9px] sm:text-[10px] font-bold text-neutral-300 tracking-wide truncate">
                {match.competition?.name || "OFFICIAL FIXTURE CARD"}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className={`${getMatchStatusColor(match.status)} text-[10px] font-bold px-2.5 py-1 shadow shrink-0`}>
            {match.status}
          </Badge>
        </div>

        {/* Teams and Score Display with Central Watermark Logo */}
        <div className="relative z-10 overflow-hidden rounded-2xl bg-white/[0.04] border-2 border-white/10 p-3.5 sm:p-5 mb-4 shadow-inner">
          {/* Centered Crest Watermark inside Scoreboard */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.07] pointer-events-none select-none">
            <img
              src="/logo.png"
              alt="BBFF Crest"
              className="h-36 w-36 object-contain"
              crossOrigin="anonymous"
            />
          </div>

          <div className="relative z-10 grid grid-cols-[1fr_auto_1fr] items-center text-center gap-2">
            {/* Home Team */}
            <div className="flex flex-col items-center min-w-0">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-emerald-500/15 border-2 border-emerald-400/50 text-lg sm:text-xl font-black text-emerald-300 mb-1.5 shadow-[0_0_12px_rgba(16,185,129,0.25)] shrink-0">
                {match.homeTeam?.name?.charAt(0) || "H"}
              </div>
              <p className="font-bold text-xs sm:text-sm text-white line-clamp-2 leading-snug break-words px-1">{match.homeTeam?.name}</p>
              <span className="text-[9px] sm:text-[10px] text-neutral-400 font-medium mt-0.5">Home</span>
            </div>

            {/* Score / VS */}
            <div className="flex flex-col items-center px-1 shrink-0">
              {match.status === "COMPLETED" ? (
                <div className="rounded-xl bg-emerald-600/25 px-3 sm:px-4 py-1.5 sm:py-2 border border-emerald-400/50 shadow-lg">
                  <p className="text-xl sm:text-2xl font-black text-emerald-300 font-mono tracking-wider whitespace-nowrap">
                    {match.homeScore} - {match.awayScore}
                  </p>
                  <span className="text-[8px] sm:text-[9px] text-neutral-300 uppercase font-black tracking-wider block mt-0.5">Full Time</span>
                </div>
              ) : (
                <div className="rounded-xl bg-white/10 px-3 sm:px-4 py-1.5 sm:py-2 border border-white/10">
                  <p className="text-base sm:text-lg font-black text-neutral-300">VS</p>
                  <span className="text-[8px] sm:text-[9px] text-emerald-400 font-bold uppercase block mt-0.5">Fixture</span>
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center min-w-0">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-blue-500/15 border-2 border-blue-400/50 text-lg sm:text-xl font-black text-blue-300 mb-1.5 shadow-[0_0_12px_rgba(59,130,246,0.25)] shrink-0">
                {match.awayTeam?.name?.charAt(0) || "A"}
              </div>
              <p className="font-bold text-xs sm:text-sm text-white line-clamp-2 leading-snug break-words px-1">{match.awayTeam?.name}</p>
              <span className="text-[9px] sm:text-[10px] text-neutral-400 font-medium mt-0.5">Away</span>
            </div>
          </div>
        </div>

        {/* Goalscorers & Highlights (if completed and goals exist) */}
        {goals.length > 0 && (
          <div className="relative z-10 mb-3 sm:mb-4 rounded-xl bg-white/[0.02] border border-white/10 p-2.5 sm:p-3">
            <p className="text-[9px] sm:text-[10px] font-bold text-neutral-300 uppercase mb-1.5 sm:mb-2 flex items-center gap-1">
              <span>⚽</span> Goalscorers
            </p>
            <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
              {goals.map((g: any) => (
                <div key={g.id} className="flex items-center justify-between text-xs py-0.5 border-b border-white/5 last:border-0">
                  <span className="font-semibold text-white truncate">
                    {g.player?.firstName} {g.player?.lastName}
                  </span>
                  <span className="font-mono text-emerald-400 font-bold text-[11px]">{g.minute}&apos;</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Player of the Match Banner */}
        {match.playerOfMatch && (
          <div className="relative z-10 mb-3 sm:mb-4 flex items-center justify-between rounded-xl bg-amber-500/15 border border-amber-400/40 p-2 sm:p-2.5 text-xs shadow-md">
            <span className="font-bold text-amber-300 flex items-center gap-1.5 text-[11px] sm:text-xs shrink-0">
              <Trophy className="h-3.5 w-3.5 text-amber-400 shrink-0" /> Player of the Match
            </span>
            <span className="font-bold text-white text-[11px] sm:text-xs truncate ml-2">
              {match.playerOfMatch.firstName} {match.playerOfMatch.lastName}
            </span>
          </div>
        )}

        {/* Match Details info */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 text-[10px] text-neutral-400 mb-3 sm:mb-4 font-medium">
          <div className="flex items-center gap-1 truncate">
            <Clock className="h-3 w-3 text-emerald-400 shrink-0" />
            <span className="truncate">{formatDateTime(match.matchDate)}</span>
          </div>
          {match.venue && (
            <div className="flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3 text-emerald-400 shrink-0" />
              <span className="truncate">{match.venue}</span>
            </div>
          )}
        </div>

        {/* Card Footer with Miniature Crest */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-2.5 sm:pt-3 text-[10px] text-neutral-400">
          <div className="flex items-center gap-1.5">
            <img src="/logo.png" alt="logo" className="h-3.5 w-3.5 object-contain opacity-80" crossOrigin="anonymous" />
            <span>Official Bhai Brother Football Federation Match Card</span>
          </div>
          <span className="text-emerald-400 font-mono font-bold">#fcbbff</span>
        </div>
      </div>
    </div>
  );
}
