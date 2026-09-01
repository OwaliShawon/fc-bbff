"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trophy, Swords, Sparkles } from "lucide-react";

interface MatchesFilterBarProps {
  competitions: any[];
  currentFilter: string;
}

export function MatchesFilterBar({ competitions, currentFilter }: MatchesFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val === "all") {
      params.delete("type");
    } else {
      params.set("type", val);
    }
    router.push(`/matches?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white/[0.03] border border-white/10 rounded-2xl p-3 sm:p-4 mb-8">
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Button
          variant={currentFilter === "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleFilterChange("all")}
          className={
            currentFilter === "all"
              ? "bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              : "text-neutral-400 hover:text-white text-xs"
          }
        >
          <Sparkles className="h-3.5 w-3.5 mr-1 text-emerald-400" /> All Matches
        </Button>

        <Button
          variant={currentFilter === "competition" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleFilterChange("competition")}
          className={
            currentFilter === "competition"
              ? "bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              : "text-neutral-400 hover:text-white text-xs"
          }
        >
          <Trophy className="h-3.5 w-3.5 mr-1 text-amber-400" /> Competition Matches
        </Button>

        <Button
          variant={currentFilter === "independent" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleFilterChange("independent")}
          className={
            currentFilter === "independent"
              ? "bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              : "text-neutral-400 hover:text-white text-xs"
          }
        >
          <Swords className="h-3.5 w-3.5 mr-1 text-cyan-400" /> Independent / Friendly
        </Button>
      </div>

      {/* Specific Competition Select Dropdown */}
      <div className="w-full sm:w-64">
        <Select
          value={currentFilter.startsWith("comp_") ? currentFilter.replace("comp_", "") : "all"}
          onValueChange={(val) => {
            if (val === "all") handleFilterChange("all");
            else handleFilterChange(`comp_${val}`);
          }}
        >
          <SelectTrigger className="w-full bg-neutral-900 border-white/10 text-xs text-white">
            <SelectValue placeholder="Filter by Competition..." />
          </SelectTrigger>
          <SelectContent className="bg-neutral-900 border-white/10 text-white">
            <SelectItem value="all">🏆 Select Specific Competition...</SelectItem>
            {competitions.map((comp) => (
              <SelectItem key={comp.id} value={comp.id}>
                {comp.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
