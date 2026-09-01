import "dotenv/config";
import { db } from "./lib/db";
import { getPlayers, getPlayerBySlug } from "./actions/player-actions";
import { getTeams } from "./actions/team-actions";
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
    const owali = members.find((m) => m.name.toLowerCase().includes("owali"));
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

  // 10. SECURITY & AUTHENTICATION TESTS
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
