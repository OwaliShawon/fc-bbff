"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createManagementMember,
  updateManagementMember,
  deleteManagementMember,
} from "@/actions/management-actions";
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
import { Plus, Edit, Trash2, UserCheck, Crown, ShieldAlert, Calendar } from "lucide-react";
import type { Player } from "@/types";

type Member = {
  id: string;
  name: string;
  role: "PRESIDENT" | "MANAGER" | "CAPTAIN" | "VICE_CAPTAIN";
  tenure: string;
  isCurrent: boolean;
  bio?: string | null;
  photoUrl?: string | null;
  playerId?: string | null;
  sortOrder: number;
  player?: {
    id: string;
    firstName: string;
    lastName: string;
    slug: string;
    jerseyNumber: number | null;
    position: string;
    photoUrl: string | null;
  } | null;
};

export function ManagementClient({
  initialMembers,
  players,
}: {
  initialMembers: Member[];
  players: Player[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    role: "PRESIDENT" as "PRESIDENT" | "MANAGER" | "CAPTAIN" | "VICE_CAPTAIN",
    tenure: "",
    isCurrent: false,
    bio: "",
    photoUrl: "",
    playerId: "none",
    sortOrder: 0,
  });

  const handleOpenCreate = () => {
    setSelectedMember(null);
    setFormData({
      name: "",
      role: "MANAGER",
      tenure: "2025 - Present",
      isCurrent: true,
      bio: "",
      photoUrl: "",
      playerId: "none",
      sortOrder: 0,
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (member: Member) => {
    setSelectedMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      tenure: member.tenure,
      isCurrent: member.isCurrent,
      bio: member.bio || "",
      photoUrl: member.photoUrl || "",
      playerId: member.playerId || "none",
      sortOrder: member.sortOrder,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const payload = {
        ...formData,
        playerId: formData.playerId === "none" ? undefined : formData.playerId,
      };

      const result = selectedMember
        ? await updateManagementMember(selectedMember.id, payload)
        : await createManagementMember(payload);

      if (result.success) {
        toast.success(
          selectedMember
            ? "Leadership member updated!"
            : "Leadership member created!"
        );
        setDialogOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Operation failed");
      }
    });
  };

  const handleDelete = () => {
    if (!selectedMember) return;
    startTransition(async () => {
      const result = await deleteManagementMember(selectedMember.id);
      if (result.success) {
        toast.success("Member removed successfully");
        setDeleteDialogOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete");
      }
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "PRESIDENT":
        return <Badge className="bg-purple-500/20 text-purple-300">President</Badge>;
      case "MANAGER":
        return <Badge className="bg-emerald-500/20 text-emerald-300">Manager</Badge>;
      case "CAPTAIN":
        return <Badge className="bg-amber-500/20 text-amber-300">Captain (C)</Badge>;
      case "VICE_CAPTAIN":
        return <Badge className="bg-blue-500/20 text-blue-300">Vice-Captain (VC)</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Club Management & Leadership
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Manage Managers, Captains, and Vice-Captains (historical and active).
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-emerald-600 hover:bg-emerald-500">
          <Plus className="mr-2 h-4 w-4" /> Add Leader / Officer
        </Button>
      </div>

      {/* Members Table */}
      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Leader</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Tenure</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-neutral-500">
                    <UserCheck className="mx-auto mb-2 h-8 w-8 text-neutral-400" />
                    No leadership members recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                initialMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-neutral-200 dark:border-neutral-800">
                          {member.photoUrl && (
                            <AvatarImage src={member.photoUrl} alt={member.name} className="object-cover" />
                          )}
                          <AvatarFallback className="font-bold text-xs">
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-white">{member.name}</p>
                          {member.bio && (
                            <p className="text-xs text-neutral-500 line-clamp-1 max-w-sm">{member.bio}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(member.role)}</TableCell>
                    <TableCell className="font-medium text-sm flex items-center gap-1.5 pt-4">
                      <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                      {member.tenure}
                    </TableCell>
                    <TableCell>
                      {member.isCurrent ? (
                        <Badge className="bg-emerald-600 text-white text-xs">Current</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 text-xs">
                          Former
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(member)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedMember(member);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-red-500 hover:text-red-600"
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
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {selectedMember ? "Edit Leader Profile" : "Add Leader / Officer"}
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    required
                    placeholder="e.g. Owali Shawon"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(v: "PRESIDENT" | "MANAGER" | "CAPTAIN" | "VICE_CAPTAIN") =>
                      setFormData({ ...formData, role: v })
                    }
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRESIDENT">President</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="CAPTAIN">Captain</SelectItem>
                      <SelectItem value="VICE_CAPTAIN">Vice-Captain</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tenure">Tenure Years *</Label>
                  <Input
                    id="tenure"
                    required
                    placeholder="e.g. 2014 - 2025"
                    value={formData.tenure}
                    onChange={(e) => setFormData({ ...formData, tenure: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="playerId">Link to Player (Optional)</Label>
                  <Select
                    value={formData.playerId}
                    onValueChange={(v) => setFormData({ ...formData, playerId: v })}
                  >
                    <SelectTrigger id="playerId">
                      <SelectValue placeholder="Select player" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {players.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.firstName} {p.lastName} (#{p.jerseyNumber || "-"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="photoUrl">Photo URL (Direct image link)</Label>
                <Input
                  id="photoUrl"
                  placeholder="https://i.ibb.co/.../photo.jpg"
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="bio">Biography / Achievements</Label>
                <Textarea
                  id="bio"
                  rows={3}
                  placeholder="Details about their contribution and leadership..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="isCurrent"
                  checked={formData.isCurrent}
                  onCheckedChange={(c) => setFormData({ ...formData, isCurrent: !!c })}
                />
                <Label htmlFor="isCurrent" className="cursor-pointer text-sm font-medium">
                  Currently holding this active role
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-500">
                {isPending ? "Saving..." : selectedMember ? "Update" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Leadership Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove &quot;{selectedMember?.name}&quot; from club management records?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
