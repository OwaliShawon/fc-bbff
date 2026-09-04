# ⚽ FC BBFF — Bhai Brother Football Federation Platform

An enterprise-grade, modern web application and management system built for **FC BBFF (Bhai Brother Football Federation)**. This platform delivers a rich public web interface for fans, players, and supporters alongside a full-featured Role-Based Access Control (RBAC) Admin Portal.

---

## 🌟 Key Features

### 🌐 Public Portal
- **Home & Hero Showcase:** Dynamic club updates, upcoming fixture countdowns, recent match results, and featured news.
- **Fixtures & Results (`/matches`):** Interactive match schedules, detailed match reports, goal events, lineups, and match stats.
- **Squad Roster & Player Directory (`/players`):** Detailed player profiles, stats (goals, assists, cards, MOTM awards), positions, and bios.
- **Head-to-Head (H2H) Track Record (`/h2h`):** Comparison matrix between internal squads and external opponents, historical match logs, and downloadable social graphic cards.
- **League Tables & Standings (`/competitions`):** Real-time points tables, goal difference rankings, and season progress.
- **Management & Leadership (`/management`):** Showcase of club executives, presidents, managers, and tenure history.
- **Events & News Hub (`/events`, `/news`):** Club announcements, AGM meetings, tournament schedules, and articles.

---

### 🛡️ Admin Management Console (`/admin`)
- **Overview Dashboard (`/admin`):** Real-time analytics, total players, upcoming fixtures, active users, and system audit summary.
- **Venue Management (`/admin/venues`):** Full CRUD for match & event venues with turf types (Natural Grass, Artificial Turf, Hybrid), spectator capacity, primary home ground flags, and automated venue dropdown selection across match/event forms.
- **Squad & Player Management (`/admin/players`):** Full player CRUD, jersey number assignment, positions, transfer status, and feature flags.
- **Teams Directory (`/admin/teams`):** Manage internal BBFF squads and external outsider opponents.
- **Fixtures & Match Operations (`/admin/matches`):** Match scheduling, referee assignments, venue dropdown selection, live score tracking, match lineup editor (starting 11 + substitutes), and match event logs (goals, assists, cards).
- **Competitions & Seasons (`/admin/competitions`, `/admin/seasons`):** Configure season dates, tournament rules, points for win/draw/loss, and automatic standings calculation.
- **Management Committee (`/admin/management`):** Manage executive roles, tenures, bios, and photo assets.
- **Events & News Publishing (`/admin/events`, `/admin/news`):** Rich content publishing workflow with draft, scheduled, and published statuses.
- **User & RBAC Security (`/admin/users`, `/admin/audit-logs`):** Fine-grained Role-Based Access Control (`SUPER_ADMIN`, `ADMIN`, `EDITOR`, `VIEWER`) and detailed audit logging.
- **Site Settings (`/admin/settings`):** Global site configuration, social links, mission, vision, and branding.

---

### 🎨 Downloadable Social Media Graphic Exporters
High-resolution, one-click JPEG graphic exporter cards optimized for Facebook & Instagram content creators:
- 🏆 **MOTM (Man of the Match) Graphic Card**
- ⚔️ **Matchday Announcement Card**
- 🤝 **Head-to-Head (H2H) Graphic Card**
- 📊 **League Standings Graphic Card**
- ⚽ **Match Result Summary Card**
- 👤 **Player Roster Profile Card**
- 📅 **Event Announcement Card**

---

## 🛠️ Technology Stack

- **Framework:** Next.js (App Router, Server Components & Server Actions)
- **Language:** TypeScript
- **Database & ORM:** PostgreSQL & Prisma ORM (`@prisma/client`)
- **Authentication:** NextAuth.js (v5) with RBAC middleware
- **Styling:** Tailwind CSS, Vanilla CSS, Lucide React icons, and Shadcn UI components
- **Image Export:** `html2canvas` / custom canvas export helper with offset & crop compensation
- **E2E Testing:** Playwright Test Suite (`playwright`)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18.x or higher
- PostgreSQL Database instance

### 2. Environment Setup
Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/fc-bbff?schema=public"
NEXTAUTH_SECRET="your-super-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Installation & Database Sync

```bash
# Install dependencies
npm install

# Push database schema to PostgreSQL
npm run db:push

# Generate Prisma Client
npm run db:generate

# Seed initial database records
npm run db:seed
```

### 4. Default Seed Login Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `superadmin@bbfffc.com` | `password123` |
| **Admin** | `admin@bbfffc.com` | `password123` |
| **Editor** | `editor@bbfffc.com` | `password123` |
| **Viewer** | `viewer@bbfffc.com` | `password123` |

### 5. Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

The project includes a Playwright End-to-End test suite covering authentication, public routes, downloadable card generation, and full Admin CRUD workflows.

```bash
# Run all E2E tests
npm run test:e2e

# Run tests in UI mode
npm run test:e2e:ui

# Debug tests
npm run test:e2e:debug
```

---

## 📂 Project Structure

```
fc-bbff/
├── prisma/
│   ├── schema.prisma      # Database schema (Models: User, Player, Team, Venue, Match, Event, News...)
│   └── seed.ts            # Database seeder script
├── src/
│   ├── actions/           # Next.js Server Actions (venue, match, player, team, event...)
│   ├── app/               # Next.js App Router (Public routes & /admin routes)
│   ├── components/        # React UI & Card Exporter components
│   ├── lib/               # Utilities, auth setup, permissions, & validations
│   ├── services/          # Audit logging and helper services
│   └── types/             # TypeScript types and Prisma exports
├── tests/
│   └── e2e/               # Playwright test specs
├── playwright.config.ts   # Playwright configuration
└── package.json           # Scripts and dependencies
```

---

## 📜 Available NPM Scripts

- `npm run dev` — Start Next.js development server
- `npm run build` — Generate Prisma Client and build production bundle
- `npm run start` — Start production server
- `npm run db:push` — Push database schema changes via Prisma
- `npm run db:generate` — Generate Prisma Client types
- `npm run db:seed` — Run database seeder script
- `npm run test:e2e` — Execute Playwright end-to-end tests

---

## 📝 License

This project is proprietary software created for **FC BBFF (Bhai Brother Football Federation)**. All rights reserved.
