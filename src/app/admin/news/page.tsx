import { getNews, getNewsCategories } from "@/actions/news-actions";
import { NewsClient } from "./news-client";

export default async function AdminNewsPage(props: {
  searchParams: Promise<{ page?: string; search?: string; status?: string; categoryId?: string }>;
}) {
  const searchParams = await props.searchParams;
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const [news, categories] = await Promise.all([
    getNews({
      page,
      pageSize: 15,
      search: searchParams.search,
      status: searchParams.status,
      categoryId: searchParams.categoryId,
    }),
    getNewsCategories(),
  ]);

  return <NewsClient initialData={news} categories={categories} />;
}
