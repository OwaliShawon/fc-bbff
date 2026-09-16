"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  UserCheck,
  Megaphone,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { exportElementAsJpeg } from "@/lib/export-image";
import { formatDate } from "@/lib/utils";
import type { Event } from "@/types";

export function DownloadableEventCard({ event }: { event: Event }) {
  const [isExporting, setIsExporting] = useState(false);
  const cardId = `event-card-${event.id}`;

  const handleDownload = async () => {
    setIsExporting(true);
    const slugTitle = (event.title || "event")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    await exportElementAsJpeg(
      cardId,
      `fc-bbff-event-${slugTitle}.jpg`
    );
    setIsExporting(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "UPCOMING":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-400/40";
      case "ONGOING":
        return "bg-amber-500/20 text-amber-300 border-amber-400/40";
      case "COMPLETED":
        return "bg-neutral-800 text-neutral-400 border-neutral-700";
      case "CANCELLED":
        return "bg-red-500/20 text-red-300 border-red-400/40";
      case "POSTPONED":
        return "bg-purple-500/20 text-purple-300 border-purple-400/40";
      default:
        return "bg-emerald-500/20 text-emerald-300 border-emerald-400/40";
    }
  };

  const formattedType = event.eventType ? event.eventType.replace(/_/g, " ") : "SPECIAL EVENT";

  return (
    <div className="space-y-4 w-full flex flex-col items-center justify-center">
      {/* Action Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap w-full max-w-[480px]">
        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="h-4 sm:h-5 w-4 sm:w-5 text-emerald-400 shrink-0" /> Event Announcement Poster
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
              <Download className="h-3.5 w-3.5" /> Download Event Card (JPG)
            </>
          )}
        </Button>
      </div>

      {/* Exportable Graphic Card */}
      <div
        id={cardId}
        className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-b from-neutral-900 via-neutral-950 to-emerald-950/60 p-5 sm:p-6 shadow-2xl text-white w-full max-w-[480px] mx-auto min-h-[480px] flex flex-col justify-between"
      >
        {/* Ambient Glows */}
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        {/* Large Watermark Crest */}
        <div className="absolute -right-8 -bottom-6 h-72 w-72 opacity-[0.06] pointer-events-none select-none">
          <img
            src="/logo.png"
            alt="BBFF Crest Background"
            className="h-full w-full object-contain"
            crossOrigin="anonymous"
          />
        </div>

        {/* Card Header with FC BBFF Branding */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-3.5 mb-4 gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-full bg-neutral-900 border-2 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.45)] ring-2 ring-emerald-500/20">
              <img
                src="/logo.png"
                alt="FC BBFF Logo"
                className="h-full w-full object-cover"
                crossOrigin="anonymous"
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-black tracking-widest text-white uppercase drop-shadow truncate">
                FC BBFF
              </p>
              <p className="text-[9px] sm:text-[10px] font-black text-emerald-300 tracking-wider uppercase flex items-center gap-1">
                <Megaphone className="h-3 w-3 text-amber-400 shrink-0" />
                OFFICIAL CLUB EVENT
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[9px] font-bold uppercase tracking-wider">
              {formattedType}
            </Badge>
            <Badge variant="secondary" className={`${getStatusColor(event.status)} text-[9px] font-bold uppercase tracking-wider border`}>
              {event.status}
            </Badge>
          </div>
        </div>

        {/* Cover Image or Feature Banner if present */}
        {event.coverImageUrl && (
          <div className="relative z-10 mb-4 h-36 w-full overflow-hidden rounded-2xl border border-white/10 shadow-md">
            <img
              src={event.coverImageUrl}
              alt={event.title}
              className="h-full w-full object-cover"
              crossOrigin="anonymous"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
          </div>
        )}

        {/* Event Main Content */}
        <div className="relative z-10 space-y-3 mb-4">
          <h2 className="text-lg sm:text-xl font-black text-white leading-snug drop-shadow-md">
            {event.title}
          </h2>

          {event.description && (
            <p className="text-xs text-neutral-300 leading-relaxed line-clamp-3 bg-white/[0.03] border border-white/10 p-3 rounded-xl">
              {event.description}
            </p>
          )}

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium pt-1">
            <div className="flex items-center gap-2 rounded-xl bg-white/[0.04] border border-white/10 p-2.5">
              <Calendar className="h-4 w-4 text-emerald-400 shrink-0" />
              <div>
                <p className="text-[10px] text-neutral-400 uppercase font-semibold">Date</p>
                <p className="font-bold text-white text-xs">{formatDate(event.eventDate)}</p>
              </div>
            </div>

            {(event.startTime || event.endTime) && (
              <div className="flex items-center gap-2 rounded-xl bg-white/[0.04] border border-white/10 p-2.5">
                <Clock className="h-4 w-4 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-neutral-400 uppercase font-semibold">Time</p>
                  <p className="font-bold text-white text-xs">
                    {event.startTime || ""}{event.startTime && event.endTime ? " - " : ""}{event.endTime || ""}
                  </p>
                </div>
              </div>
            )}

            {event.venue && (
              <div className="flex items-center gap-2 rounded-xl bg-white/[0.04] border border-white/10 p-2.5 sm:col-span-2">
                <MapPin className="h-4 w-4 text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-neutral-400 uppercase font-semibold">Venue</p>
                  <p className="font-bold text-white text-xs truncate">{event.venue}</p>
                </div>
              </div>
            )}
          </div>

          {/* Organizer & Registration info */}
          {(event.organizer || event.registrationUrl) && (
            <div className="flex items-center justify-between gap-2 rounded-xl bg-emerald-500/10 border border-emerald-400/30 p-2.5 text-xs">
              {event.organizer && (
                <div className="flex items-center gap-1.5 text-emerald-300 font-semibold text-[11px] truncate">
                  <UserCheck className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Org: {event.organizer}</span>
                </div>
              )}
              {event.registrationUrl && (
                <div className="flex items-center gap-1 text-amber-300 font-bold text-[11px] shrink-0 ml-auto">
                  <ExternalLink className="h-3 w-3" />
                  <span>RSVP Open</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-3 text-[10px] text-neutral-400 mt-auto">
          <div className="flex items-center gap-1.5">
            <img src="/logo.png" alt="logo" className="h-3.5 w-3.5 object-contain opacity-80" crossOrigin="anonymous" />
            <span>Official Bhai Brother Football Federation Event Poster</span>
          </div>
          <span className="text-emerald-400 font-mono font-bold">#fcbbff</span>
        </div>
      </div>
    </div>
  );
}
