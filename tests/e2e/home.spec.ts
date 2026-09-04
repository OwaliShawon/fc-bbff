import { test, expect } from "@playwright/test";

test.describe("Public Home Page E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display home page title and official club branding", async ({ page }) => {
    const mainHeading = page.locator("h1").first();
    await expect(mainHeading).toBeVisible();
    await expect(page).toHaveTitle(/FC BBFF/i);
  });

  test("should render navigation bar and links correctly", async ({ page }) => {
    const navbar = page.locator("header").first();
    await expect(navbar).toBeVisible();

    await expect(page.locator("header nav").getByRole("link", { name: "Home" })).toBeVisible();
    await expect(page.locator("header nav").getByRole("link", { name: "Players" })).toBeVisible();
    await expect(page.locator("header nav").getByRole("link", { name: "H2H Record" })).toBeVisible();
    await expect(page.locator("header nav").getByRole("link", { name: "Statistics" })).toBeVisible();
  });

  test("should navigate to matches page via View Fixtures action button", async ({ page }) => {
    const fixturesBtn = page.getByRole("link", { name: /View Fixtures/i }).first();
    await expect(fixturesBtn).toBeVisible();
    await fixturesBtn.click();
    await expect(page).toHaveURL(/\/matches/);
  });

  test("should render footer with club details", async ({ page }) => {
    const footer = page.locator("footer").first();
    await expect(footer).toBeVisible();
    await expect(footer).toContainText("FC BBFF");
  });
});
