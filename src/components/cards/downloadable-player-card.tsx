"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Loader2, Sparkles, Shield, Star, MapPin, Calendar } from "lucide-react";
import { exportElementAsJpeg } from "@/lib/export-image";
import { getPlayerPositionColor } from "@/lib/utils";

export function DownloadablePlayerCard({ player, team }: { player: any; team?: any }) {
  const [isExporting, setIsExporting] = useState(false);
  const cardId = `player-card-${player.id}`;

  const handleDownload = async () => {
    setIsExporting(true);
    await exportElementAsJpeg(
      cardId,
      `${player.firstName.toLowerCase()}-${player.lastName.toLowerCase()}-fc-bbff-card.jpg`
    );
    setIsExporting(false);
  };

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-400" /> Official Player Card
        </h3>
        <Button
          onClick={handleDownload}
          disabled={isExporting}
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 shadow-lg shadow-emerald-950 font-semibold"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating JPG...
            </>
          ) : (
            <>
              <Download className="h-3.5 w-3.5" /> Download Card (JPG)
            </>
          )}
        </Button>
      </div>

      {/* The Printable / Exportable Card */}
      <div
        id={cardId}
        className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-b from-neutral-900 via-neutral-950 to-emerald-950/50 p-6 shadow-2xl text-white max-w-sm mx-auto"
        style={{ width: "360px", minHeight: "540px" }}
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
        <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            {/* Highlighted BBFF Official Logo */}
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-neutral-900/90 p-1.5 border-2 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.45)] ring-2 ring-emerald-500/20">
              <img
                src="/logo.png"
                alt="FC BBFF Logo"
                className="h-full w-full object-contain drop-shadow-[0_2px_8px_rgba(16,185,129,0.6)]"
                crossOrigin="anonymous"
              />
            </div>
            <div>
              <p className="text-sm font-black tracking-widest bg-gradient-to-r from-emerald-300 via-amber-200 to-emerald-400 bg-clip-text text-transparent uppercase drop-shadow">
                FC BBFF
              </p>
              <p className="text-[10px] font-bold text-neutral-300 tracking-wide">
                OFFICIAL SQUAD CARD
              </p>
            </div>
          </div>
          {player.jerseyNumber && (
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 border-2 border-emerald-400/60 font-mono text-xl font-black text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              #{player.jerseyNumber}
            </div>
          )}
        </div>

        {/* Player Image / Silhouette */}
        <div className="relative z-10 mx-auto mb-4 h-56 w-full overflow-hidden rounded-2xl border-2 border-white/10 bg-neutral-900 flex items-center justify-center shadow-2xl">
          {player.photoUrl ? (
            <img
              src={player.photoUrl}
              alt={`${player.firstName} ${player.lastName}`}
              className="h-full w-full object-cover object-top"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-4">
              <span className="text-6xl font-black text-emerald-400/80 mb-1">
                {player.jerseyNumber || "?"}
              </span>
              <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">
                {player.position}
              </span>
            </div>
          )}

          {/* Position & Captaincy Overlay */}
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
            <Badge className={`${getPlayerPositionColor(player.position)} text-[10px] px-2 py-0.5 shadow-lg font-bold`}>
              {player.position}
            </Badge>
            {player.secondaryPosition && (
              <Badge variant="outline" className="border-white/30 bg-neutral-950/80 text-[10px] px-2 py-0.5 text-neutral-200 font-medium">
                {player.secondaryPosition}
              </Badge>
            )}
          </div>
          {team?.isCaptain && (
            <div className="absolute top-2.5 right-2.5 bg-amber-400 text-neutral-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-lg flex items-center gap-1 border border-amber-300">
              👑 CAPTAIN
            </div>
          )}
        </div>

        {/* Player Name & Team Info */}
        <div className="relative z-10 text-center mb-4">
          <h2 className="text-2xl font-black text-white tracking-tight">
            {player.firstName} {player.lastName}
          </h2>
          <p className="text-xs text-emerald-400 font-semibold mt-0.5 flex items-center justify-center gap-1">
            <Shield className="h-3 w-3 text-emerald-400" />
            {team?.team?.name || "FC BBFF Squad"}
          </p>
        </div>

        {/* Player Stats Grid */}
        <div className="relative z-10 grid grid-cols-3 gap-2 rounded-xl bg-white/[0.04] p-3 border border-white/10 text-center text-xs mb-4">
          <div>
            <p className="text-[10px] text-neutral-400 uppercase font-semibold">Nationality</p>
            <p className="font-bold text-white truncate mt-0.5">{player.nationality || "—"}</p>
          </div>
          <div className="border-x border-white/10">
            <p className="text-[10px] text-neutral-400 uppercase font-semibold">Foot</p>
            <p className="font-bold text-emerald-400 mt-0.5">{player.preferredFoot || "—"}</p>
          </div>
          <div>
            <p className="text-[10px] text-neutral-400 uppercase font-semibold">Height</p>
            <p className="font-bold text-white mt-0.5">{player.height || "—"}</p>
          </div>
        </div>

        {/* Card Footer with Miniature Crest */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-3 text-[10px] text-neutral-400">
          <div className="flex items-center gap-1.5">
            <img src="/logo.png" alt="logo" className="h-3.5 w-3.5 object-contain opacity-80" crossOrigin="anonymous" />
            <span>FC BBFF Official Card</span>
          </div>
          <span className="text-emerald-400 font-mono font-bold">#fcbbff</span>
        </div>
      </div>
    </div>
  );
}
