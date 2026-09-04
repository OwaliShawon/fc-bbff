import { test, expect } from "@playwright/test";

test.describe("Teams & Squads Sequential CRUD Lifecycle Workflow", () => {
  const ts = Date.now();
  const testTeam = {
    initialName: `E2E Team ${ts}`,
    updatedName: `E2E Team ${ts} (Updated)`,
  };

  test("should execute full CRUD lifecycle for Teams step-by-step", async ({ page }) => {
    // STEP 1: LOGIN
    await page.goto("/login");
    await page.locator("#email").fill("superadmin@bbfffc.com");
    await page.locator("#password").fill("password123");
    await page.getByRole("button", { name: /Sign In/i }).click();
    await expect(page).toHaveURL(/\/admin/);

    // STEP 2: GET / READ
    await page.goto("/admin/teams");
    await expect(page.locator("h1, h2").filter({ hasText: "Teams" }).first()).toBeVisible();
    await expect(page.locator("table").first()).toBeVisible();

    // STEP 3: CREATE TEAM
    const addBtn = page.getByRole("button", { name: /Add Team/i }).first();
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    const dialog = page.getByRole("dialog").first();
    await expect(dialog).toBeVisible();
    await dialog.locator("#teamName").fill(testTeam.initialName);

    const saveBtn = dialog.getByRole("button", { name: "Create", exact: true });
    await saveBtn.click();

    // Wait for modal to close after server action succeeds
    await expect(dialog).not.toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);
    await page.goto(`/admin/teams?search=${encodeURIComponent(testTeam.initialName)}`);
    await expect(page.getByText(testTeam.initialName).first()).toBeVisible({ timeout: 10000 });

    // STEP 4: UPDATE TEAM
    const teamRow = page.locator("tr").filter({ hasText: testTeam.initialName }).first();
    await expect(teamRow).toBeVisible();

    const editBtn = teamRow.locator("button[title='Edit Team']");
    await editBtn.click();

    const editDialog = page.getByRole("dialog").first();
    await expect(editDialog).toBeVisible();

    await editDialog.locator("#teamName").fill(testTeam.updatedName);

    const updateBtn = editDialog.getByRole("button", { name: "Update", exact: true });
    await updateBtn.click();

    // Wait for modal to close after update server action succeeds
    await expect(editDialog).not.toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);
    await page.goto(`/admin/teams?search=${encodeURIComponent(testTeam.updatedName)}`);
    await expect(page.getByText(testTeam.updatedName).first()).toBeVisible({ timeout: 10000 });

    // STEP 5: DELETE TEAM
    const targetRow = page.locator("tr").filter({ hasText: testTeam.updatedName }).first();
    const deleteBtn = targetRow.locator("button[title='Delete Team']");
    await deleteBtn.click();

    const confirmAlert = page.getByRole("alertdialog");
    await expect(confirmAlert).toBeVisible();
    await confirmAlert.getByRole("button", { name: "Delete" }).click();

    // Wait for delete dialog to close after server action succeeds
    await expect(confirmAlert).not.toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    await page.goto(`/admin/teams?search=${encodeURIComponent(testTeam.updatedName)}`);
    await expect(page.getByText(testTeam.updatedName)).toHaveCount(0, { timeout: 10000 });
  });
});
