"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createMatch, updateMatch, deleteMatch, updateMatchResult, addMatchEvent } from "@/actions/match-actions";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, Loader2, Swords, Trophy,
} from "lucide-react";
import { formatDateTime, getMatchStatusColor } from "@/lib/utils";
import type { PaginatedResponse, Match, Season } from "@/types";
import type { Team } from "@prisma/client";

export function MatchesClient({
  initialData, teams, seasons, currentPage, currentStatus, currentSearch,
}: {
  initialData: PaginatedResponse<Match>;
  teams: Team[];
  seasons: Season[];
  currentPage: number;
  currentStatus: string;
  currentSearch: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDialog, setShowDialog] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [formData, setFormData] = useState({
    homeTeamId: "", awayTeamId: "", matchDate: "", venue: "", seasonId: "",
    competitionId: "", matchDay: "", referee: "", status: "SCHEDULED", notes: "",
  });
  const [resultData, setResultData] = useState({
    homeScore: 0, awayScore: 0, playerOfMatchId: "", matchReport: "", status: "COMPLETED" as const,
  });

  function openCreate() {
    setEditingMatch(null);
    setFormData({
      homeTeamId: "", awayTeamId: "", matchDate: "", venue: "", seasonId: "",
      competitionId: "", matchDay: "", referee: "", status: "SCHEDULED", notes: "",
    });
    setShowDialog(true);
  }

  function openEdit(match: any) {
    setEditingMatch(match);
    setFormData({
      homeTeamId: match.homeTeamId, awayTeamId: match.awayTeamId,
      matchDate: new Date(match.matchDate).toISOString().slice(0, 16),
      venue: match.venue || "", seasonId: match.seasonId || "",
      competitionId: match.competitionId || "", matchDay: match.matchDay?.toString() || "",
      referee: match.referee || "", status: match.status, notes: match.notes || "",
    });
    setShowDialog(true);
  }

  function openResult(match: any) {
    setSelectedMatch(match);
    setResultData({
      homeScore: match.homeScore || 0, awayScore: match.awayScore || 0,
      playerOfMatchId: match.playerOfMatchId || "", matchReport: match.matchReport || "",
      status: "COMPLETED",
    });
    setShowResultDialog(true);
  }

  async function handleSubmit() {
    startTransition(async () => {
      const data = {
        ...formData,
        matchDay: formData.matchDay ? parseInt(formData.matchDay) : null,
        competitionId: formData.competitionId || null,
        seasonId: formData.seasonId || null,
      };
      const result = editingMatch
        ? await updateMatch(editingMatch.id, data)
        : await createMatch(data);
      if (result.success) {
        toast.success(editingMatch ? "Match updated" : "Match created");
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
          <Select value={currentStatus || "all"} onValueChange={(v) => {
            const p = new URLSearchParams();
            if (v !== "all") p.set("status", v);
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
                      <p className="text-xs text-neutral-500">{match.competition?.name || "Friendly"}</p>
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Home Team *</Label>
              <Select value={formData.homeTeamId} onValueChange={(v) => setFormData({ ...formData, homeTeamId: v })}>
                <SelectTrigger><SelectValue placeholder="Select team" /></SelectTrigger>
                <SelectContent>{teams.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Away Team *</Label>
              <Select value={formData.awayTeamId} onValueChange={(v) => setFormData({ ...formData, awayTeamId: v })}>
                <SelectTrigger><SelectValue placeholder="Select team" /></SelectTrigger>
                <SelectContent>{teams.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
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

      {/* Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent>
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
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{selectedMatch?.homeTeam?.name || "Home"} Score</Label>
                <Input type="number" min={0} value={resultData.homeScore} onChange={(e) => setResultData({ ...resultData, homeScore: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>{selectedMatch?.awayTeam?.name || "Away"} Score</Label>
                <Input type="number" min={0} value={resultData.awayScore} onChange={(e) => setResultData({ ...resultData, awayScore: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Match Report</Label>
              <Textarea value={resultData.matchReport || ""} onChange={(e) => setResultData({ ...resultData, matchReport: e.target.value })} rows={4} placeholder="Write a match report..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResultDialog(false)}>Cancel</Button>
            <Button onClick={handleResult} disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700">
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
