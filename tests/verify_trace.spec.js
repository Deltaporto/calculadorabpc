import { test, expect } from '@playwright/test';
import path from 'path';

test('Security Verification: Trace Log XSS and Structure', async ({ page }) => {
  // 1. Open the page
  const filePath = path.resolve(process.cwd(), 'index.html');
  await page.goto(`file://${filePath}`);

  // 2. Switch to Controle Judicial (should be default but let's be sure)
  await page.click('button[data-mode="controle"]');

  // 3. Complete Step 1: Base Administrativa
  // Select 'N' for Amb and Ativ
  await page.click('#jcAdminAmbButtons button[data-value="0"]');
  await page.click('#jcAdminAtivButtons button[data-value="0"]');
  // Select 'M' (2) for Corpo to enable Ativ Reclass question
  await page.click('#jcAdminCorpoButtons button[data-value="2"]');

  // Select 'Não' for recognitions
  await page.click('#jcAdminEstruturasRecButtons button[data-value="nao"]');
  await page.click('#jcAdminProgRecButtons button[data-value="nao"]');
  // Fix base
  await page.click('#btnFixarBaseAdmin');

  // 4. Complete Step 2: Pericia Médica
  // Select 'Sim' for Impedimento
  await page.click('#jcImpedimentoButtons button[data-value="sim"]');
  // Select 'Manter' for Corpo (so it stays M)
  await page.click('#jcCorpoKeepButtons button[data-value="sim"]');

  // Now #jcHasAtivMedButtons should be visible
  await expect(page.locator('#jcHasAtivMedButtons')).toBeVisible();

  // Select 'Sim' for Atividades (to expose the text area)
  await page.click('#jcHasAtivMedButtons button[data-value="sim"]');
  // Select 'Simples' mode
  await page.click('#jcAtivModeButtons button[data-value="simples"]');
  // Select 'N' for Atividades Final
  await page.click('#jcAtivMedSimpleButtons button[data-value="0"]');

  // 5. Inject malicious payload
  const maliciousInput = '<img src=x onerror=alert("XSS")>';
  await page.fill('#jcAtivMedJustification', maliciousInput);

  // 6. Verify Trace Log
  const trace = page.locator('#jcTrace');
  await expect(trace).toBeVisible();

  // Check if the payload appears as text
  const content = await trace.textContent();
  expect(content).toContain(maliciousInput);

  // Ensure no image tag was created (XSS check)
  const imgTag = trace.locator('img');
  await expect(imgTag).toHaveCount(0);

  // Verify structure
  const lines = trace.locator('.jc-trace-line');
  await expect(lines).toHaveCount(8);
});
