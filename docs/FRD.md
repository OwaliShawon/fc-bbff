# Functional Requirements Document (FRD)
## Bhai Brother Football Federation (FC BBFF)

---

## 1. Functional System Breakdown

### 1.1 Squad & Team Management System (FR-1)
- **FR-1.1**: System shall seed a primary internal team named **FC BBFF**.
- **FR-1.2**: Every newly created or active player shall be automatically assigned to the main core FC BBFF squad.
- **FR-1.3**: Admin shall be able to create external (outsider) teams requiring Contact Person Name, Email, and Phone number.
- **FR-1.4**: External teams shall be restricted from having internal squad rosters and joining internal competitions.
- **FR-1.5**: Squad roster modal shall render at spacious width (`w-[95vw] sm:max-w-4xl lg:max-w-5xl`) to prevent cramped table layouts.

### 1.2 Match Engine & Lineups (FR-2)
- **FR-2.1**: When creating a match with an outsider, default Team 1 shall automatically select FC BBFF.
- **FR-2.2**: Admin shall be able to set match lineups (Starting XI & Substitutes) from registered club players.
- **FR-2.3**: Admin shall record match events: `GOAL`, `ASSIST`, `YELLOW_CARD`, `RED_CARD`, `SUBSTITUTION`, `OWN_GOAL`, `PENALTY`, `PENALTY_MISSED`, and `PLAYER_OF_MATCH`.
- **FR-2.4**: Completed match scores shall automatically recalculate competition standings (Points, GD, GF, GA, W/D/L).

### 1.3 Head-to-Head (H2H) Engine (FR-3)
- **FR-3.1**: H2H matrix shall allow comparing any Team 1 against any Team 2.
- **FR-3.2**: Overall Opponent Records Summary on `/h2h` shall query and aggregate records strictly for internal teams (`isExternal: false`).
- **FR-3.3**: Summary stats shall calculate Played, Wins, Draws, Losses, Goals For, Goals Against, Goal Difference, Win Rate %, Clean Sheets, and Biggest Win.

### 1.4 Graphic Cards Export Engine (FR-4)
- **FR-4.1**: Card graphics generation (`exportElementAsJpeg`) shall render 2x retina JPEG images using `html-to-image`.
- **FR-4.2**: Card titles shall display **FC BBFF** in solid white (`text-white`).
- **FR-4.3**: Card footers shall display official branding: *Official Bhai Brother Football Federation [Card Type]*.
- **FR-4.4**: Standings card table graphic shall render with `bg-white` container and `text-black` font color for maximum contrast.
- **FR-4.5**: Standings card table container shall omit overflow scrollbars (`overflow-x-auto`) to eliminate cut-out/clipped image exports.
- **FR-4.6**: Player card image rendering shall incorporate safe CORS handling (`crossOrigin`) and `onError` fallback to prevent canvas export crashes when player photos exist.

### 1.5 Admin Filter & Navigation (FR-5)
- **FR-5.1**: Selecting "All Positions" or "All Status" in player directory filters shall remove query parameters (`?position=` / `?status=`) from URL to reset the view to all players.

---

## 2. Detailed Functional Matrix & Traceability

| Req ID | Component / File | Functional Specification | Verification Status |
| :--- | :--- | :--- | :--- |
| **FR-1.1** | `team-actions.ts` | Seed primary internal team named FC BBFF. | Verified ✅ |
| **FR-1.2** | `player-actions.ts` | Auto-assign newly created players to main FC BBFF squad. | Verified ✅ |
| **FR-1.3** | `teams-client.tsx` | Require Contact Person details for external outsider teams. | Verified ✅ |
| **FR-1.4** | `competition-actions.ts` | Prevent external teams from joining competitions. | Verified ✅ |
| **FR-1.5** | `teams-client.tsx` | Render Squad Roster modal with `w-[95vw] max-w-5xl`. | Verified ✅ |
| **FR-2.1** | `match-actions.ts` | Default Team 1 to FC BBFF for outsider matches. | Verified ✅ |
| **FR-3.2** | `h2h-actions.ts` | Filter `getAllOpponentRecords()` to `isExternal: false`. | Verified ✅ |
| **FR-4.2** | `cards/*.tsx` | Render card titles as `FC BBFF` in `text-white`. | Verified ✅ |
| **FR-4.4** | `downloadable-standings-card.tsx` | Render standings table in `bg-white` with `text-black`. | Verified ✅ |
| **FR-4.6** | `downloadable-player-card.tsx` | Safe CORS `crossOrigin` and `onError` image fallback. | Verified ✅ |
| **FR-5.1** | `players-client.tsx` | Omit `position` / `status` query params when set to `"all"`. | Verified ✅ |
