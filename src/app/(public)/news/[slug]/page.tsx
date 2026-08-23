import { notFound } from "next/navigation";
import Link from "next/link";
import { getNewsBySlug, getRelatedNews } from "@/actions/news-actions";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User, Shield } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);

  if (!article) notFound();

  const related = await getRelatedNews(article.id, article.categoryId, 3);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-950 via-emerald-950/20 to-neutral-950 py-16">
        <div className="relative mx-auto max-w-4xl px-4 lg:px-8">
          <Link
            href="/news"
            className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to News
          </Link>

          {article.category && (
            <Badge variant="secondary" className="mb-4 bg-emerald-500/10 text-emerald-400">
              {article.category.name}
            </Badge>
          )}

          <h1 className="text-3xl font-black text-white md:text-5xl leading-tight">
            {article.title}
          </h1>

          <div className="mt-6 flex items-center gap-6 text-sm text-neutral-400 border-t border-white/10 pt-4">
            {article.author && (
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-emerald-400" />
                {article.author.name}
              </span>
            )}
            {article.publishedAt && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-emerald-400" />
                {formatDate(article.publishedAt)}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="bg-neutral-950 py-12">
        <div className="mx-auto max-w-4xl px-4 lg:px-8 space-y-12">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 lg:p-10 leading-relaxed text-neutral-200">
            {article.excerpt && (
              <p className="mb-8 text-lg font-medium text-emerald-300/90 border-l-2 border-emerald-500 pl-4">
                {article.excerpt}
              </p>
            )}

            <div className="whitespace-pre-wrap leading-relaxed space-y-4 text-base text-neutral-300">
              {article.content}
            </div>

            {article.tags && article.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2 border-t border-white/10 pt-6">
                {article.tags.map((tag) => (
                  <span key={tag} className="rounded-md bg-white/5 px-2.5 py-1 text-xs text-neutral-400">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Related News */}
          {related.length > 0 && (
            <div>
              <h2 className="mb-6 text-2xl font-bold text-white">Related Stories</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {related.map((item: any) => (
                  <Link
                    key={item.id}
                    href={`/news/${item.slug}`}
                    className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5"
                  >
                    <h3 className="mb-2 font-bold text-white group-hover:text-emerald-400 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-neutral-500">{item.publishedAt ? formatDate(item.publishedAt) : ""}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
