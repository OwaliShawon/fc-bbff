"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createPlayer, updatePlayer, deletePlayer } from "@/actions/player-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  UserCircle,
  Filter,
} from "lucide-react";
import { getPlayerPositionColor } from "@/lib/utils";
import type { PaginatedResponse, Player } from "@/types";
import type { Team } from "@prisma/client";

type PlayerFormData = {
  firstName: string;
  lastName: string;
  jerseyNumber: number | null;
  position: string;
  secondaryPosition: string;
  currentCity: string;
  dateOfBirth: string;
  nationality: string;
  height: string;
  weight: string;
  preferredFoot: string;
  dateJoined: string;
  bio: string;
  photoUrl: string;
  status: string;
  isFeatured: boolean;
  teamId: string;
  isCaptain: boolean;
  isViceCaptain: boolean;
};

const defaultFormData: PlayerFormData = {
  firstName: "",
  lastName: "",
  jerseyNumber: null,
  position: "MIDFIELDER",
  secondaryPosition: "NONE",
  currentCity: "",
  dateOfBirth: "",
  nationality: "",
  height: "",
  weight: "",
  preferredFoot: "Right",
  dateJoined: "",
  bio: "",
  photoUrl: "",
  status: "ACTIVE",
  isFeatured: false,
  teamId: "NONE",
  isCaptain: false,
  isViceCaptain: false,
};

export function PlayersClient({
  initialData,
  teams,
  currentPage,
  currentSearch,
  currentStatus,
  currentPosition,
}: {
  initialData: PaginatedResponse<Player>;
  teams: Team[];
  currentPage: number;
  currentSearch: string;
  currentStatus: string;
  currentPosition: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [deletingPlayerId, setDeletingPlayerId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PlayerFormData>(defaultFormData);
  const [searchInput, setSearchInput] = useState(currentSearch);

  function openCreate() {
    setEditingPlayer(null);
    setFormData(defaultFormData);
    setShowDialog(true);
  }

  function openEdit(player: Player) {
    setEditingPlayer(player);
    const currentTeam = (player as any).teamPlayers?.[0];
    setFormData({
      firstName: player.firstName,
      lastName: player.lastName,
      jerseyNumber: player.jerseyNumber,
      position: player.position,
      secondaryPosition: player.secondaryPosition || "NONE",
      currentCity: player.currentCity || "",
      dateOfBirth: player.dateOfBirth
        ? new Date(player.dateOfBirth).toISOString().split("T")[0]
        : "",
      nationality: player.nationality || "",
      height: player.height || "",
      weight: player.weight || "",
      preferredFoot: player.preferredFoot || "Right",
      dateJoined: player.dateJoined
        ? new Date(player.dateJoined).toISOString().split("T")[0]
        : "",
      bio: player.bio || "",
      photoUrl: player.photoUrl || "",
      status: player.status,
      isFeatured: player.isFeatured,
      teamId: currentTeam?.teamId || "NONE",
      isCaptain: currentTeam?.isCaptain || false,
      isViceCaptain: currentTeam?.isViceCaptain || false,
    });
    setShowDialog(true);
  }

  function openDelete(id: string) {
    setDeletingPlayerId(id);
    setShowDeleteDialog(true);
  }

  async function handleSubmit() {
    startTransition(async () => {
      const payload = {
        ...formData,
        teamId: formData.teamId === "NONE" ? null : formData.teamId,
        isCaptain: formData.teamId === "NONE" ? false : formData.isCaptain,
        isViceCaptain: formData.teamId === "NONE" ? false : formData.isViceCaptain,
        secondaryPosition:
          formData.secondaryPosition === "NONE" || !formData.secondaryPosition
            ? null
            : formData.secondaryPosition,
        currentCity: formData.currentCity ? formData.currentCity.trim() : null,
      };

      const result = editingPlayer
        ? await updatePlayer(editingPlayer.id, payload)
        : await createPlayer(payload);

      if (result.success) {
        toast.success(
          editingPlayer
            ? "Player updated successfully"
            : "Player created successfully"
        );
        setShowDialog(false);
        router.refresh();
      } else {
        toast.error(result.error || "Something went wrong");
      }
    });
  }

  async function handleDelete() {
    if (!deletingPlayerId) return;
    startTransition(async () => {
      const result = await deletePlayer(deletingPlayerId);
      if (result.success) {
        toast.success("Player deleted successfully");
        setShowDeleteDialog(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete player");
      }
    });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchInput) params.set("search", searchInput);
    if (currentStatus) params.set("status", currentStatus);
    if (currentPosition) params.set("position", currentPosition);
    router.push(`/admin/players?${params.toString()}`);
  }

  function handleFilterChange(key: string, value: string) {
    const params = new URLSearchParams();
    if (searchInput) params.set("search", searchInput);
    if (key === "status" && value) params.set("status", value);
    else if (currentStatus) params.set("status", currentStatus);
    if (key === "position" && value) params.set("position", value);
    else if (currentPosition) params.set("position", currentPosition);
    router.push(`/admin/players?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Players
          </h1>
          <p className="text-neutral-500">
            Manage your club players ({initialData.total} total)
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Player
        </Button>
      </div>

      {/* Search & Filters */}
      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          <form onSubmit={handleSearch} className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                placeholder="Search players..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>

          <div className="flex gap-2">
            <Select
              value={currentStatus || "all"}
              onValueChange={(v) =>
                handleFilterChange("status", v === "all" ? "" : v)
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INJURED">Injured</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={currentPosition || "all"}
              onValueChange={(v) =>
                handleFilterChange("position", v === "all" ? "" : v)
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                <SelectItem value="GOALKEEPER">Goalkeeper</SelectItem>
                <SelectItem value="DEFENDER">Defender</SelectItem>
                <SelectItem value="MIDFIELDER">Midfielder</SelectItem>
                <SelectItem value="FORWARD">Forward</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Players Table */}
      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="text-center">Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialData.data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-12 text-center text-neutral-500"
                  >
                    <UserCircle className="mx-auto mb-2 h-8 w-8 text-neutral-300" />
                    No players found
                  </TableCell>
                </TableRow>
              ) : (
                initialData.data.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell className="font-mono text-sm font-bold">
                      {player.jerseyNumber || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-neutral-200 dark:border-neutral-800">
                          {player.photoUrl && (
                            <AvatarImage
                              src={player.photoUrl}
                              alt={`${player.firstName} ${player.lastName}`}
                              className="object-cover"
                            />
                          )}
                          <AvatarFallback className="bg-neutral-100 text-xs font-bold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                            {player.firstName[0]}
                            {player.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {player.firstName} {player.lastName}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {[player.nationality, player.currentCity].filter(Boolean).join(" • ") || "—"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        <Badge
                          variant="secondary"
                          className={getPlayerPositionColor(player.position)}
                        >
                          {player.position}
                        </Badge>
                        {player.secondaryPosition && (
                          <span className="text-[10px] text-neutral-500">
                            Sec: {player.secondaryPosition}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          player.status === "ACTIVE"
                            ? "default"
                            : "secondary"
                        }
                        className={
                          player.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : ""
                        }
                      >
                        {player.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {(() => {
                        const tp = (player as any).teamPlayers?.[0];
                        if (!tp?.team) {
                          return <span className="text-xs text-neutral-400">Free Agent</span>;
                        }
                        return (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Badge variant="outline" className="font-medium bg-neutral-50 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700">
                              {tp.team.name}
                            </Badge>
                            {tp.isCaptain && (
                              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 text-[10px] px-1.5 py-0 border border-amber-300 dark:border-amber-700">
                                👑 Captain
                              </Badge>
                            )}
                            {tp.isViceCaptain && (
                              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 text-[10px] px-1.5 py-0 border border-blue-300 dark:border-blue-700">
                                🛡️ Vice-Captain
                              </Badge>
                            )}
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="text-center">
                      {player.isFeatured ? "⭐" : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(player)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDelete(player.id)}
                          className="h-8 w-8 text-red-500 hover:text-red-700"
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

        {/* Pagination */}
        {initialData.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
            <p className="text-sm text-neutral-500">
              Page {initialData.page} of {initialData.totalPages} (
              {initialData.total} records)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() =>
                  router.push(
                    `/admin/players?page=${currentPage - 1}${currentSearch ? `&search=${currentSearch}` : ""}`
                  )
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= initialData.totalPages}
                onClick={() =>
                  router.push(
                    `/admin/players?page=${currentPage + 1}${currentSearch ? `&search=${currentSearch}` : ""}`
                  )
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlayer ? "Edit Player" : "Add Player"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>First Name *</Label>
              <Input
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name *</Label>
              <Input
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Jersey Number</Label>
              <Input
                type="number"
                min={1}
                max={99}
                value={formData.jerseyNumber || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    jerseyNumber: e.target.value
                      ? parseInt(e.target.value)
                      : null,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Primary Position *</Label>
              <Select
                value={formData.position}
                onValueChange={(v) =>
                  setFormData({ ...formData, position: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GOALKEEPER">Goalkeeper</SelectItem>
                  <SelectItem value="DEFENDER">Defender</SelectItem>
                  <SelectItem value="MIDFIELDER">Midfielder</SelectItem>
                  <SelectItem value="FORWARD">Forward</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Secondary Position</Label>
              <Select
                value={formData.secondaryPosition}
                onValueChange={(v) =>
                  setFormData({ ...formData, secondaryPosition: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">None</SelectItem>
                  <SelectItem value="GOALKEEPER">Goalkeeper</SelectItem>
                  <SelectItem value="DEFENDER">Defender</SelectItem>
                  <SelectItem value="MIDFIELDER">Midfielder</SelectItem>
                  <SelectItem value="FORWARD">Forward</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Current City</Label>
              <Input
                placeholder="e.g., Dhaka, London"
                value={formData.currentCity}
                onChange={(e) =>
                  setFormData({ ...formData, currentCity: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Date Joined</Label>
              <Input
                type="date"
                value={formData.dateJoined}
                onChange={(e) =>
                  setFormData({ ...formData, dateJoined: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Nationality</Label>
              <Input
                value={formData.nationality}
                onChange={(e) =>
                  setFormData({ ...formData, nationality: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Preferred Foot</Label>
              <Select
                value={formData.preferredFoot}
                onValueChange={(v) =>
                  setFormData({ ...formData, preferredFoot: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Right">Right</SelectItem>
                  <SelectItem value="Left">Left</SelectItem>
                  <SelectItem value="Both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Height</Label>
              <Input
                placeholder="e.g., 5'11&quot;"
                value={formData.height}
                onChange={(e) =>
                  setFormData({ ...formData, height: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Weight</Label>
              <Input
                placeholder="e.g., 75kg"
                value={formData.weight}
                onChange={(e) =>
                  setFormData({ ...formData, weight: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) =>
                  setFormData({ ...formData, status: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INJURED">Injured</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="TRANSFERRED">Transferred</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Photo URL</Label>
              <Input
                value={formData.photoUrl}
                onChange={(e) =>
                  setFormData({ ...formData, photoUrl: e.target.value })
                }
                placeholder="https://..."
              />
            </div>

            {/* Team & Role Assignment */}
            <div className="col-span-full rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50 space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">Team Assignment</h4>
                <p className="text-xs text-neutral-500">Assign player to a squad and configure leadership status</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 items-center">
                <div className="space-y-1.5">
                  <Label>Club Team</Label>
                  <Select
                    value={formData.teamId}
                    onValueChange={(v) =>
                      setFormData({
                        ...formData,
                        teamId: v,
                        isCaptain: v === "NONE" ? false : formData.isCaptain,
                        isViceCaptain: v === "NONE" ? false : formData.isViceCaptain,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">No Team (Free Agent)</SelectItem>
                      {teams.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.teamId !== "NONE" && (
                  <div className="flex flex-wrap items-center gap-4 pt-4 sm:pt-5">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="isCaptain"
                        checked={formData.isCaptain}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            isCaptain: checked === true,
                            isViceCaptain: checked === true ? false : formData.isViceCaptain,
                          })
                        }
                      />
                      <Label htmlFor="isCaptain" className="cursor-pointer text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        👑 Team Captain
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="isViceCaptain"
                        checked={formData.isViceCaptain}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            isViceCaptain: checked === true,
                            isCaptain: checked === true ? false : formData.isCaptain,
                          })
                        }
                      />
                      <Label htmlFor="isViceCaptain" className="cursor-pointer text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        🛡️ Vice Captain
                      </Label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-full space-y-2">
              <Label>Bio</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                rows={3}
                placeholder="Player biography..."
              />
            </div>

            <div className="col-span-full flex items-center gap-2">
              <Checkbox
                id="featured"
                checked={formData.isFeatured}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    isFeatured: checked === true,
                  })
                }
              />
              <Label htmlFor="featured" className="cursor-pointer">
                Featured Player (show on homepage)
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={isPending}
            >
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
              ) : editingPlayer ? (
                "Update Player"
              ) : (
                "Create Player"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Player</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this player? This action will
              deactivate the player record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
