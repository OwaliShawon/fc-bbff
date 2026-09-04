import { test, expect } from "@playwright/test";

test.describe("Users & Permissions Sequential CRUD Lifecycle Workflow", () => {
  const timestamp = Date.now();
  const testUser = {
    initialName: `E2E User ${timestamp}`,
    updatedName: `E2E User ${timestamp} (Updated)`,
    email: `e2e.user.${timestamp}@bbfffc.com`,
    password: "Password123!",
  };

  test("should execute full CRUD lifecycle for Admin Users step-by-step", async ({ page }) => {
    // STEP 1: LOGIN
    await page.goto("/login");
    await page.locator("#email").fill("superadmin@bbfffc.com");
    await page.locator("#password").fill("password123");
    await page.getByRole("button", { name: /Sign In/i }).click();
    await expect(page).toHaveURL(/\/admin/);

    // STEP 2: GET / READ
    await page.goto("/admin/users");
    await expect(page.locator("h1, h2").filter({ hasText: /Users/i }).first()).toBeVisible();

    // STEP 3: CREATE USER
    const createBtn = page.getByRole("button", { name: /Add User/i }).first();
    await expect(createBtn).toBeVisible();
    await createBtn.click();

    const dialog = page.getByRole("dialog").first();
    await expect(dialog).toBeVisible();

    await dialog.locator("#name").fill(testUser.initialName);
    await dialog.locator("#email").fill(testUser.email);
    await dialog.locator("#password").fill(testUser.password);

    const saveBtn = dialog.getByRole("button", { name: /^Create User$/i }).first();
    await saveBtn.click();

    await expect(dialog).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText(testUser.initialName).first()).toBeVisible();

    // STEP 4: UPDATE USER
    const userRow = page.locator("tr").filter({ hasText: testUser.initialName }).first();
    const editBtn = userRow.locator('button[title="Edit User"]').first();
    await expect(editBtn).toBeVisible();
    await editBtn.click();

    const editDialog = page.getByRole("dialog").first();
    await expect(editDialog).toBeVisible();

    await editDialog.locator("#name").fill(testUser.updatedName);

    const updateBtn = editDialog.getByRole("button", { name: /^Update User$/i }).first();
    await updateBtn.click();

    await expect(editDialog).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText(testUser.updatedName).first()).toBeVisible();

    // STEP 5: DELETE USER
    const targetRow = page.locator("tr").filter({ hasText: testUser.updatedName }).first();
    const deleteBtn = targetRow.locator('button[title="Delete User"]').first();
    await expect(deleteBtn).toBeVisible();
    await deleteBtn.click();

    const confirmDialog = page.getByRole("alertdialog").first();
    await expect(confirmDialog).toBeVisible();
    const confirmBtn = confirmDialog.getByRole("button", { name: /^Delete$/i });
    await confirmBtn.click();

    await expect(confirmDialog).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText(testUser.updatedName)).toHaveCount(0);
  });
});

