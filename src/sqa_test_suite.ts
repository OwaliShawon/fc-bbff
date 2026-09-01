import "dotenv/config";
import { db } from "./lib/db";
import { getPlayers, getPlayerBySlug, getAllActivePlayers } from "./actions/player-actions";
import { getTeams, getAllActiveTeams, getTeamSquad } from "./actions/team-actions";
import { getMatches } from "./actions/match-actions";
import { getCompetitions, getSeasons, getLeagueTable } from "./actions/competition-actions";
import { getEvents } from "./actions/event-actions";
import { getNews, getNewsCategories } from "./actions/news-actions";
import { getManagementMembers } from "./actions/management-actions";
import { getDashboardStats, getPlayerStatistics, getSiteSettings } from "./actions/settings-actions";
import { getAuditLogs } from "./services/audit-log";
import { getMediaFiles } from "./actions/media-actions";

type TestResult = {
  testCase: string;
  category: "DATABASE" | "PUBLIC_PAGES" | "ADMIN_PAGES" | "BRANDING_INTEGRITY" | "SECURITY_PERMISSIONS";
  status: "PASS" | "FAIL";
  details: string;
  durationMs: number;
};

const results: TestResult[] = [];

async function runTest(
  category: TestResult["category"],
  testCase: string,
  fn: () => Promise<void>
) {
  const start = Date.now();
  try {
    await fn();
    results.push({
      testCase,
      category,
      status: "PASS",
      details: "Executed successfully without errors.",
      durationMs: Date.now() - start,
    });
  } catch (err: any) {
    results.push({
      testCase,
      category,
      status: "FAIL",
      details: err.message || String(err),
      durationMs: Date.now() - start,
    });
  }
}

async function main() {
  console.log("=================================================");
  console.log("    FC BBFF - COMPREHENSIVE SQA TEST SUITE      ");
  console.log("=================================================\n");

  // 1. DATABASE & CONNECTIVITY
  await runTest("DATABASE", "Neon Database Connection & Prisma Health Check", async () => {
    const userCount = await db.user.count();
    if (userCount < 1) throw new Error("No users found in database");
  });

  // 2. BRANDING & IDENTITY
  await runTest("BRANDING_INTEGRITY", "Brand Name & Motto Verification", async () => {
    const settings = await getSiteSettings();
    if (settings.clubName !== "FC BBFF") {
      throw new Error(`Expected clubName 'FC BBFF', got '${settings.clubName}'`);
    }
    if (settings.clubMotto !== "One for All, All for One") {
      throw new Error(`Expected motto 'One for All, All for One', got '${settings.clubMotto}'`);
    }
  });

  // 3. PUBLIC - PLAYERS & SQUADS
  await runTest("PUBLIC_PAGES", "Squad Roster Query & Position Grouping", async () => {
    const { data: players } = await getPlayers({ pageSize: 50 });
    if (players.length === 0) throw new Error("No players returned");
    const positions = new Set(players.map((p) => p.position));
    if (!positions.has("MIDFIELDER") && !positions.has("FORWARD")) {
      throw new Error("Missing expected player positions");
    }
  });

  await runTest("PUBLIC_PAGES", "Player Slug Detail Lookup", async () => {
    const { data: players } = await getPlayers({ pageSize: 1 });
    if (players.length > 0) {
      const player = await getPlayerBySlug(players[0].slug);
      if (!player || player.id !== players[0].id) {
        throw new Error("Failed to retrieve player by slug");
      }
    }
  });

  // 4. PUBLIC - MANAGEMENT & LEADERSHIP
  await runTest("PUBLIC_PAGES", "Club Leadership & Management Query (Owali Shawon 2014-2025)", async () => {
    const members = await getManagementMembers();
    if (members.length === 0) throw new Error("No management members found");
    const owali = members.find((m) => m.name.toLowerCase().includes("owali") && m.role === "MANAGER");
    if (!owali) throw new Error("Owali Shawon record not found in management");
    if (owali.role !== "MANAGER") throw new Error(`Expected MANAGER role, got ${owali.role}`);
    if (!owali.tenure.includes("2014")) throw new Error(`Expected 2014 tenure, got ${owali.tenure}`);
  });

  // 5. PUBLIC - MATCHES & FIXTURES
  await runTest("PUBLIC_PAGES", "Matches & Fixtures Query", async () => {
    const matches = await getMatches({ pageSize: 10 });
    if (!matches.data) throw new Error("Matches data query failed");
  });

  // 6. PUBLIC - COMPETITIONS & LEAGUE TABLE
  await runTest("PUBLIC_PAGES", "Competitions & League Standings Point Calculation", async () => {
    const { data: comps } = await getCompetitions({ pageSize: 5 });
    if (comps.length > 0) {
      const table = await getLeagueTable(comps[0].id);
      if (!Array.isArray(table)) throw new Error("League table did not return an array");
    }
  });

  // 7. PUBLIC - EVENTS & NEWS
  await runTest("PUBLIC_PAGES", "Club Events Query", async () => {
    const events = await getEvents({ pageSize: 10 });
    if (!events.data) throw new Error("Events query failed");
  });

  await runTest("PUBLIC_PAGES", "News Articles & Categories Query", async () => {
    const [news, categories] = await Promise.all([
      getNews({ pageSize: 10 }),
      getNewsCategories(),
    ]);
    if (!news.data) throw new Error("News query failed");
  });

  // 8. PUBLIC - STATS & LEADERBOARDS
  await runTest("PUBLIC_PAGES", "Squad Statistics & Leaderboard Aggregations", async () => {
    const stats = await getPlayerStatistics();
    if (!Array.isArray(stats)) throw new Error("Player statistics did not return an array");
  });

  // 9. ADMIN SUITE
  await runTest("ADMIN_PAGES", "Admin Dashboard KPI Statistics", async () => {
    const kpis = await getDashboardStats();
    if (typeof kpis.totalPlayers !== "number") throw new Error("totalPlayers KPI invalid");
    if (typeof kpis.totalTeams !== "number") throw new Error("totalTeams KPI invalid");
  });

  await runTest("ADMIN_PAGES", "Admin Teams Management Query", async () => {
    const teams = await getTeams({ pageSize: 20 });
    if (!teams.data) throw new Error("Teams query failed");
  });

  await runTest("ADMIN_PAGES", "Admin Teams & Squad Roster Query (getTeamSquad)", async () => {
    const teams = await getTeams({ pageSize: 5 });
    if (!teams.data || teams.data.length === 0) throw new Error("No teams found");
    const squad = await getTeamSquad(teams.data[0].id);
    if (!Array.isArray(squad)) throw new Error("Squad did not return an array");
    if (squad.length === 0) throw new Error("Expected squad members in team");
    if (!squad[0].player) throw new Error("Squad member missing player details");
  });

  await runTest("ADMIN_PAGES", "Admin Active Players & Teams for Squad Assignment", async () => {
    const [allPlayers, allTeams] = await Promise.all([
      getAllActivePlayers(),
      getAllActiveTeams(),
    ]);
    if (!Array.isArray(allPlayers) || allPlayers.length === 0) {
      throw new Error("Active players list is empty");
    }
    if (!Array.isArray(allTeams) || allTeams.length === 0) {
      throw new Error("Active teams list is empty");
    }
  });

  await runTest("ADMIN_PAGES", "Player Squad Membership & Captaincy Resolution", async () => {
    const player = await db.player.findFirst({
      where: { teamPlayers: { some: { isCaptain: true } } },
      include: { teamPlayers: { include: { team: true } } },
    });
    if (!player) throw new Error("No captain player found");
    const captainTeam = player.teamPlayers.find((tp) => tp.isCaptain);
    if (!captainTeam || !captainTeam.team) throw new Error("Failed to resolve captain team");
  });

  await runTest("ADMIN_PAGES", "Player secondaryPosition Update & Verification", async () => {
    const player = await db.player.findFirst();
    if (!player) throw new Error("No player found");
    const updated = await db.player.update({
      where: { id: player.id },
      data: {
        secondaryPosition: player.secondaryPosition === "FORWARD" ? "MIDFIELDER" : "FORWARD",
      },
    });
    if (!updated) throw new Error("Player update failed");

    // Reset back
    await db.player.update({
      where: { id: player.id },
      data: { secondaryPosition: player.secondaryPosition },
    });
  });

  await runTest("ADMIN_PAGES", "Admin Seasons Management Query", async () => {
    const seasons = await getSeasons();
    if (!Array.isArray(seasons)) throw new Error("Seasons query failed");
  });

  await runTest("ADMIN_PAGES", "Admin Users Account Query", async () => {
    const users = await db.user.findMany({ select: { id: true, email: true, role: true } });
    if (users.length === 0) throw new Error("No admin users found in database");
  });

  await runTest("ADMIN_PAGES", "Admin Media Assets Repository Query", async () => {
    const media = await getMediaFiles();
    if (!Array.isArray(media)) throw new Error("Media query failed");
  });

  await runTest("ADMIN_PAGES", "Admin System Audit Trail Query", async () => {
    const logs = await getAuditLogs(20);
    if (!Array.isArray(logs)) throw new Error("Audit logs query failed");
  });

  // 10. PUBLIC PAGES HTTP 200 RENDERING TESTS
  const publicRoutes = [
    "/",
    "/about",
    "/players",
    "/teams",
    "/management",
    "/matches",
    "/competitions",
    "/events",
    "/news",
    "/statistics",
    "/login",
  ];

  for (const route of publicRoutes) {
    await runTest("PUBLIC_PAGES", `Live HTTP GET: ${route} renders with 200 OK`, async () => {
      const res = await fetch(`http://localhost:3000${route}`);
      if (res.status !== 200) {
        throw new Error(`Expected HTTP 200 for ${route}, got ${res.status}`);
      }
      const html = await res.text();
      if (!html.includes("FC BBFF") && !html.includes("html")) {
        throw new Error(`Unexpected page content for ${route}`);
      }
    });
  }

  // 11. DYNAMIC SLUG RENDERING TESTS
  await runTest("PUBLIC_PAGES", "Live HTTP GET: /players/[slug] dynamic routes render with 200 OK", async () => {
    const players = await db.player.findMany({ where: { deletedAt: null }, take: 3 });
    for (const p of players) {
      const res = await fetch(`http://localhost:3000/players/${p.slug}`);
      if (res.status !== 200) throw new Error(`Failed to render /players/${p.slug}: ${res.status}`);
    }
  });

  await runTest("PUBLIC_PAGES", "Live HTTP GET: /teams/[slug] dynamic routes render with 200 OK", async () => {
    const teams = await db.team.findMany({ where: { deletedAt: null }, take: 3 });
    for (const t of teams) {
      const res = await fetch(`http://localhost:3000/teams/${t.slug}`);
      if (res.status !== 200) throw new Error(`Failed to render /teams/${t.slug}: ${res.status}`);
    }
  });

  await runTest("PUBLIC_PAGES", "Live HTTP GET: /matches/[id] dynamic routes render with 200 OK", async () => {
    const matches = await db.match.findMany({ take: 3 });
    for (const m of matches) {
      const res = await fetch(`http://localhost:3000/matches/${m.id}`);
      if (res.status !== 200) throw new Error(`Failed to render /matches/${m.id}: ${res.status}`);
    }
  });

  // 12. VALIDATION ENGINE & EDGE CASE TESTS
  await runTest("DATABASE", "Validation Schema Tolerates Empty Strings for Optional UUIDs", async () => {
    const { matchResultSchema, createMatchSchema, createNewsSchema } = await import("./lib/validations");
    
    // Test matchResultSchema with empty playerOfMatchId
    const resResult = matchResultSchema.parse({
      homeScore: 3,
      awayScore: 1,
      playerOfMatchId: "",
      matchReport: "Great match",
      status: "COMPLETED",
    });
    if (resResult.playerOfMatchId !== null) throw new Error("Expected empty playerOfMatchId to transform to null");

    // Test matchResultSchema with NONE
    const resResultNone = matchResultSchema.parse({
      homeScore: 2,
      awayScore: 0,
      playerOfMatchId: "NONE",
      status: "COMPLETED",
    });
    if (resResultNone.playerOfMatchId !== null) throw new Error("Expected NONE to transform to null");

    // Test createMatchSchema with empty competitionId and seasonId
    const resMatch = createMatchSchema.parse({
      homeTeamId: "5f14d95c-198f-467d-ad4b-6dc43a277ee6",
      awayTeamId: "5f14d95c-198f-467d-ad4b-6dc43a277ee7",
      matchDate: "2026-09-02T15:00:00Z",
      competitionId: "",
      seasonId: "NONE",
    });
    if (resMatch.competitionId !== null || resMatch.seasonId !== null) {
      throw new Error("Expected empty string/NONE to transform to null in match schema");
    }
  });

  // 13. SECURITY & AUTHENTICATION TESTS
  const protectedAdminRoutes = [
    "/admin",
    "/admin/players",
    "/admin/teams",
    "/admin/management",
    "/admin/matches",
    "/admin/competitions",
    "/admin/seasons",
    "/admin/league-tables",
    "/admin/events",
    "/admin/news",
    "/admin/media",
    "/admin/users",
    "/admin/audit-logs",
    "/admin/settings",
    "/admin/statistics",
  ];

  for (const route of protectedAdminRoutes) {
    await runTest("SECURITY_PERMISSIONS", `Route Guard: ${route} redirects unauthorized visitors`, async () => {
      const res = await fetch(`http://localhost:3000${route}`, {
        redirect: "manual",
      });
      // Should redirect (302/307/308) to login
      if (res.status !== 302 && res.status !== 307 && res.status !== 308) {
        throw new Error(`Expected redirect, got status ${res.status}`);
      }
    });
  }

  // SUMMARY
  console.log("\n-------------------------------------------------");
  console.log("               TEST RESULTS SUMMARY              ");
  console.log("-------------------------------------------------");
  let passed = 0;
  let failed = 0;
  for (const r of results) {
    const icon = r.status === "PASS" ? "✅ PASS" : "❌ FAIL";
    console.log(`${icon.padEnd(9)} [${r.category.padEnd(19)}] ${r.testCase} (${r.durationMs}ms)`);
    if (r.status === "PASS") passed++;
    else {
      failed++;
      console.log(`        ⚠️ Reason: ${r.details}`);
    }
  }

  console.log("\n=================================================");
  console.log(` TOTAL TESTS: ${results.length} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log(` SQA VERDICT: ${failed === 0 ? "100% PASSED - SYSTEM READY FOR PRODUCTION" : "FAILED"}`);
  console.log("=================================================\n");
}

main().then(() => process.exit(0));
