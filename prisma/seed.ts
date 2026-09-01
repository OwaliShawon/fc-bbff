import "dotenv/config";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient, PlayerPosition, ManagementRole } from "@prisma/client";
import { hash } from "bcryptjs";
import slugify from "slugify";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed with specific teams and players...");

  // ============================================================================
  // CLEAN UP (for re-seeding)
  // ============================================================================
  console.log("  Cleaning up old database records...");
  await prisma.auditLog.deleteMany();
  await prisma.matchEvent.deleteMany();
  await prisma.matchLineup.deleteMany();
  await prisma.matchPhoto.deleteMany();
  await prisma.match.deleteMany();
  await prisma.competitionTeam.deleteMany();
  await prisma.competition.deleteMany();
  await prisma.season.deleteMany();
  await prisma.teamPlayer.deleteMany();
  await prisma.managementMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.player.deleteMany();
  await prisma.eventGallery.deleteMany();
  await prisma.event.deleteMany();
  await prisma.news.deleteMany();
  await prisma.newsCategory.deleteMany();
  await prisma.media.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.siteSetting.deleteMany();
  await prisma.user.deleteMany();

  // ============================================================================
  // PERMISSIONS
  // ============================================================================
  console.log("  Creating permissions...");
  const permissionData = [
    { name: "players.view", module: "players", description: "View players" },
    { name: "players.create", module: "players", description: "Create players" },
    { name: "players.update", module: "players", description: "Update players" },
    { name: "players.delete", module: "players", description: "Delete players" },
    { name: "teams.view", module: "teams", description: "View teams" },
    { name: "teams.create", module: "teams", description: "Create teams" },
    { name: "teams.update", module: "teams", description: "Update teams" },
    { name: "teams.delete", module: "teams", description: "Delete teams" },
    { name: "matches.view", module: "matches", description: "View matches" },
    { name: "matches.create", module: "matches", description: "Create matches" },
    { name: "matches.update", module: "matches", description: "Update matches" },
    { name: "matches.delete", module: "matches", description: "Delete matches" },
    { name: "matches.publish", module: "matches", description: "Publish matches" },
    { name: "results.create", module: "results", description: "Create results" },
    { name: "results.update", module: "results", description: "Update results" },
    { name: "results.delete", module: "results", description: "Delete results" },
    { name: "events.view", module: "events", description: "View events" },
    { name: "events.create", module: "events", description: "Create events" },
    { name: "events.update", module: "events", description: "Update events" },
    { name: "events.delete", module: "events", description: "Delete events" },
    { name: "news.view", module: "news", description: "View news" },
    { name: "news.create", module: "news", description: "Create news" },
    { name: "news.update", module: "news", description: "Update news" },
    { name: "news.delete", module: "news", description: "Delete news" },
    { name: "news.publish", module: "news", description: "Publish news" },
    { name: "competitions.view", module: "competitions", description: "View competitions" },
    { name: "competitions.create", module: "competitions", description: "Create competitions" },
    { name: "competitions.update", module: "competitions", description: "Update competitions" },
    { name: "competitions.delete", module: "competitions", description: "Delete competitions" },
    { name: "users.view", module: "users", description: "View users" },
    { name: "users.create", module: "users", description: "Create users" },
    { name: "users.update", module: "users", description: "Update users" },
    { name: "users.delete", module: "users", description: "Delete users" },
    { name: "settings.view", module: "settings", description: "View settings" },
    { name: "settings.update", module: "settings", description: "Update settings" },
    { name: "audit_logs.view", module: "audit_logs", description: "View audit logs" },
    { name: "media.view", module: "media", description: "View media" },
    { name: "media.upload", module: "media", description: "Upload media" },
    { name: "media.delete", module: "media", description: "Delete media" },
  ];

  for (const perm of permissionData) {
    const p = await prisma.permission.create({ data: perm });

    // SUPER_ADMIN gets all
    await prisma.rolePermission.create({
      data: { role: "SUPER_ADMIN", permissionId: p.id },
    });

    // ADMIN gets most except users, settings.update, audit_logs
    if (!["users.create", "users.delete", "settings.update", "audit_logs.view"].includes(perm.name)) {
      await prisma.rolePermission.create({
        data: { role: "ADMIN", permissionId: p.id },
      });
    }

    // EDITOR gets view + content creation
    if (perm.name.endsWith(".view") || ["news.create", "news.update", "events.create", "events.update", "media.upload"].includes(perm.name)) {
      await prisma.rolePermission.create({
        data: { role: "EDITOR", permissionId: p.id },
      });
    }

    // VIEWER gets view only
    if (perm.name.endsWith(".view")) {
      await prisma.rolePermission.create({
        data: { role: "VIEWER", permissionId: p.id },
      });
    }
  }

  // ============================================================================
  // USERS
  // ============================================================================
  console.log("  Creating users...");
  const hashedPassword = await hash("password123", 12);

  const superAdmin = await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "superadmin@bbfffc.com",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
  });

  await prisma.user.create({
    data: {
      name: "Club Admin",
      email: "admin@bbfffc.com",
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  const editor = await prisma.user.create({
    data: {
      name: "Content Editor",
      email: "editor@bbfffc.com",
      password: hashedPassword,
      role: "EDITOR",
      status: "ACTIVE",
    },
  });

  await prisma.user.create({
    data: {
      name: "Club Viewer",
      email: "viewer@bbfffc.com",
      password: hashedPassword,
      role: "VIEWER",
      status: "ACTIVE",
    },
  });

  // ============================================================================
  // TEAMS & PLAYERS DATA
  // 1. Sydney - BBFF BULLS
  // 2. Omi Azad - BBFF Hilful Fuzul
  // 3. Shaishab - BBFF Warlords
  // 4. Niloy - BBFF AL JULFIKAR
  // 5. Utsho - BBFF REVOLUTION
  // 6. Sujon - BBFF Calm Storm
  // 7. Owali Shawon - BBFF THUNDER
  // 8. Kabbo - BBFF Viperz
  // 9. Nakib - BBFF Brutal Bros
  // 10. Himel - BBFF Lone Wolves
  // ============================================================================
  console.log("  Creating 10 teams and 10 players...");

  const seedPairs = [
    {
      player: {
        firstName: "Sydney",
        lastName: "",
        jerseyNumber: 1,
        position: "GOALKEEPER" as PlayerPosition,
        secondaryPosition: null,
        currentCity: "Dhaka",
        bio: "Agile shot-stopper with superb reflexes and leadership from the back.",
        nationality: "Bangladeshi",
        height: "6'1\"",
        weight: "80kg",
        preferredFoot: "Right",
        isFeatured: true,
      },
      team: {
        name: "BBFF BULLS",
        description: "Power, determination, and unyielding strength on the pitch.",
        manager: "Coach Sydney",
      },
    },
    {
      player: {
        firstName: "Omi",
        lastName: "Azad",
        jerseyNumber: 10,
        position: "MIDFIELDER" as PlayerPosition,
        secondaryPosition: "FORWARD" as PlayerPosition,
        currentCity: "Dhaka",
        bio: "Master tactician and midfield maestro known for precision passing.",
        nationality: "Bangladeshi",
        height: "5'9\"",
        weight: "72kg",
        preferredFoot: "Right",
        isFeatured: true,
      },
      team: {
        name: "BBFF Hilful Fuzul",
        description: "Built on unity, discipline, and tactical brilliance.",
        manager: "Coach Omi Azad",
      },
    },
    {
      player: {
        firstName: "Shaishab",
        lastName: "",
        jerseyNumber: 11,
        position: "FORWARD" as PlayerPosition,
        secondaryPosition: "MIDFIELDER" as PlayerPosition,
        currentCity: "Chittagong",
        bio: "Prolific attacker with blistering pace and lethal finishing skills.",
        nationality: "Bangladeshi",
        height: "5'10\"",
        weight: "74kg",
        preferredFoot: "Left",
        isFeatured: true,
      },
      team: {
        name: "BBFF Warlords",
        description: "Aggressive, commanding, and relentless in pursuit of victory.",
        manager: "Coach Shaishab",
      },
    },
    {
      player: {
        firstName: "Niloy",
        lastName: "",
        jerseyNumber: 4,
        position: "DEFENDER" as PlayerPosition,
        secondaryPosition: "MIDFIELDER" as PlayerPosition,
        currentCity: "Dhaka",
        bio: "Rock-solid centre-back dominant in aerial duels and physical challenges.",
        nationality: "Bangladeshi",
        height: "6'0\"",
        weight: "78kg",
        preferredFoot: "Right",
        isFeatured: true,
      },
      team: {
        name: "BBFF AL JULFIKAR",
        description: "Impenetrable defense combined with swift counter-offense.",
        manager: "Coach Niloy",
      },
    },
    {
      player: {
        firstName: "Utsho",
        lastName: "",
        jerseyNumber: 8,
        position: "GOALKEEPER" as PlayerPosition,
        secondaryPosition: "DEFENDER" as PlayerPosition,
        currentCity: "Rajshahi",
        bio: "Dynamic shot-stopper and defender who dictates team rhythm.",
        nationality: "Bangladeshi",
        height: "5'11\"",
        weight: "76kg",
        preferredFoot: "Right",
        isFeatured: true,
      },
      team: {
        name: "BBFF REVOLUTION",
        description: "Redefining modern club football with visionary passion.",
        manager: "Coach Utsho",
      },
    },
    {
      player: {
        firstName: "Sujon",
        lastName: "",
        jerseyNumber: 6,
        position: "MIDFIELDER" as PlayerPosition,
        secondaryPosition: "DEFENDER" as PlayerPosition,
        currentCity: "Khulna",
        bio: "Calm and composed playmaker controlling the tempo from deep positions.",
        nationality: "Bangladeshi",
        height: "5'10\"",
        weight: "73kg",
        preferredFoot: "Right",
        isFeatured: true,
      },
      team: {
        name: "BBFF Calm Storm",
        description: "Patient buildup play transitioning into devastating attacks.",
        manager: "Coach Sujon",
      },
    },
    {
      player: {
        firstName: "Owali",
        lastName: "Shawon",
        jerseyNumber: 7,
        position: "FORWARD" as PlayerPosition,
        secondaryPosition: "MIDFIELDER" as PlayerPosition,
        currentCity: "Dhaka",
        bio: "Explosive winger with dazzling dribbling skills and thunderous strikes.",
        nationality: "Bangladeshi",
        height: "5'8\"",
        weight: "69kg",
        preferredFoot: "Right",
        isFeatured: true,
      },
      team: {
        name: "BBFF THUNDER",
        description: "Lightning-quick counter-attacks and electrifying performances.",
        manager: "Coach Owali Shawon",
      },
    },
    {
      player: {
        firstName: "Kabbo",
        lastName: "",
        jerseyNumber: 3,
        position: "DEFENDER" as PlayerPosition,
        secondaryPosition: "MIDFIELDER" as PlayerPosition,
        currentCity: "Sylhet",
        bio: "Tenacious and agile defender who shuts down opposing wingers.",
        nationality: "Bangladeshi",
        height: "5'9\"",
        weight: "71kg",
        preferredFoot: "Left",
        isFeatured: true,
      },
      team: {
        name: "BBFF Viperz",
        description: "Swift, dangerous, and striking when least expected.",
        manager: "Coach Kabbo",
      },
    },
    {
      player: {
        firstName: "Nakib",
        lastName: "",
        jerseyNumber: 9,
        position: "FORWARD" as PlayerPosition,
        secondaryPosition: "MIDFIELDER" as PlayerPosition,
        currentCity: "Dhaka",
        bio: "Natural goalscorer and set-piece specialist with clinical accuracy.",
        nationality: "Bangladeshi",
        height: "5'11\"",
        weight: "75kg",
        preferredFoot: "Right",
        isFeatured: true,
      },
      team: {
        name: "BBFF Brutal Bros",
        description: "Physical, relentless, and united brothers in competition.",
        manager: "Coach Nakib",
      },
    },
    {
      player: {
        firstName: "Himel",
        lastName: "",
        jerseyNumber: 17,
        position: "FORWARD" as PlayerPosition,
        secondaryPosition: "MIDFIELDER" as PlayerPosition,
        currentCity: "Sylhet",
        bio: "Cunning attacker with great positioning, speed, and finishing.",
        nationality: "Bangladeshi",
        height: "5'8\"",
        weight: "68kg",
        preferredFoot: "Right",
        isFeatured: true,
      },
      team: {
        name: "BBFF Lone Wolves",
        description: "Fierce fighters with high adaptability and indomitable spirit.",
        manager: "Coach Himel",
      },
    },
  ];

  const createdTeams = [];
  const createdPlayers = [];

  for (const pair of seedPairs) {
    const teamSlug = slugify(pair.team.name, { lower: true, strict: true });
    const team = await prisma.team.create({
      data: {
        name: pair.team.name,
        slug: teamSlug,
        description: pair.team.description,
        manager: pair.team.manager,
        status: "ACTIVE",
      },
    });
    createdTeams.push(team);

    const playerNameStr = `${pair.player.firstName}${pair.player.lastName ? ` ${pair.player.lastName}` : ""}`;
    const playerSlug = slugify(playerNameStr, { lower: true, strict: true });

    const player = await prisma.player.create({
      data: {
        ...pair.player,
        slug: playerSlug,
        status: "ACTIVE",
        dateOfBirth: new Date(1996 + Math.floor(Math.random() * 6), Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28)),
        dateJoined: new Date(2023, 0, 1),
      },
    });
    createdPlayers.push(player);

    // Assign player to their team as Captain
    await prisma.teamPlayer.create({
      data: {
        teamId: team.id,
        playerId: player.id,
        isCaptain: true,
        isViceCaptain: false,
      },
    });
  }

  // ============================================================================
  // SEASON & COMPETITION
  // ============================================================================
  console.log("  Creating season & competition...");
  const season = await prisma.season.create({
    data: {
      name: "2025/2026",
      startDate: new Date("2025-09-01"),
      endDate: new Date("2026-06-30"),
      isCurrent: true,
    },
  });

  const league = await prisma.competition.create({
    data: {
      name: "BBFF Championship League",
      slug: "bbff-championship-league",
      description: "The official championship league featuring all 10 BBFF teams.",
      seasonId: season.id,
      startDate: new Date("2025-09-15"),
      endDate: new Date("2026-05-30"),
      status: "ONGOING",
      pointsForWin: 3,
      pointsForDraw: 1,
      pointsForLoss: 0,
    },
  });

  // Add all 10 teams to the competition
  for (const team of createdTeams) {
    await prisma.competitionTeam.create({
      data: {
        competitionId: league.id,
        teamId: team.id,
      },
    });
  }

  // ============================================================================
  // MATCHES & EVENTS
  // ============================================================================
  console.log("  Creating matches...");

  // Match 1: BBFF BULLS vs BBFF Hilful Fuzul
  const match1 = await prisma.match.create({
    data: {
      competitionId: league.id,
      seasonId: season.id,
      homeTeamId: createdTeams[0].id, // BBFF BULLS
      awayTeamId: createdTeams[1].id, // BBFF Hilful Fuzul
      matchDate: new Date("2025-09-20T15:00:00"),
      venue: "BBFF Central Arena",
      homeScore: 2,
      awayScore: 1,
      status: "COMPLETED",
      isPublished: true,
      matchDay: 1,
      referee: "Referee Alam",
      playerOfMatchId: createdPlayers[0].id, // Sydney
      matchReport: "BBFF BULLS secured a thrilling 2-1 victory against BBFF Hilful Fuzul in an electric opening fixture.",
    },
  });

  await prisma.matchEvent.createMany({
    data: [
      { matchId: match1.id, playerId: createdPlayers[0].id, eventType: "GOAL", minute: 18, description: "Powerful header from set piece" },
      { matchId: match1.id, playerId: createdPlayers[1].id, eventType: "GOAL", minute: 44, description: "Calculated curling finish" },
      { matchId: match1.id, playerId: createdPlayers[0].id, eventType: "GOAL", minute: 76, description: "Match-winning strike from the edge of the box" },
    ],
  });

  // Match 2: BBFF Warlords vs BBFF AL JULFIKAR
  const match2 = await prisma.match.create({
    data: {
      competitionId: league.id,
      seasonId: season.id,
      homeTeamId: createdTeams[2].id, // BBFF Warlords
      awayTeamId: createdTeams[3].id, // BBFF AL JULFIKAR
      matchDate: new Date("2025-09-27T16:00:00"),
      venue: "Warlords Fortress",
      homeScore: 3,
      awayScore: 2,
      status: "COMPLETED",
      isPublished: true,
      matchDay: 1,
      referee: "Referee Hasan",
      playerOfMatchId: createdPlayers[2].id, // Shaishab
      matchReport: "Shaishab led BBFF Warlords to victory with an outstanding performance against Niloy's AL JULFIKAR.",
    },
  });

  await prisma.matchEvent.createMany({
    data: [
      { matchId: match2.id, playerId: createdPlayers[2].id, eventType: "GOAL", minute: 12, description: "Speedy counter-attack goal" },
      { matchId: match2.id, playerId: createdPlayers[3].id, eventType: "GOAL", minute: 35, description: "Solid defensive header converted into goal" },
      { matchId: match2.id, playerId: createdPlayers[2].id, eventType: "GOAL", minute: 61, description: "Sensational solo run and finish" },
      { matchId: match2.id, playerId: createdPlayers[2].id, eventType: "ASSIST", minute: 82, relatedPlayerId: createdPlayers[3].id },
    ],
  });

  // Match 3: BBFF THUNDER vs BBFF Viperz
  const match3 = await prisma.match.create({
    data: {
      competitionId: league.id,
      seasonId: season.id,
      homeTeamId: createdTeams[6].id, // BBFF THUNDER
      awayTeamId: createdTeams[7].id, // BBFF Viperz
      matchDate: new Date("2025-10-05T15:30:00"),
      venue: "Thunder Dome",
      homeScore: 2,
      awayScore: 2,
      status: "COMPLETED",
      isPublished: true,
      matchDay: 2,
      referee: "Referee Karim",
      playerOfMatchId: createdPlayers[6].id, // Shawon
      matchReport: "A pulsating 2-2 draw between BBFF THUNDER and BBFF Viperz.",
    },
  });

  await prisma.matchEvent.createMany({
    data: [
      { matchId: match3.id, playerId: createdPlayers[6].id, eventType: "GOAL", minute: 23, description: "Thunderbolt strike from 25 yards" },
      { matchId: match3.id, playerId: createdPlayers[7].id, eventType: "GOAL", minute: 58, description: "Stealthy finish into the bottom corner" },
    ],
  });

  // Upcoming Matches
  await prisma.match.create({
    data: {
      competitionId: league.id,
      seasonId: season.id,
      homeTeamId: createdTeams[4].id, // BBFF REVOLUTION
      awayTeamId: createdTeams[5].id, // BBFF Calm Storm
      matchDate: new Date("2026-09-15T16:00:00"),
      venue: "Revolution Stadium",
      status: "SCHEDULED",
      matchDay: 3,
    },
  });

  await prisma.match.create({
    data: {
      competitionId: league.id,
      seasonId: season.id,
      homeTeamId: createdTeams[8].id, // BBFF Brutal Bros
      awayTeamId: createdTeams[9].id, // BBFF Lone Wolves
      matchDate: new Date("2026-09-22T17:00:00"),
      venue: "Brutal Grounds",
      status: "SCHEDULED",
      matchDay: 3,
    },
  });

  // ============================================================================
  // MANAGEMENT & LEADERSHIP
  // ============================================================================
  console.log("  Creating club leadership and management members...");
  const owaliPlayer = createdPlayers.find((p) => p.firstName === "Owali" || p.firstName === "Shawon");
  const himelPlayer = createdPlayers.find((p) => p.firstName === "Himel");
  const nakibPlayer = createdPlayers.find((p) => p.firstName === "Nakib");
  const utshoPlayer = createdPlayers.find((p) => p.firstName === "Utsho");

  const managementMembersData = [
    // President
    {
      name: "Owali Shawon",
      role: ManagementRole.PRESIDENT,
      tenure: "2026 - Present",
      isCurrent: true,
      bio: "President of FC BBFF presiding over club governance, executive strategy, and sporting growth.",
      playerId: owaliPlayer?.id ?? null,
      sortOrder: 1,
    },
    // Manager
    {
      name: "Himel",
      role: ManagementRole.MANAGER,
      tenure: "2026 - Present",
      isCurrent: true,
      bio: "First Team Manager directing squad tactics, match strategy, and modern team performance.",
      playerId: himelPlayer?.id ?? null,
      sortOrder: 1,
    },
    {
      name: "Owali Shawon",
      role: ManagementRole.MANAGER,
      tenure: "2014 - 2025",
      isCurrent: false,
      bio: "Foundational manager who led FC BBFF across a decorated decade of dominance and growth.",
      playerId: owaliPlayer?.id ?? null,
      sortOrder: 2,
    },
    // Captain
    {
      name: "Nakib",
      role: ManagementRole.CAPTAIN,
      tenure: "2026 - Present",
      isCurrent: true,
      bio: "Club Captain leading on the pitch with discipline, authority, and tactical composure.",
      playerId: nakibPlayer?.id ?? null,
      sortOrder: 1,
    },
    {
      name: "Owali Shawon",
      role: ManagementRole.CAPTAIN,
      tenure: "2014 - 2025",
      isCurrent: false,
      bio: "Legendary captain who wore the armband with pride through the club's foundational era.",
      playerId: owaliPlayer?.id ?? null,
      sortOrder: 2,
    },
    // Vice Captain
    {
      name: "Utsho",
      role: ManagementRole.VICE_CAPTAIN,
      tenure: "2026 - Present",
      isCurrent: true,
      bio: "Vice-Captain providing vital on-pitch leadership, communication, and squad cohesion.",
      playerId: utshoPlayer?.id ?? null,
      sortOrder: 1,
    },
  ];

  for (const member of managementMembersData) {
    await prisma.managementMember.create({
      data: member,
    });
  }

  // ============================================================================
  // EVENTS
  // ============================================================================
  console.log("  Creating events...");
  await prisma.event.createMany({
    data: [
      {
        title: "BBFF Championship 2026 Opening Ceremony",
        slug: "bbff-championship-2026-opening-ceremony",
        description: "Official kickoff and banner presentation for all 10 BBFF teams.",
        eventType: "CELEBRATION",
        eventDate: new Date("2026-09-10T18:00:00"),
        startTime: "6:00 PM",
        endTime: "9:00 PM",
        venue: "BBFF Central Arena",
        organizer: "BBFF Board",
        status: "UPCOMING",
        isPublished: true,
      },
      {
        title: "Captains & Leaders Strategy Conclave",
        slug: "captains-leaders-strategy-conclave",
        description: "Exclusive strategy and sportsmanship summit for the 10 team captains.",
        eventType: "CLUB_MEETING",
        eventDate: new Date("2026-09-18T10:00:00"),
        startTime: "10:00 AM",
        endTime: "1:00 PM",
        venue: "BBFF Conference Hall",
        organizer: "BBFF Committee",
        status: "UPCOMING",
        isPublished: true,
      },
    ],
  });

  // ============================================================================
  // NEWS
  // ============================================================================
  console.log("  Creating news...");
  const categoryGeneral = await prisma.newsCategory.create({
    data: { name: "Tournament News", slug: "tournament-news" },
  });

  await prisma.news.createMany({
    data: [
      {
        title: "10 Titans Face Off: BBFF Championship Season Begins",
        slug: "10-titans-face-off-bbff-championship-season-begins",
        excerpt: "The ultimate showdown begins as BULLS, Hilful Fuzul, Warlords, AL JULFIKAR, REVOLUTION, Calm Storm, THUNDER, Viperz, Brutal Bros, and Lone Wolves lock horns.",
        content: `
# BBFF Championship Season Officially Kickstarted!

The stage is set for the most competitive season yet. Ten incredible teams led by their inspirational captains are ready to battle for supremacy:

1. **Sydney** - BBFF BULLS
2. **Omi Azad** - BBFF Hilful Fuzul
3. **Shaishab** - BBFF Warlords
4. **Niloy** - BBFF AL JULFIKAR
5. **Utsho** - BBFF REVOLUTION
6. **Sujon** - BBFF Calm Storm
7. **Owali Shawon** - BBFF THUNDER
8. **Kabbo** - BBFF Viperz
9. **Nakib** - BBFF Brutal Bros
10. **Himel** - BBFF Lone Wolves

Stay tuned for live scores, match reports, and fixture updates!
        `.trim(),
        categoryId: categoryGeneral.id,
        authorId: superAdmin.id,
        tags: ["bbff", "tournament", "teams"],
        status: "PUBLISHED",
        publishedAt: new Date("2025-09-15T12:00:00"),
        isFeatured: true,
      },
    ],
  });

  // ============================================================================
  // SITE SETTINGS
  // ============================================================================
  console.log("  Creating site settings...");
  const settings = [
    { key: "clubName", value: "FC BBFF" },
    { key: "clubMotto", value: "One for All, All for One" },
    { key: "clubLogo", value: "/logo.png" },
    { key: "favicon", value: "/logo.png" },
    { key: "contactEmail", value: "info@bbfffc.com" },
    { key: "contactPhone", value: "+880 1234 567890" },
    { key: "address", value: "BBFF Stadium, Dhaka, Bangladesh" },
    { key: "aboutText", value: "BBFF Football Club is a community-based football club dedicated to developing talent, building character, and promoting the beautiful game." },
    { key: "footerText", value: "© 2026 FC BBFF. All rights reserved." },
    { key: "facebookUrl", value: "https://facebook.com/bbfffc" },
    { key: "twitterUrl", value: "https://twitter.com/bbfffc" },
    { key: "instagramUrl", value: "https://instagram.com/bbfffc" },
    { key: "youtubeUrl", value: "https://youtube.com/@bbfffc" },
    { key: "clubHistory", value: "Founded with a passion for football and community, BBFF Football Club has grown from humble beginnings to become one of the most respected clubs in the region. Our journey is defined by dedication, teamwork, and an unwavering commitment to excellence both on and off the pitch." },
    { key: "mission", value: "To develop football talent, foster community spirit, and achieve excellence in competitive football through dedication, discipline, and teamwork." },
    { key: "vision", value: "To be the premier football club in the region, recognized for our commitment to player development, community engagement, and sporting achievement." },
    { key: "clubValues", value: "Excellence, Integrity, Teamwork, Respect, Community, Development" },
  ];

  for (const setting of settings) {
    await prisma.siteSetting.create({ data: setting });
  }

  console.log("✅ Seed completed successfully!");
  console.log("");
  console.log("📋 Seeded Teams and Captains:");
  seedPairs.forEach((item, index) => {
    const pName = `${item.player.firstName}${item.player.lastName ? ` ${item.player.lastName}` : ""}`;
    console.log(`  ${index + 1}. ${pName} -> ${item.team.name}`);
  });
  console.log("");
  console.log("🏛️  Seeded Club Management & Leadership:");
  managementMembersData.forEach((m) => {
    console.log(`  • [${m.role}] ${m.name} (${m.tenure}) ${m.isCurrent ? "★ CURRENT" : ""}`);
  });
  console.log("");
  console.log("📋 Development Credentials:");
  console.log("  Super Admin: superadmin@bbfffc.com / password123");
  console.log("  Admin:       admin@bbfffc.com / password123");
  console.log("  Editor:      editor@bbfffc.com / password123");
  console.log("  Viewer:      viewer@bbfffc.com / password123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
