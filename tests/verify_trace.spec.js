import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import http from 'node:http';
import path from 'path';

function getContentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
  return 'application/octet-stream';
}

async function startStaticServer(rootDir) {
  const server = http.createServer((req, res) => {
    const reqPath = (req.url || '/').split('?')[0];
    const relativePath = reqPath === '/' ? '/index.html' : reqPath;
    const safePath = path.normalize(relativePath).replace(/^(\.\.[/\\])+/, '');
    const absolutePath = path.join(rootDir, safePath);

    if (!absolutePath.startsWith(rootDir)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    if (!fs.existsSync(absolutePath) || fs.statSync(absolutePath).isDirectory()) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }

    const file = fs.readFileSync(absolutePath);
    res.writeHead(200, { 'Content-Type': getContentType(absolutePath) });
    res.end(file);
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();
  return {
    server,
    url: `http://127.0.0.1:${address.port}`
  };
}

test('Security Verification: Trace Log XSS and Structure', async ({ page }) => {
  const rootDir = process.cwd();
  const { server, url } = await startStaticServer(rootDir);
  try {
    // 1. Open the page
    await page.goto(`${url}/index.html`);

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
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
