# Bhai Brother Football Federation (FC BBFF)
## System Documentation Suite

Welcome to the official technical and business documentation for **Bhai Brother Football Federation (FC BBFF)**. This repository contains the complete specification standards governing the platform's design, architecture, business logic, and functional requirements.

---

## 📚 Documentation Table of Contents

| Document | Description | Target Audience |
| :--- | :--- | :--- |
| 📄 **[BRD.md](./BRD.md)** | **Business Requirements Document**: Business vision, strategic KPIs, stakeholder roles, core FC BBFF umbrella rules, and operational policies. | Executive Stakeholders, Product Owners |
| 📄 **[PRD.md](./PRD.md)** | **Product Requirements Document**: User personas, feature hierarchy, user journeys, UI/UX aesthetics, and visual design specifications. | Product Managers, Designers, Developers |
| 📄 **[FRD.md](./FRD.md)** | **Functional Requirements Document**: Detailed functional specifications for Squad Management, Match Engine, H2H Matrix, Graphic Cards Export, and Standings. | Software Engineers, QA Leads |
| 📄 **[SRS.md](./SRS.md)** | **Software Requirements Specification**: Technical architecture, Next.js 15 App Router structure, Prisma schema models, RBAC security, and NFRs. | Technical Architects, Full-Stack Engineers |

---

## ⚡ Quick Technology Summary

- **Core Framework**: Next.js 15+ (App Router, Server Actions, React Server Components)
- **Language**: TypeScript (Strict Mode)
- **Database & ORM**: PostgreSQL with Prisma ORM
- **Styling & Aesthetics**: Tailwind CSS (Dark Mode Glassmorphism, Emerald & Amber Gold Accents)
- **Graphic Card Generator**: `html-to-image` (2x Retina JPEG Export)
- **Authentication**: NextAuth.js / Auth.js with Role-Based Access Control (RBAC)

---

## ⚽ Main System Features

1. **Core FC BBFF Squad Auto-Sync**: Main umbrella team automatically enrolls all active registered club players and synchronizes management leadership (Manager, Captain, Vice-Captain).
2. **Internal vs External Team Management**: Dedicated handling for outsider clubs with Contact Person Details (Name, Email, Phone), restricted from internal competitions and internal squad rosters.
3. **Head-to-Head (H2H) Comparison Matrix**: Select Team 1 vs Team 2 with match history logs and an internal-only opponent summary leaderboard.
4. **Automated Social Graphic Cards**: 1-click 2x retina JPEG graphics generation for Player Cards, Match Cards, Standings Cards, Statistics Cards, and H2H Cards.
5. **Standings & Statistics Engine**: Automatic points calculation (PTS, GD, W/D/L) and leaderboards for Top Scorers, Playmakers, and POTM awards.
