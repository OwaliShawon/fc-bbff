import { getPlayerStatistics } from "@/actions/settings-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Flame, Star, ShieldAlert, Award } from "lucide-react";

export default async function AdminStatisticsPage() {
  const stats = await getPlayerStatistics();

  const topScorers = [...stats].filter((s) => s.goals > 0).sort((a, b) => b.goals - a.goals).slice(0, 10);
  const topAssists = [...stats].filter((s) => s.assists > 0).sort((a, b) => b.assists - a.assists).slice(0, 10);
  const topPotm = [...stats].filter((s) => s.playerOfMatchAwards > 0).sort((a, b) => b.playerOfMatchAwards - a.playerOfMatchAwards).slice(0, 10);
  const topCards = [...stats].filter((s) => s.yellowCards > 0 || s.redCards > 0).sort((a, b) => (b.yellowCards + b.redCards * 3) - (a.yellowCards + a.redCards * 3)).slice(0, 10);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Squad Statistics & Leaderboards
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Auto-computed performance metrics across all recorded competitive club fixtures.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Scorers */}
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-emerald-400">
              <Flame className="h-5 w-5" /> Top Goalscorers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-center font-mono">Matches</TableHead>
                  <TableHead className="text-right font-bold text-emerald-400">Goals</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topScorers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-neutral-500">
                      No goals recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  topScorers.map((item, idx) => (
                    <TableRow key={item.playerId}>
                      <TableCell className="font-bold text-neutral-400">{idx + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            {item.playerPhoto && <AvatarImage src={item.playerPhoto} />}
                            <AvatarFallback className="text-xs">
                              {item.playerName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-semibold text-white">
                            {item.playerName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-mono text-neutral-400">{item.matchesPlayed}</TableCell>
                      <TableCell className="text-right font-mono text-lg font-bold text-emerald-400">
                        {item.goals}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Assists */}
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-blue-400">
              <Award className="h-5 w-5" /> Top Playmakers (Assists)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-center font-mono">Matches</TableHead>
                  <TableHead className="text-right font-bold text-blue-400">Assists</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topAssists.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-neutral-500">
                      No assists recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  topAssists.map((item, idx) => (
                    <TableRow key={item.playerId}>
                      <TableCell className="font-bold text-neutral-400">{idx + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            {item.playerPhoto && <AvatarImage src={item.playerPhoto} />}
                            <AvatarFallback className="text-xs">
                              {item.playerName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-semibold text-white">
                            {item.playerName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-mono text-neutral-400">{item.matchesPlayed}</TableCell>
                      <TableCell className="text-right font-mono text-lg font-bold text-blue-400">
                        {item.assists}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* POTM */}
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-amber-400">
              <Star className="h-5 w-5" /> Player of the Match
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right font-bold text-amber-400">Awards</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPotm.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-neutral-500">
                      No POTM awards recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  topPotm.map((item, idx) => (
                    <TableRow key={item.playerId}>
                      <TableCell className="font-bold text-neutral-400">{idx + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            {item.playerPhoto && <AvatarImage src={item.playerPhoto} />}
                            <AvatarFallback className="text-xs">
                              {item.playerName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-semibold text-white">
                            {item.playerName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-lg font-bold text-amber-400">
                        {item.playerOfMatchAwards}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Cards & Disciplinary */}
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-red-400">
              <ShieldAlert className="h-5 w-5" /> Cards & Disciplinary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-center font-bold text-yellow-400">Yellow</TableHead>
                  <TableHead className="text-center font-bold text-red-400">Red</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCards.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-neutral-500">
                      Clean disciplinary record!
                    </TableCell>
                  </TableRow>
                ) : (
                  topCards.map((item, idx) => (
                    <TableRow key={item.playerId}>
                      <TableCell className="font-bold text-neutral-400">{idx + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            {item.playerPhoto && <AvatarImage src={item.playerPhoto} />}
                            <AvatarFallback className="text-xs">
                              {item.playerName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-semibold text-white">
                            {item.playerName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-mono font-bold text-yellow-400">
                        {item.yellowCards}
                      </TableCell>
                      <TableCell className="text-center font-mono font-bold text-red-400">
                        {item.redCards}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
