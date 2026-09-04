"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, MapPin, Clock, Trophy, Flame, Swords, Shield } from "lucide-react";
import { exportElementAsJpeg } from "@/lib/export-image";
import { formatDateTime } from "@/lib/utils";

export function DownloadableMatchdayCard({ match }: { match: any }) {
  const [isExporting, setIsExporting] = useState(false);
  const cardId = `matchday-card-${match.id}`;

  const isIntraClub = !match.homeTeam?.isExternal && !match.awayTeam?.isExternal;

  const handleDownload = async () => {
    setIsExporting(true);
    const home = (match.homeTeam?.name || "home").toLowerCase().replace(/\s+/g, "-");
    const away = (match.awayTeam?.name || "away").toLowerCase().replace(/\s+/g, "-");
    await exportElementAsJpeg(
      cardId,
      `fc-bbff-matchday-${home}-vs-${away}.jpg`
    );
    setIsExporting(false);
  };

  return (
    <div className="space-y-4 w-full flex flex-col items-center justify-center">
      {/* Action Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap w-full max-w-[480px]">
        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="h-4 sm:h-5 w-4 sm:w-5 text-emerald-400 shrink-0" /> Matchday Poster Exporter
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
              <Download className="h-3.5 w-3.5" /> Download Matchday Poster (JPG)
            </>
          )}
        </Button>
      </div>

      {/* Exportable Matchday Graphic Poster */}
      <div
        id={cardId}
        className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-b from-neutral-900 via-neutral-950 to-emerald-950/60 p-5 sm:p-6 shadow-2xl text-white w-full max-w-[480px] mx-auto min-h-[480px] flex flex-col justify-between"
      >
        {/* Glow Effects */}
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        {/* Large Watermark Crest */}
        <div className="absolute -right-8 -bottom-6 h-72 w-72 opacity-[0.06] pointer-events-none select-none">
          <img
            src="/logo.png"
            alt="BBFF Crest"
            className="h-full w-full object-contain"
            crossOrigin="anonymous"
          />
        </div>

        {/* Card Header with Prominent FC BBFF Logo Badge */}
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
              <p className="text-[9px] sm:text-[10px] font-black text-emerald-300 tracking-wider uppercase flex items-center gap-1">
                <Flame className="h-3 w-3 text-amber-400 animate-pulse" />
                OFFICIAL MATCHDAY ANNOUNCEMENT
              </p>
            </div>
          </div>
          <div className="text-right">
            {isIntraClub ? (
              <Badge variant="secondary" className="bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[9px] font-bold uppercase tracking-wider">
                ⚔️ INTRA-CLUB DERBY
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border border-blue-400/40 text-[9px] font-bold uppercase tracking-wider">
                🌐 INTER-CLUB
              </Badge>
            )}
          </div>
        </div>

        {/* Competition Name Banner */}
        <div className="relative z-10 text-center mb-2">
          <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight drop-shadow-md">
            {match.competition?.name || "CLUB FRIENDLY FIXTURE"}
          </h2>
        </div>

        {/* Matchup Showdown Cards */}
        <div className="relative z-10 my-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-2xl bg-white/[0.04] border border-white/10 p-4 text-center shadow-lg">
          {/* Home Team */}
          <div className="flex flex-col items-center">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center font-black text-xl sm:text-2xl text-emerald-300 mb-2 shadow-[0_0_15px_rgba(16,185,129,0.35)]">
              {match.homeTeam?.name?.charAt(0) || "H"}
            </div>
            <p className="text-xs font-black text-white line-clamp-2 uppercase tracking-wide">
              {match.homeTeam?.name}
            </p>
            <span className="text-[9px] text-emerald-400 font-bold mt-1">HOME TEAM</span>
          </div>

          {/* VS Center Graphic */}
          <div className="flex flex-col items-center px-2">
            <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono tracking-wider drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
              VS
            </span>
            <div className="mt-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[9px] font-mono font-bold text-neutral-200 uppercase">
              {match.status === "COMPLETED" ? `${match.homeScore} - ${match.awayScore}` : "KICKOFF"}
            </div>
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-blue-500/20 border-2 border-blue-400 flex items-center justify-center font-black text-xl sm:text-2xl text-blue-300 mb-2 shadow-[0_0_15px_rgba(59,130,246,0.35)]">
              {match.awayTeam?.name?.charAt(0) || "A"}
            </div>
            <p className="text-xs font-black text-white line-clamp-2 uppercase tracking-wide">
              {match.awayTeam?.name}
            </p>
            <span className="text-[9px] text-blue-400 font-bold mt-1">AWAY TEAM</span>
          </div>
        </div>

        {/* Kickoff & Venue Info Box */}
        <div className="relative z-10 rounded-2xl bg-white/[0.03] border border-white/10 p-3.5 text-center space-y-1.5 mb-4">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-300">
            <Clock className="h-4 w-4 text-emerald-400" />
            <span>{formatDateTime(match.matchDate)}</span>
          </div>
          {match.venue && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-300 font-medium">
              <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span>{match.venue}</span>
            </div>
          )}
        </div>

        {/* Poster Footer */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-3 text-[10px] text-neutral-400 mt-auto">
          <div className="flex items-center gap-1.5">
            <img src="/logo.png" alt="logo" className="h-3.5 w-3.5 object-contain opacity-80" crossOrigin="anonymous" />
            <span>Official Bhai Brother Football Federation Matchday Poster</span>
          </div>
          <span className="text-emerald-400 font-mono font-bold">#fcbbff</span>
        </div>
      </div>
    </div>
  );
}
