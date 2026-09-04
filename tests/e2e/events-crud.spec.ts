import { test, expect } from "@playwright/test";

test.describe("Events Sequential CRUD Lifecycle Workflow", () => {
  const ts = Date.now();
  const testEvent = {
    initialTitle: `E2E Event ${ts}`,
    updatedTitle: `E2E Event ${ts} (Updated)`,
    eventDate: "2026-12-25",
  };

  test("should execute full CRUD lifecycle for Club Events step-by-step", async ({ page }) => {
    // STEP 1: LOGIN
    await page.goto("/login");
    await page.locator("#email").fill("superadmin@bbfffc.com");
    await page.locator("#password").fill("password123");
    await page.getByRole("button", { name: /Sign In/i }).click();
    await expect(page).toHaveURL(/\/admin/);

    // STEP 2: GET / READ
    await page.goto("/admin/events");
    await expect(page.locator("h1, h2").filter({ hasText: /Events/i }).first()).toBeVisible();

    // STEP 3: CREATE EVENT
    const createBtn = page.getByRole("button", { name: /Create Event|Add Event/i }).first();
    await expect(createBtn).toBeVisible();
    await createBtn.click();

    const dialog = page.getByRole("dialog").first();
    await expect(dialog).toBeVisible();

    await dialog.locator("#title").fill(testEvent.initialTitle);
    await dialog.locator("#eventDate").fill(testEvent.eventDate);

    const saveBtn = dialog.getByRole("button", { name: /Create|Save/i }).first();
    await saveBtn.click();

    await expect(dialog).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText(testEvent.initialTitle).first()).toBeVisible({ timeout: 10000 });

    // STEP 4: UPDATE EVENT
    const eventRow = page.locator("tr").filter({ hasText: testEvent.initialTitle }).first();
    await expect(eventRow).toBeVisible();

    const editBtn = eventRow.locator("button[title='Edit Event']");
    await editBtn.click();

    const editDialog = page.getByRole("dialog").first();
    await expect(editDialog).toBeVisible();

    await editDialog.locator("#title").fill(testEvent.updatedTitle);

    const updateBtn = editDialog.getByRole("button", { name: /Update|Save/i }).first();
    await updateBtn.click();

    await expect(editDialog).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText(testEvent.updatedTitle).first()).toBeVisible({ timeout: 10000 });

    // STEP 5: DELETE EVENT
    const targetRow = page.locator("tr").filter({ hasText: testEvent.updatedTitle }).first();
    const deleteBtn = targetRow.locator("button[title='Delete Event']");
    await deleteBtn.click();

    const confirmAlert = page.getByRole("alertdialog");
    await expect(confirmAlert).toBeVisible();
    await confirmAlert.getByRole("button", { name: "Delete" }).click();

    await expect(confirmAlert).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText(testEvent.updatedTitle)).toHaveCount(0, { timeout: 10000 });
  });
});
