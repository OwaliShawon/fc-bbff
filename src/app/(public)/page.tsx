import Link from "next/link";
import { getSiteSettings } from "@/actions/settings-actions";
import { getLatestNews } from "@/actions/news-actions";
import { getUpcomingMatches, getRecentResults } from "@/actions/match-actions";
import { getFeaturedPlayers } from "@/actions/player-actions";
import { getUpcomingEvents } from "@/actions/event-actions";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Calendar,
  Trophy,
  ArrowRight,
  MapPin,
  Clock,
  ChevronRight,
  Star,
  Users,
  Target,
} from "lucide-react";
import { formatDate, formatDateTime, getPlayerPositionColor } from "@/lib/utils";

export default async function HomePage() {
  const [settings, latestNews, upcomingMatches, recentResults, featuredPlayers, upcomingEvents] =
    await Promise.all([
      getSiteSettings(),
      getLatestNews(3),
      getUpcomingMatches(3),
      getRecentResults(1),
      getFeaturedPlayers(),
      getUpcomingEvents(3),
    ]);

  const latestResult = recentResults[0];

  return (
    <div className="min-h-screen">
      {/* ====== HERO SECTION ====== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-950 via-emerald-950/30 to-neutral-950 py-24 lg:py-36">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-emerald-600/10 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/5 blur-2xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 text-center lg:px-8">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-2xl shadow-emerald-500/30">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="mb-4 text-5xl font-black tracking-tight text-white md:text-7xl lg:text-8xl">
            {settings.clubName}
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-emerald-200/80 md:text-xl">
            {settings.clubMotto || "Excellence in Football, Unity in Spirit"}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/matches"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-3.5 font-semibold text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-500 hover:shadow-emerald-500/40"
            >
              <Calendar className="h-5 w-5" />
              View Fixtures
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-3.5 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
            >
              About Us
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ====== LATEST RESULT ====== */}
      {latestResult && (
        <section className="border-b border-white/10 bg-neutral-900/50">
          <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
            <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-amber-400" />
                <span className="text-sm font-medium uppercase tracking-wider text-neutral-400">
                  Latest Result
                </span>
              </div>
              <Link href={`/matches/${latestResult.id}`} className="group flex items-center gap-6">
                <div className="text-right">
                  <p className="text-lg font-bold text-white">{(latestResult as any).homeTeam?.name}</p>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-emerald-600/20 px-6 py-3">
                  <span className="text-3xl font-black text-emerald-400">
                    {latestResult.homeScore}
                  </span>
                  <span className="text-neutral-500">-</span>
                  <span className="text-3xl font-black text-emerald-400">
                    {latestResult.awayScore}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold text-white">{(latestResult as any).awayTeam?.name}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-neutral-500 transition-transform group-hover:translate-x-1" />
              </Link>
              <span className="text-sm text-neutral-500">
                {formatDate(latestResult.matchDate)}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* ====== UPCOMING MATCHES ====== */}
      {upcomingMatches.length > 0 && (
        <section className="border-b border-white/10 bg-neutral-950 py-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white">Upcoming Matches</h2>
                <p className="mt-1 text-neutral-400">Don&apos;t miss our next fixtures</p>
              </div>
              <Link href="/matches" className="flex items-center gap-1 text-sm font-medium text-emerald-400 hover:text-emerald-300">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingMatches.map((match) => (
                <Link
                  key={match.id}
                  href={`/matches/${match.id}`}
                  className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5"
                >
                  {(match as any).competition && (
                    <p className="mb-3 text-xs font-medium uppercase tracking-wider text-emerald-400">
                      {(match as any).competition.name}
                    </p>
                  )}
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-center">
                      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-sm font-bold text-white">
                        {(match as any).homeTeam?.name?.charAt(0)}
                      </div>
                      <p className="text-sm font-medium text-white">{(match as any).homeTeam?.name}</p>
                    </div>
                    <div className="px-4 text-center">
                      <p className="text-lg font-bold text-neutral-500">VS</p>
                    </div>
                    <div className="text-center">
                      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-sm font-bold text-white">
                        {(match as any).awayTeam?.name?.charAt(0)}
                      </div>
                      <p className="text-sm font-medium text-white">{(match as any).awayTeam?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDateTime(match.matchDate)}
                    </span>
                    {match.venue && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {match.venue}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ====== FEATURED PLAYERS ====== */}
      {featuredPlayers.length > 0 && (
        <section className="border-b border-white/10 bg-gradient-to-b from-neutral-950 to-neutral-900 py-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white">Featured Players</h2>
                <p className="mt-1 text-neutral-400">Meet our star players</p>
              </div>
              <Link href="/players" className="flex items-center gap-1 text-sm font-medium text-emerald-400 hover:text-emerald-300">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {featuredPlayers.map((player) => (
                <Link
                  key={player.id}
                  href={`/players/${player.slug}`}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5"
                >
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 text-2xl font-bold text-emerald-400">
                    {player.jerseyNumber || "?"}
                  </div>
                  <h3 className="text-sm font-bold text-white">
                    {player.firstName} {player.lastName}
                  </h3>
                  <Badge variant="secondary" className={`mt-1 text-[10px] ${getPlayerPositionColor(player.position)}`}>
                    {player.position}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ====== LATEST NEWS ====== */}
      {latestNews.length > 0 && (
        <section className="border-b border-white/10 bg-neutral-950 py-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white">Latest News</h2>
                <p className="mt-1 text-neutral-400">Stay updated with the club</p>
              </div>
              <Link href="/news" className="flex items-center gap-1 text-sm font-medium text-emerald-400 hover:text-emerald-300">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {latestNews.map((article) => (
                <Link
                  key={article.id}
                  href={`/news/${article.slug}`}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5"
                >
                  <div className="flex h-48 items-center justify-center bg-gradient-to-br from-emerald-900/30 to-neutral-900">
                    <Shield className="h-12 w-12 text-emerald-500/30" />
                  </div>
                  <div className="p-5">
                    {(article as any).category && (
                      <Badge variant="secondary" className="mb-2 bg-emerald-500/10 text-emerald-400">
                        {(article as any).category.name}
                      </Badge>
                    )}
                    <h3 className="mb-2 text-lg font-bold text-white transition-colors group-hover:text-emerald-400">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="mb-3 line-clamp-2 text-sm text-neutral-400">{article.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span>{(article as any).author?.name}</span>
                      <span>{article.publishedAt ? formatDate(article.publishedAt) : ""}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ====== UPCOMING EVENTS ====== */}
      {upcomingEvents.length > 0 && (
        <section className="border-b border-white/10 bg-neutral-900/50 py-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white">Upcoming Events</h2>
                <p className="mt-1 text-neutral-400">What&apos;s happening at the club</p>
              </div>
              <Link href="/events" className="flex items-center gap-1 text-sm font-medium text-emerald-400 hover:text-emerald-300">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="rounded-xl bg-emerald-600/20 p-3">
                      <Calendar className="h-5 w-5 text-emerald-400" />
                    </div>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 text-xs">
                      {event.eventType.replace("_", " ")}
                    </Badge>
                  </div>
                  <h3 className="mb-2 font-bold text-white group-hover:text-emerald-400">{event.title}</h3>
                  <div className="space-y-1 text-xs text-neutral-500">
                    <p className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(event.eventDate)}
                      {event.startTime && ` • ${event.startTime}`}
                    </p>
                    {event.venue && (
                      <p className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.venue}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ====== CTA SECTION ====== */}
      <section className="bg-gradient-to-r from-emerald-900/30 via-emerald-800/20 to-emerald-900/30 py-20">
        <div className="mx-auto max-w-7xl px-4 text-center lg:px-8">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Join the {settings.clubName} Family
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-neutral-300">
            Whether you&apos;re a player, supporter, or volunteer — there&apos;s a place for you at{" "}
            {settings.clubName}.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-3.5 font-semibold text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-500"
            >
              <Users className="h-5 w-5" />
              Learn More
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-3.5 font-semibold text-white transition-all hover:bg-white/10"
            >
              <Calendar className="h-5 w-5" />
              Upcoming Events
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
