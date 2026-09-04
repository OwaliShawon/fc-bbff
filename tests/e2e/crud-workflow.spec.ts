import { test, expect } from "@playwright/test";

test.describe("Full Admin CRUD Lifecycle Workflow (Login -> GET -> CREATE -> UPDATE -> DELETE)", () => {
  const testPlayer = {
    firstName: "E2E",
    lastName: "TestPlayer",
    fullName: "E2E TestPlayer",
    initialCity: "Dhaka",
    updatedCity: "Chittagong",
    jerseyNumber: "99",
  };

  test("should execute full CRUD lifecycle step-by-step in one session", async ({ page }) => {
    // ------------------------------------------------------------------------
    // STEP 1: LOGIN (AUTHENTICATION)
    // ------------------------------------------------------------------------
    await page.goto("/login");
    await page.locator("#email").fill("superadmin@bbfffc.com");
    await page.locator("#password").fill("password123");
    await page.getByRole("button", { name: /Sign In/i }).click();

    // Verify authentication redirect to Admin Portal
    await expect(page).toHaveURL(/\/admin/);

    // ------------------------------------------------------------------------
    // STEP 2: GET / READ (RESOURCE LISTS)
    // ------------------------------------------------------------------------
    // Read Players Directory
    await page.goto("/admin/players");
    await expect(page.locator("h1, h2").filter({ hasText: "Players" }).first()).toBeVisible();
    await expect(page.locator("table").first()).toBeVisible();

    // Read Teams Directory
    await page.goto("/admin/teams");
    await expect(page.locator("h1, h2").filter({ hasText: "Teams" }).first()).toBeVisible();

    // Read Matches Directory
    await page.goto("/admin/matches");
    await expect(page.locator("h1, h2").filter({ hasText: "Matches" }).first()).toBeVisible();

    // ------------------------------------------------------------------------
    // STEP 3: CREATE (POST NEW PLAYER)
    // ------------------------------------------------------------------------
    await page.goto("/admin/players");

    const addBtn = page.getByRole("button", { name: /Add Player/i }).first();
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    const dialog = page.getByRole("dialog").first();
    await expect(dialog).toBeVisible();

    // Fill form fields using unique element IDs
    await dialog.locator("#firstName").fill(testPlayer.firstName);
    await dialog.locator("#lastName").fill(testPlayer.lastName);
    await dialog.locator("#jerseyNumber").fill(testPlayer.jerseyNumber);

    const cityInput = dialog.locator("#currentCity");
    if (await cityInput.isVisible()) {
      await cityInput.fill(testPlayer.initialCity);
    }

    // Submit player creation
    const saveBtn = dialog.getByRole("button", { name: "Create Player" }).first();
    await saveBtn.click();

    // Verify created entry appears in table
    await page.waitForTimeout(1000);
    await expect(page.getByText(testPlayer.fullName).first()).toBeVisible();

    // ------------------------------------------------------------------------
    // STEP 4: UPDATE (PUT/PATCH EXISTING PLAYER)
    // ------------------------------------------------------------------------
    const playerRow = page.locator("tr").filter({ hasText: testPlayer.fullName }).first();
    await expect(playerRow).toBeVisible();

    const editBtn = playerRow.locator("button").filter({ hasText: /Edit/i }).first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
    } else {
      await playerRow.locator("button").first().click();
    }

    const editDialog = page.getByRole("dialog").first();
    await expect(editDialog).toBeVisible();

    const editCity = editDialog.locator("#currentCity");
    if (await editCity.isVisible()) {
      await editCity.fill(testPlayer.updatedCity);
    }

    const updateSaveBtn = editDialog.getByRole("button", { name: "Update Player" }).first();
    await updateSaveBtn.click();

    await page.waitForTimeout(1000);
    await expect(page.getByText(testPlayer.fullName).first()).toBeVisible();

    // ------------------------------------------------------------------------
    // STEP 5: DELETE (DESTROY PLAYER ENTRY)
    // ------------------------------------------------------------------------
    const targetRow = page.locator("tr").filter({ hasText: testPlayer.fullName }).first();
    const deleteBtn = targetRow.locator("button").filter({ hasText: /Delete/i }).first();
    
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
    } else {
      await targetRow.locator("button").last().click();
    }

    const confirmBtn = page.getByRole("button", { name: /^Delete$/i }).last();
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }

    // Verify player is removed from directory
    await page.waitForTimeout(1000);
    await expect(page.getByText(testPlayer.fullName)).toHaveCount(0);
  });
});
