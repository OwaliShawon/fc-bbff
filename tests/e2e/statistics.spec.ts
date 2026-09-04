import { test, expect } from "@playwright/test";

test.describe("Statistics & Leaderboards E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/statistics");
  });

  test("should render statistics page header", async ({ page }) => {
    await expect(page.locator("h1").first()).toContainText("Club Statistics");
  });

  test("should render top goalscorer, playmaker, and awards cards", async ({ page }) => {
    await expect(page.locator("h3").filter({ hasText: "Top Goalscorer" }).first()).toBeVisible();
    await expect(page.locator("h3").filter({ hasText: "Top Playmaker" }).first()).toBeVisible();
    await expect(page.locator("h3").filter({ hasText: "Player of the Match" }).first()).toBeVisible();
  });

  test("should render full squad performance leaderboard table", async ({ page }) => {
    await expect(page.getByText("Full Squad Performance").first()).toBeVisible();
    
    const table = page.locator("table").first();
    await expect(table).toBeVisible();
    await expect(page.getByText("Player").first()).toBeVisible();
    await expect(page.getByText("Position").first()).toBeVisible();
  });
});
