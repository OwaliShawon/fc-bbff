"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createMediaFile, deleteMediaFile } from "@/actions/media-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trash2, ImageIcon, Copy, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";

export function MediaClient({ initialMedia }: { initialMedia: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    url: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await createMediaFile(formData);
      if (result.success) {
        toast.success("Media added to library!");
        setDialogOpen(false);
        setFormData({ title: "", url: "" });
        router.refresh();
      } else {
        toast.error(result.error || "Failed to add media");
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteMediaFile(id);
      if (result.success) {
        toast.success("Media deleted");
        router.refresh();
      } else {
        toast.error("Failed to delete");
      }
    });
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Image URL copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Media Library & Assets
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Store and copy direct image links for player photos, logos, banners, and match galleries.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-500">
          <Plus className="mr-2 h-4 w-4" /> Add Media Link
        </Button>
      </div>

      {initialMedia.length === 0 ? (
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="py-16 text-center text-neutral-500">
            <ImageIcon className="mx-auto mb-3 h-10 w-10 text-neutral-400" />
            <p className="font-semibold text-neutral-300">No media assets in library</p>
            <p className="text-xs text-neutral-500 mt-1">Add direct links from ImgBB, Cloudinary, or S3</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {initialMedia.map((item) => (
            <Card key={item.id} className="overflow-hidden border-neutral-200 dark:border-neutral-800 bg-neutral-900/50">
              <div className="relative h-44 w-full bg-neutral-950 flex items-center justify-center">
                <Image
                  src={item.url}
                  alt={item.filename}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <CardContent className="p-3">
                <p className="font-semibold text-sm text-white line-clamp-1">{item.filename}</p>
                <p className="text-[10px] text-neutral-500 mt-0.5">{formatDate(item.createdAt)}</p>
                <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => handleCopy(item.url)}
                  >
                    <Copy className="h-3 w-3" /> Copy URL
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-red-500 hover:text-red-600"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Add Media to Library</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="title">Asset Title *</Label>
                <Input
                  id="title"
                  required
                  placeholder="e.g. Club Crest Shield Logo"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="url">Direct Image URL *</Label>
                <Input
                  id="url"
                  required
                  placeholder="https://i.ibb.co/.../image.jpg"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-500">
                {isPending ? "Adding..." : "Add to Library"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
