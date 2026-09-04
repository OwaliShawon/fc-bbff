import { test, expect } from "@playwright/test";

test.describe("Competitions Sequential CRUD Lifecycle Workflow", () => {
  const ts = Date.now();
  const testComp = {
    initialName: `E2E Comp ${ts}`,
    updatedName: `E2E Comp ${ts} (Updated)`,
  };

  test("should execute full CRUD lifecycle for Competitions step-by-step", async ({ page }) => {
    // STEP 1: LOGIN
    await page.goto("/login");
    await page.locator("#email").fill("superadmin@bbfffc.com");
    await page.locator("#password").fill("password123");
    await page.getByRole("button", { name: /Sign In/i }).click();
    await expect(page).toHaveURL(/\/admin/);

    // STEP 2: GET / READ
    await page.goto("/admin/competitions");
    await expect(page.locator("h1, h2").filter({ hasText: "Competitions & Tournaments" }).first()).toBeVisible();

    // STEP 3: CREATE COMPETITION
    const createBtn = page.getByRole("button", { name: "Create Competition" }).first();
    await expect(createBtn).toBeVisible();
    await createBtn.click();

    const dialog = page.getByRole("dialog").first();
    await expect(dialog).toBeVisible();

    await dialog.locator("#name").fill(testComp.initialName);

    const saveBtn = dialog.getByRole("button", { name: /Create|Save/i }).first();
    await saveBtn.click();

    await expect(dialog).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText(testComp.initialName).first()).toBeVisible({ timeout: 10000 });

    // STEP 4: UPDATE COMPETITION
    const compRow = page.locator("tr").filter({ hasText: testComp.initialName }).first();
    await expect(compRow).toBeVisible();

    const editBtn = compRow.locator("button[title='Edit Competition']");
    await editBtn.click();

    const editDialog = page.getByRole("dialog").first();
    await expect(editDialog).toBeVisible();

    await editDialog.locator("#name").fill(testComp.updatedName);

    const updateBtn = editDialog.getByRole("button", { name: /Update|Save/i }).first();
    await updateBtn.click();

    await expect(editDialog).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText(testComp.updatedName).first()).toBeVisible({ timeout: 10000 });

    // STEP 5: DELETE COMPETITION
    const targetComp = page.locator("tr").filter({ hasText: testComp.updatedName }).first();
    const deleteBtn = targetComp.locator("button[title='Delete Competition']");
    await deleteBtn.click();

    const confirmAlert = page.getByRole("alertdialog");
    await expect(confirmAlert).toBeVisible();
    await confirmAlert.getByRole("button", { name: "Delete" }).click();

    await expect(confirmAlert).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText(testComp.updatedName)).toHaveCount(0, { timeout: 10000 });
  });
});
