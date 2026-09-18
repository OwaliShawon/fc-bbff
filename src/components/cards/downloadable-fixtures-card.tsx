"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Flame, Copy, Check, Clock } from "lucide-react";
import { exportElementAsJpeg } from "@/lib/export-image";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

export function DownloadableFixturesCard({
  competition,
  matches,
}: {
  competition: any;
  matches: any[];
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeLeg, setActiveLeg] = useState<"ALL" | "LEG1" | "LEG2">("ALL");

  const cardId = `fixtures-card-${competition?.id || "bbff"}`;

  const cleanName = (name: string) => (name ? name.replace(/^BBFF\s+/i, "").trim() : "");

  const formatShortMatchDate = (dateStrOrObj: Date | string) => {
    const d = new Date(dateStrOrObj);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Dhaka",
    });
  };


  const leg1Matches = matches.filter((m) => m.notes?.includes("Leg 1") || m.matchDay <= 15);
  const leg2Matches = matches.filter((m) => m.notes?.includes("Leg 2") || m.matchDay > 15);

  const displayMatches =
    activeLeg === "LEG1"
      ? leg1Matches
      : activeLeg === "LEG2"
      ? leg2Matches
      : matches;

  const handleDownload = async () => {
    setIsExporting(true);
    const slug = (competition?.name || "fixtures").toLowerCase().replace(/\s+/g, "-");
    const legTag = activeLeg.toLowerCase();
    await exportElementAsJpeg(
      cardId,
      `fc-bbff-${slug}-${legTag}-fixtures-facebook.jpg`
    );
    setIsExporting(false);
  };

  const handleCopyCaption = () => {
    let caption = `🏆 FC BBFF - ${competition?.name || "COMPETITION FIXTURES"} 🏆\n`;
    caption += `Official Fixture Schedule & Matchdays\n\n`;

    displayMatches.forEach((m: any, idx: number) => {
      const matchNum = m.matchDay || idx + 1;
      const dateStr = formatDateTime(m.matchDate);
      const homeName = m.homeTeam?.name || "Home Team";
      const awayName = m.awayTeam?.name || "Away Team";
      const notes = m.notes ? ` (${m.notes})` : "";

      caption += `📌 Match #${matchNum}: ${homeName} vs ${awayName}\n`;
      caption += `🗓️ ${dateStr}${notes}\n\n`;
    });

    caption += `#FCBBFF #IntraLeague #Football #Fixtures #BhaiBrotherFootballFederation`;

    navigator.clipboard.writeText(caption);
    setCopied(true);
    toast.success("Facebook caption copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-4 w-full flex flex-col items-center justify-center">
      {/* Action Header Controls */}
      <div className="flex items-center justify-between gap-3 flex-wrap w-full max-w-[680px]">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`cursor-pointer text-xs px-2.5 py-1 font-bold ${
              activeLeg === "ALL" ? "bg-emerald-500/20 text-emerald-300 border-emerald-400" : "text-neutral-400 border-white/10"
            }`}
            onClick={() => setActiveLeg("ALL")}
          >
            All 30 Matches
          </Badge>
          <Badge
            variant="outline"
            className={`cursor-pointer text-xs px-2.5 py-1 font-bold ${
              activeLeg === "LEG1" ? "bg-amber-500/20 text-amber-300 border-amber-400" : "text-neutral-400 border-white/10"
            }`}
            onClick={() => setActiveLeg("LEG1")}
          >
            Leg 1 (1-15)
          </Badge>
          <Badge
            variant="outline"
            className={`cursor-pointer text-xs px-2.5 py-1 font-bold ${
              activeLeg === "LEG2" ? "bg-blue-500/20 text-blue-300 border-blue-400" : "text-neutral-400 border-white/10"
            }`}
            onClick={() => setActiveLeg("LEG2")}
          >
            Leg 2 (16-30)
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleCopyCaption}
            size="sm"
            variant="outline"
            className="border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs gap-1.5 font-semibold"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-amber-400" />}
            {copied ? "Copied Text!" : "Copy Post Text"}
          </Button>

          <Button
            onClick={handleDownload}
            disabled={isExporting}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 shadow-lg shadow-emerald-950 font-semibold"
          >
            {isExporting ? (
              <>
                <span className="inline-block animate-spin text-sm leading-none">⚽</span> Generating...
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" /> Download Facebook Card (JPG)
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Exportable Facebook Graphic Fixture Poster Card */}
      <div
        id={cardId}
        className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-b from-neutral-900 via-neutral-950 to-emerald-950/70 p-5 sm:p-6 shadow-2xl text-white w-full max-w-[680px] mx-auto flex flex-col justify-between"
      >
        {/* Glow Effects */}
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        {/* Large Watermark Logo */}
        <div className="absolute -right-8 -bottom-6 h-80 w-80 opacity-[0.05] pointer-events-none select-none">
          <img
            src="/logo.png"
            alt="BBFF Watermark"
            className="h-full w-full object-contain"
            crossOrigin="anonymous"
          />
        </div>

        {/* Poster Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-3 sm:pb-4 mb-4">
          <div className="flex items-center gap-3">
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
              <h2 className="text-sm sm:text-base font-black text-white tracking-tight leading-tight uppercase">
                {competition?.name || "OFFICIAL FIXTURE SCHEDULE"}
              </h2>
              <p className="text-[9px] sm:text-[10px] text-emerald-300 font-bold tracking-wide uppercase flex items-center gap-1 mt-0.5">
                <Flame className="h-3 w-3 text-amber-400" />
                {activeLeg === "ALL"
                  ? "FULL LEAGUE FIXTURES (30 MATCHES)"
                  : activeLeg === "LEG1"
                  ? "LEG 1 FIXTURES SCHEDULE (MATCHES 1-15)"
                  : "LEG 2 FIXTURES SCHEDULE (MATCHES 16-30)"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="rounded-xl bg-amber-500/15 border border-amber-400/50 px-2.5 py-1 text-[9px] sm:text-[10px] font-black text-amber-300 uppercase shadow-lg tracking-wider">
              {activeLeg === "ALL" ? "30 MATCHES" : activeLeg}
            </span>
          </div>
        </div>

        {/* Fixtures Grid Layout (Side-by-side columns for Leg 1 and Leg 2 when ALL is selected) */}
        {activeLeg === "ALL" ? (
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {/* Leg 1 Column */}
            <div className="space-y-1.5 bg-white/[0.02] border border-white/10 rounded-2xl p-2.5">
              <div className="flex items-center justify-between border-b border-amber-500/30 pb-1 mb-1 px-1">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  ⚔️ LEG 1 (MATCHES 1-15)
                </span>
              </div>
              {leg1Matches.map((m: any, idx: number) => (
                <div
                  key={m.id || idx}
                  className="flex items-center justify-between gap-1 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-[11px]"
                >
                  <span className="font-mono font-bold text-[9px] text-amber-400 bg-amber-500/10 px-1 py-0.5 rounded border border-amber-500/20 shrink-0">
                    #{m.matchDay || idx + 1}
                  </span>
                  <div className="font-bold text-white text-[10px] sm:text-[11px] truncate flex items-center gap-1">
                    <span className="text-emerald-300 truncate max-w-[85px] text-right">
                      {cleanName(m.homeTeam?.name)}
                    </span>
                    <span className="text-[8px] text-neutral-400 font-mono">v</span>
                    <span className="text-blue-300 truncate max-w-[85px]">
                      {cleanName(m.awayTeam?.name)}
                    </span>
                  </div>
                  <span className="text-[8px] text-neutral-400 font-mono shrink-0">
                    {formatShortMatchDate(m.matchDate)}
                  </span>
                </div>
              ))}
            </div>

            {/* Leg 2 Column */}
            <div className="space-y-1.5 bg-white/[0.02] border border-white/10 rounded-2xl p-2.5">
              <div className="flex items-center justify-between border-b border-blue-500/30 pb-1 mb-1 px-1">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider flex items-center gap-1">
                  ⚡ LEG 2 (MATCHES 16-30)
                </span>
              </div>
              {leg2Matches.map((m: any, idx: number) => (
                <div
                  key={m.id || idx}
                  className="flex items-center justify-between gap-1 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-[11px]"
                >
                  <span className="font-mono font-bold text-[9px] text-blue-400 bg-blue-500/10 px-1 py-0.5 rounded border border-blue-500/20 shrink-0">
                    #{m.matchDay || idx + 16}
                  </span>
                  <div className="font-bold text-white text-[10px] sm:text-[11px] truncate flex items-center gap-1">
                    <span className="text-emerald-300 truncate max-w-[85px] text-right">
                      {cleanName(m.homeTeam?.name)}
                    </span>
                    <span className="text-[8px] text-neutral-400 font-mono">v</span>
                    <span className="text-blue-300 truncate max-w-[85px]">
                      {cleanName(m.awayTeam?.name)}
                    </span>
                  </div>
                  <span className="text-[8px] text-neutral-400 font-mono shrink-0">
                    {formatShortMatchDate(m.matchDate)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Single Leg View */
          <div className="relative z-10 rounded-2xl bg-white/[0.03] border border-white/10 p-3 mb-4 space-y-1.5 shadow-inner">
            {displayMatches.map((m: any, idx: number) => (
              <div
                key={m.id || idx}
                className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/5 text-xs hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">
                    #{m.matchDay || idx + 1}
                  </span>
                  <div className="flex items-center gap-1.5 font-bold text-white text-xs truncate">
                    <span className="text-emerald-400 truncate max-w-[130px] sm:max-w-[160px] text-right">
                      {cleanName(m.homeTeam?.name)}
                    </span>
                    <span className="text-[9px] text-neutral-400 font-mono">VS</span>
                    <span className="text-blue-400 truncate max-w-[130px] sm:max-w-[160px]">
                      {cleanName(m.awayTeam?.name)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-neutral-300 font-mono shrink-0">
                  <span className="text-neutral-400 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-emerald-400" />
                    {formatDateTime(m.matchDate)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Card Footer */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-2.5 text-[10px] text-neutral-400 mt-auto">
          <div className="flex items-center gap-1.5">
            <img src="/logo.png" alt="logo" className="h-3.5 w-3.5 object-contain opacity-80" crossOrigin="anonymous" />
            <span>Official Bhai Brother Football Federation Fixtures</span>
          </div>
          <span className="text-emerald-400 font-mono font-bold">#fcbbff</span>
        </div>
      </div>
    </div>
  );
}
