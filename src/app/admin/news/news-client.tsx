"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createNews, updateNews, deleteNews } from "@/actions/news-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { Plus, Search, Edit, Trash2, Newspaper, Star, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { News, NewsCategory, PaginatedResponse } from "@/types";

export function NewsClient({
  initialData,
  categories,
}: {
  initialData: PaginatedResponse<News>;
  categories: NewsCategory[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<News | null>(null);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    categoryId: categories[0]?.id || "",
    featuredImageUrl: "",
    tags: [] as string[],
    tagsInput: "",
    status: "PUBLISHED" as "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED",
    isFeatured: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput) params.set("search", searchInput);
    else params.delete("search");
    params.set("page", "1");
    router.push(`/admin/news?${params.toString()}`);
  };

  const handleOpenCreate = () => {
    setSelectedArticle(null);
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      categoryId: categories[0]?.id || "",
      featuredImageUrl: "",
      tags: [],
      tagsInput: "",
      status: "PUBLISHED",
      isFeatured: false,
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (article: News) => {
    setSelectedArticle(article);
    setFormData({
      title: article.title,
      excerpt: article.excerpt || "",
      content: article.content,
      categoryId: article.categoryId || categories[0]?.id || "",
      featuredImageUrl: article.featuredImageUrl || "",
      tags: article.tags || [],
      tagsInput: (article.tags || []).join(", "),
      status: article.status as "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED",
      isFeatured: article.isFeatured,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const tagsArray = formData.tagsInput
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const payload = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        categoryId: formData.categoryId,
        featuredImageUrl: formData.featuredImageUrl || undefined,
        tags: tagsArray,
        status: formData.status,
        isFeatured: formData.isFeatured,
      };

      const result = selectedArticle
        ? await updateNews(selectedArticle.id, payload)
        : await createNews(payload);

      if (result.success) {
        toast.success(selectedArticle ? "Article updated!" : "Article published!");
        setDialogOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to save article");
      }
    });
  };

  const handleDelete = () => {
    if (!selectedArticle) return;
    startTransition(async () => {
      const result = await deleteNews(selectedArticle.id);
      if (result.success) {
        toast.success("Article deleted!");
        setDeleteDialogOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete article");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Club News & Articles
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Publish match reports, announcements, club updates, and transfer news.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-emerald-600 hover:bg-emerald-500">
          <Plus className="mr-2 h-4 w-4" /> Create Article
        </Button>
      </div>

      {/* Filter */}
      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                placeholder="Search articles by title or content..."
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
                <TableHead>Category</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialData.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-neutral-500">
                    <Newspaper className="mx-auto mb-2 h-8 w-8 text-neutral-400" />
                    No articles found
                  </TableCell>
                </TableRow>
              ) : (
                initialData.data.map((article: any) => (
                  <TableRow key={article.id}>
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-neutral-900 dark:text-white">{article.title}</p>
                          {article.isFeatured && (
                            <Badge className="bg-amber-500/20 text-amber-300 text-[10px]">
                              <Star className="h-2.5 w-2.5 mr-0.5" /> Featured
                            </Badge>
                          )}
                        </div>
                        {article.excerpt && (
                          <p className="text-xs text-neutral-500 line-clamp-1 max-w-md">{article.excerpt}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {article.category?.name || "General"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-neutral-500">
                      {article.author?.name || "Admin"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          article.status === "PUBLISHED"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-neutral-800 text-neutral-400"
                        }
                      >
                        {article.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-neutral-500">
                      {article.publishedAt ? formatDate(article.publishedAt) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(article)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedArticle(article);
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

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{selectedArticle ? "Edit Article" : "Create Article"}</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="title">Headline / Title *</Label>
                <Input
                  id="title"
                  required
                  placeholder="e.g. FC BBFF Secure Dominant Victory"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(v) => setFormData({ ...formData, categoryId: v })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v: "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED") =>
                      setFormData({ ...formData, status: v })
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="featuredImageUrl">Cover Image URL (Direct link)</Label>
                <Input
                  id="featuredImageUrl"
                  placeholder="https://..."
                  value={formData.featuredImageUrl}
                  onChange={(e) => setFormData({ ...formData, featuredImageUrl: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Summary / Excerpt</Label>
                <Textarea
                  id="excerpt"
                  rows={2}
                  placeholder="Brief 1-2 sentence preview of the article..."
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="content">Full Article Content (Markdown supported) *</Label>
                <Textarea
                  id="content"
                  rows={8}
                  required
                  placeholder="Write the full match report or announcement here..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  placeholder="e.g. victory, match-report, premier-league"
                  value={formData.tagsInput}
                  onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(c) => setFormData({ ...formData, isFeatured: !!c })}
                />
                <Label htmlFor="isFeatured" className="cursor-pointer text-sm font-medium">
                  Feature this article prominently on the homepage
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-500">
                {isPending ? "Saving..." : selectedArticle ? "Update Article" : "Publish Article"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedArticle?.title}&quot;?
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
