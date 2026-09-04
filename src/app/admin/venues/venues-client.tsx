"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createVenue, updateVenue, deleteVenue } from "@/actions/venue-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Search, Edit, Trash2, MapPin, Building2, Users } from "lucide-react";
import type { Venue, PaginatedResponse } from "@/types";

const TURF_OPTIONS = [
  "Natural Grass",
  "Artificial Turf",
  "Hybrid Grass",
  "Indoor Court",
  "Sand / Clay",
  "Other",
];

export function VenuesClient({
  initialData,
  currentPage,
  currentSearch,
}: {
  initialData: PaginatedResponse<Venue>;
  currentPage: number;
  currentSearch: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [searchInput, setSearchInput] = useState(currentSearch);

  const [formData, setFormData] = useState({
    name: "",
    city: "",
    address: "",
    turfType: "Natural Grass",
    capacity: "",
    notes: "",
    isHomeVenue: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput) params.set("search", searchInput);
    else params.delete("search");
    params.set("page", "1");
    router.push(`/admin/venues?${params.toString()}`);
  };

  const handleOpenCreate = () => {
    setSelectedVenue(null);
    setFormData({
      name: "",
      city: "",
      address: "",
      turfType: "Natural Grass",
      capacity: "",
      notes: "",
      isHomeVenue: false,
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (venue: Venue) => {
    setSelectedVenue(venue);
    setFormData({
      name: venue.name,
      city: venue.city || "",
      address: venue.address || "",
      turfType: venue.turfType || "Natural Grass",
      capacity: venue.capacity ? String(venue.capacity) : "",
      notes: venue.notes || "",
      isHomeVenue: venue.isHomeVenue,
    });
    setDialogOpen(true);
  };

  const handleOpenDelete = (venue: Venue) => {
    setSelectedVenue(venue);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Venue name is required");
      return;
    }

    startTransition(async () => {
      const payload = {
        name: formData.name.trim(),
        city: formData.city.trim() || null,
        address: formData.address.trim() || null,
        turfType: formData.turfType || null,
        capacity: formData.capacity ? parseInt(formData.capacity, 10) : null,
        notes: formData.notes.trim() || null,
        isHomeVenue: formData.isHomeVenue,
      };

      const res = selectedVenue
        ? await updateVenue(selectedVenue.id, payload)
        : await createVenue(payload);

      if (res.success) {
        toast.success(
          selectedVenue
            ? "Venue updated successfully!"
            : "Venue created successfully!"
        );
        setDialogOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to save venue");
      }
    });
  };

  const handleDelete = () => {
    if (!selectedVenue) return;
    startTransition(async () => {
      const res = await deleteVenue(selectedVenue.id);
      if (res.success) {
        toast.success("Venue deleted successfully!");
        setDeleteDialogOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete venue");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <MapPin className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Venue Management
          </h1>
          <p className="text-sm text-neutral-500">
            Create, update, and manage match & event venues across the club.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Add Venue
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                placeholder="Search venues by name, city, or address..."
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

      {/* Venues Table */}
      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardHeader className="border-b border-neutral-200 dark:border-neutral-800">
          <CardTitle className="text-lg font-semibold flex items-center justify-between">
            <span>All Venues ({initialData.total})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Venue Name</TableHead>
                <TableHead>City / Address</TableHead>
                <TableHead>Turf Type</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialData.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-neutral-500">
                    No venues found. Click &quot;Add Venue&quot; to create one.
                  </TableCell>
                </TableRow>
              ) : (
                initialData.data.map((venue) => (
                  <TableRow key={venue.id}>
                    <TableCell className="font-semibold text-neutral-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>{venue.name}</span>
                      </div>
                      {venue.notes && (
                        <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5">{venue.notes}</p>
                      )}
                    </TableCell>
                    <TableCell className="text-neutral-600 dark:text-neutral-300">
                      <div className="text-sm">{venue.city || "—"}</div>
                      {venue.address && (
                        <div className="text-xs text-neutral-400">{venue.address}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                        {venue.turfType || "Natural Grass"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-neutral-600 dark:text-neutral-300">
                      {venue.capacity ? (
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-neutral-400" />
                          {venue.capacity.toLocaleString()}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {venue.isHomeVenue ? (
                        <Badge className="bg-emerald-600 text-white">Home Ground</Badge>
                      ) : (
                        <Badge variant="secondary">Away / Neutral</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(venue)}
                          className="h-8 w-8 text-neutral-600 hover:text-emerald-600 dark:text-neutral-400"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDelete(venue)}
                          className="h-8 w-8 text-rose-600 hover:text-rose-700 dark:text-rose-400"
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

      {/* Pagination */}
      {initialData.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-500">
            Page {initialData.page} of {initialData.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1 || isPending}
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set("page", String(currentPage - 1));
                router.push(`/admin/venues?${params.toString()}`);
              }}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= initialData.totalPages || isPending}
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set("page", String(currentPage + 1));
                router.push(`/admin/venues?${params.toString()}`);
              }}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-600" />
              {selectedVenue ? "Edit Venue" : "Create New Venue"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Venue Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Bangladesh Army Stadium"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City / District</Label>
                <Input
                  id="city"
                  placeholder="e.g. Dhaka"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity (Spectators)</Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="e.g. 20000"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Full Address</Label>
              <Input
                id="address"
                placeholder="e.g. Airport Road, Dhaka Cantt, Dhaka 1206"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="turfType">Turf Type</Label>
              <Select
                value={formData.turfType}
                onValueChange={(val) => setFormData({ ...formData, turfType: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Turf Type" />
                </SelectTrigger>
                <SelectContent>
                  {TURF_OPTIONS.map((turf) => (
                    <SelectItem key={turf} value={turf}>
                      {turf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="isHomeVenue"
                checked={formData.isHomeVenue}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isHomeVenue: !!checked })
                }
              />
              <Label htmlFor="isHomeVenue" className="cursor-pointer">
                Primary Home Ground for FC BBFF
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes / Special Instructions</Label>
              <Textarea
                id="notes"
                placeholder="Pitch dimensions, floodlight status, parking facilities..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={isPending}
              >
                {isPending ? "Saving..." : selectedVenue ? "Update Venue" : "Create Venue"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark &quot;{selectedVenue?.name}&quot; as deleted. Matches and events assigned to this venue will keep their venue information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white"
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete Venue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
