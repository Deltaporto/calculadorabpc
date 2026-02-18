import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

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

test('Guidance advances focus to next pending judicial field', async ({ page }) => {
  const rootDir = process.cwd();
  const { server, url } = await startStaticServer(rootDir);

  try {
    await page.goto(`${url}/index.html`);
    await page.click('button[data-mode="controle"]');

    await expect(page.locator('#jcAdminGuidanceText')).toContainText('Faltam');
    await page.click('#jcAdminAmbButtons button[data-value="0"]');
    await expect(page.locator('#jcAdminGuidanceText')).toContainText('Atividades e Participação');

    await page.click('#jcAdminAtivButtons button[data-value="1"]');
    await page.click('#jcAdminCorpoButtons button[data-value="2"]');
    await page.click('#jcAdminEstruturasRecButtons button[data-value="nao"]');
    await page.click('#jcAdminProgRecButtons button[data-value="nao"]');
    await expect(page.locator('#jcAdminGuidanceText')).toContainText('Fixar base administrativa');

    await page.click('#btnFixarBaseAdmin');
    await expect.poll(async () => (
      page.evaluate(() => {
        const active = document.activeElement;
        return !!active && !!active.closest('#jcImpedimentoButtons');
      })
    )).toBe(true);

    await page.click('#jcImpedimentoButtons button[data-value="sim"]');
    await page.click('#jcCorpoKeepButtons button[data-value="sim"]');
    await page.click('#jcHasAtivMedButtons button[data-value="sim"]');
    await page.click('#jcAtivModeButtons button[data-value="simples"]');
    await page.click('#jcAtivMedSimpleButtons button[data-value="0"]');
    await page.fill('#jcAtivMedJustification', 'Justificativa técnica para teste de orientação.');

    await expect.poll(async () => (
      page.evaluate(() => document.activeElement && document.activeElement.id)
    )).toBe('btnGerarControleTexto');
    await expect(page.locator('#jcTextoGuidanceText')).toContainText('Gere a minuta');
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
