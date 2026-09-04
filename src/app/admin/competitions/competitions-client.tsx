"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createCompetition,
  updateCompetition,
  deleteCompetition,
  addTeamToCompetition,
  removeTeamFromCompetition,
  setCompetitionTeams,
} from "@/actions/competition-actions";
import { createMatch } from "@/actions/match-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Trophy, Calendar, Shield, X, Users, Loader2, Swords } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Competition, Season, Team, PaginatedResponse } from "@/types";

export function CompetitionsClient({
  initialData,
  seasons,
  teams,
}: {
  initialData: PaginatedResponse<Competition>;
  seasons: Season[];
  teams: Team[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teamsDialogOpen, setTeamsDialogOpen] = useState(false);
  const [createMatchDialogOpen, setCreateMatchDialogOpen] = useState(false);

  const [selectedComp, setSelectedComp] = useState<Competition | null>(null);
  const [managingComp, setManagingComp] = useState<any>(null);
  const [targetCompForMatch, setTargetCompForMatch] = useState<any>(null);
  const [selectedTeamToAdd, setSelectedTeamToAdd] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    seasonId: seasons[0]?.id || "",
    status: "ONGOING" as "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED",
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });

  const [matchFormData, setMatchFormData] = useState({
    homeTeamId: "",
    awayTeamId: "",
    matchDate: new Date().toISOString().slice(0, 16),
    venue: "",
    seasonId: "",
    matchDay: "",
    referee: "",
    notes: "",
    status: "SCHEDULED",
  });

  const handleOpenCreate = () => {
    setSelectedComp(null);
    setFormData({
      name: "",
      description: "",
      seasonId: seasons[0]?.id || "",
      status: "ONGOING",
      pointsForWin: 3,
      pointsForDraw: 1,
      pointsForLoss: 0,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (comp: Competition) => {
    setSelectedComp(comp);
    setFormData({
      name: comp.name,
      description: comp.description || "",
      seasonId: comp.seasonId || seasons[0]?.id || "",
      status: comp.status,
      pointsForWin: comp.pointsForWin,
      pointsForDraw: comp.pointsForDraw,
      pointsForLoss: comp.pointsForLoss,
      startDate: comp.startDate
        ? new Date(comp.startDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      endDate: comp.endDate
        ? new Date(comp.endDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    });
    setDialogOpen(true);
  };

  const handleOpenTeams = (comp: Competition) => {
    setManagingComp(comp);
    setSelectedTeamToAdd("");
    setTeamsDialogOpen(true);
  };

  const handleOpenCreateMatch = (comp: Competition) => {
    setTargetCompForMatch(comp);
    setMatchFormData({
      homeTeamId: "",
      awayTeamId: "",
      matchDate: new Date().toISOString().slice(0, 16),
      venue: "",
      seasonId: comp.seasonId || "",
      matchDay: "",
      referee: "",
      notes: "",
      status: "SCHEDULED",
    });
    setCreateMatchDialogOpen(true);
  };

  const handleCreateMatchSubmit = async () => {
    if (!matchFormData.homeTeamId || !matchFormData.awayTeamId) {
      toast.error("Please select both Home and Away teams");
      return;
    }
    if (matchFormData.homeTeamId === matchFormData.awayTeamId) {
      toast.error("Home and Away teams must be different");
      return;
    }

    startTransition(async () => {
      const payload = {
        ...matchFormData,
        competitionId: targetCompForMatch?.id || null,
        matchDay: matchFormData.matchDay ? parseInt(matchFormData.matchDay) : null,
      };

      const result = await createMatch(payload);
      if (result.success) {
        toast.success(`Match created for ${targetCompForMatch?.name}!`);
        setCreateMatchDialogOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create match");
      }
    });
  };

  const handleAddTeam = async () => {
    if (!selectedTeamToAdd || !managingComp) return;
    startTransition(async () => {
      const res = await addTeamToCompetition(managingComp.id, selectedTeamToAdd);
      if (res.success) {
        toast.success("Team added to competition!");
        setManagingComp({
          ...managingComp,
          competitionTeams: [
            ...(managingComp.competitionTeams || []),
            { teamId: selectedTeamToAdd, team: teams.find((t) => t.id === selectedTeamToAdd) },
          ],
        });
        setSelectedTeamToAdd("");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to add team");
      }
    });
  };

  const handleRemoveTeam = async (teamId: string) => {
    if (!managingComp) return;
    startTransition(async () => {
      const res = await removeTeamFromCompetition(managingComp.id, teamId);
      if (res.success) {
        toast.success("Team removed from competition!");
        setManagingComp({
          ...managingComp,
          competitionTeams: (managingComp.competitionTeams || []).filter(
            (ct: any) => ct.teamId !== teamId
          ),
        });
        router.refresh();
      } else {
        toast.error(res.error || "Failed to remove team");
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Competition name is required");
      return;
    }

    startTransition(async () => {
      let result;
      if (selectedComp) {
        result = await updateCompetition(selectedComp.id, formData);
      } else {
        result = await createCompetition(formData);
      }

      if (result.success) {
        toast.success(selectedComp ? "Competition updated!" : "Competition created!");
        setDialogOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Something went wrong");
      }
    });
  };

  const handleDelete = async () => {
    if (!selectedComp) return;
    startTransition(async () => {
      const result = await deleteCompetition(selectedComp.id);
      if (result.success) {
        toast.success("Competition deleted!");
        setDeleteDialogOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete competition");
      }
    });
  };

  // List of teams not yet enrolled in managingComp (Internal teams only)
  const enrolledTeamIds = new Set(
    (managingComp?.competitionTeams || []).map((ct: any) => ct.teamId)
  );
  const availableTeams = teams.filter((t) => !t.isExternal && !enrolledTeamIds.has(t.id));

  // Internal teams enrolled in targetCompForMatch (fall back to all internal teams if < 2)
  const internalTeams = teams.filter((t) => !t.isExternal);
  const compEnrolledTeams = (targetCompForMatch?.competitionTeams || [])
    .map((ct: any) => ct.team)
    .filter((t: any) => t && !t.isExternal);
  const compTeams = compEnrolledTeams.length >= 2 ? compEnrolledTeams : internalTeams;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Competitions & Tournaments
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Manage leagues, cups, points rules, participating teams, and competition fixtures.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-emerald-600 hover:bg-emerald-500">
          <Plus className="mr-2 h-4 w-4" /> Create Competition
        </Button>
      </div>

      {/* Table */}
      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Competition Name</TableHead>
                <TableHead>Season</TableHead>
                <TableHead>Teams</TableHead>
                <TableHead>Points (W/D/L)</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialData.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-neutral-500">
                    <Trophy className="mx-auto mb-2 h-8 w-8 text-neutral-400" />
                    No competitions found
                  </TableCell>
                </TableRow>
              ) : (
                initialData.data.map((comp: any) => {
                  const teamCount = comp.competitionTeams?.length ?? comp._count?.competitionTeams ?? 0;
                  return (
                    <TableRow key={comp.id}>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white">{comp.name}</p>
                          {comp.description && (
                            <p className="text-xs text-neutral-500 line-clamp-1 max-w-md">{comp.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {comp.season?.name || "Current"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenTeams(comp)}
                          className="h-7 text-xs gap-1.5 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                        >
                          <Shield className="h-3.5 w-3.5" />
                          <span>{teamCount} Teams</span>
                        </Button>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {comp.pointsForWin} / {comp.pointsForDraw} / {comp.pointsForLoss}
                      </TableCell>
                      <TableCell className="text-xs text-neutral-500">
                        {comp.startDate ? formatDate(comp.startDate) : "TBD"} -{" "}
                        {comp.endDate ? formatDate(comp.endDate) : "TBD"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            comp.status === "ONGOING"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-neutral-800 text-neutral-400"
                          }
                        >
                          {comp.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Create Match for Competition Quick Action */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenCreateMatch(comp)}
                            title="Create Match Fixture for Competition"
                            className="h-8 px-2.5 text-xs gap-1 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/15"
                          >
                            <Swords className="h-3.5 w-3.5" />
                            <span>Add Match</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenTeams(comp)}
                            title="Manage Enrolled Teams"
                            className="h-8 px-2 text-xs"
                          >
                            <Users className="h-4 w-4 mr-1 text-emerald-500" /> Teams
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(comp)} title="Edit Competition">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedComp(comp);
                              setDeleteDialogOpen(true);
                            }}
                            title="Delete Competition"
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Manage Teams Dialog */}
      <Dialog open={teamsDialogOpen} onOpenChange={setTeamsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-500" />
              Participating Teams — {managingComp?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Add Team */}
            <div className="flex gap-2">
              <Select value={selectedTeamToAdd} onValueChange={setSelectedTeamToAdd}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Add team to competition..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTeams.length === 0 ? (
                    <SelectItem value="_empty" disabled>
                      All active teams already added
                    </SelectItem>
                  ) : (
                    availableTeams.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAddTeam}
                disabled={!selectedTeamToAdd || isPending}
                className="bg-emerald-600 hover:bg-emerald-500"
              >
                Add
              </Button>
            </div>

            {/* List Enrolled Teams */}
            <div className="space-y-2 max-h-60 overflow-y-auto border-t border-neutral-800 pt-3">
              {(managingComp?.competitionTeams || []).length === 0 ? (
                <p className="text-center text-xs text-neutral-500 py-4">
                  No teams assigned to this competition yet.
                </p>
              ) : (
                managingComp?.competitionTeams?.map((ct: any) => (
                  <div
                    key={ct.teamId}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-sm"
                  >
                    <span className="font-medium text-white">{ct.team?.name || "Team"}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveTeam(ct.teamId)}
                      className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-950/40"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTeamsDialogOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Match for Competition Dialog */}
      <Dialog open={createMatchDialogOpen} onOpenChange={setCreateMatchDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-400">
              <Swords className="h-5 w-5" /> Add Match Fixture for &quot;{targetCompForMatch?.name}&quot;
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 py-2">
            <div className="space-y-2">
              <Label>Home Team *</Label>
              <Select
                value={matchFormData.homeTeamId}
                onValueChange={(v) => setMatchFormData({ ...matchFormData, homeTeamId: v })}
              >
                <SelectTrigger><SelectValue placeholder="Select home team" /></SelectTrigger>
                <SelectContent>
                  {compTeams.map((t: any) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Away Team *</Label>
              <Select
                value={matchFormData.awayTeamId}
                onValueChange={(v) => setMatchFormData({ ...matchFormData, awayTeamId: v })}
              >
                <SelectTrigger><SelectValue placeholder="Select away team" /></SelectTrigger>
                <SelectContent>
                  {compTeams.map((t: any) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date & Time *</Label>
              <Input
                type="datetime-local"
                value={matchFormData.matchDate}
                onChange={(e) => setMatchFormData({ ...matchFormData, matchDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Venue</Label>
              <Input
                placeholder="e.g. Bangabandhu National Stadium"
                value={matchFormData.venue}
                onChange={(e) => setMatchFormData({ ...matchFormData, venue: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Match Day / Round</Label>
              <Input
                type="number"
                placeholder="e.g. 1"
                value={matchFormData.matchDay}
                onChange={(e) => setMatchFormData({ ...matchFormData, matchDay: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Referee</Label>
              <Input
                placeholder="Referee name"
                value={matchFormData.referee}
                onChange={(e) => setMatchFormData({ ...matchFormData, referee: e.target.value })}
              />
            </div>

            <div className="col-span-full space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Fixture notes..."
                value={matchFormData.notes}
                onChange={(e) => setMatchFormData({ ...matchFormData, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateMatchDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateMatchSubmit} disabled={isPending} className="bg-emerald-600 hover:bg-emerald-500">
              {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating Fixture...</> : "Create Match"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create / Edit Competition Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedComp ? "Edit Competition" : "Create New Competition"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Competition Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Premier Division League 2026"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seasonId">Season</Label>
                <Select
                  value={formData.seasonId}
                  onValueChange={(v) => setFormData({ ...formData, seasonId: v })}
                >
                  <SelectTrigger id="seasonId">
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent>
                    {seasons.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v: any) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UPCOMING">Upcoming</SelectItem>
                    <SelectItem value="ONGOING">Ongoing</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Points Rules */}
            <div className="grid grid-cols-3 gap-3 border-t border-neutral-800 pt-3">
              <div className="space-y-1">
                <Label htmlFor="pointsWin" className="text-xs">
                  Win Points
                </Label>
                <Input
                  id="pointsWin"
                  type="number"
                  value={formData.pointsForWin}
                  onChange={(e) =>
                    setFormData({ ...formData, pointsForWin: Number(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="pointsDraw" className="text-xs">
                  Draw Points
                </Label>
                <Input
                  id="pointsDraw"
                  type="number"
                  value={formData.pointsForDraw}
                  onChange={(e) =>
                    setFormData({ ...formData, pointsForDraw: Number(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="pointsLoss" className="text-xs">
                  Loss Points
                </Label>
                <Input
                  id="pointsLoss"
                  type="number"
                  value={formData.pointsForLoss}
                  onChange={(e) =>
                    setFormData({ ...formData, pointsForLoss: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="Details about this tournament, format, rules..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-500">
                {isPending ? "Saving..." : selectedComp ? "Update Competition" : "Create Competition"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Competition</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedComp?.name}&quot;? All associated league table records will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
