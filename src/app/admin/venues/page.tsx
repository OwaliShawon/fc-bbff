import { getVenues } from "@/actions/venue-actions";
import { VenuesClient } from "./venues-client";

export default async function VenuesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = (params.search as string) || "";

  const venuesData = await getVenues({ page, pageSize: 10, search });

  return (
    <VenuesClient
      initialData={venuesData}
      currentPage={page}
      currentSearch={search}
    />
  );
}
