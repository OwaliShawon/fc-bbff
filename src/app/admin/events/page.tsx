import { getEvents } from "@/actions/event-actions";
import { EventsClient } from "./events-client";

export default async function AdminEventsPage(props: {
  searchParams: Promise<{ page?: string; search?: string; status?: string; eventType?: string }>;
}) {
  const searchParams = await props.searchParams;
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const events = await getEvents({
    page,
    pageSize: 15,
    search: searchParams.search,
    status: searchParams.status,
    eventType: searchParams.eventType,
  });

  return <EventsClient initialData={events} />;
}
