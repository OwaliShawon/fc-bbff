import { test, expect } from "@playwright/test";

test.describe("Players Directory & Profile E2E Tests", () => {
  test("should render player directory page", async ({ page }) => {
    await page.goto("/players");
    await expect(page.locator("h1").first()).toContainText("Our Players");
    await expect(page.locator("section").first()).toBeVisible();
  });

  test("should navigate from players directory to player detail page", async ({ page }) => {
    await page.goto("/players");
    const playerLink = page.locator("a[href^='/players/']").filter({ hasNotText: "Our Players" }).first();

    if (await playerLink.isVisible()) {
      await playerLink.click();
      await expect(page).toHaveURL(/\/players\/[a-z0-9-]+/);
      await expect(page.locator("h1").first()).toBeVisible();
    }
  });

  test("should display downloadable official squad card on player detail page", async ({ page }) => {
    await page.goto("/players");
    const playerLink = page.locator("a[href^='/players/']").filter({ hasNotText: "Our Players" }).first();

    if (await playerLink.isVisible()) {
      const href = await playerLink.getAttribute("href");
      if (href) {
        await page.goto(href);
        const downloadBtn = page.getByRole("button", { name: /Download Card/i });
        await expect(downloadBtn).toBeVisible();

        const cardTitle = page.locator("div[id^='player-card-'] p").filter({ hasText: "FC BBFF" }).first();
        await expect(cardTitle).toBeVisible();
      }
    }
  });
});
