import {
  getDashboardStats,
  getRecentAuditLogs,
} from "@/actions/settings-actions";
import { getUpcomingMatches, getRecentResults } from "@/actions/match-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserCheck,
  Trophy,
  Calendar,
  CheckCircle,
  CalendarDays,
  Newspaper,
  Shield,
} from "lucide-react";
import { formatDate, formatDateTime, getMatchStatusColor } from "@/lib/utils";

export default async function AdminDashboard() {
  const [stats, recentLogs, upcomingMatches, recentResults] = await Promise.all(
    [
      getDashboardStats(),
      getRecentAuditLogs(5),
      getUpcomingMatches(5),
      getRecentResults(5),
    ]
  );

  const statCards = [
    {
      title: "Total Players",
      value: stats.totalPlayers,
      icon: Users,
      color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Active Players",
      value: stats.activePlayers,
      icon: UserCheck,
      color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      title: "Teams",
      value: stats.totalTeams,
      icon: Shield,
      color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
    },
    {
      title: "Upcoming Matches",
      value: stats.upcomingMatches,
      icon: Calendar,
      color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
    },
    {
      title: "Completed Matches",
      value: stats.completedMatches,
      icon: CheckCircle,
      color: "text-green-600 bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "Upcoming Events",
      value: stats.upcomingEvents,
      icon: CalendarDays,
      color: "text-pink-600 bg-pink-100 dark:bg-pink-900/30",
    },
    {
      title: "Published News",
      value: stats.publishedNews,
      icon: Newspaper,
      color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Trophy,
      color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-neutral-500">Overview of your club management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card
            key={stat.title}
            className="border-neutral-200 dark:border-neutral-800"
          >
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`rounded-xl p-3 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-xs text-neutral-500">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Matches */}
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4 text-emerald-600" />
              Upcoming Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingMatches.length === 0 ? (
              <p className="text-sm text-neutral-500">
                No upcoming matches scheduled.
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingMatches.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between rounded-lg border border-neutral-100 p-3 dark:border-neutral-800"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {(match as any).homeTeam?.name} vs{" "}
                        {(match as any).awayTeam?.name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {formatDateTime(match.matchDate)}
                        {match.venue && ` • ${match.venue}`}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={getMatchStatusColor(match.status)}
                    >
                      {match.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Results */}
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-4 w-4 text-amber-600" />
              Recent Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentResults.length === 0 ? (
              <p className="text-sm text-neutral-500">
                No results published yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentResults.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between rounded-lg border border-neutral-100 p-3 dark:border-neutral-800"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {(match as any).homeTeam?.name}
                        </span>
                        <span className="font-bold text-emerald-600">
                          {match.homeScore} - {match.awayScore}
                        </span>
                        <span className="text-sm font-medium">
                          {(match as any).awayTeam?.name}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500">
                        {formatDate(match.matchDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-neutral-200 lg:col-span-2 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentLogs.length === 0 ? (
              <p className="text-sm text-neutral-500">No recent activity.</p>
            ) : (
              <div className="space-y-3">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start justify-between border-b border-neutral-100 pb-3 last:border-0 dark:border-neutral-800"
                  >
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">
                          {(log as any).user?.name}
                        </span>{" "}
                        {log.description || `${log.action} in ${log.module}`}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {formatDateTime(log.createdAt)}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {log.module}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
