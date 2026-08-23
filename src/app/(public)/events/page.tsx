import Link from "next/link";
import { getEvents } from "@/actions/event-actions";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, ArrowRight, User } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function EventsPage() {
  const { data: events } = await getEvents({ pageSize: 50 });

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-950 via-emerald-950/20 to-neutral-950 py-20">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 text-center lg:px-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
            <Calendar className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-black text-white md:text-6xl">Club Events</h1>
          <p className="mt-4 text-neutral-400">Join our training camps, general meetings, award nights, and community days</p>
        </div>
      </section>

      {/* Events List */}
      <section className="bg-neutral-950 py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          {events.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center text-neutral-400">
              <Calendar className="mx-auto mb-3 h-10 w-10 text-neutral-500" />
              <p className="text-lg font-medium text-white">No upcoming events scheduled</p>
              <p className="text-sm text-neutral-500">Check back soon for new club activities and announcements.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5 flex flex-col justify-between"
                >
                  <div>
                    <div className="mb-4 flex items-start justify-between">
                      <div className="rounded-xl bg-emerald-600/20 p-3">
                        <Calendar className="h-5 w-5 text-emerald-400" />
                      </div>
                      <Badge
                        variant="secondary"
                        className={
                          event.status === "COMPLETED"
                            ? "bg-neutral-800 text-neutral-400"
                            : "bg-emerald-500/10 text-emerald-400"
                        }
                      >
                        {event.eventType.replace("_", " ")}
                      </Badge>
                    </div>

                    <h3 className="mb-2 text-xl font-bold text-white transition-colors group-hover:text-emerald-400">
                      {event.title}
                    </h3>
                    {event.description && (
                      <p className="mb-4 line-clamp-3 text-sm text-neutral-400">
                        {event.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 border-t border-white/5 pt-4 text-xs text-neutral-500">
                    <p className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-emerald-500" />
                      {formatDate(event.eventDate)}
                      {event.startTime && ` • ${event.startTime}`}
                      {event.endTime && ` - ${event.endTime}`}
                    </p>
                    {event.venue && (
                      <p className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                        {event.venue}
                      </p>
                    )}
                    {event.organizer && (
                      <p className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-emerald-500" />
                        Organizer: {event.organizer}
                      </p>
                    )}
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
