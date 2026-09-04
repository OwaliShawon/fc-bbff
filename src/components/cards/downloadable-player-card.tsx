"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Sparkles, Crown, MapPin } from "lucide-react";
import { exportElementAsJpeg } from "@/lib/export-image";
import { getPlayerPositionColor } from "@/lib/utils";

export function DownloadablePlayerCard({ player, team }: { player: any; team?: any }) {
  const [isExporting, setIsExporting] = useState(false);
  const [imgError, setImgError] = useState(false);
  const cardId = `player-card-${player.id}`;

  const handleDownload = async () => {
    setIsExporting(true);
    await exportElementAsJpeg(
      cardId,
      `${player.firstName.toLowerCase()}-${player.lastName.toLowerCase()}-fc-bbff-card.jpg`
    );
    setIsExporting(false);
  };

  // Seasonal Performance Stats Calculations
  const goalsCount = (player.matchEvents || []).filter(
    (e: any) => e.eventType === "GOAL" || e.eventType === "PENALTY"
  ).length;

  const assistsCount = (player.relatedEvents || []).filter(
    (e: any) => e.eventType === "GOAL" || e.eventType === "PENALTY"
  ).length;

  const appsCount = (player.matchLineups || []).length;
  const potmCount = (player.playerOfMatch || []).length;

  return (
    <div className="space-y-4 w-full flex flex-col items-center justify-center">
      {/* Action Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap w-full max-w-[360px]">
        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="h-4 sm:h-5 w-4 sm:w-5 text-amber-400 shrink-0" /> Official Player Card
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
              <Download className="h-3.5 w-3.5" /> Download Card (JPG)
            </>
          )}
        </Button>
      </div>

      {/* Responsive Printable / Exportable Card */}
      <div
        id={cardId}
        className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-b from-neutral-900 via-neutral-950 to-emerald-950/50 p-4 sm:p-6 shadow-2xl text-white w-full max-w-[360px] mx-auto min-h-[540px]"
      >
        {/* Background Glowing Accents */}
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        {/* Large Watermark Logo in Background */}
        <div className="absolute right-[-30px] bottom-[-30px] h-64 w-64 opacity-[0.06] pointer-events-none select-none">
          <img
            src="/logo.png"
            alt="BBFF Watermark"
            className="h-full w-full object-contain"
            crossOrigin="anonymous"
          />
        </div>

        {/* Card Header with Prominent, Highlighted FC BBFF Official Logo */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-3 sm:pb-4 mb-3 sm:mb-4">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Highlighted BBFF Official Logo */}
            <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-2xl bg-neutral-900/90 p-1.5 border-2 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.45)] ring-2 ring-emerald-500/20">
              <img
                src="/logo.png"
                alt="FC BBFF Logo"
                className="h-full w-full object-contain drop-shadow-[0_2px_8px_rgba(16,185,129,0.6)]"
                crossOrigin="anonymous"
              />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-black tracking-widest text-white uppercase drop-shadow">
                FC BBFF
              </p>
              <p className="text-[9px] sm:text-[10px] font-bold text-neutral-300 tracking-wide">
                OFFICIAL SQUAD CARD
              </p>
            </div>
          </div>
          {player.jerseyNumber && (
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-emerald-500/15 border-2 border-emerald-400/60 font-mono text-lg sm:text-xl font-black text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              #{player.jerseyNumber}
            </div>
          )}
        </div>

        {/* Player Image / Silhouette */}
        <div className="relative z-10 mx-auto mb-3 sm:mb-4 h-48 sm:h-52 w-full overflow-hidden rounded-2xl border-2 border-white/10 bg-neutral-900 flex items-center justify-center shadow-2xl">
          {player.photoUrl && !imgError ? (
            <img
              src={player.photoUrl}
              alt={`${player.firstName} ${player.lastName}`}
              className="h-full w-full object-cover object-top"
              crossOrigin={player.photoUrl.startsWith("http") ? "anonymous" : undefined}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-4">
              <span className="text-5xl sm:text-6xl font-black text-emerald-400/80 mb-1">
                {player.jerseyNumber || "?"}
              </span>
              <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">
                {player.position}
              </span>
            </div>
          )}

          {/* Position & Captaincy Overlay */}
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 z-20">
            <Badge className={`${getPlayerPositionColor(player.position)} text-[10px] px-2 py-0.5 shadow-lg font-bold`}>
              {player.position}
            </Badge>
          </div>
          {team?.isCaptain && (
            <div className="absolute top-2.5 right-2.5 bg-amber-400 text-neutral-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-lg flex items-center gap-1 border border-amber-300 z-20">
              <Crown className="h-3 w-3 fill-neutral-950" /> CAPTAIN
            </div>
          )}
        </div>

        {/* Player Name & City */}
        <div className="relative z-10 text-center mb-3">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {player.firstName} {player.lastName}
          </h2>
          {player.currentCity && (
            <p className="text-xs font-semibold mt-1 flex items-center justify-center gap-1 text-amber-300">
              <MapPin className="h-3 w-3 text-amber-400 shrink-0" />
              {player.currentCity}
            </p>
          )}
        </div>

        {/* Seasonal Performance Bar */}
        <div className="relative z-10 grid grid-cols-4 gap-1 rounded-xl bg-gradient-to-r from-emerald-950/80 via-neutral-900 to-amber-950/80 p-2 border border-emerald-500/30 text-center mb-3 shadow-lg">
          <div>
            <span className="text-[8px] font-black text-emerald-400 uppercase tracking-wider block">Goals</span>
            <span className="text-sm font-black text-white font-mono">{goalsCount}</span>
          </div>
          <div className="border-l border-white/10">
            <span className="text-[8px] font-black text-cyan-400 uppercase tracking-wider block">Assists</span>
            <span className="text-sm font-black text-white font-mono">{assistsCount}</span>
          </div>
          <div className="border-l border-white/10">
            <span className="text-[8px] font-black text-neutral-300 uppercase tracking-wider block">Apps</span>
            <span className="text-sm font-black text-white font-mono">{appsCount}</span>
          </div>
          <div className="border-l border-white/10">
            <span className="text-[8px] font-black text-amber-400 uppercase tracking-wider block">POTM</span>
            <span className="text-sm font-black text-amber-300 font-mono">{potmCount}</span>
          </div>
        </div>

        {/* Player Stats Grid with City */}
        <div className="relative z-10 grid grid-cols-3 gap-1 sm:gap-1.5 rounded-xl bg-white/[0.04] p-2.5 sm:p-3 border border-white/10 text-center text-xs mb-3">
          <div>
            <p className="text-[8px] sm:text-[9px] text-neutral-400 uppercase font-semibold">City</p>
            <p className="font-bold text-amber-300 truncate mt-0.5">{player.currentCity || "—"}</p>
          </div>
          <div className="border-l border-white/10">
            <p className="text-[8px] sm:text-[9px] text-neutral-400 uppercase font-semibold">Foot</p>
            <p className="font-bold text-emerald-400 mt-0.5 uppercase">{player.preferredFoot || "—"}</p>
          </div>
          <div className="border-l border-white/10">
            <p className="text-[8px] sm:text-[9px] text-neutral-400 uppercase font-semibold">Height</p>
            <p className="font-bold text-white mt-0.5">{player.height || "—"}</p>
          </div>
        </div>

        {/* Card Footer with Miniature Crest */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-2.5 sm:pt-3 text-[10px] text-neutral-400">
          <div className="flex items-center gap-1.5">
            <img src="/logo.png" alt="logo" className="h-3.5 w-3.5 object-contain opacity-80" crossOrigin="anonymous" />
            <span>Official Bhai Brother Football Federation Card</span>
          </div>
          <span className="text-emerald-400 font-mono font-bold">#fcbbff</span>
        </div>
      </div>
    </div>
  );
}
