// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Toast Feedback', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://127.0.0.1:8000/index.html');
  });

  test('shows success toast for judicial control actions with accessibility attributes', async ({ page }) => {
    await page.click('button[data-mode="simulador"]');

    await page.click('#btnLevarParaControle');
    const firstToast = page.locator('.toast-success').last();
    await expect(firstToast).toBeVisible();
    await expect(firstToast).toContainText('Cenário copiado para o rascunho do Controle Judicial.');

    const container = page.locator('#toast-container');
    await expect(container).toHaveAttribute('role', 'region');
    await expect(container).toHaveAttribute('aria-label', 'Notificações');
    await expect(container).toHaveAttribute('aria-live', 'polite');
    await expect(firstToast).toHaveAttribute('role', 'status');

    await page.click('#jcAdminAmbButtons button[data-value="2"]');
    await page.click('#jcAdminAtivButtons button[data-value="2"]');
    await page.click('#jcAdminCorpoButtons button[data-value="2"]');
    await page.click('#jcAdminEstruturasRecButtons button[data-value="nao"]');
    await page.click('#jcAdminProgRecButtons button[data-value="nao"]');
    await page.click('#btnFixarBaseAdmin');

    const secondToast = page.locator('.toast-success').last();
    await expect(secondToast).toContainText('Base administrativa fixada com sucesso.');
  });
});
