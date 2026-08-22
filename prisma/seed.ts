import { PrismaClient, UserRole, PlayerPosition, PlayerStatus, MatchStatus, EventType, EventStatus, NewsStatus, CompetitionStatus, TeamStatus } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // ============================================================================
  // CLEAN UP (for re-seeding)
  // ============================================================================
  await prisma.auditLog.deleteMany();
  await prisma.matchEvent.deleteMany();
  await prisma.matchLineup.deleteMany();
  await prisma.matchPhoto.deleteMany();
  await prisma.match.deleteMany();
  await prisma.competitionTeam.deleteMany();
  await prisma.competition.deleteMany();
  await prisma.season.deleteMany();
  await prisma.teamPlayer.deleteMany();
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
  // USERS (Development only - change credentials for production!)
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
  // TEAMS
  // ============================================================================
  console.log("  Creating teams...");
  const teamA = await prisma.team.create({
    data: {
      name: "BBFF FC First XI",
      slug: "bbff-fc-first-xi",
      description: "The main first team of BBFF Football Club competing in the premier league.",
      manager: "Coach Rahman",
      status: "ACTIVE",
    },
  });

  const teamB = await prisma.team.create({
    data: {
      name: "BBFF FC Reserves",
      slug: "bbff-fc-reserves",
      description: "The reserve team developing future stars for the first team.",
      manager: "Coach Karim",
      status: "ACTIVE",
    },
  });

  const teamC = await prisma.team.create({
    data: {
      name: "Rival United",
      slug: "rival-united",
      description: "A strong competing team in the local league.",
      manager: "Coach Hasan",
      status: "ACTIVE",
    },
  });

  const teamD = await prisma.team.create({
    data: {
      name: "City Stars FC",
      slug: "city-stars-fc",
      description: "An established club with a rich history.",
      manager: "Coach Ali",
      status: "ACTIVE",
    },
  });

  // ============================================================================
  // PLAYERS
  // ============================================================================
  console.log("  Creating players...");
  const playersData = [
    { firstName: "Rafiq", lastName: "Ahmed", jerseyNumber: 1, position: "GOALKEEPER" as PlayerPosition, bio: "Experienced goalkeeper with excellent reflexes and commanding presence in the box.", nationality: "Bangladeshi", height: "6'1\"", weight: "82kg", preferredFoot: "Right" },
    { firstName: "Tanvir", lastName: "Hossain", jerseyNumber: 2, position: "DEFENDER" as PlayerPosition, bio: "Solid right-back known for his defensive discipline and overlapping runs.", nationality: "Bangladeshi", height: "5'10\"", weight: "75kg", preferredFoot: "Right" },
    { firstName: "Jubayer", lastName: "Rahman", jerseyNumber: 4, position: "DEFENDER" as PlayerPosition, bio: "Center-back with great aerial ability and leadership qualities.", nationality: "Bangladeshi", height: "6'0\"", weight: "80kg", preferredFoot: "Right" },
    { firstName: "Saiful", lastName: "Islam", jerseyNumber: 5, position: "DEFENDER" as PlayerPosition, bio: "Reliable center-back who reads the game exceptionally well.", nationality: "Bangladeshi", height: "5'11\"", weight: "78kg", preferredFoot: "Left" },
    { firstName: "Masud", lastName: "Rana", jerseyNumber: 3, position: "DEFENDER" as PlayerPosition, bio: "Attacking left-back with exceptional crossing ability.", nationality: "Bangladeshi", height: "5'9\"", weight: "72kg", preferredFoot: "Left" },
    { firstName: "Ariful", lastName: "Haque", jerseyNumber: 6, position: "MIDFIELDER" as PlayerPosition, bio: "Box-to-box midfielder with tireless work rate and great passing range.", nationality: "Bangladeshi", height: "5'10\"", weight: "74kg", preferredFoot: "Right", isFeatured: true },
    { firstName: "Nazmul", lastName: "Hasan", jerseyNumber: 8, position: "MIDFIELDER" as PlayerPosition, bio: "Creative playmaker with excellent vision and technical ability.", nationality: "Bangladeshi", height: "5'8\"", weight: "70kg", preferredFoot: "Left", isFeatured: true },
    { firstName: "Imran", lastName: "Khan", jerseyNumber: 10, position: "MIDFIELDER" as PlayerPosition, bio: "Attacking midfielder who creates chances and scores spectacular goals.", nationality: "Bangladeshi", height: "5'9\"", weight: "71kg", preferredFoot: "Right", isFeatured: true },
    { firstName: "Shakil", lastName: "Ahmed", jerseyNumber: 7, position: "FORWARD" as PlayerPosition, bio: "Pacy winger with incredible dribbling skills and an eye for goal.", nationality: "Bangladeshi", height: "5'8\"", weight: "68kg", preferredFoot: "Right", isFeatured: true },
    { firstName: "Fahim", lastName: "Chowdhury", jerseyNumber: 9, position: "FORWARD" as PlayerPosition, bio: "Clinical striker who is lethal inside the box. The club's top scorer.", nationality: "Bangladeshi", height: "5'11\"", weight: "76kg", preferredFoot: "Right", isFeatured: true },
    { firstName: "Rezaul", lastName: "Karim", jerseyNumber: 11, position: "FORWARD" as PlayerPosition, bio: "Versatile forward comfortable playing across the front line.", nationality: "Bangladeshi", height: "5'10\"", weight: "73kg", preferredFoot: "Left", isFeatured: true },
    { firstName: "Kamrul", lastName: "Hasan", jerseyNumber: 12, position: "GOALKEEPER" as PlayerPosition, bio: "Young talented backup goalkeeper with a bright future.", nationality: "Bangladeshi", height: "6'0\"", weight: "79kg", preferredFoot: "Right" },
    { firstName: "Zahid", lastName: "Hossain", jerseyNumber: 14, position: "DEFENDER" as PlayerPosition, bio: "Versatile defender who can play across the back line.", nationality: "Bangladeshi", height: "5'11\"", weight: "77kg", preferredFoot: "Right" },
    { firstName: "Biplab", lastName: "Roy", jerseyNumber: 16, position: "MIDFIELDER" as PlayerPosition, bio: "Defensive midfielder with excellent tackling and interception ability.", nationality: "Bangladeshi", height: "5'10\"", weight: "76kg", preferredFoot: "Right" },
    { firstName: "Sohan", lastName: "Ali", jerseyNumber: 18, position: "FORWARD" as PlayerPosition, bio: "Young exciting forward with raw pace and finishing ability.", nationality: "Bangladeshi", height: "5'9\"", weight: "69kg", preferredFoot: "Right" },
  ];

  const players = [];
  for (const p of playersData) {
    const slug = `${p.firstName}-${p.lastName}`.toLowerCase().replace(/\s+/g, "-");
    const player = await prisma.player.create({
      data: {
        ...p,
        slug,
        status: "ACTIVE",
        isFeatured: (p as { isFeatured?: boolean }).isFeatured || false,
        dateOfBirth: new Date(1995 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28)),
        dateJoined: new Date(2022 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), 1),
      },
    });
    players.push(player);
  }

  // Assign players to teams
  for (let i = 0; i < 11; i++) {
    await prisma.teamPlayer.create({
      data: {
        teamId: teamA.id,
        playerId: players[i].id,
        isCaptain: i === 7, // Imran Khan as captain
        isViceCaptain: i === 5, // Ariful as vice captain
      },
    });
  }

  for (let i = 11; i < 15; i++) {
    await prisma.teamPlayer.create({
      data: {
        teamId: teamB.id,
        playerId: players[i].id,
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
      name: "BBFF Premier League",
      slug: "bbff-premier-league",
      description: "The top-flight football competition featuring the best local teams.",
      seasonId: season.id,
      startDate: new Date("2025-09-15"),
      endDate: new Date("2026-05-30"),
      status: "ONGOING",
      pointsForWin: 3,
      pointsForDraw: 1,
      pointsForLoss: 0,
    },
  });

  // Add teams to competition
  for (const team of [teamA, teamB, teamC, teamD]) {
    await prisma.competitionTeam.create({
      data: { competitionId: league.id, teamId: team.id },
    });
  }

  // ============================================================================
  // MATCHES
  // ============================================================================
  console.log("  Creating matches...");

  // Completed matches with results
  const match1 = await prisma.match.create({
    data: {
      competitionId: league.id,
      seasonId: season.id,
      homeTeamId: teamA.id,
      awayTeamId: teamC.id,
      matchDate: new Date("2025-09-20T15:00:00"),
      venue: "BBFF Stadium",
      homeScore: 3,
      awayScore: 1,
      status: "COMPLETED",
      isPublished: true,
      matchDay: 1,
      referee: "Referee Alam",
      playerOfMatchId: players[9].id, // Fahim
      matchReport: "A dominant display from BBFF FC First XI. Fahim Chowdhury scored a brace and Imran Khan added a stunning free kick.",
    },
  });

  // Match events for match 1
  await prisma.matchEvent.createMany({
    data: [
      { matchId: match1.id, playerId: players[9].id, eventType: "GOAL", minute: 15, description: "Header from corner" },
      { matchId: match1.id, playerId: players[7].id, eventType: "ASSIST", minute: 15, relatedPlayerId: players[9].id },
      { matchId: match1.id, playerId: players[7].id, eventType: "GOAL", minute: 42, description: "Stunning free kick" },
      { matchId: match1.id, playerId: players[9].id, eventType: "GOAL", minute: 67, description: "Clinical finish from close range" },
      { matchId: match1.id, playerId: players[8].id, eventType: "ASSIST", minute: 67, relatedPlayerId: players[9].id },
      { matchId: match1.id, playerId: players[3].id, eventType: "YELLOW_CARD", minute: 55 },
    ],
  });

  const match2 = await prisma.match.create({
    data: {
      competitionId: league.id,
      seasonId: season.id,
      homeTeamId: teamD.id,
      awayTeamId: teamA.id,
      matchDate: new Date("2025-10-05T16:00:00"),
      venue: "City Stars Arena",
      homeScore: 1,
      awayScore: 2,
      status: "COMPLETED",
      isPublished: true,
      matchDay: 2,
      referee: "Referee Bhuiyan",
      playerOfMatchId: players[6].id, // Nazmul
    },
  });

  await prisma.matchEvent.createMany({
    data: [
      { matchId: match2.id, playerId: players[8].id, eventType: "GOAL", minute: 23, description: "Counter-attack goal" },
      { matchId: match2.id, playerId: players[10].id, eventType: "GOAL", minute: 78, description: "Tap-in from cross" },
      { matchId: match2.id, playerId: players[6].id, eventType: "ASSIST", minute: 78, relatedPlayerId: players[10].id },
    ],
  });

  const match3 = await prisma.match.create({
    data: {
      competitionId: league.id,
      seasonId: season.id,
      homeTeamId: teamC.id,
      awayTeamId: teamD.id,
      matchDate: new Date("2025-10-12T15:00:00"),
      venue: "Rival Ground",
      homeScore: 2,
      awayScore: 2,
      status: "COMPLETED",
      isPublished: true,
      matchDay: 2,
      referee: "Referee Hossain",
    },
  });

  // Upcoming matches
  await prisma.match.create({
    data: {
      competitionId: league.id,
      seasonId: season.id,
      homeTeamId: teamA.id,
      awayTeamId: teamD.id,
      matchDate: new Date("2026-09-15T16:00:00"),
      venue: "BBFF Stadium",
      status: "SCHEDULED",
      matchDay: 3,
    },
  });

  await prisma.match.create({
    data: {
      competitionId: league.id,
      seasonId: season.id,
      homeTeamId: teamB.id,
      awayTeamId: teamC.id,
      matchDate: new Date("2026-09-22T15:00:00"),
      venue: "Training Ground",
      status: "SCHEDULED",
      matchDay: 3,
    },
  });

  await prisma.match.create({
    data: {
      competitionId: league.id,
      seasonId: season.id,
      homeTeamId: teamC.id,
      awayTeamId: teamA.id,
      matchDate: new Date("2026-10-01T16:00:00"),
      venue: "Rival Ground",
      status: "SCHEDULED",
      matchDay: 4,
    },
  });

  // ============================================================================
  // EVENTS
  // ============================================================================
  console.log("  Creating events...");
  await prisma.event.createMany({
    data: [
      {
        title: "Annual General Meeting 2026",
        slug: "annual-general-meeting-2026",
        description: "The club's annual general meeting to discuss the season's progress, finances, and future plans. All members are invited to attend.",
        eventType: "AGM",
        eventDate: new Date("2026-09-10T18:00:00"),
        startTime: "6:00 PM",
        endTime: "9:00 PM",
        venue: "BBFF Community Hall",
        organizer: "Club Management",
        status: "UPCOMING",
        isPublished: true,
      },
      {
        title: "Pre-Season Training Camp",
        slug: "pre-season-training-camp",
        description: "Intensive pre-season training camp for all registered players. Focus on fitness, tactical drills, and team building.",
        eventType: "TRAINING",
        eventDate: new Date("2026-08-25T06:00:00"),
        startTime: "6:00 AM",
        endTime: "12:00 PM",
        venue: "BBFF Training Ground",
        organizer: "Coaching Staff",
        status: "UPCOMING",
        isPublished: true,
      },
      {
        title: "BBFF FC Award Night 2025",
        slug: "bbff-fc-award-night-2025",
        description: "Celebrating our players and supporters. Awards include Player of the Season, Golden Boot, Golden Glove, and Young Player of the Year.",
        eventType: "AWARD_CEREMONY",
        eventDate: new Date("2025-07-15T19:00:00"),
        startTime: "7:00 PM",
        endTime: "11:00 PM",
        venue: "Grand Ballroom, Hotel Royal",
        organizer: "Club Management",
        status: "COMPLETED",
        isPublished: true,
      },
      {
        title: "Community Football Festival",
        slug: "community-football-festival",
        description: "A fun-filled community football festival with mini-tournaments, skills challenges, and food stalls. Open to all ages.",
        eventType: "COMMUNITY",
        eventDate: new Date("2026-10-05T10:00:00"),
        startTime: "10:00 AM",
        endTime: "5:00 PM",
        venue: "BBFF Public Ground",
        organizer: "Community Relations",
        status: "UPCOMING",
        isPublished: true,
      },
    ],
  });

  // ============================================================================
  // NEWS CATEGORIES & NEWS
  // ============================================================================
  console.log("  Creating news...");
  const matchDay = await prisma.newsCategory.create({
    data: { name: "Match Day", slug: "match-day" },
  });
  const transfers = await prisma.newsCategory.create({
    data: { name: "Transfers", slug: "transfers" },
  });
  const clubUpdates = await prisma.newsCategory.create({
    data: { name: "Club Updates", slug: "club-updates" },
  });

  await prisma.news.createMany({
    data: [
      {
        title: "BBFF FC Secure Dominant Victory Over Rival United",
        slug: "bbff-fc-secure-dominant-victory-over-rival-united",
        excerpt: "A stunning performance from the First XI saw BBFF FC cruise to a 3-1 victory over Rival United in the season opener.",
        content: `
# BBFF FC 3 - 1 Rival United

What a start to the season! BBFF FC First XI delivered a commanding performance at BBFF Stadium to kick off the 2025/2026 campaign in style.

## First Half

The match started with high intensity from both sides, but it was BBFF who drew first blood in the 15th minute. **Fahim Chowdhury** rose highest to head in a pin-point corner delivery from **Imran Khan**.

The lead was doubled before half-time when **Imran Khan** himself stepped up to curl a magnificent free kick into the top corner from 25 yards, leaving the goalkeeper rooted to the spot.

## Second Half

The second half saw more of the same dominance. **Fahim Chowdhury** completed his brace in the 67th minute, finishing clinically from a delightful through ball by **Shakil Ahmed**.

Rival United pulled one back late on but it was nothing more than a consolation.

## Player of the Match

**Fahim Chowdhury** - Two goals and a tireless performance made him the obvious choice.

A perfect start to the season. Up the BBFF! 🏆
        `.trim(),
        featuredImageUrl: null,
        categoryId: matchDay.id,
        authorId: superAdmin.id,
        tags: ["match-report", "victory", "premier-league"],
        status: "PUBLISHED",
        publishedAt: new Date("2025-09-20T18:00:00"),
        isFeatured: true,
      },
      {
        title: "Club Announces New Training Facility Development",
        slug: "club-announces-new-training-facility-development",
        excerpt: "BBFF FC is investing in a state-of-the-art training facility to enhance player development and performance.",
        content: `
# New Training Facility Announcement

BBFF Football Club is thrilled to announce plans for a brand-new training facility that will significantly enhance our player development capabilities.

## Key Features

- **Full-size synthetic pitch** with floodlights for evening training
- **Modern gymnasium** with state-of-the-art equipment
- **Recovery center** including ice baths and physiotherapy rooms
- **Video analysis room** for tactical preparation
- **Changing rooms** with premium amenities

## Timeline

Construction is expected to begin in early 2026, with the facility ready for use by the start of the 2026/2027 season.

## Club Statement

Club Chairman said: "This investment represents our commitment to excellence and long-term growth. We want to provide our players and coaching staff with the best possible environment to succeed."

Stay tuned for further updates on this exciting project!
        `.trim(),
        featuredImageUrl: null,
        categoryId: clubUpdates.id,
        authorId: superAdmin.id,
        tags: ["facility", "development", "investment"],
        status: "PUBLISHED",
        publishedAt: new Date("2025-10-01T10:00:00"),
        isFeatured: true,
      },
      {
        title: "Exciting Young Talent Joins BBFF FC Reserves",
        slug: "exciting-young-talent-joins-bbff-fc-reserves",
        excerpt: "BBFF FC welcomes a promising young midfielder to strengthen the reserve team squad.",
        content: `
# New Signing Announcement

BBFF Football Club is delighted to announce the signing of a promising young midfielder who joins our Reserve team.

## About the Player

The new signing comes highly recommended from the local youth football circuit, where he has impressed scouts with his technical ability, vision, and maturity beyond his years.

## Manager's Comments

Reserve Team Manager Coach Karim commented: "We're very happy to bring in this young player. He has all the qualities we look for - technical skill, a great attitude, and the hunger to improve every day."

## What's Next

The player will link up with the Reserve squad immediately and will be available for selection in the upcoming fixtures.

Welcome to BBFF FC! 💚
        `.trim(),
        featuredImageUrl: null,
        categoryId: transfers.id,
        authorId: editor.id,
        tags: ["transfer", "signing", "reserves"],
        status: "PUBLISHED",
        publishedAt: new Date("2025-10-15T12:00:00"),
      },
    ],
  });

  // ============================================================================
  // SITE SETTINGS
  // ============================================================================
  console.log("  Creating site settings...");
  const settings = [
    { key: "clubName", value: "BBFF FC" },
    { key: "clubMotto", value: "Excellence in Football, Unity in Spirit" },
    { key: "contactEmail", value: "info@bbfffc.com" },
    { key: "contactPhone", value: "+880 1234 567890" },
    { key: "address", value: "BBFF Stadium, Dhaka, Bangladesh" },
    { key: "aboutText", value: "BBFF Football Club is a community-based football club dedicated to developing talent, building character, and promoting the beautiful game." },
    { key: "footerText", value: "© 2026 BBFF FC. All rights reserved." },
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
  console.log("📋 Development Credentials:");
  console.log("  Super Admin: superadmin@bbfffc.com / password123");
  console.log("  Admin:       admin@bbfffc.com / password123");
  console.log("  Editor:      editor@bbfffc.com / password123");
  console.log("  Viewer:      viewer@bbfffc.com / password123");
  console.log("");
  console.log("⚠️  These are DEVELOPMENT ONLY credentials. Change them in production!");
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
