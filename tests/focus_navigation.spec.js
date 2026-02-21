// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Focus Management', () => {
  test('focus moves to Judicial Control section when switching from Simulator via "Levar para Controle"', async ({ page }) => {
    await page.goto('http://127.0.0.1:8000/index.html');

    // Switch to Simulator mode
    await page.click('button[data-mode="simulador"]');

    // Ensure we are in Simulator mode
    const simulatorDetails = page.locator('#simuladorDetails');
    await expect(simulatorDetails).toBeVisible();

    // The button should now be visible
    const btnLevar = page.locator('#btnLevarParaControle');
    await expect(btnLevar).toBeVisible();

    await btnLevar.click();

    // Expect Judicial Control section to be visible
    const judicialSection = page.locator('#judicialControlSection');
    await expect(judicialSection).toBeVisible();

    // Verify focus is on the Judicial Control section
    await expect(judicialSection).toBeFocused();
  });
});
