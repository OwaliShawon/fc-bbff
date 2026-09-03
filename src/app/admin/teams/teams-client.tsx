"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createTeam,
  updateTeam,
  deleteTeam,
  addPlayerToTeam,
  removePlayerFromTeam,
  togglePlayerCaptain,
  togglePlayerViceCaptain,
  getTeamSquad,
} from "@/actions/team-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  UsersRound,
  Crown,
  Shield,
  UserPlus,
  UserMinus,
  UserCircle,
} from "lucide-react";
import { getPlayerPositionColor } from "@/lib/utils";
import type { PaginatedResponse, Team } from "@/types";

export function TeamsClient({
  initialData,
  allPlayers,
  currentPage,
  currentSearch,
  currentStatus,
}: {
  initialData: PaginatedResponse<Team>;
  allPlayers: any[];
  currentPage: number;
  currentSearch: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logoUrl: "",
    manager: "",
    contactPersonName: "",
    contactNumber: "",
    facebookUrl: "",
    isExternal: false,
    status: "ACTIVE",
  });

  // Squad Management State
  const [showSquadDialog, setShowSquadDialog] = useState(false);
  const [activeSquadTeam, setActiveSquadTeam] = useState<any | null>(null);
  const [squadList, setSquadList] = useState<any[]>([]);
  const [selectedPlayerToAdd, setSelectedPlayerToAdd] = useState<string>("NONE");
  const [isCaptainToAdd, setIsCaptainToAdd] = useState(false);
  const [isViceCaptainToAdd, setIsViceCaptainToAdd] = useState(false);
  const [isSquadLoading, setIsSquadLoading] = useState(false);

  function openCreate() {
    setEditingTeam(null);
    setFormData({
      name: "",
      description: "",
      logoUrl: "",
      manager: "",
      contactPersonName: "",
      contactNumber: "",
      facebookUrl: "",
      isExternal: false,
      status: "ACTIVE",
    });
    setShowDialog(true);
  }

  function openEdit(team: Team) {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      description: team.description || "",
      logoUrl: team.logoUrl || "",
      manager: team.manager || "",
      contactPersonName: (team as any).contactPersonName || "",
      contactNumber: (team as any).contactNumber || "",
      facebookUrl: (team as any).facebookUrl || "",
      isExternal: (team as any).isExternal || false,
      status: team.status,
    });
    setShowDialog(true);
  }

  async function openSquad(team: any) {
    setActiveSquadTeam(team);
    setSelectedPlayerToAdd("NONE");
    setIsCaptainToAdd(false);
    setIsViceCaptainToAdd(false);
    setShowSquadDialog(true);
    setIsSquadLoading(true);

    try {
      const squad = await getTeamSquad(team.id);
      setSquadList(squad);
    } catch (err) {
      toast.error("Failed to load squad members");
    } finally {
      setIsSquadLoading(false);
    }
  }

  async function handleAddPlayerToSquad() {
    if (!activeSquadTeam || selectedPlayerToAdd === "NONE") return;

    startTransition(async () => {
      const result = await addPlayerToTeam(activeSquadTeam.id, selectedPlayerToAdd, {
        isCaptain: isCaptainToAdd,
        isViceCaptain: isViceCaptainToAdd,
      });

      if (result.success) {
        toast.success("Player assigned to squad successfully");
        setSelectedPlayerToAdd("NONE");
        setIsCaptainToAdd(false);
        setIsViceCaptainToAdd(false);

        // Refresh squad list
        const updated = await getTeamSquad(activeSquadTeam.id);
        setSquadList(updated);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to assign player");
      }
    });
  }

  async function handleRemovePlayerFromSquad(playerId: string) {
    if (!activeSquadTeam) return;

    startTransition(async () => {
      const result = await removePlayerFromTeam(activeSquadTeam.id, playerId);
      if (result.success) {
        toast.success("Player removed from squad");
        const updated = await getTeamSquad(activeSquadTeam.id);
        setSquadList(updated);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to remove player");
      }
    });
  }

  async function handleToggleCaptain(playerId: string, currentStatus: boolean) {
    if (!activeSquadTeam) return;

    startTransition(async () => {
      const result = await togglePlayerCaptain(activeSquadTeam.id, playerId, !currentStatus);
      if (result.success) {
        toast.success(!currentStatus ? "Player promoted to Captain" : "Captain status removed");
        const updated = await getTeamSquad(activeSquadTeam.id);
        setSquadList(updated);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update captain status");
      }
    });
  }

  async function handleToggleViceCaptain(playerId: string, currentStatus: boolean) {
    if (!activeSquadTeam) return;

    startTransition(async () => {
      const result = await togglePlayerViceCaptain(activeSquadTeam.id, playerId, !currentStatus);
      if (result.success) {
        toast.success(!currentStatus ? "Player promoted to Vice-Captain" : "Vice-Captain status removed");
        const updated = await getTeamSquad(activeSquadTeam.id);
        setSquadList(updated);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update vice-captain status");
      }
    });
  }

  async function handleSubmit() {
    startTransition(async () => {
      const result = editingTeam
        ? await updateTeam(editingTeam.id, formData)
        : await createTeam(formData);
      if (result.success) {
        toast.success(editingTeam ? "Team updated" : "Team created");
        setShowDialog(false);
        router.refresh();
      } else {
        toast.error(result.error || "Something went wrong");
      }
    });
  }

  async function handleDelete() {
    if (!deletingId) return;
    startTransition(async () => {
      const result = await deleteTeam(deletingId);
      if (result.success) {
        toast.success("Team deleted");
        setShowDeleteDialog(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchInput) params.set("search", searchInput);
    if (currentStatus) params.set("status", currentStatus);
    router.push(`/admin/teams?${params.toString()}`);
  }

  // Players available to add (exclude players already in this squad)
  const squadPlayerIds = new Set(squadList.map((s) => s.playerId));
  const availablePlayersToAdd = (allPlayers || []).filter(
    (p) => !squadPlayerIds.has(p.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Teams & Squads</h1>
          <p className="text-neutral-500">Manage club teams and assign players to squads ({initialData.total} teams)</p>
        </div>
        <Button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" /> Add Team
        </Button>
      </div>

      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="flex gap-4 p-4">
          <form onSubmit={handleSearch} className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                placeholder="Search teams..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team Name</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Squad Members</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialData.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-neutral-500">
                    <UsersRound className="mx-auto mb-2 h-8 w-8 text-neutral-300" />
                    No teams found
                  </TableCell>
                </TableRow>
              ) : (
                initialData.data.map((team: any) => (
                  <TableRow key={team.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {team.logoUrl ? (
                          <img
                            src={team.logoUrl}
                            alt={team.name}
                            className="h-9 w-9 rounded-lg object-cover border border-neutral-200 dark:border-neutral-800"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-700 dark:bg-emerald-900/30">
                            {team.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{team.name}</p>
                            {team.isExternal ? (
                              <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-500 bg-amber-500/10 font-bold">
                                Outsider Team
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-500 bg-emerald-500/10 font-bold">
                                FC BBFF Squad
                              </Badge>
                            )}
                          </div>
                          <p className="max-w-[300px] truncate text-xs text-neutral-500">{team.description || "—"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-neutral-200">{team.manager || "—"}</p>
                        {team.contactPersonName && (
                          <p className="text-xs text-neutral-500">
                            Contact: <span className="text-emerald-400 font-semibold">{team.contactPersonName}</span>
                            {team.contactNumber ? ` (${team.contactNumber})` : ""}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="gap-1 font-medium">
                        <UsersRound className="h-3 w-3 text-emerald-600" />
                        {team._count?.teamPlayers || 0} players
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={team.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : ""}>
                        {team.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openSquad(team)}
                          className="h-8 gap-1.5 border-emerald-500/30 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50 text-xs font-semibold"
                        >
                          <UsersRound className="h-3.5 w-3.5" />
                          Manage Squad
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(team)}
                          className="h-8 w-8 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                          title="Edit Team"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeletingId(team.id);
                            setShowDeleteDialog(true);
                          }}
                          className="h-8 w-8 text-red-500 hover:text-red-700"
                          title="Delete Team"
                        >
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
          <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
            <p className="text-sm text-neutral-500">
              Page {initialData.page} of {initialData.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => router.push(`/admin/teams?page=${currentPage - 1}`)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= initialData.totalPages}
                onClick={() => router.push(`/admin/teams?page=${currentPage + 1}`)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* SQUAD / ROSTER MANAGEMENT DIALOG                                         */}
      {/* ========================================================================= */}
      <Dialog open={showSquadDialog} onOpenChange={setShowSquadDialog}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-lg font-bold text-emerald-700 dark:bg-emerald-900/30">
                {activeSquadTeam?.name?.charAt(0)}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">
                  {activeSquadTeam?.name} — Squad Roster
                </DialogTitle>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Assign players to this team, appoint captains, or transfer squad members
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 pt-2">
            {/* Quick Add Player Section */}
            <div className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-4 dark:border-neutral-800 dark:bg-neutral-900/50">
              <div className="mb-3">
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-emerald-600" /> Assign Player to Squad
                </h4>
                <p className="text-xs text-neutral-500">
                  Select an available player or transfer a player from another team
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-end">
                <div className="sm:col-span-6 space-y-1.5">
                  <Label className="text-xs">Select Player</Label>
                  <Select
                    value={selectedPlayerToAdd}
                    onValueChange={setSelectedPlayerToAdd}
                  >
                    <SelectTrigger className="bg-white dark:bg-neutral-950">
                      <SelectValue placeholder="Choose a player..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      <SelectItem value="NONE" disabled>
                        Choose a player to add...
                      </SelectItem>
                      {availablePlayersToAdd.map((p) => {
                        const currentTeamName = p.teamPlayers?.[0]?.team?.name;
                        return (
                          <SelectItem key={p.id} value={p.id}>
                            <div className="flex items-center gap-2">
                              <span>#{p.jerseyNumber ?? "—"}</span>
                              <span className="font-medium">{p.firstName} {p.lastName}</span>
                              <span className="text-[11px] text-neutral-400">({p.position})</span>
                              {currentTeamName ? (
                                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                                  [Currently: {currentTeamName}]
                                </span>
                              ) : (
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                                  [Free Agent]
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="sm:col-span-3 flex flex-col gap-2 pb-1">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="squadCaptain"
                      checked={isCaptainToAdd}
                      onCheckedChange={(checked) => {
                        setIsCaptainToAdd(checked === true);
                        if (checked === true) setIsViceCaptainToAdd(false);
                      }}
                    />
                    <Label htmlFor="squadCaptain" className="cursor-pointer text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                      👑 Captain
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="squadViceCaptain"
                      checked={isViceCaptainToAdd}
                      onCheckedChange={(checked) => {
                        setIsViceCaptainToAdd(checked === true);
                        if (checked === true) setIsCaptainToAdd(false);
                      }}
                    />
                    <Label htmlFor="squadViceCaptain" className="cursor-pointer text-xs font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-1">
                      🛡️ Vice-Captain
                    </Label>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <Button
                    onClick={handleAddPlayerToSquad}
                    disabled={isPending || selectedPlayerToAdd === "NONE"}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                        Assign Player
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Current Squad Members Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                  <UsersRound className="h-4 w-4 text-emerald-600" /> Current Squad Members ({squadList.length})
                </h4>
              </div>

              {isSquadLoading ? (
                <div className="py-12 text-center text-neutral-400">
                  <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-emerald-600" />
                  <p className="text-xs">Loading squad roster...</p>
                </div>
              ) : squadList.length === 0 ? (
                <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500 dark:border-neutral-800">
                  <UsersRound className="mx-auto mb-2 h-8 w-8 text-neutral-400" />
                  <p className="text-sm font-medium">No players currently assigned</p>
                  <p className="text-xs text-neutral-400 mt-1">Use the selector above to assign players to this team.</p>
                </div>
              ) : (
                <div className="rounded-xl border border-neutral-200 overflow-hidden dark:border-neutral-800">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-neutral-50/50 dark:bg-neutral-900/50">
                        <TableHead>Player</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {squadList.map((item) => {
                        const p = item.player;
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 border border-neutral-200 dark:border-neutral-800">
                                  <AvatarImage src={p.photoUrl || ""} />
                                  <AvatarFallback className="bg-emerald-50 text-xs font-bold text-emerald-700 dark:bg-emerald-950">
                                    {p.firstName?.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                                    #{p.jerseyNumber ?? "—"} {p.firstName} {p.lastName}
                                  </p>
                                  <p className="text-xs text-neutral-400">{p.nationality || "Club Player"}</p>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={`text-[10px] font-semibold ${getPlayerPositionColor(p.position)}`}
                              >
                                {p.position}
                              </Badge>
                            </TableCell>

                            <TableCell>
                              {item.isCaptain ? (
                                <Badge className="bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700 text-xs gap-1 font-semibold">
                                  👑 Captain
                                </Badge>
                              ) : item.isViceCaptain ? (
                                <Badge className="bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700 text-xs gap-1 font-semibold">
                                  🛡️ Vice-Captain
                                </Badge>
                              ) : (
                                <span className="text-xs text-neutral-400">Squad Member</span>
                              )}
                            </TableCell>

                            <TableCell className="text-right">
                              <div className="flex justify-end items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={isPending}
                                  onClick={() => handleToggleCaptain(item.playerId, item.isCaptain)}
                                  className={`h-7 px-2 text-xs gap-1 ${
                                    item.isCaptain
                                      ? "text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30"
                                      : "text-neutral-500 hover:text-amber-600"
                                  }`}
                                  title={item.isCaptain ? "Remove Captain" : "Make Captain"}
                                >
                                  <Crown className="h-3.5 w-3.5" />
                                  <span className="hidden sm:inline">{item.isCaptain ? "Captain" : "Make Captain"}</span>
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={isPending}
                                  onClick={() => handleToggleViceCaptain(item.playerId, item.isViceCaptain)}
                                  className={`h-7 px-2 text-xs gap-1 ${
                                    item.isViceCaptain
                                      ? "text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30"
                                      : "text-neutral-500 hover:text-blue-600"
                                  }`}
                                  title={item.isViceCaptain ? "Remove Vice-Captain" : "Make Vice-Captain"}
                                >
                                  <Shield className="h-3.5 w-3.5" />
                                  <span className="hidden sm:inline">{item.isViceCaptain ? "Vice" : "Make Vice"}</span>
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled={isPending}
                                  onClick={() => handleRemovePlayerFromSquad(item.playerId)}
                                  className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                                  title="Remove from Team"
                                >
                                  <UserMinus className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-4 border-t pt-4">
            <Button variant="outline" onClick={() => setShowSquadDialog(false)}>
              Close Roster
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* ADD / EDIT TEAM DIALOG                                                   */}
      {/* ========================================================================= */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTeam ? "Edit Team" : "Add Team"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
              <Checkbox
                id="isExternalTeam"
                checked={formData.isExternal}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isExternal: checked === true })
                }
              />
              <Label htmlFor="isExternalTeam" className="cursor-pointer text-xs font-bold text-amber-300">
                This is an External / Outsider Opponent Team
              </Label>
            </div>

            <div className="space-y-2">
              <Label>Team Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Manager / Coach</Label>
                <Input
                  value={formData.manager}
                  onChange={(e) =>
                    setFormData({ ...formData, manager: e.target.value })
                  }
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input
                  value={formData.logoUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, logoUrl: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Outsider / Contact Person Details */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-3">
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Contact Person Details
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Contact Person Name</Label>
                  <Input
                    value={formData.contactPersonName}
                    onChange={(e) =>
                      setFormData({ ...formData, contactPersonName: e.target.value })
                    }
                    placeholder="e.g. Rahat Ahmed"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Contact Phone Number</Label>
                  <Input
                    value={formData.contactNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, contactNumber: e.target.value })
                    }
                    placeholder="e.g. +8801700000000"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Facebook Profile / Page URL (Optional)</Label>
                <Input
                  value={formData.facebookUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, facebookUrl: e.target.value })
                  }
                  placeholder="https://facebook.com/..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : editingTeam ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This will deactivate the team.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
