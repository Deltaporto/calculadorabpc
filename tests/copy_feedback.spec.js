// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Clipboard Feedback', () => {
  test.beforeEach(async ({ context, page }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    // Navigate to the app
    await page.goto('http://127.0.0.1:8000/index.html');
  });

  test('Standard Text Copy Button Feedback', async ({ page }) => {
    // Switch to Simulador mode to see the standard text section
    await page.click('button[data-mode="simulador"]');

    // Fill in some data to generate text (just to be safe, though empty might work with "Gere o texto" message)
    // Actually, "Copiar texto" works even if text is empty, it just shows feedback.
    // But let's fill something to be realistic.
    await page.click('[data-domain="e1"] button[data-value="2"]');

    const copyBtn = page.locator('#btnCopiarTexto');

    // Initial state
    await expect(copyBtn).toContainText('Copiar texto');
    // Check initial icon (clipboard) - we can check the use href
    const iconUse = copyBtn.locator('use');
    await expect(iconUse).toHaveAttribute('href', '#i-clipboard');

    // Click copy
    await copyBtn.click();

    // Verify feedback state
    // The text should change to "Copiado!" (or similar, based on implementation)
    // The icon should change to checkmark
    await expect(copyBtn).toContainText('Copiado!');
    await expect(copyBtn.locator('use')).toHaveAttribute('href', '#i-check-circle');

    // Verify reversion after timeout
    // Timeout is 2000ms
    await page.waitForTimeout(2100);

    await expect(copyBtn).toContainText('Copiar texto');
    await expect(copyBtn.locator('use')).toHaveAttribute('href', '#i-clipboard');
  });

  test('Judicial Control Copy Button Feedback', async ({ page }) => {
    // Switch to Controle Judicial
    await page.click('button[data-mode="controle"]');

    // We need to fix base admin to unlock further steps.

    // Step 1: Base Admin
    await page.click('#jcAdminAmbButtons button[data-value="0"]');
    await page.click('#jcAdminAtivButtons button[data-value="0"]');
    // Use value 2 (M) for Corpo to ensure AtivMed question is shown (if needed) or just to have a relevant scenario
    await page.click('#jcAdminCorpoButtons button[data-value="2"]');
    await page.click('#jcAdminEstruturasRecButtons button[data-value="nao"]');
    await page.click('#jcAdminProgRecButtons button[data-value="nao"]');
    await page.click('#btnFixarBaseAdmin');

    // Step 2: Med
    await page.click('#jcImpedimentoButtons button[data-value="sim"]');
    await page.click('#jcCorpoKeepButtons button[data-value="sim"]');
    // Now with Corpo=M, the system asks about AtivMed
    await page.click('#jcHasAtivMedButtons button[data-value="nao"]');

    // Step 3: Triage should be done now.
    // Step 4: Text should be available.

    // Scroll to the buttons
    const btnGerar = page.locator('#btnGerarControleTexto');
    await btnGerar.click();

    const btnCopy = page.locator('#btnCopiarControleTexto');

    // Click Copy
    await btnCopy.click();

    // Verify feedback
    await expect(btnCopy).toContainText('Copiado!');
    await expect(btnCopy.locator('use')).toHaveAttribute('href', '#i-check-circle');

    // Revert
    await page.waitForTimeout(2100);
    await expect(btnCopy).toContainText('Somente copiar');
    await expect(btnCopy.locator('use')).toHaveAttribute('href', '#i-clipboard');
  });
});
