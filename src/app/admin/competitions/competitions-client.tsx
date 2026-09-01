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
import { Plus, Edit, Trash2, Trophy, Calendar, Shield, X, Users, Loader2 } from "lucide-react";
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
  const [selectedComp, setSelectedComp] = useState<Competition | null>(null);
  const [managingComp, setManagingComp] = useState<any>(null);
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
      seasonId: comp.seasonId,
      status: comp.status as "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED",
      pointsForWin: comp.pointsForWin,
      pointsForDraw: comp.pointsForDraw,
      pointsForLoss: comp.pointsForLoss,
      startDate: comp.startDate ? new Date(comp.startDate).toISOString().split("T")[0] : "",
      endDate: comp.endDate ? new Date(comp.endDate).toISOString().split("T")[0] : "",
    });
    setDialogOpen(true);
  };

  const handleOpenTeams = (comp: any) => {
    setManagingComp(comp);
    setSelectedTeamToAdd("");
    setTeamsDialogOpen(true);
  };

  const handleAddTeam = (teamId: string) => {
    if (!managingComp || !teamId) return;
    startTransition(async () => {
      const result = await addTeamToCompetition(managingComp.id, teamId);
      if (result.success) {
        toast.success("Team added to competition!");
        setSelectedTeamToAdd("");
        // Update local state
        const addedTeam = teams.find((t) => t.id === teamId);
        if (addedTeam) {
          const updatedTeams = [
            ...(managingComp.competitionTeams || []),
            { competitionId: managingComp.id, teamId, team: addedTeam },
          ];
          setManagingComp({
            ...managingComp,
            competitionTeams: updatedTeams,
            _count: {
              ...managingComp._count,
              competitionTeams: updatedTeams.length,
            },
          });
        }
        router.refresh();
      } else {
        toast.error(result.error || "Failed to add team");
      }
    });
  };

  const handleRemoveTeam = (teamId: string) => {
    if (!managingComp || !teamId) return;
    startTransition(async () => {
      const result = await removeTeamFromCompetition(managingComp.id, teamId);
      if (result.success) {
        toast.success("Team removed from competition!");
        const updatedTeams = (managingComp.competitionTeams || []).filter(
          (ct: any) => ct.teamId !== teamId
        );
        setManagingComp({
          ...managingComp,
          competitionTeams: updatedTeams,
          _count: {
            ...managingComp._count,
            competitionTeams: updatedTeams.length,
          },
        });
        router.refresh();
      } else {
        toast.error(result.error || "Failed to remove team");
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = selectedComp
        ? await updateCompetition(selectedComp.id, formData)
        : await createCompetition(formData);

      if (result.success) {
        toast.success(selectedComp ? "Competition updated!" : "Competition created!");
        setDialogOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to save competition");
      }
    });
  };

  const handleDelete = () => {
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

  // List of teams not yet enrolled in managingComp
  const enrolledTeamIds = new Set(
    (managingComp?.competitionTeams || []).map((ct: any) => ct.teamId)
  );
  const availableTeams = teams.filter((t) => !enrolledTeamIds.has(t.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Competitions & Tournaments
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Manage leagues, cups, points rules, and participating teams.
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
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenTeams(comp)}
                            title="Manage Teams"
                            className="h-8 px-2 text-xs"
                          >
                            <Users className="h-4 w-4 mr-1 text-emerald-500" /> Teams
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(comp)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedComp(comp);
                              setDeleteDialogOpen(true);
                            }}
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

      {/* Manage Teams in Competition Dialog */}
      <Dialog open={teamsDialogOpen} onOpenChange={setTeamsDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-500" />
              Manage Teams: {managingComp?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Add Team Dropdown */}
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50 space-y-3">
              <Label className="text-xs font-semibold uppercase text-neutral-500">
                Add Team to this Competition
              </Label>
              <div className="flex gap-2">
                <Select
                  value={selectedTeamToAdd}
                  onValueChange={setSelectedTeamToAdd}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={availableTeams.length > 0 ? "Select a team to add..." : "All teams already added"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTeams.length === 0 ? (
                      <SelectItem value="none" disabled>No remaining teams to add</SelectItem>
                    ) : (
                      availableTeams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => selectedTeamToAdd && handleAddTeam(selectedTeamToAdd)}
                  disabled={isPending || !selectedTeamToAdd}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                  Add
                </Button>
              </div>
            </div>

            {/* Participating Teams List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
                  Participating Teams ({(managingComp?.competitionTeams || []).length})
                </h3>
              </div>

              {(managingComp?.competitionTeams || []).length === 0 ? (
                <div className="rounded-xl border border-dashed border-neutral-200 p-8 text-center text-neutral-500 dark:border-neutral-800">
                  <Shield className="mx-auto mb-2 h-8 w-8 text-neutral-400 opacity-50" />
                  <p className="text-sm font-medium">No teams added yet</p>
                  <p className="text-xs text-neutral-400 mt-1">Select a team above to register them in this competition.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {(managingComp?.competitionTeams || []).map((ct: any) => (
                    <div
                      key={ct.teamId}
                      className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 font-bold text-emerald-400 text-sm">
                          {ct.team?.name?.charAt(0) || "T"}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-neutral-900 dark:text-white">
                            {ct.team?.name}
                          </p>
                          <p className="text-xs text-neutral-500">
                            Status: <span className="text-emerald-500">{ct.team?.status || "ACTIVE"}</span>
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTeam(ct.teamId)}
                        disabled={isPending}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10 h-8 px-2"
                        title="Remove team from competition"
                      >
                        <X className="h-4 w-4 mr-1" />
                        <span className="text-xs">Remove</span>
                      </Button>
                    </div>
                  ))}
                </div>
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{selectedComp ? "Edit Competition" : "Create Competition"}</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="name">Competition Name *</Label>
                <Input
                  id="name"
                  required
                  placeholder="e.g. BBFF Premier League"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="season">Season *</Label>
                  <Select
                    value={formData.seasonId}
                    onValueChange={(v) => setFormData({ ...formData, seasonId: v })}
                  >
                    <SelectTrigger id="season">
                      <SelectValue placeholder="Select Season" />
                    </SelectTrigger>
                    <SelectContent>
                      {seasons.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} {s.isCurrent ? "(Current)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED") =>
                      setFormData({ ...formData, status: v })
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ONGOING">Ongoing</SelectItem>
                      <SelectItem value="UPCOMING">Upcoming</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="pointsForWin">Pts for Win</Label>
                  <Input
                    id="pointsForWin"
                    type="number"
                    value={formData.pointsForWin}
                    onChange={(e) =>
                      setFormData({ ...formData, pointsForWin: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="pointsForDraw">Pts for Draw</Label>
                  <Input
                    id="pointsForDraw"
                    type="number"
                    value={formData.pointsForDraw}
                    onChange={(e) =>
                      setFormData({ ...formData, pointsForDraw: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="pointsForLoss">Pts for Loss</Label>
                  <Input
                    id="pointsForLoss"
                    type="number"
                    value={formData.pointsForLoss}
                    onChange={(e) =>
                      setFormData({ ...formData, pointsForLoss: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  placeholder="Details about this tournament, format, rules..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
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
