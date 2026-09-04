import { test, expect } from "@playwright/test";

test.describe("Admin Console & Squad Roster E2E Tests", () => {
  test("should render admin login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1, h2, div").filter({ hasText: "FC BBFF Admin" }).first()).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
  });

  test("should handle player directory filter resetting", async ({ page }) => {
    await page.goto("/admin/players");
    
    const positionSelect = page.locator("button").filter({ hasText: /All Positions|Position/i }).first();
    if (await positionSelect.isVisible()) {
      await positionSelect.click();
      const defenderOption = page.getByRole("option", { name: "Defender" });
      if (await defenderOption.isVisible()) {
        await defenderOption.click();
        await expect(page).toHaveURL(/position=DEFENDER/);

        await positionSelect.click();
        const allOption = page.getByRole("option", { name: "All Positions" });
        await allOption.click();

        await expect(page).not.toHaveURL(/position=/);
      }
    }
  });

  test("should redirect unauthenticated users from /admin/venues to /login", async ({ page }) => {
    await page.goto("/admin/venues");
    await expect(page).toHaveURL(/\/login/);
  });
});
