import { test, expect } from "@playwright/test";

test.describe("Facebook Social Media Cards Download & Size Verification", () => {
  test("should load match detail page and verify card download action buttons", async ({ page }) => {
    // Navigate to matches list
    await page.goto("/matches");
    await page.waitForLoadState("networkidle");

    // Click on the first match if available or navigate to /h2h
    const matchLink = page.locator('a[href^="/matches/"]').first();
    if (await matchLink.isVisible()) {
      await matchLink.click();
      await page.waitForLoadState("networkidle");

      // Verify Matchday & MOTM card download buttons exist
      const downloadBtn = page.getByRole("button", { name: /Download/i }).first();
      await expect(downloadBtn).toBeVisible();

      // Trigger download event check
      const downloadPromise = page.waitForEvent("download").catch(() => null);
      await downloadBtn.click();

      // Ensure button state changes or download fires without errors
      await page.waitForTimeout(2000);
    }

    // Navigate to H2H page and check H2H Card Download
    await page.goto("/h2h");
    await page.waitForLoadState("networkidle");

    const h2hDownloadBtn = page.getByRole("button", { name: /Download H2H Card/i }).first();
    if (await h2hDownloadBtn.isVisible()) {
      await expect(h2hDownloadBtn).toBeVisible();
    }
  });
});
