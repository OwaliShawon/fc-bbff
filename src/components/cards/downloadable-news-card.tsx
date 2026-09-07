"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Newspaper,
  Calendar,
  User,
  Sparkles,
  Tag,
  Flame,
  Globe,
  Share2,
} from "lucide-react";
import { exportElementAsJpeg } from "@/lib/export-image";
import { formatDate } from "@/lib/utils";
import type { NewsWithDetails, News } from "@/types";

export function DownloadableNewsCard({ news }: { news: NewsWithDetails | News | any }) {
  const [isExporting, setIsExporting] = useState(false);
  const cardId = `news-card-${news.id}`;

  const handleDownload = async () => {
    setIsExporting(true);
    const slugTitle = (news.title || "news")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    await exportElementAsJpeg(
      cardId,
      `fc-bbff-news-${slugTitle}.jpg`
    );
    setIsExporting(false);
  };

  const publishDate = news.publishedAt || news.createdAt;
  const categoryName = news.category?.name || "CLUB ANNOUNCEMENT";
  const authorName = news.author?.name || "FC BBFF Media";

  return (
    <div className="space-y-4 w-full flex flex-col items-center justify-center">
      {/* Action Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap w-full max-w-[480px]">
        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <Newspaper className="h-4 sm:h-5 w-4 sm:w-5 text-emerald-400 shrink-0" /> News Graphic Release Card
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
              <Download className="h-3.5 w-3.5" /> Download News Card (JPG)
            </>
          )}
        </Button>
      </div>

      {/* Exportable News Card Graphic */}
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
                <Flame className="h-3 w-3 text-amber-400 shrink-0" />
                OFFICIAL PRESS RELEASE
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[9px] font-bold uppercase tracking-wider">
              {categoryName}
            </Badge>
            {news.isFeatured && (
              <Badge variant="secondary" className="bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[9px] font-bold uppercase tracking-wider">
                ⭐ Featured
              </Badge>
            )}
          </div>
        </div>

        {/* Featured Image if Available */}
        {news.featuredImageUrl && (
          <div className="relative z-10 mb-4 h-40 w-full overflow-hidden rounded-2xl border border-white/10 shadow-md">
            <img
              src={news.featuredImageUrl}
              alt={news.title}
              className="h-full w-full object-cover"
              crossOrigin="anonymous"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
          </div>
        )}

        {/* News Article Details */}
        <div className="relative z-10 space-y-3 mb-4">
          <h2 className="text-lg sm:text-xl font-black text-white leading-snug drop-shadow-md">
            {news.title}
          </h2>

          {news.excerpt && (
            <p className="text-xs text-neutral-300 leading-relaxed line-clamp-3 bg-white/[0.03] border border-white/10 p-3 rounded-xl">
              {news.excerpt}
            </p>
          )}

          {/* Author and Date metadata */}
          <div className="flex items-center justify-between text-xs text-neutral-400 font-medium pt-1 border-t border-white/5">
            <div className="flex items-center gap-1.5 truncate">
              <User className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{authorName}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 text-emerald-300 font-semibold">
              <Calendar className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>{formatDate(publishDate)}</span>
            </div>
          </div>

          {/* Tags */}
          {news.tags && news.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <Tag className="h-3 w-3 text-neutral-400 shrink-0" />
              {news.tags.slice(0, 4).map((tag: string, i: number) => (
                <span
                  key={i}
                  className="rounded-md bg-white/10 px-2 py-0.5 text-[9px] font-medium text-neutral-300 border border-white/10"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-3 text-[10px] text-neutral-400 mt-auto">
          <div className="flex items-center gap-1.5">
            <img src="/logo.png" alt="logo" className="h-3.5 w-3.5 object-contain opacity-80" crossOrigin="anonymous" />
            <span>Official Bhai Brother Football Federation News Graphic</span>
          </div>
          <span className="text-emerald-400 font-mono font-bold">#fcbbff</span>
        </div>
      </div>
    </div>
  );
}
