import { test, expect } from '@playwright/test';

test.describe('Palette: Animation Visibility Verification', () => {
  test('Popover is visible after opening', async ({ page }) => {
    // Navigate to the app (assumes server is running on port 8000)
    await page.goto('http://127.0.0.1:8000/index.html');

    // Switch to Simulator mode
    await page.click('button[data-mode="simulador"]');

    // Open the help popover
    await page.click('#btnImpedimentoHelp');

    // Verify it is visible
    const popover = page.locator('#simHelpPopover');
    await expect(popover).toBeVisible();

    // Verify content is visible
    await expect(page.locator('#simHelpTitle')).toBeVisible();
  });

  test('Dialog is visible after opening', async ({ page }) => {
    await page.goto('http://127.0.0.1:8000/index.html');

    // Click the button that opens the modal
    await page.click('#openPortariaTextBtn');

    // Verify modal is visible
    const modal = page.locator('#portariaModal');
    await expect(modal).toBeVisible();

    // Verify content inside modal is visible
    await expect(page.locator('#portariaModalTitle')).toBeVisible();
  });
});
