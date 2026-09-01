"use server";

import { db } from "@/lib/db";

export interface H2HSummary {
  opponentTeam: any;
  fcBbffTeam: any;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  winRate: number;
  cleanSheets: number;
  biggestWin: { score: string; date: Date } | null;
  recentMatches: any[];
}

export async function getHeadToHeadStats(opponentTeamId: string): Promise<H2HSummary | null> {
  // Find FC BBFF team
  const fcBbffTeam = await db.team.findFirst({
    where: {
      OR: [
        { name: { contains: "FC BBFF", mode: "insensitive" } },
        { name: { contains: "BBFF", mode: "insensitive" } },
      ],
    },
  });

  const opponentTeam = await db.team.findUnique({
    where: { id: opponentTeamId },
  });

  if (!fcBbffTeam || !opponentTeam) return null;

  // Fetch all completed matches between FC BBFF and this opponent team
  const matches = await db.match.findMany({
    where: {
      status: "COMPLETED",
      OR: [
        { homeTeamId: fcBbffTeam.id, awayTeamId: opponentTeam.id },
        { homeTeamId: opponentTeam.id, awayTeamId: fcBbffTeam.id },
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
    const isHome = m.homeTeamId === fcBbffTeam.id;
    const bbffScore = isHome ? (m.homeScore ?? 0) : (m.awayScore ?? 0);
    const oppScore = isHome ? (m.awayScore ?? 0) : (m.homeScore ?? 0);

    goalsFor += bbffScore;
    goalsAgainst += oppScore;

    if (oppScore === 0) {
      cleanSheets += 1;
    }

    if (bbffScore > oppScore) {
      wins += 1;
      const margin = bbffScore - oppScore;
      if (margin > biggestWinMargin) {
        biggestWinMargin = margin;
        biggestWin = { score: `${bbffScore}-${oppScore}`, date: m.matchDate };
      }
    } else if (bbffScore === oppScore) {
      draws += 1;
    } else {
      losses += 1;
    }
  });

  const goalDifference = goalsFor - goalsAgainst;
  const winRate = played > 0 ? Math.round((wins / played) * 100) : 0;

  return {
    opponentTeam,
    fcBbffTeam,
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
  // Find FC BBFF team
  const fcBbffTeam = await db.team.findFirst({
    where: {
      OR: [
        { name: { contains: "FC BBFF", mode: "insensitive" } },
        { name: { contains: "BBFF", mode: "insensitive" } },
      ],
    },
  });

  if (!fcBbffTeam) return [];

  // Find all other active teams
  const opponentTeams = await db.team.findMany({
    where: {
      id: { not: fcBbffTeam.id },
      status: "ACTIVE",
    },
  });

  const records = await Promise.all(
    opponentTeams.map((team) => getHeadToHeadStats(team.id))
  );

  // Return non-null records sorted by total matches played desc
  return records
    .filter((r): r is H2HSummary => r !== null)
    .sort((a, b) => b.played - a.played);
}
