import { notFound } from "next/navigation";
import Link from "next/link";
import { getEventBySlug } from "@/actions/event-actions";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, ArrowLeft, User, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) notFound();

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-950 via-emerald-950/20 to-neutral-950 py-16">
        <div className="relative mx-auto max-w-4xl px-4 lg:px-8">
          <Link
            href="/events"
            className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Events
          </Link>

          <div className="flex items-center gap-3 mb-3">
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400">
              {event.eventType.replace("_", " ")}
            </Badge>
            <Badge
              variant="secondary"
              className={event.status === "COMPLETED" ? "bg-neutral-800 text-neutral-400" : "bg-emerald-600/20 text-emerald-300"}
            >
              {event.status}
            </Badge>
          </div>

          <h1 className="text-3xl font-black text-white md:text-5xl">{event.title}</h1>
        </div>
      </section>

      <section className="bg-neutral-950 py-12">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 lg:p-8">
                <h2 className="mb-4 text-xl font-bold text-white">Event Details</h2>
                <div className="whitespace-pre-wrap leading-relaxed text-neutral-300">
                  {event.description || "No detailed description provided for this event."}
                </div>

                {event.registrationUrl && (
                  <div className="mt-8">
                    <a
                      href={event.registrationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all"
                    >
                      Register Now <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="mb-4 text-lg font-bold text-white">Information</h3>
                <div className="space-y-4 text-sm text-neutral-300">
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-4 w-4 text-emerald-400" />
                    <div>
                      <p className="font-medium text-white">Date</p>
                      <p className="text-neutral-400">{formatDate(event.eventDate)}</p>
                    </div>
                  </div>

                  {(event.startTime || event.endTime) && (
                    <div className="flex items-start gap-3">
                      <Clock className="mt-0.5 h-4 w-4 text-emerald-400" />
                      <div>
                        <p className="font-medium text-white">Time</p>
                        <p className="text-neutral-400">
                          {event.startTime || ""} {event.endTime ? `- ${event.endTime}` : ""}
                        </p>
                      </div>
                    </div>
                  )}

                  {event.venue && (
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 text-emerald-400" />
                      <div>
                        <p className="font-medium text-white">Venue</p>
                        <p className="text-neutral-400">{event.venue}</p>
                      </div>
                    </div>
                  )}

                  {event.organizer && (
                    <div className="flex items-start gap-3">
                      <User className="mt-0.5 h-4 w-4 text-emerald-400" />
                      <div>
                        <p className="font-medium text-white">Organizer</p>
                        <p className="text-neutral-400">{event.organizer}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
