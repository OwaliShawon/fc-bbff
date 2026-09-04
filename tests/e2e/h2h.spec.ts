import { test, expect } from "@playwright/test";

test.describe("Head-to-Head (H2H) Analytics E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/h2h");
  });

  test("should render H2H hero section and title", async ({ page }) => {
    await expect(page.locator("h1").first()).toContainText("BBFF vs Opponents");
    await expect(page.getByText("Head-to-Head Comparison Matrix").first()).toBeVisible();
  });

  test("should render downloadable H2H card", async ({ page }) => {
    const h2hCard = page.locator("div[id^='h2h-card-']").first();
    await expect(h2hCard).toBeVisible();

    const downloadBtn = page.getByRole("button", { name: /Download H2H Card/i });
    await expect(downloadBtn).toBeVisible();
  });

  test("should render Overall Opponent Records Summary table with internal teams only", async ({ page }) => {
    const tableHeader = page.locator("h2").filter({ hasText: /Overall Opponent Records Summary/i }).first();
    await expect(tableHeader).toBeVisible();

    const table = page.locator("table").first();
    await expect(table).toBeVisible();

    await expect(page.getByText("Opponent Team").first()).toBeVisible();
    await expect(page.getByText("Played").first()).toBeVisible();
    await expect(page.getByText("Wins").first()).toBeVisible();
    await expect(page.getByText("Win Rate").first()).toBeVisible();
  });
});
