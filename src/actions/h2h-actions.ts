"use server";

import { db } from "@/lib/db";

export interface H2HSummary {
  opponentTeam: any; // Team 2 (Opponent or Internal Team)
  fcBbffTeam: any;   // Team 1 (Primary or Internal Team)
  played: number;
  wins: number;      // Team 1 Wins
  draws: number;
  losses: number;    // Team 2 Wins
  goalsFor: number;  // Team 1 Goals
  goalsAgainst: number; // Team 2 Goals
  goalDifference: number;
  winRate: number;   // Team 1 Win Rate
  cleanSheets: number;
  biggestWin: { score: string; date: Date } | null;
  recentMatches: any[];
}

export async function getHeadToHeadStats(
  team1IdOrOpponentId: string,
  team2Id?: string
): Promise<H2HSummary | null> {
  let team1: any;
  let team2: any;

  if (team2Id) {
    [team1, team2] = await Promise.all([
      db.team.findUnique({ where: { id: team1IdOrOpponentId } }),
      db.team.findUnique({ where: { id: team2Id } }),
    ]);
  } else {
    // Default fallback: Find primary FC BBFF team as team1
    team1 = await db.team.findFirst({
      where: {
        isExternal: false,
        OR: [
          { name: { contains: "FC BBFF", mode: "insensitive" } },
          { name: { contains: "BBFF", mode: "insensitive" } },
        ],
      },
    });

    if (!team1) {
      team1 = await db.team.findFirst({ where: { isExternal: false } });
    }

    team2 = await db.team.findUnique({
      where: { id: team1IdOrOpponentId },
    });
  }

  if (!team1 || !team2) return null;

  // Fetch all completed matches between team1 and team2
  const matches = await db.match.findMany({
    where: {
      status: "COMPLETED",
      OR: [
        { homeTeamId: team1.id, awayTeamId: team2.id },
        { homeTeamId: team2.id, awayTeamId: team1.id },
      ],
    },
    include: {
      homeTeam: true,
      awayTeam: true,
      competition: true,
    },
    orderBy: { matchDate: "desc" },
  });

  let played = matches.length;
  let wins = 0;
  let draws = 0;
  let losses = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;
  let cleanSheets = 0;
  let biggestWinMargin = -1;
  let biggestWin: { score: string; date: Date } | null = null;

  matches.forEach((m) => {
    const isTeam1Home = m.homeTeamId === team1.id;
    const t1Score = isTeam1Home ? (m.homeScore ?? 0) : (m.awayScore ?? 0);
    const t2Score = isTeam1Home ? (m.awayScore ?? 0) : (m.homeScore ?? 0);

    goalsFor += t1Score;
    goalsAgainst += t2Score;

    if (t2Score === 0) {
      cleanSheets += 1;
    }

    if (t1Score > t2Score) {
      wins += 1;
      const margin = t1Score - t2Score;
      if (margin > biggestWinMargin) {
        biggestWinMargin = margin;
        biggestWin = { score: `${t1Score}-${t2Score}`, date: m.matchDate };
      }
    } else if (t1Score === t2Score) {
      draws += 1;
    } else {
      losses += 1;
    }
  });

  const goalDifference = goalsFor - goalsAgainst;
  const winRate = played > 0 ? Math.round((wins / played) * 100) : 0;

  return {
    opponentTeam: team2,
    fcBbffTeam: team1,
    played,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    goalDifference,
    winRate,
    cleanSheets,
    biggestWin,
    recentMatches: matches,
  };
}

export async function getAllOpponentRecords(): Promise<H2HSummary[]> {
  const fcBbffTeam = await db.team.findFirst({
    where: {
      isExternal: false,
      OR: [
        { name: { contains: "FC BBFF", mode: "insensitive" } },
        { name: { contains: "BBFF", mode: "insensitive" } },
      ],
    },
  });

  if (!fcBbffTeam) return [];

  const opponentTeams = await db.team.findMany({
    where: {
      id: { not: fcBbffTeam.id },
      isExternal: false,
      status: "ACTIVE",
    },
    orderBy: { name: "asc" },
  });

  const records = await Promise.all(
    opponentTeams.map((team) => getHeadToHeadStats(fcBbffTeam.id, team.id))
  );

  return records
    .filter((r): r is H2HSummary => r !== null)
    .sort((a, b) => b.played - a.played);
}

export async function getH2HTeamOptions() {
  const teams = await db.team.findMany({
    where: { status: "ACTIVE", deletedAt: null },
    orderBy: [{ isExternal: "asc" }, { name: "asc" }],
  });

  const internalTeams = teams.filter((t) => !t.isExternal);
  const outsiderTeams = teams.filter((t) => t.isExternal);

  return { internalTeams, outsiderTeams, allTeams: teams };
}
