import { getEvents } from "@/actions/event-actions";
import { getAllVenues } from "@/actions/venue-actions";
import { EventsClient } from "./events-client";

export default async function AdminEventsPage(props: {
  searchParams: Promise<{ page?: string; search?: string; status?: string; eventType?: string }>;
}) {
  const searchParams = await props.searchParams;
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const [events, venues] = await Promise.all([
    getEvents({
      page,
      pageSize: 15,
      search: searchParams.search,
      status: searchParams.status,
      eventType: searchParams.eventType,
    }),
    getAllVenues(),
  ]);

  return <EventsClient initialData={events} venues={venues} />;
}
