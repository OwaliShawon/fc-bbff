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
      <div className="flex items-center justify-between gap-2 flex-wrap w-full max-w-[540px]">
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
        className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-b from-neutral-900 via-neutral-950 to-emerald-950/50 p-4 sm:p-6 shadow-2xl text-white w-full max-w-[540px] mx-auto min-h-[460px]"
      >
        {/* Glow Accents */}
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        {/* Large Watermark Logo in Background */}
        <div className="absolute -right-10 -bottom-6 h-80 w-80 opacity-[0.07] pointer-events-none select-none">
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
            <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-2xl bg-neutral-900/90 p-1.5 border-2 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)] ring-2 ring-emerald-500/20">
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

        {/* Points Table Grid with responsive wrapper */}
        <div className="relative z-10 rounded-2xl bg-white/[0.03] border-2 border-white/10 p-2 sm:p-3.5 mb-3 sm:mb-4 overflow-x-auto shadow-inner">
          {leagueTable.length === 0 ? (
            <p className="py-6 text-center text-xs text-neutral-400 font-medium">No standings data recorded yet.</p>
          ) : (
            <div className="min-w-[400px]">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent text-[9px] sm:text-[10px]">
                    <TableHead className="w-8 text-neutral-400 p-1 sm:p-1.5 text-center font-bold">Pos</TableHead>
                    <TableHead className="text-neutral-400 p-1 sm:p-1.5 font-bold">Club</TableHead>
                    <TableHead className="text-center text-neutral-400 p-1 sm:p-1.5 font-bold">P</TableHead>
                    <TableHead className="text-center text-neutral-400 p-1 sm:p-1.5 font-bold">W</TableHead>
                    <TableHead className="text-center text-neutral-400 p-1 sm:p-1.5 font-bold">D</TableHead>
                    <TableHead className="text-center text-neutral-400 p-1 sm:p-1.5 font-bold">L</TableHead>
                    <TableHead className="text-center text-neutral-400 p-1 sm:p-1.5 font-bold">GD</TableHead>
                    <TableHead className="text-center font-black text-white p-1 sm:p-1.5">PTS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leagueTable.map((row) => (
                    <TableRow
                      key={row.teamId}
                      className={`border-white/5 text-xs transition-colors ${
                        row.teamName.includes("FC BBFF")
                          ? "bg-emerald-950/70 border-emerald-500/30 font-bold"
                          : "hover:bg-transparent"
                      }`}
                    >
                      <TableCell className="p-1 sm:p-1.5 text-center font-mono text-neutral-300 font-bold">
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
                      <TableCell className="p-1 sm:p-1.5">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <div className="flex h-5 w-5 items-center justify-center rounded bg-white/10 text-[9px] font-bold text-white shrink-0 border border-white/10">
                            {row.teamName.charAt(0)}
                          </div>
                          <span className={`truncate text-xs ${row.teamName.includes("FC BBFF") ? "text-emerald-300 font-bold" : "text-white"}`}>
                            {row.teamName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="p-1 sm:p-1.5 text-center font-mono text-neutral-300">{row.played}</TableCell>
                      <TableCell className="p-1 sm:p-1.5 text-center font-mono text-neutral-300">{row.won}</TableCell>
                      <TableCell className="p-1 sm:p-1.5 text-center font-mono text-neutral-300">{row.drawn}</TableCell>
                      <TableCell className="p-1 sm:p-1.5 text-center font-mono text-neutral-300">{row.lost}</TableCell>
                      <TableCell className="p-1 sm:p-1.5 text-center font-mono text-neutral-300 font-semibold">
                        {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                      </TableCell>
                      <TableCell className="p-1 sm:p-1.5 text-center font-mono font-black text-emerald-300 text-xs sm:text-sm">
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
        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-2.5 sm:pt-3 text-[10px] text-neutral-400">
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
