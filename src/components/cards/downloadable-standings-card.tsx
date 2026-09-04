"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Loader2, Sparkles, Trophy, Calendar } from "lucide-react";
import { exportElementAsJpeg } from "@/lib/export-image";

export function DownloadableStandingsCard({
  competition,
  leagueTable,
}: {
  competition: any;
  leagueTable: any[];
}) {
  const [isExporting, setIsExporting] = useState(false);
  const cardId = `standings-card-${competition.id}`;

  const handleDownload = async () => {
    setIsExporting(true);
    const slug = (competition.name || "competition").toLowerCase().replace(/\s+/g, "-");
    await exportElementAsJpeg(
      cardId,
      `fc-bbff-standings-${slug}.jpg`
    );
    setIsExporting(false);
  };

  return (
    <div className="space-y-4 w-full flex flex-col items-center justify-center">
      {/* Action Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap w-full max-w-[480px]">
        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <Trophy className="h-4 sm:h-5 w-4 sm:w-5 text-amber-400 shrink-0" /> League Table Card
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
              <Download className="h-3.5 w-3.5" /> Download Standings (JPG)
            </>
          )}
        </Button>
      </div>

      {/* Responsive Printable / Exportable Standings Card */}
      <div
        id={cardId}
        className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-b from-neutral-900 via-neutral-950 to-emerald-950/60 p-5 sm:p-6 shadow-2xl text-white w-full max-w-[480px] mx-auto min-h-[460px] flex flex-col justify-between"
      >
        {/* Glow Accents */}
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        {/* Large Watermark Logo in Background */}
        <div className="absolute -right-8 -bottom-6 h-72 w-72 opacity-[0.06] pointer-events-none select-none">
          <img
            src="/logo.png"
            alt="BBFF Watermark"
            className="h-full w-full object-contain"
            crossOrigin="anonymous"
          />
        </div>

        {/* Card Header with Prominent FC BBFF Branding */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-3 sm:pb-4 mb-3 sm:mb-4">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Highlighted BBFF Official Logo */}
            <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-full bg-neutral-900 border-2 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)] ring-2 ring-emerald-500/20">
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
              <h2 className="text-sm sm:text-base font-black text-white tracking-tight leading-tight line-clamp-1">
                {competition.name}
              </h2>
              {competition.season && (
                <p className="text-[9px] sm:text-[10px] text-neutral-300 font-semibold flex items-center gap-1 mt-0.5">
                  <Calendar className="h-3 w-3 text-emerald-400 shrink-0" /> Season: {competition.season.name}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className="rounded-xl bg-amber-500/15 border border-amber-400/50 px-2 sm:px-3 py-1 sm:py-1.5 text-[9px] sm:text-[10px] font-black text-amber-300 uppercase shadow-lg tracking-wider">
              Standings
            </span>
          </div>
        </div>

        {/* Points Table Grid with High-Contrast White Background & Black Text */}
        <div className="relative z-10 rounded-2xl bg-white p-2.5 sm:p-3 mb-3 sm:mb-4 shadow-xl border border-neutral-200">
          {leagueTable.length === 0 ? (
            <p className="py-6 text-center text-xs text-neutral-600 font-medium">No standings data recorded yet.</p>
          ) : (
            <div className="w-full">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="border-neutral-200 hover:bg-transparent text-[10px]">
                    <TableHead className="w-7 text-neutral-800 p-1 text-center font-black">Pos</TableHead>
                    <TableHead className="text-neutral-800 p-1 font-black">Club</TableHead>
                    <TableHead className="text-center text-neutral-800 p-1 font-bold">P</TableHead>
                    <TableHead className="text-center text-neutral-800 p-1 font-bold">W</TableHead>
                    <TableHead className="text-center text-neutral-800 p-1 font-bold">D</TableHead>
                    <TableHead className="text-center text-neutral-800 p-1 font-bold">L</TableHead>
                    <TableHead className="text-center text-neutral-800 p-1 font-bold">GD</TableHead>
                    <TableHead className="text-center font-black text-black p-1">PTS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leagueTable.map((row) => (
                    <TableRow
                      key={row.teamId}
                      className={`border-neutral-200 text-xs transition-colors ${
                        row.teamName.includes("FC BBFF")
                          ? "bg-emerald-100/90 font-bold text-emerald-950 border-emerald-300"
                          : "hover:bg-neutral-50 text-neutral-900"
                      }`}
                    >
                      <TableCell className="p-1 text-center font-mono font-black text-black">
                        {row.position === 1 ? (
                          <span className="text-xs sm:text-sm">🥇</span>
                        ) : row.position === 2 ? (
                          <span className="text-xs sm:text-sm">🥈</span>
                        ) : row.position === 3 ? (
                          <span className="text-xs sm:text-sm">🥉</span>
                        ) : (
                          row.position
                        )}
                      </TableCell>
                      <TableCell className="p-1">
                        <div className="flex items-center gap-1.5">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-[9px] font-bold text-white shrink-0 overflow-hidden">
                            {row.teamName.charAt(0)}
                          </div>
                          <span className={`truncate text-xs ${row.teamName.includes("FC BBFF") ? "text-emerald-950 font-black" : "text-black font-semibold"}`}>
                            {row.teamName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="p-1 text-center font-mono text-black font-semibold">{row.played}</TableCell>
                      <TableCell className="p-1 text-center font-mono text-black font-semibold">{row.won}</TableCell>
                      <TableCell className="p-1 text-center font-mono text-black font-semibold">{row.drawn}</TableCell>
                      <TableCell className="p-1 text-center font-mono text-black font-semibold">{row.lost}</TableCell>
                      <TableCell className="p-1 text-center font-mono font-bold text-black">
                        {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                      </TableCell>
                      <TableCell className="p-1 text-center font-mono font-black text-emerald-900 text-xs sm:text-sm">
                        {row.points}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Card Footer with Miniature Crest */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-2.5 sm:pt-3 text-[10px] text-neutral-400 mt-auto">
          <div className="flex items-center gap-1.5">
            <img src="/logo.png" alt="logo" className="h-3.5 w-3.5 object-contain opacity-80" crossOrigin="anonymous" />
            <span>Official Bhai Brother Football Federation Standings</span>
          </div>
          <span className="text-emerald-400 font-mono font-bold">#fcbbff</span>
        </div>
      </div>
    </div>
  );
}
