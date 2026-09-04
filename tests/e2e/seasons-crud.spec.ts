import { test, expect } from "@playwright/test";

test.describe("Seasons Sequential CRUD Lifecycle Workflow", () => {
  const ts = Date.now();
  const testSeason = {
    initialName: `Season ${ts}`,
    updatedName: `Season ${ts} (Updated)`,
    startDate: "2031-01-01",
    endDate: "2031-12-31",
  };

  test("should execute full CRUD lifecycle for Seasons step-by-step", async ({ page }) => {
    // STEP 1: LOGIN
    await page.goto("/login");
    await page.locator("#email").fill("superadmin@bbfffc.com");
    await page.locator("#password").fill("password123");
    await page.getByRole("button", { name: /Sign In/i }).click();
    await expect(page).toHaveURL(/\/admin/);

    // STEP 2: GET / READ
    await page.goto("/admin/seasons");
    await expect(page.locator("h1, h2").filter({ hasText: "Seasons" }).first()).toBeVisible();

    // STEP 3: CREATE SEASON
    const createBtn = page.getByRole("button", { name: /Create Season|Add Season/i }).first();
    await expect(createBtn).toBeVisible();
    await createBtn.click();

    const dialog = page.getByRole("dialog").first();
    await expect(dialog).toBeVisible();

    await dialog.locator("#name").fill(testSeason.initialName);
    await dialog.locator("#startDate").fill(testSeason.startDate);
    await dialog.locator("#endDate").fill(testSeason.endDate);

    const saveBtn = dialog.getByRole("button", { name: /Create|Save/i }).first();
    await saveBtn.click();

    await expect(dialog).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText(testSeason.initialName).first()).toBeVisible({ timeout: 10000 });

    // STEP 4: UPDATE SEASON
    const seasonRow = page.locator("tr").filter({ hasText: testSeason.initialName }).first();
    await expect(seasonRow).toBeVisible();

    const editBtn = seasonRow.locator("button[title='Edit Season']");
    await editBtn.click();

    const editDialog = page.getByRole("dialog").first();
    await expect(editDialog).toBeVisible();

    await editDialog.locator("#name").fill(testSeason.updatedName);

    const updateBtn = editDialog.getByRole("button", { name: /Update|Save/i }).first();
    await updateBtn.click();

    await expect(editDialog).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText(testSeason.updatedName).first()).toBeVisible({ timeout: 10000 });

    // STEP 5: DELETE SEASON
    const targetRow = page.locator("tr").filter({ hasText: testSeason.updatedName }).first();
    const deleteBtn = targetRow.locator("button[title='Delete Season']");
    await deleteBtn.click();

    const confirmAlert = page.getByRole("alertdialog");
    await expect(confirmAlert).toBeVisible();
    await confirmAlert.getByRole("button", { name: "Delete" }).click();

    await expect(confirmAlert).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText(testSeason.updatedName)).toHaveCount(0, { timeout: 10000 });
  });
});
