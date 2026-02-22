// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Toast Feedback', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://127.0.0.1:8000/index.html');
  });

  test('Judicial Control "Send to Draft" triggers toast', async ({ page }) => {
    // 1. Navigate to Simulador to ensure elements are ready
    const simButton = page.locator('button[data-mode="simulador"]');
    await simButton.click();

    // 2. Locate the "Levar cenário para Controle Judicial" button
    const btn = page.locator('#btnLevarParaControle');

    // 3. Click the button
    await btn.click();

    // 4. Verify toast appearance
    // The toast message should be "Cenário copiado para o rascunho do Controle Judicial."
    // And it should have role="status" and the container aria-live="polite".
    const toast = page.locator('.toast-success');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Cenário copiado para o rascunho do Controle Judicial.');

    // 5. Verify accessibility attributes on toast container
    const container = page.locator('#toast-container');
    await expect(container).toHaveAttribute('role', 'region');
    await expect(container).toHaveAttribute('aria-label', 'Notificações');
    await expect(container).toHaveAttribute('aria-live', 'polite');

    // 6. Verify individual toast accessibility
    // Success toast should be role="status"
    await expect(toast).toHaveAttribute('role', 'status');
  });
});
