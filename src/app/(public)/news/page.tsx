import Link from "next/link";
import { getLatestNews, getNewsCategories } from "@/actions/news-actions";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Shield } from "lucide-react";

export default async function NewsPage() {
  const [news, categories] = await Promise.all([getLatestNews(20), getNewsCategories()]);

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-950 via-emerald-950/20 to-neutral-950 py-20">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 text-center lg:px-8">
          <h1 className="text-4xl font-black text-white md:text-6xl">News</h1>
          <p className="mt-4 text-neutral-400">Latest updates and stories from the club</p>
        </div>
      </section>

      <section className="bg-neutral-950 py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          {news.length === 0 ? (
            <p className="text-center text-neutral-500">No news articles published yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {news.map((article: any) => (
                <Link key={article.id} href={`/news/${article.slug}`}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5">
                  <div className="flex h-48 items-center justify-center bg-gradient-to-br from-emerald-900/30 to-neutral-900">
                    <Shield className="h-12 w-12 text-emerald-500/30" />
                  </div>
                  <div className="p-5">
                    {article.category && (
                      <Badge variant="secondary" className="mb-2 bg-emerald-500/10 text-emerald-400">{article.category.name}</Badge>
                    )}
                    <h3 className="mb-2 text-lg font-bold text-white group-hover:text-emerald-400">{article.title}</h3>
                    {article.excerpt && <p className="mb-3 line-clamp-2 text-sm text-neutral-400">{article.excerpt}</p>}
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span>{article.author?.name}</span>
                      <span>{article.publishedAt ? formatDate(article.publishedAt) : ""}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
