"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createMatch, createMatchWithOutsider, updateMatch, deleteMatch, updateMatchResult,
  addMatchEvent, removeMatchEvent, getMatchById,
} from "@/actions/match-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, Loader2, Swords, Trophy, X, Globe, Users,
} from "lucide-react";
import { formatDateTime, getMatchStatusColor } from "@/lib/utils";
import type { PaginatedResponse, Match, Season, Player } from "@/types";
import type { Team, Competition } from "@prisma/client";

const EVENT_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  GOAL: { label: "Goal", icon: "⚽", color: "bg-emerald-500/20 text-emerald-400" },
  ASSIST: { label: "Assist", icon: "🅰️", color: "bg-blue-500/20 text-blue-400" },
  YELLOW_CARD: { label: "Yellow Card", icon: "🟨", color: "bg-yellow-500/20 text-yellow-400" },
  RED_CARD: { label: "Red Card", icon: "🟥", color: "bg-red-500/20 text-red-400" },
  OWN_GOAL: { label: "Own Goal", icon: "⚽", color: "bg-orange-500/20 text-orange-400" },
  PENALTY: { label: "Penalty Goal", icon: "⚽", color: "bg-emerald-500/20 text-emerald-400" },
  PENALTY_MISSED: { label: "Penalty Missed", icon: "❌", color: "bg-neutral-500/20 text-neutral-400" },
  SUBSTITUTION: { label: "Substitution", icon: "🔄", color: "bg-cyan-500/20 text-cyan-400" },
};

interface MatchesClientProps {
  initialData: PaginatedResponse<Match>;
  teams: Team[];
  seasons: Season[];
  competitions?: Competition[];
  allPlayers?: Player[];
  currentPage: number;
  currentStatus: string;
  currentSearch: string;
  currentCompetitionId?: string;
}

export function MatchesClient({
  initialData,
  teams,
  seasons,
  competitions = [],
  allPlayers = [],
  currentPage,
  currentStatus,
  currentSearch,
  currentCompetitionId = "",
}: MatchesClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDialog, setShowDialog] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [matchPlayers, setMatchPlayers] = useState<any[]>([]);
  const [matchEvents, setMatchEvents] = useState<any[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [isLoadingMatch, setIsLoadingMatch] = useState(false);

  const fcBbffTeam = teams.find((t) => t.name.toUpperCase().includes("BBFF")) || teams[0];

  const [matchTypeMode, setMatchTypeMode] = useState<"outsider" | "internal">("outsider");
  const [outsiderData, setOutsiderData] = useState<{
    fcBbffTeamId: string;
    outsiderTeamName: string;
    isFcBbffHome: boolean;
    selectedPlayerIds: string[];
  }>({
    fcBbffTeamId: fcBbffTeam?.id || "",
    outsiderTeamName: "",
    isFcBbffHome: true,
    selectedPlayerIds: [],
  });

  const [formData, setFormData] = useState({
    homeTeamId: "", awayTeamId: "", matchDate: "", venue: "", seasonId: "",
    competitionId: "", matchDay: "", referee: "", status: "SCHEDULED", notes: "",
  });
  const [resultData, setResultData] = useState({
    homeScore: 0, awayScore: 0, playerOfMatchId: "", matchReport: "", status: "COMPLETED" as const,
  });

  // New event form
  const [newEvent, setNewEvent] = useState({
    eventType: "GOAL", playerId: "", relatedPlayerId: "", minute: "", description: "",
  });

  function openCreate() {
    setEditingMatch(null);
    setMatchTypeMode("outsider");
    setOutsiderData({
      fcBbffTeamId: fcBbffTeam?.id || teams[0]?.id || "",
      outsiderTeamName: "",
      isFcBbffHome: true,
      selectedPlayerIds: allPlayers.map((p) => p.id), // Pre-select all registered players by default
    });
    setFormData({
      homeTeamId: fcBbffTeam?.id || teams[0]?.id || "",
      awayTeamId: "",
      matchDate: new Date().toISOString().slice(0, 16),
      venue: "",
      seasonId: "",
      competitionId: "",
      matchDay: "",
      referee: "",
      status: "SCHEDULED",
      notes: "",
    });
    setShowDialog(true);
  }

  function openEdit(match: any) {
    setEditingMatch(match);
    setMatchTypeMode("internal");
    setFormData({
      homeTeamId: match.homeTeamId, awayTeamId: match.awayTeamId,
      matchDate: new Date(match.matchDate).toISOString().slice(0, 16),
      venue: match.venue || "", seasonId: match.seasonId || "",
      competitionId: match.competitionId || "", matchDay: match.matchDay?.toString() || "",
      referee: match.referee || "", status: match.status, notes: match.notes || "",
    });
    setShowDialog(true);
  }

  async function openResult(match: any) {
    setIsLoadingMatch(true);
    setShowResultDialog(true);

    try {
      // Fetch full match data including team rosters and existing events
      const fullMatch = await getMatchById(match.id) as any;
      if (!fullMatch) {
        toast.error("Failed to load match details");
        setShowResultDialog(false);
        setIsLoadingMatch(false);
        return;
      }

      setSelectedMatch(fullMatch);

      // Collect all players from both teams
      let homePlayers = (fullMatch.homeTeam?.teamPlayers || []).map((tp: any) => ({
        ...tp.player,
        teamName: fullMatch.homeTeam?.name,
        teamSide: "home",
      }));
      let awayPlayers = (fullMatch.awayTeam?.teamPlayers || []).map((tp: any) => ({
        ...tp.player,
        teamName: fullMatch.awayTeam?.name,
        teamSide: "away",
      }));

      // Collect lineups if explicitly created
      const lineupPlayers = (fullMatch.lineups || []).map((l: any) => ({
        ...l.player,
        teamName: "FC BBFF",
        teamSide: fullMatch.homeTeamId === l.teamId ? "home" : "away",
      }));

      // Always include ALL club players for FC BBFF in match roster so any player can score goals/assists/cards
      const clubPlayers = allPlayers.map((p: any) => ({
        ...p,
        teamName: "FC BBFF",
        teamSide: fullMatch.homeTeam?.name?.toUpperCase().includes("BBFF") ? "home" : "away",
      }));

      setMatchPlayers([...lineupPlayers, ...clubPlayers, ...homePlayers, ...awayPlayers]);

      // Load existing events
      setMatchEvents(fullMatch.matchEvents || []);

      setResultData({
        homeScore: fullMatch.homeScore ?? 0,
        awayScore: fullMatch.awayScore ?? 0,
        playerOfMatchId: fullMatch.playerOfMatchId || "",
        matchReport: fullMatch.matchReport || "",
        status: "COMPLETED",
      });

      setNewEvent({ eventType: "GOAL", playerId: "", relatedPlayerId: "", minute: "", description: "" });
    } catch {
      toast.error("Failed to load match data");
      setShowResultDialog(false);
    } finally {
      setIsLoadingMatch(false);
    }
  }

  async function handleSubmit() {
    startTransition(async () => {
      let result;
      if (!editingMatch && matchTypeMode === "outsider") {
        if (!outsiderData.outsiderTeamName.trim()) {
          toast.error("Please enter the Outsider / External Team name");
          return;
        }
        result = await createMatchWithOutsider({
          fcBbffTeamId: outsiderData.fcBbffTeamId || fcBbffTeam?.id || "",
          outsiderTeamName: outsiderData.outsiderTeamName,
          isFcBbffHome: outsiderData.isFcBbffHome,
          selectedPlayerIds: outsiderData.selectedPlayerIds,
          matchDate: formData.matchDate,
          venue: formData.venue,
          competitionId: formData.competitionId || null,
          seasonId: formData.seasonId || null,
          matchDay: formData.matchDay ? parseInt(formData.matchDay) : null,
          referee: formData.referee,
          notes: formData.notes,
          status: formData.status as any,
        });
      } else {
        const data = {
          ...formData,
          matchDay: formData.matchDay ? parseInt(formData.matchDay) : null,
          competitionId: formData.competitionId || null,
          seasonId: formData.seasonId || null,
        };
        result = editingMatch
          ? await updateMatch(editingMatch.id, data)
          : await createMatch(data);
      }

      if (result.success) {
        toast.success(editingMatch ? "Match updated" : "Match created!");
        setShowDialog(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed");
      }
    });
  }

  async function handleResult() {
    if (!selectedMatch) return;
    startTransition(async () => {
      const payload = {
        ...resultData,
        playerOfMatchId:
          resultData.playerOfMatchId && resultData.playerOfMatchId !== "NONE"
            ? resultData.playerOfMatchId
            : null,
        matchReport: resultData.matchReport || null,
      };
      const result = await updateMatchResult(selectedMatch.id, payload);
      if (result.success) {
        toast.success("Result published successfully!");
        setShowResultDialog(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update result");
      }
    });
  }

  async function handleAddEvent() {
    if (!selectedMatch || !newEvent.playerId || !newEvent.minute) {
      toast.error("Please select a player and enter the minute");
      return;
    }
    startTransition(async () => {
      const eventData = {
        playerId: newEvent.playerId,
        eventType: newEvent.eventType,
        minute: parseInt(newEvent.minute),
        relatedPlayerId: newEvent.relatedPlayerId || null,
        description: newEvent.description || null,
      };
      const result = await addMatchEvent(selectedMatch.id, eventData);
      if (result.success) {
        toast.success(`${EVENT_LABELS[newEvent.eventType]?.label || "Event"} added`);
        // Refresh match data to get updated events
        const refreshed = await getMatchById(selectedMatch.id) as any;
        if (refreshed) {
          setMatchEvents(refreshed.matchEvents || []);
          setSelectedMatch(refreshed);
        }
        setNewEvent({ eventType: "GOAL", playerId: "", relatedPlayerId: "", minute: "", description: "" });
      } else {
        toast.error(result.error || "Failed to add event");
      }
    });
  }

  async function handleRemoveEvent(eventId: string) {
    startTransition(async () => {
      const result = await removeMatchEvent(eventId);
      if (result.success) {
        setMatchEvents((prev) => prev.filter((e) => e.id !== eventId));
        toast.success("Event removed");
      } else {
        toast.error(result.error || "Failed to remove event");
      }
    });
  }

  async function handleDelete() {
    if (!deletingId) return;
    startTransition(async () => {
      const result = await deleteMatch(deletingId);
      if (result.success) {
        toast.success("Match deleted");
        setShowDeleteDialog(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (searchInput) p.set("search", searchInput);
    if (currentStatus) p.set("status", currentStatus);
    router.push(`/admin/matches?${p.toString()}`);
  }

  function getPlayerName(playerId: string) {
    const p = matchPlayers.find((pl) => pl.id === playerId);
    return p ? `${p.firstName} ${p.lastName}` : "Unknown";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Matches</h1>
          <p className="text-neutral-500">Manage fixtures and results ({initialData.total} total)</p>
        </div>
        <Button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" /> Create Match
        </Button>
      </div>

      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row">
          <form onSubmit={handleSearch} className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input placeholder="Search matches..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="pl-9" />
            </div>
            <Button type="submit" variant="secondary">Search</Button>
          </form>

          {/* Competition / Independent Filter */}
          <Select value={currentCompetitionId || "all"} onValueChange={(v) => {
            const p = new URLSearchParams();
            if (currentStatus) p.set("status", currentStatus);
            if (v !== "all") p.set("competitionId", v);
            if (searchInput) p.set("search", searchInput);
            router.push(`/admin/matches?${p.toString()}`);
          }}>
            <SelectTrigger className="w-[210px]"><SelectValue placeholder="All Competitions" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Competitions & Independent</SelectItem>
              <SelectItem value="INDEPENDENT">🤝 Independent / Friendly Matches</SelectItem>
              {competitions.map((c) => (
                <SelectItem key={c.id} value={c.id}>🏆 {c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={currentStatus || "all"} onValueChange={(v) => {
            const p = new URLSearchParams();
            if (v !== "all") p.set("status", v);
            if (currentCompetitionId) p.set("competitionId", currentCompetitionId);
            if (searchInput) p.set("search", searchInput);
            router.push(`/admin/matches?${p.toString()}`);
          }}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="SCHEDULED">Scheduled</SelectItem>
              <SelectItem value="LIVE">Live</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="POSTPONED">Postponed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Match</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialData.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-neutral-500">
                    <Swords className="mx-auto mb-2 h-8 w-8 text-neutral-300" />
                    No matches found
                  </TableCell>
                </TableRow>
              ) : (
                initialData.data.map((match: any) => (
                  <TableRow key={match.id}>
                    <TableCell>
                      <p className="font-medium">{match.homeTeam?.name} vs {match.awayTeam?.name}</p>
                      {match.competition ? (
                        <span className="inline-flex items-center text-xs font-semibold text-emerald-400 mt-0.5">
                          🏆 {match.competition.name}
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs font-semibold text-amber-400 mt-0.5">
                          🤝 Independent / Friendly Match
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {match.status === "COMPLETED" ? (
                        <span className="font-bold text-emerald-600">{match.homeScore} - {match.awayScore}</span>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{formatDateTime(match.matchDate)}</TableCell>
                    <TableCell className="text-sm text-neutral-500">{match.venue || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getMatchStatusColor(match.status)}>{match.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {(match.status === "SCHEDULED" || match.status === "LIVE" || match.status === "COMPLETED") && (
                          <Button variant="ghost" size="sm" onClick={() => openResult(match)} className="h-8 text-xs">
                            <Trophy className="mr-1 h-3 w-3" /> Result
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => openEdit(match)} className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { setDeletingId(match.id); setShowDeleteDialog(true); }} className="h-8 w-8 text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        {initialData.totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-neutral-500">Page {initialData.page} of {initialData.totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => router.push(`/admin/matches?page=${currentPage - 1}`)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" disabled={currentPage >= initialData.totalPages} onClick={() => router.push(`/admin/matches?page=${currentPage + 1}`)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Create/Edit Match Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>{editingMatch ? "Edit Match" : "Create Match"}</DialogTitle></DialogHeader>
          
          {/* Mode Switcher Tabs for Creating New Match */}
          {!editingMatch && (
            <div className="flex items-center gap-2 p-1 bg-white/[0.04] rounded-xl border border-white/10 my-2">
              <button
                type="button"
                onClick={() => setMatchTypeMode("outsider")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  matchTypeMode === "outsider"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Globe className="h-4 w-4" /> Match vs Outsider Team
              </button>
              <button
                type="button"
                onClick={() => setMatchTypeMode("internal")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  matchTypeMode === "internal"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Swords className="h-4 w-4" /> Existing / Internal Teams
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Competition Selector (Only for Internal/Competition matches) */}
            {(matchTypeMode === "internal" || editingMatch) && (
              <div className="col-span-full space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <Label className="font-bold text-white flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-emerald-400" /> Competition Selection
                </Label>
                <Select
                  value={formData.competitionId || "none"}
                  onValueChange={(v) => setFormData({ ...formData, competitionId: v === "none" ? "" : v })}
                >
                  <SelectTrigger className="w-full bg-neutral-900 border-neutral-700 text-white">
                    <SelectValue placeholder="Select Competition or Independent Match" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-neutral-700 text-white">
                    <SelectItem value="none">🤝 Independent / Friendly Match (No Competition)</SelectItem>
                    {competitions.map((c) => (
                      <SelectItem key={c.id} value={c.id}>🏆 {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Outsider Team Form Fields */}
            {matchTypeMode === "outsider" && !editingMatch ? (
              <div className="col-span-full space-y-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                  <div>
                    <p className="text-xs font-bold text-emerald-400">⚽ Club Team: FC BBFF</p>
                    <p className="text-[11px] text-neutral-400">Default FC BBFF team is selected automatically for outsider matches.</p>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">
                    FC BBFF Default
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-white">Outsider / External Team Name *</Label>
                  <Input
                    placeholder="e.g. Abahani Academy, Mohammedan SC, Dhaka Stars FC..."
                    value={outsiderData.outsiderTeamName}
                    onChange={(e) => setOutsiderData({ ...outsiderData, outsiderTeamName: e.target.value })}
                    className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500"
                  />
                  <p className="text-[11px] text-neutral-400">
                    Type the opponent club name. If this team does not exist yet, it will be automatically registered!
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-white">Match Designation</Label>
                  <div className="flex items-center gap-6 pt-1">
                    <label className="flex items-center gap-2 text-xs font-semibold text-white cursor-pointer">
                      <input
                        type="radio"
                        name="homeAway"
                        checked={outsiderData.isFcBbffHome}
                        onChange={() => setOutsiderData({ ...outsiderData, isFcBbffHome: true })}
                        className="accent-emerald-500 h-4 w-4"
                      />
                      FC BBFF is Home Team
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-white cursor-pointer">
                      <input
                        type="radio"
                        name="homeAway"
                        checked={!outsiderData.isFcBbffHome}
                        onChange={() => setOutsiderData({ ...outsiderData, isFcBbffHome: false })}
                        className="accent-emerald-500 h-4 w-4"
                      />
                      FC BBFF is Away Team
                    </label>
                  </div>
                </div>

                {/* FC BBFF Squad Roster Selection from All Registered Club Players */}
                <div className="space-y-2 border-t border-white/10 pt-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-bold text-white flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-emerald-400" /> Select Match Roster from All Club Players ({outsiderData.selectedPlayerIds.length} / {allPlayers.length})
                    </Label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setOutsiderData({ ...outsiderData, selectedPlayerIds: allPlayers.map((p) => p.id) })}
                        className="text-[11px] text-emerald-400 hover:underline font-bold"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => setOutsiderData({ ...outsiderData, selectedPlayerIds: [] })}
                        className="text-[11px] text-neutral-400 hover:underline"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1.5 rounded-xl border border-white/10 bg-neutral-950 p-2">
                    {allPlayers.length === 0 ? (
                      <p className="text-center text-xs text-neutral-500 py-3">No registered players found in club database.</p>
                    ) : (
                      allPlayers.map((player) => {
                        const isChecked = outsiderData.selectedPlayerIds.includes(player.id);
                        return (
                          <label
                            key={player.id}
                            className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                              isChecked
                                ? "bg-emerald-500/20 border border-emerald-500/40 text-white font-semibold"
                                : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:bg-neutral-800"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setOutsiderData({
                                      ...outsiderData,
                                      selectedPlayerIds: [...outsiderData.selectedPlayerIds, player.id],
                                    });
                                  } else {
                                    setOutsiderData({
                                      ...outsiderData,
                                      selectedPlayerIds: outsiderData.selectedPlayerIds.filter((id) => id !== player.id),
                                    });
                                  }
                                }}
                                className="accent-emerald-500 h-4 w-4 rounded"
                              />
                              <span>
                                {player.firstName} {player.lastName}
                              </span>
                            </div>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              {player.jerseyNumber ? `#${player.jerseyNumber}` : ""} {player.position}
                            </span>
                          </label>
                        );
                      })
                    )}
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    Checked players will be registered as the match lineup for FC BBFF.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Home Team *</Label>
                  <Select value={formData.homeTeamId} onValueChange={(v) => setFormData({ ...formData, homeTeamId: v })}>
                    <SelectTrigger className="w-full bg-neutral-900 border-neutral-700 text-white"><SelectValue placeholder="Select home team" /></SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-700 text-white">{teams.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Away Team *</Label>
                  <Select value={formData.awayTeamId} onValueChange={(v) => setFormData({ ...formData, awayTeamId: v })}>
                    <SelectTrigger className="w-full bg-neutral-900 border-neutral-700 text-white"><SelectValue placeholder="Select away team" /></SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-700 text-white">{teams.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label>Date & Time *</Label>
              <Input type="datetime-local" value={formData.matchDate} onChange={(e) => setFormData({ ...formData, matchDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Venue</Label>
              <Input value={formData.venue} onChange={(e) => setFormData({ ...formData, venue: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Season</Label>
              <Select value={formData.seasonId || "none"} onValueChange={(v) => setFormData({ ...formData, seasonId: v === "none" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="Select season" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No season</SelectItem>
                  {seasons.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Match Day</Label>
              <Input type="number" value={formData.matchDay} onChange={(e) => setFormData({ ...formData, matchDay: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Referee</Label>
              <Input value={formData.referee} onChange={(e) => setFormData({ ...formData, referee: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="LIVE">Live</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="POSTPONED">Postponed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-full space-y-2">
              <Label>Notes</Label>
              <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700">
              {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : editingMatch ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Update Match Result
              {selectedMatch && (
                <p className="mt-1 text-sm font-normal text-neutral-500">
                  {selectedMatch.homeTeam?.name} vs {selectedMatch.awayTeam?.name}
                </p>
              )}
            </DialogTitle>
          </DialogHeader>

          {isLoadingMatch ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              <span className="ml-3 text-neutral-500">Loading match data...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Score */}
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500">Score</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{selectedMatch?.homeTeam?.name || "Home"}</Label>
                    <Input type="number" min={0} value={resultData.homeScore} onChange={(e) => setResultData({ ...resultData, homeScore: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-2">
                    <Label>{selectedMatch?.awayTeam?.name || "Away"}</Label>
                    <Input type="number" min={0} value={resultData.awayScore} onChange={(e) => setResultData({ ...resultData, awayScore: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
              </div>

              {/* Match Events */}
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500">
                  Match Events ({matchEvents.length})
                </h3>

                {/* Existing events */}
                {matchEvents.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {matchEvents.map((event: any) => {
                      const meta = EVENT_LABELS[event.eventType] || { label: event.eventType, icon: "📌", color: "bg-neutral-500/20 text-neutral-400" };
                      return (
                        <div key={event.id} className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800/50">
                          <span className="w-10 text-right font-mono text-xs font-bold text-emerald-600">{event.minute}&apos;</span>
                          <Badge variant="secondary" className={`text-xs ${meta.color}`}>
                            {meta.icon} {meta.label}
                          </Badge>
                          <span className="flex-1 text-sm font-medium">
                            {event.player?.firstName} {event.player?.lastName}
                            {event.relatedPlayer && (
                              <span className="ml-1 font-normal text-neutral-500">
                                (assist: {event.relatedPlayer.firstName} {event.relatedPlayer.lastName})
                              </span>
                            )}
                          </span>
                          {event.description && (
                            <span className="text-xs text-neutral-500">{event.description}</span>
                          )}
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600" onClick={() => handleRemoveEvent(event.id)} disabled={isPending}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add new event */}
                <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-4 dark:border-neutral-600 dark:bg-neutral-800/30">
                  <p className="mb-3 text-xs font-semibold uppercase text-neutral-500">Add Event</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="space-y-1">
                      <Label className="text-xs">Type</Label>
                      <Select value={newEvent.eventType} onValueChange={(v) => setNewEvent({ ...newEvent, eventType: v })}>
                        <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GOAL">⚽ Goal</SelectItem>
                          <SelectItem value="ASSIST">🅰️ Assist</SelectItem>
                          <SelectItem value="YELLOW_CARD">🟨 Yellow Card</SelectItem>
                          <SelectItem value="RED_CARD">🟥 Red Card</SelectItem>
                          <SelectItem value="OWN_GOAL">⚽ Own Goal</SelectItem>
                          <SelectItem value="PENALTY">⚽ Penalty</SelectItem>
                          <SelectItem value="PENALTY_MISSED">❌ Penalty Missed</SelectItem>
                          <SelectItem value="SUBSTITUTION">🔄 Substitution</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Player *</Label>
                      <Select value={newEvent.playerId} onValueChange={(v) => setNewEvent({ ...newEvent, playerId: v })}>
                        <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select player" /></SelectTrigger>
                        <SelectContent>
                          {matchPlayers.length > 0 ? (
                            <>
                              {/* Group by team */}
                              {selectedMatch?.homeTeam && (
                                <SelectItem value="__home_header" disabled className="font-bold text-emerald-600">
                                  — {selectedMatch.homeTeam.name} —
                                </SelectItem>
                              )}
                              {matchPlayers.filter((p) => p.teamSide === "home").map((p: any) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.jerseyNumber ? `#${p.jerseyNumber} ` : ""}{p.firstName} {p.lastName}
                                </SelectItem>
                              ))}
                              {selectedMatch?.awayTeam && (
                                <SelectItem value="__away_header" disabled className="font-bold text-blue-600">
                                  — {selectedMatch.awayTeam.name} —
                                </SelectItem>
                              )}
                              {matchPlayers.filter((p) => p.teamSide === "away").map((p: any) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.jerseyNumber ? `#${p.jerseyNumber} ` : ""}{p.firstName} {p.lastName}
                                </SelectItem>
                              ))}
                            </>
                          ) : (
                            <SelectItem value="none" disabled>No players available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Minute *</Label>
                      <Input className="h-9 text-xs" type="number" min={0} max={120} placeholder="e.g. 45" value={newEvent.minute} onChange={(e) => setNewEvent({ ...newEvent, minute: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">
                        {newEvent.eventType === "GOAL" || newEvent.eventType === "PENALTY" ? "Assist by" : newEvent.eventType === "SUBSTITUTION" ? "Replaced by" : "Related Player"}
                      </Label>
                      <Select value={newEvent.relatedPlayerId || "NONE"} onValueChange={(v) => setNewEvent({ ...newEvent, relatedPlayerId: v === "NONE" ? "" : v })}>
                        <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Optional" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NONE">None</SelectItem>
                          {matchPlayers.map((p: any) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.jerseyNumber ? `#${p.jerseyNumber} ` : ""}{p.firstName} {p.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-3 flex items-end gap-3">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">Note (optional)</Label>
                      <Input className="h-9 text-xs" placeholder="e.g. Header from corner" value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} />
                    </div>
                    <Button size="sm" onClick={handleAddEvent} disabled={isPending || !newEvent.playerId || !newEvent.minute} className="h-9 bg-emerald-600 hover:bg-emerald-700">
                      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="mr-1 h-4 w-4" />}
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              {/* Player of the Match */}
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500">⭐ Player of the Match</h3>
                <Select value={resultData.playerOfMatchId || "NONE"} onValueChange={(v) => setResultData({ ...resultData, playerOfMatchId: v === "NONE" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="Select player" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">No selection</SelectItem>
                    {matchPlayers.length > 0 ? (
                      <>
                        {selectedMatch?.homeTeam && (
                          <SelectItem value="__potm_home" disabled className="font-bold text-emerald-600">
                            — {selectedMatch.homeTeam.name} —
                          </SelectItem>
                        )}
                        {matchPlayers.filter((p) => p.teamSide === "home").map((p: any) => (
                          <SelectItem key={`potm-${p.id}`} value={p.id}>
                            {p.jerseyNumber ? `#${p.jerseyNumber} ` : ""}{p.firstName} {p.lastName}
                          </SelectItem>
                        ))}
                        {selectedMatch?.awayTeam && (
                          <SelectItem value="__potm_away" disabled className="font-bold text-blue-600">
                            — {selectedMatch.awayTeam.name} —
                          </SelectItem>
                        )}
                        {matchPlayers.filter((p) => p.teamSide === "away").map((p: any) => (
                          <SelectItem key={`potm-${p.id}`} value={p.id}>
                            {p.jerseyNumber ? `#${p.jerseyNumber} ` : ""}{p.firstName} {p.lastName}
                          </SelectItem>
                        ))}
                      </>
                    ) : null}
                  </SelectContent>
                </Select>
              </div>

              {/* Match Report */}
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500">Match Report</h3>
                <Textarea value={resultData.matchReport || ""} onChange={(e) => setResultData({ ...resultData, matchReport: e.target.value })} rows={4} placeholder="Write a match report..." />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResultDialog(false)}>Cancel</Button>
            <Button onClick={handleResult} disabled={isPending || isLoadingMatch} className="bg-emerald-600 hover:bg-emerald-700">
              {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Publishing...</> : "Publish Result"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Match</AlertDialogTitle>
            <AlertDialogDescription>Are you sure? This will permanently delete this match and all associated data.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
