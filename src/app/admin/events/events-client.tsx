"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createEvent, updateEvent, deleteEvent } from "@/actions/event-actions";
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
import { Plus, Search, Edit, Trash2, Calendar, Clock, MapPin } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Event, PaginatedResponse, Venue } from "@/types";

export function EventsClient({
  initialData,
  venues = [],
}: {
  initialData: PaginatedResponse<Event>;
  venues?: Venue[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventType: "OTHER",
    eventDate: new Date().toISOString().split("T")[0],
    startTime: "10:00 AM",
    endTime: "12:00 PM",
    venue: "FC BBFF Stadium",
    organizer: "Club Management",
    registrationUrl: "",
    status: "UPCOMING",
    isPublished: true,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput) params.set("search", searchInput);
    else params.delete("search");
    params.set("page", "1");
    router.push(`/admin/events?${params.toString()}`);
  };

  const handleOpenCreate = () => {
    setSelectedEvent(null);
    setFormData({
      title: "",
      description: "",
      eventType: "OTHER",
      eventDate: new Date().toISOString().split("T")[0],
      startTime: "10:00 AM",
      endTime: "12:00 PM",
      venue: "FC BBFF Stadium",
      organizer: "Club Management",
      registrationUrl: "",
      status: "UPCOMING",
      isPublished: true,
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (event: Event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description || "",
      eventType: event.eventType,
      eventDate: new Date(event.eventDate).toISOString().split("T")[0],
      startTime: event.startTime || "",
      endTime: event.endTime || "",
      venue: event.venue || "",
      organizer: event.organizer || "",
      registrationUrl: event.registrationUrl || "",
      status: event.status,
      isPublished: event.isPublished,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = selectedEvent
        ? await updateEvent(selectedEvent.id, formData)
        : await createEvent(formData);

      if (result.success) {
        toast.success(selectedEvent ? "Event updated!" : "Event created!");
        setDialogOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to save event");
      }
    });
  };

  const handleDelete = () => {
    if (!selectedEvent) return;
    startTransition(async () => {
      const result = await deleteEvent(selectedEvent.id);
      if (result.success) {
        toast.success("Event deleted!");
        setDeleteDialogOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete event");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Club Events
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Manage tournaments, training camps, AGM meetings, and celebrations.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-emerald-600 hover:bg-emerald-500">
          <Plus className="mr-2 h-4 w-4" /> Create Event
        </Button>
      </div>

      {/* Filter */}
      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                placeholder="Search events by title..."
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

      {/* Table */}
      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialData.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-neutral-500">
                    <Calendar className="mx-auto mb-2 h-8 w-8 text-neutral-400" />
                    No events found
                  </TableCell>
                </TableRow>
              ) : (
                initialData.data.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">{event.title}</p>
                        {event.organizer && (
                          <p className="text-xs text-neutral-500">Org: {event.organizer}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 text-xs">
                        {event.eventType.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <p className="font-medium">{formatDate(event.eventDate)}</p>
                      {event.startTime && <p className="text-xs text-neutral-500">{event.startTime}</p>}
                    </TableCell>
                    <TableCell className="text-sm text-neutral-500">{event.venue || "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          event.status === "COMPLETED"
                            ? "bg-neutral-800 text-neutral-400"
                            : "bg-emerald-500/20 text-emerald-300"
                        }
                      >
                        {event.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(event)} title="Edit Event">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedEvent(event);
                            setDeleteDialogOpen(true);
                          }}
                          title="Delete Event"
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

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{selectedEvent ? "Edit Event" : "Create Event"}</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  required
                  placeholder="e.g. Pre-Season Training Camp"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eventType">Event Type</Label>
                  <Select
                    value={formData.eventType}
                    onValueChange={(v) => setFormData({ ...formData, eventType: v })}
                  >
                    <SelectTrigger id="eventType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TRAINING">Training</SelectItem>
                      <SelectItem value="AGM">AGM</SelectItem>
                      <SelectItem value="AWARD_CEREMONY">Award Ceremony</SelectItem>
                      <SelectItem value="TOURNAMENT">Tournament</SelectItem>
                      <SelectItem value="COMMUNITY">Community</SelectItem>
                      <SelectItem value="CLUB_MEETING">Club Meeting</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData({ ...formData, status: v })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
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

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="eventDate">Date *</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    required
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    placeholder="e.g. 10:00 AM"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    placeholder="e.g. 1:00 PM"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="venue">Venue</Label>
                  {venues && venues.length > 0 ? (
                    <Select
                      value={
                        venues.some((v) => v.name === formData.venue)
                          ? formData.venue
                          : formData.venue
                          ? "custom"
                          : "none"
                      }
                      onValueChange={(val) => {
                        if (val === "none") {
                          setFormData({ ...formData, venue: "" });
                        } else if (val !== "custom") {
                          setFormData({ ...formData, venue: val });
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select venue..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No venue selected</SelectItem>
                        {venues.map((v) => (
                          <SelectItem key={v.id} value={v.name}>
                            {v.name} {v.city ? `(${v.city})` : ""} {v.isHomeVenue ? "🏠 [Home]" : ""}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Custom / Other Venue...</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : null}
                  {(!venues ||
                    venues.length === 0 ||
                    !venues.some((v) => v.name === formData.venue)) && (
                    <Input
                      id="venue"
                      placeholder="e.g. BBFF Stadium"
                      value={formData.venue}
                      onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      className={venues && venues.length > 0 ? "mt-2" : ""}
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="organizer">Organizer</Label>
                  <Input
                    id="organizer"
                    placeholder="e.g. Coaching Staff"
                    value={formData.organizer}
                    onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="registrationUrl">Registration Link (Optional)</Label>
                <Input
                  id="registrationUrl"
                  placeholder="https://..."
                  value={formData.registrationUrl}
                  onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  placeholder="Event description and agenda..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="isPublished"
                  checked={formData.isPublished}
                  onCheckedChange={(c) => setFormData({ ...formData, isPublished: !!c })}
                />
                <Label htmlFor="isPublished" className="cursor-pointer text-sm font-medium">
                  Publish on public website
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-500">
                {isPending ? "Saving..." : selectedEvent ? "Update Event" : "Create Event"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedEvent?.title}&quot;?
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
