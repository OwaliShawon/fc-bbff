import { test, expect } from "@playwright/test";

test.describe("All Admin Features Sequential CRUD Workflow (One by One)", () => {
  const ts = Date.now();
  const testData = {
    player: {
      firstName: `E2E_${ts}`,
      lastName: "Player",
      fullName: `E2E_${ts} Player`,
      initialCity: "Dhaka",
      updatedCity: "Chittagong",
      jerseyNumber: "88",
    },
    team: {
      initialName: `E2E Team ${ts}`,
      updatedName: `E2E Team ${ts} (Updated)`,
    },
    competition: {
      initialName: `E2E Comp ${ts}`,
      updatedName: `E2E Comp ${ts} (Updated)`,
    },
    season: {
      initialName: `Season ${ts}`,
      updatedName: `Season ${ts} (Updated)`,
      startDate: "2031-01-01",
      endDate: "2031-12-31",
    },
    news: {
      initialTitle: `E2E News ${ts}`,
      updatedTitle: `E2E News ${ts} (Updated)`,
      content: "Full detailed content of the official club announcement for test automation.",
    },
    event: {
      initialTitle: `E2E Event ${ts}`,
      updatedTitle: `E2E Event ${ts} (Updated)`,
      eventDate: "2026-11-20",
    },
    user: {
      initialName: `E2E User ${ts}`,
      updatedName: `E2E User ${ts} (Updated)`,
      email: `e2e.user.${ts}@bbfffc.com`,
      password: "Password123!",
    },
  };

  test("should execute Login and full CRUD lifecycle for all admin features one by one", async ({ page }) => {
    test.setTimeout(180000);

    // =========================================================================
    // INITIAL STEP: LOGIN (AUTHENTICATION)
    // =========================================================================
    await page.goto("/login");
    await page.locator("#email").fill("superadmin@bbfffc.com");
    await page.locator("#password").fill("password123");
    await page.getByRole("button", { name: /Sign In/i }).click();
    await expect(page).toHaveURL(/\/admin/, { timeout: 15000 });

    // =========================================================================
    // FEATURE 1: PLAYERS (GET -> CREATE -> UPDATE -> DELETE)
    // =========================================================================
    await page.goto("/admin/players");
    await expect(page.locator("h1, h2").filter({ hasText: "Players" }).first()).toBeVisible();

    // Create Player
    await page.getByRole("button", { name: /Add Player/i }).first().click();
    const playerModal = page.getByRole("dialog").first();
    await expect(playerModal).toBeVisible();
    await playerModal.locator("#firstName").fill(testData.player.firstName);
    await playerModal.locator("#lastName").fill(testData.player.lastName);
    await playerModal.locator("#jerseyNumber").fill(testData.player.jerseyNumber);
    if (await playerModal.locator("#currentCity").isVisible()) {
      await playerModal.locator("#currentCity").fill(testData.player.initialCity);
    }
    await playerModal.getByRole("button", { name: /Create|Save/i }).first().click();
    await expect(playerModal).not.toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);
    
    // Search created player
    await page.goto(`/admin/players?search=${encodeURIComponent(testData.player.firstName)}`);
    await expect(page.getByText(testData.player.fullName).first()).toBeVisible({ timeout: 10000 });

    // Update Player
    const playerRow = page.locator("tr").filter({ hasText: testData.player.fullName }).first();
    const playerEditBtn = playerRow.locator('button[title="Edit Player"]').first();
    await expect(playerEditBtn).toBeVisible();
    await playerEditBtn.click();

    const playerEditModal = page.getByRole("dialog").first();
    await expect(playerEditModal).toBeVisible();
    if (await playerEditModal.locator("#currentCity").isVisible()) {
      await playerEditModal.locator("#currentCity").fill(testData.player.updatedCity);
    }
    await playerEditModal.getByRole("button", { name: /Update|Save/i }).first().click();
    await expect(playerEditModal).not.toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    await page.goto(`/admin/players?search=${encodeURIComponent(testData.player.firstName)}`);
    await expect(page.getByText(testData.player.fullName).first()).toBeVisible({ timeout: 10000 });

    // Delete Player
    const playerDelRow = page.locator("tr").filter({ hasText: testData.player.fullName }).first();
    const playerDelBtn = playerDelRow.locator('button[title="Delete Player"]').first();
    await expect(playerDelBtn).toBeVisible();
    await playerDelBtn.click();

    const playerAlert = page.getByRole("alertdialog").first();
    await expect(playerAlert).toBeVisible();
    await playerAlert.getByRole("button", { name: "Delete" }).click();
    await expect(playerAlert).not.toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    await page.goto(`/admin/players?search=${encodeURIComponent(testData.player.firstName)}`);
    await expect(page.getByText(testData.player.fullName)).toHaveCount(0, { timeout: 10000 });

    // =========================================================================
    // FEATURE 2: TEAMS & SQUADS (GET -> CREATE -> UPDATE -> DELETE)
    // =========================================================================
    await page.goto("/admin/teams");
    await expect(page.locator("h1, h2").filter({ hasText: "Teams" }).first()).toBeVisible();

    // Create Team
    await page.getByRole("button", { name: /Add Team/i }).first().click();
    const teamModal = page.getByRole("dialog").first();
    await expect(teamModal).toBeVisible();
    await teamModal.locator("#teamName").fill(testData.team.initialName);
    await teamModal.getByRole("button", { name: /Create|Save/i }).first().click();
    await expect(teamModal).not.toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    await page.goto(`/admin/teams?search=${encodeURIComponent(testData.team.initialName)}`);
    await expect(page.getByText(testData.team.initialName).first()).toBeVisible({ timeout: 10000 });

    // Update Team
    const teamRow = page.locator("tr").filter({ hasText: testData.team.initialName }).first();
    const teamEditBtn = teamRow.locator('button[title="Edit Team"]').first();
    await expect(teamEditBtn).toBeVisible();
    await teamEditBtn.click();

    const teamEditModal = page.getByRole("dialog").first();
    await expect(teamEditModal).toBeVisible();
    await teamEditModal.locator("#teamName").fill(testData.team.updatedName);
    await teamEditModal.getByRole("button", { name: /Update|Save/i }).first().click();
    await expect(teamEditModal).not.toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    await page.goto(`/admin/teams?search=${encodeURIComponent(testData.team.updatedName)}`);
    await expect(page.getByText(testData.team.updatedName).first()).toBeVisible({ timeout: 10000 });

    // Delete Team
    const teamDelRow = page.locator("tr").filter({ hasText: testData.team.updatedName }).first();
    const teamDelBtn = teamDelRow.locator('button[title="Delete Team"]').first();
    await expect(teamDelBtn).toBeVisible();
    await teamDelBtn.click();

    const teamAlert = page.getByRole("alertdialog").first();
    await expect(teamAlert).toBeVisible();
    await teamAlert.getByRole("button", { name: "Delete" }).click();
    await expect(teamAlert).not.toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    await page.goto(`/admin/teams?search=${encodeURIComponent(testData.team.updatedName)}`);
    await expect(page.getByText(testData.team.updatedName)).toHaveCount(0, { timeout: 10000 });

    // =========================================================================
    // FEATURE 3: COMPETITIONS (GET -> CREATE -> UPDATE -> DELETE)
    // =========================================================================
    await page.goto("/admin/competitions");
    await expect(page.locator("h1, h2").filter({ hasText: "Competitions" }).first()).toBeVisible();

    // Create Competition
    await page.getByRole("button", { name: /Create Competition|Add Competition/i }).first().click();
    const compModal = page.getByRole("dialog").first();
    await expect(compModal).toBeVisible();
    await compModal.locator("#name").fill(testData.competition.initialName);
    await compModal.getByRole("button", { name: /Create|Save/i }).first().click();
    await expect(compModal).not.toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    await page.goto("/admin/competitions");
    await expect(page.getByText(testData.competition.initialName).first()).toBeVisible({ timeout: 10000 });

    // Update Competition
    const compCard = page.locator("tr, div").filter({ hasText: testData.competition.initialName }).first();
    const compEditBtn = compCard.locator('button[title="Edit Competition"]').first();
    await expect(compEditBtn).toBeVisible();
    await compEditBtn.click();

    const compEditModal = page.getByRole("dialog").first();
    await expect(compEditModal).toBeVisible();
    await compEditModal.locator("#name").fill(testData.competition.updatedName);
    await compEditModal.getByRole("button", { name: /Update|Save/i }).first().click();
    await expect(compEditModal).not.toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    await page.goto("/admin/competitions");
    await expect(page.getByText(testData.competition.updatedName).first()).toBeVisible({ timeout: 10000 });

    // Delete Competition
    const compDelCard = page.locator("tr, div").filter({ hasText: testData.competition.updatedName }).first();
    const compDelBtn = compDelCard.locator('button[title="Delete Competition"]').first();
    await expect(compDelBtn).toBeVisible();
    await compDelBtn.click();

    const compAlert = page.getByRole("alertdialog").first();
    await expect(compAlert).toBeVisible();
    await compAlert.getByRole("button", { name: "Delete" }).click();
    await expect(compAlert).not.toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    await page.goto("/admin/competitions");
    await expect(page.getByText(testData.competition.updatedName)).toHaveCount(0, { timeout: 10000 });

    // =========================================================================
    // FEATURE 4: SEASONS (GET -> CREATE -> UPDATE -> DELETE)
    // =========================================================================
    await page.goto("/admin/seasons");
    await expect(page.locator("h1, h2").filter({ hasText: "Seasons" }).first()).toBeVisible();

    // Create Season
    await page.getByRole("button", { name: /Create Season|Add Season/i }).first().click();
    const seasonModal = page.getByRole("dialog").first();
    await expect(seasonModal).toBeVisible();
    await seasonModal.locator("#name").fill(testData.season.initialName);
    await seasonModal.locator("#startDate").fill(testData.season.startDate);
    await seasonModal.locator("#endDate").fill(testData.season.endDate);
    await seasonModal.getByRole("button", { name: /Create|Save/i }).first().click();
    await expect(seasonModal).not.toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    await page.goto("/admin/seasons");
    await expect(page.getByText(testData.season.initialName).first()).toBeVisible({ timeout: 10000 });

    // Update Season
    const seasonRow = page.locator("tr").filter({ hasText: testData.season.initialName }).first();
    const seasonEditBtn = seasonRow.locator('button[title="Edit Season"]').first();
    await expect(seasonEditBtn).toBeVisible();
    await seasonEditBtn.click();

    const seasonEditModal = page.getByRole("dialog").first();
    await expect(seasonEditModal).toBeVisible();
    await seasonEditModal.locator("#name").fill(testData.season.updatedName);
    await seasonEditModal.getByRole("button", { name: /Update|Save/i }).first().click();
    await expect(seasonEditModal).not.toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    await page.goto("/admin/seasons");
    await expect(page.getByText(testData.season.updatedName).first()).toBeVisible({ timeout: 10000 });

    // Delete Season
    const seasonDelRow = page.locator("tr").filter({ hasText: testData.season.updatedName }).first();
    const seasonDelBtn = seasonDelRow.locator('button[title="Delete Season"]').first();
    await expect(seasonDelBtn).toBeVisible();
    await seasonDelBtn.click();

    const seasonAlert = page.getByRole("alertdialog").first();
    await expect(seasonAlert).toBeVisible();
    await seasonAlert.getByRole("button", { name: "Delete" }).click();
    await expect(seasonAlert).not.toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    await page.goto("/admin/seasons");
    await expect(page.getByText(testData.season.updatedName)).toHaveCount(0, { timeout: 10000 });

    // =========================================================================
    // FEATURE 5: NEWS ARTICLES (GET -> CREATE -> UPDATE -> DELETE)
    // =========================================================================
    await page.goto("/admin/news");
    await expect(page.locator("h1, h2").filter({ hasText: /News|Articles/i }).first()).toBeVisible();

    // Create Article
    await page.getByRole("button", { name: /Create Article|Add Article/i }).first().click();
    const newsModal = page.getByRole("dialog").first();
    await expect(newsModal).toBeVisible();
    await newsModal.locator("#title").fill(testData.news.initialTitle);
    await newsModal.locator("#content").fill(testData.news.content);
    await newsModal.getByRole("button", { name: /Publish|Create|Save/i }).first().click();
    await expect(newsModal).not.toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    await page.goto(`/admin/news?search=${encodeURIComponent(testData.news.initialTitle)}`);
    await expect(page.getByText(testData.news.initialTitle).first()).toBeVisible({ timeout: 10000 });

    // Update Article
    const newsRow = page.locator("tr").filter({ hasText: testData.news.initialTitle }).first();
    const newsEditBtn = newsRow.locator('button[title="Edit Article"]').first();
    await expect(newsEditBtn).toBeVisible();
    await newsEditBtn.click();

    const newsEditModal = page.getByRole("dialog").first();
    await expect(newsEditModal).toBeVisible();
    await newsEditModal.locator("#title").fill(testData.news.updatedTitle);
    await newsEditModal.getByRole("button", { name: /Update|Save/i }).first().click();
    await expect(newsEditModal).not.toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    await page.goto(`/admin/news?search=${encodeURIComponent(testData.news.updatedTitle)}`);
    await expect(page.getByText(testData.news.updatedTitle).first()).toBeVisible({ timeout: 10000 });

    // Delete Article
    const newsDelRow = page.locator("tr").filter({ hasText: testData.news.updatedTitle }).first();
    const newsDelBtn = newsDelRow.locator('button[title="Delete Article"]').first();
    await expect(newsDelBtn).toBeVisible();
    await newsDelBtn.click();

    const newsAlert = page.getByRole("alertdialog").first();
    await expect(newsAlert).toBeVisible();
    await newsAlert.getByRole("button", { name: "Delete" }).click();
    await expect(newsAlert).not.toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    await page.goto(`/admin/news?search=${encodeURIComponent(testData.news.updatedTitle)}`);
    await expect(page.getByText(testData.news.updatedTitle)).toHaveCount(0, { timeout: 10000 });

    // =========================================================================
    // FEATURE 6: CLUB EVENTS (GET -> CREATE -> UPDATE -> DELETE)
    // =========================================================================
    await page.goto("/admin/events");
    await expect(page.locator("h1, h2").filter({ hasText: /Events/i }).first()).toBeVisible();

    // Create Event
    await page.getByRole("button", { name: /Create Event|Add Event/i }).first().click();
    const eventModal = page.getByRole("dialog").first();
    await expect(eventModal).toBeVisible();
    await eventModal.locator("#title").fill(testData.event.initialTitle);
    await eventModal.locator("#eventDate").fill(testData.event.eventDate);
    await eventModal.getByRole("button", { name: /Create|Save/i }).first().click();
    await expect(eventModal).not.toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    await page.goto(`/admin/events?search=${encodeURIComponent(testData.event.initialTitle)}`);
    await expect(page.getByText(testData.event.initialTitle).first()).toBeVisible({ timeout: 10000 });

    // Update Event
    const eventRow = page.locator("tr").filter({ hasText: testData.event.initialTitle }).first();
    const eventEditBtn = eventRow.locator('button[title="Edit Event"]').first();
    await expect(eventEditBtn).toBeVisible();
    await eventEditBtn.click();

    const eventEditModal = page.getByRole("dialog").first();
    await expect(eventEditModal).toBeVisible();
    await eventEditModal.locator("#title").fill(testData.event.updatedTitle);
    await eventEditModal.getByRole("button", { name: /Update|Save/i }).first().click();
    await expect(eventEditModal).not.toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    await page.goto(`/admin/events?search=${encodeURIComponent(testData.event.updatedTitle)}`);
    await expect(page.getByText(testData.event.updatedTitle).first()).toBeVisible({ timeout: 10000 });

    // Delete Event
    const eventDelRow = page.locator("tr").filter({ hasText: testData.event.updatedTitle }).first();
    const eventDelBtn = eventDelRow.locator('button[title="Delete Event"]').first();
    await expect(eventDelBtn).toBeVisible();
    await eventDelBtn.click();

    const eventAlert = page.getByRole("alertdialog").first();
    await expect(eventAlert).toBeVisible();
    await eventAlert.getByRole("button", { name: "Delete" }).click();
    await expect(eventAlert).not.toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    await page.goto(`/admin/events?search=${encodeURIComponent(testData.event.updatedTitle)}`);
    await expect(page.getByText(testData.event.updatedTitle)).toHaveCount(0, { timeout: 10000 });

    // =========================================================================
    // FEATURE 7: USERS & PERMISSIONS (GET -> CREATE -> UPDATE -> DELETE)
    // =========================================================================
    await page.goto("/admin/users");
    await expect(page.locator("h1, h2").filter({ hasText: /Users/i }).first()).toBeVisible();

    // Create User
    await page.getByRole("button", { name: /Add User/i }).first().click();
    const userModal = page.getByRole("dialog").first();
    await expect(userModal).toBeVisible();
    await userModal.locator("#name").fill(testData.user.initialName);
    await userModal.locator("#email").fill(testData.user.email);
    await userModal.locator("#password").fill(testData.user.password);
    await userModal.getByRole("button", { name: /Create|Save/i }).first().click();
    await expect(userModal).not.toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    await page.goto(`/admin/users?search=${encodeURIComponent(testData.user.initialName)}`);
    await expect(page.getByText(testData.user.initialName).first()).toBeVisible({ timeout: 10000 });

    // Update User
    const userRow = page.locator("tr").filter({ hasText: testData.user.initialName }).first();
    const userEditBtn = userRow.locator('button[title="Edit User"]').first();
    await expect(userEditBtn).toBeVisible();
    await userEditBtn.click();

    const userEditModal = page.getByRole("dialog").first();
    await expect(userEditModal).toBeVisible();
    await userEditModal.locator("#name").fill(testData.user.updatedName);
    await userEditModal.getByRole("button", { name: /Update|Save/i }).first().click();
    await expect(userEditModal).not.toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    await page.goto(`/admin/users?search=${encodeURIComponent(testData.user.updatedName)}`);
    await expect(page.getByText(testData.user.updatedName).first()).toBeVisible({ timeout: 10000 });

    // Delete User
    const userDelRow = page.locator("tr").filter({ hasText: testData.user.updatedName }).first();
    const userDelBtn = userDelRow.locator('button[title="Delete User"]').first();
    await expect(userDelBtn).toBeVisible();
    await userDelBtn.click();

    const userAlert = page.getByRole("alertdialog").first();
    await expect(userAlert).toBeVisible();
    await userAlert.getByRole("button", { name: "Delete" }).click();
    await expect(userAlert).not.toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    await page.goto(`/admin/users?search=${encodeURIComponent(testData.user.updatedName)}`);
    await expect(page.getByText(testData.user.updatedName)).toHaveCount(0, { timeout: 10000 });
  });
});
