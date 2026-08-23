"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createSeason, updateSeason, deleteSeason } from "@/actions/competition-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, CalendarDays } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Season } from "@/types";

export function SeasonsClient({ initialSeasons }: { initialSeasons: Season[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    startDate: "2025-09-01",
    endDate: "2026-06-30",
    isCurrent: false,
  });

  const handleOpenCreate = () => {
    setSelectedSeason(null);
    setFormData({
      name: "",
      startDate: "2025-09-01",
      endDate: "2026-06-30",
      isCurrent: false,
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (season: Season) => {
    setSelectedSeason(season);
    setFormData({
      name: season.name,
      startDate: new Date(season.startDate).toISOString().split("T")[0],
      endDate: new Date(season.endDate).toISOString().split("T")[0],
      isCurrent: season.isCurrent,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = selectedSeason
        ? await updateSeason(selectedSeason.id, formData)
        : await createSeason(formData);

      if (result.success) {
        toast.success(selectedSeason ? "Season updated!" : "Season created!");
        setDialogOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to save season");
      }
    });
  };

  const handleDelete = () => {
    if (!selectedSeason) return;
    startTransition(async () => {
      const result = await deleteSeason(selectedSeason.id);
      if (result.success) {
        toast.success("Season deleted!");
        setDeleteDialogOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete season");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Seasons Management
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Define competition campaign years (e.g. 2025/2026).
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-emerald-600 hover:bg-emerald-500">
          <Plus className="mr-2 h-4 w-4" /> Create Season
        </Button>
      </div>

      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Season Name</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialSeasons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-neutral-500">
                    <CalendarDays className="mx-auto mb-2 h-8 w-8 text-neutral-400" />
                    No seasons defined yet.
                  </TableCell>
                </TableRow>
              ) : (
                initialSeasons.map((season) => (
                  <TableRow key={season.id}>
                    <TableCell className="font-semibold">{season.name}</TableCell>
                    <TableCell className="text-sm text-neutral-500">{formatDate(season.startDate)}</TableCell>
                    <TableCell className="text-sm text-neutral-500">{formatDate(season.endDate)}</TableCell>
                    <TableCell>
                      {season.isCurrent ? (
                        <Badge className="bg-emerald-600 text-white">Current Active Season</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-neutral-800 text-neutral-400">
                          Past Season
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(season)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedSeason(season);
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{selectedSeason ? "Edit Season" : "Create Season"}</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="name">Season Name *</Label>
                <Input
                  id="name"
                  required
                  placeholder="e.g. 2025/2026"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="isCurrent"
                  checked={formData.isCurrent}
                  onCheckedChange={(c) => setFormData({ ...formData, isCurrent: !!c })}
                />
                <Label htmlFor="isCurrent" className="cursor-pointer text-sm font-medium">
                  Set as current active season
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-500">
                {isPending ? "Saving..." : selectedSeason ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Season</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete season &quot;{selectedSeason?.name}&quot;?
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
