"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createTeam, updateTeam, deleteTeam } from "@/actions/team-actions";
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
  Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, Loader2, UsersRound,
} from "lucide-react";
import type { PaginatedResponse, Team } from "@/types";

export function TeamsClient({
  initialData, currentPage, currentSearch, currentStatus,
}: {
  initialData: PaginatedResponse<Team>;
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
    name: "", description: "", logoUrl: "", manager: "", status: "ACTIVE",
  });

  function openCreate() {
    setEditingTeam(null);
    setFormData({ name: "", description: "", logoUrl: "", manager: "", status: "ACTIVE" });
    setShowDialog(true);
  }

  function openEdit(team: Team) {
    setEditingTeam(team);
    setFormData({
      name: team.name, description: team.description || "",
      logoUrl: team.logoUrl || "", manager: team.manager || "", status: team.status,
    });
    setShowDialog(true);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Teams</h1>
          <p className="text-neutral-500">Manage your club teams ({initialData.total} total)</p>
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
              <Input placeholder="Search teams..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="pl-9" />
            </div>
            <Button type="submit" variant="secondary">Search</Button>
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
                <TableHead>Players</TableHead>
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
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-700 dark:bg-emerald-900/30">
                          {team.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{team.name}</p>
                          <p className="max-w-[300px] truncate text-xs text-neutral-500">{team.description || "—"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{team.manager || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{team._count?.teamPlayers || 0} players</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={team.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : ""}>
                        {team.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(team)} className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { setDeletingId(team.id); setShowDeleteDialog(true); }} className="h-8 w-8 text-red-500 hover:text-red-700">
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
            <p className="text-sm text-neutral-500">Page {initialData.page} of {initialData.totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => router.push(`/admin/teams?page=${currentPage - 1}`)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" disabled={currentPage >= initialData.totalPages} onClick={() => router.push(`/admin/teams?page=${currentPage + 1}`)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTeam ? "Edit Team" : "Add Team"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Team Name *</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Manager</Label>
              <Input value={formData.manager} onChange={(e) => setFormData({ ...formData, manager: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Logo URL</Label>
              <Input value={formData.logoUrl} onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700">
              {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : editingTeam ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team</AlertDialogTitle>
            <AlertDialogDescription>Are you sure? This will deactivate the team.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-red-600 hover:bg-red-700">
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
