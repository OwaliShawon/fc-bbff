import { test, expect } from "@playwright/test";

test.describe("News Articles Sequential CRUD Lifecycle Workflow", () => {
  const ts = Date.now();
  const testArticle = {
    initialTitle: `E2E News ${ts}`,
    updatedTitle: `E2E News ${ts} (Updated)`,
    content: "Full detailed report of the automated test match series.",
  };

  test("should execute full CRUD lifecycle for News Articles step-by-step", async ({ page }) => {
    // STEP 1: LOGIN
    await page.goto("/login");
    await page.locator("#email").fill("superadmin@bbfffc.com");
    await page.locator("#password").fill("password123");
    await page.getByRole("button", { name: /Sign In/i }).click();
    await expect(page).toHaveURL(/\/admin/);

    // STEP 2: GET / READ
    await page.goto("/admin/news");
    await expect(page.locator("h1, h2").filter({ hasText: /News|Articles/i }).first()).toBeVisible();

    // STEP 3: CREATE ARTICLE
    const createBtn = page.getByRole("button", { name: /Create Article|Add Article/i }).first();
    await expect(createBtn).toBeVisible();
    await createBtn.click();

    const dialog = page.getByRole("dialog").first();
    await expect(dialog).toBeVisible();

    await dialog.locator("#title").fill(testArticle.initialTitle);
    await dialog.locator("#content").fill(testArticle.content);

    const saveBtn = dialog.getByRole("button", { name: /Publish|Create|Save/i }).first();
    await saveBtn.click();

    await expect(dialog).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText(testArticle.initialTitle).first()).toBeVisible({ timeout: 10000 });

    // STEP 4: UPDATE ARTICLE
    const newsRow = page.locator("tr").filter({ hasText: testArticle.initialTitle }).first();
    await expect(newsRow).toBeVisible();

    const editBtn = newsRow.locator("button[title='Edit Article']");
    await editBtn.click();

    const editDialog = page.getByRole("dialog").first();
    await expect(editDialog).toBeVisible();

    await editDialog.locator("#title").fill(testArticle.updatedTitle);

    const updateBtn = editDialog.getByRole("button", { name: /Update|Save/i }).first();
    await updateBtn.click();

    await expect(editDialog).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText(testArticle.updatedTitle).first()).toBeVisible({ timeout: 10000 });

    // STEP 5: DELETE ARTICLE
    const targetRow = page.locator("tr").filter({ hasText: testArticle.updatedTitle }).first();
    const deleteBtn = targetRow.locator("button[title='Delete Article']");
    await deleteBtn.click();

    const confirmAlert = page.getByRole("alertdialog");
    await expect(confirmAlert).toBeVisible();
    await confirmAlert.getByRole("button", { name: "Delete" }).click();

    await expect(confirmAlert).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText(testArticle.updatedTitle)).toHaveCount(0, { timeout: 10000 });
  });
});
