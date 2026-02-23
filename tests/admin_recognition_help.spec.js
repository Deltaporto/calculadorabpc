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
  if (filePath.endsWith('.txt')) return 'text/plain; charset=utf-8';
  if (filePath.endsWith('.pdf')) return 'application/pdf';
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

test('Admin recognition help explains estruturas do corpo and prognóstico with examples and legal anchors', async ({ page }) => {
  const rootDir = process.cwd();
  const { server, url } = await startStaticServer(rootDir);

  try {
    await page.goto(`${url}/index.html`);
    await page.click('button[data-mode="controle"]');

    const details = page.locator('.jc-help-details');
    await details.locator('summary').click();

    const estruturasItem = page.locator('.jc-help-item').filter({ hasText: 'Estruturas do corpo mais limitantes que Funções do Corpo' });
    await expect(estruturasItem).toContainText('Exemplos de alterações em Estruturas do Corpo');
    await expect(estruturasItem).toContainText('amputação');
    await expect(estruturasItem).toContainText('art. 7º, I');
    await expect(estruturasItem).toContainText('linhas 2848-2853');

    const prognosticoItem = page.locator('.jc-help-item').filter({ hasText: 'Prognóstico desfavorável' });
    await expect(prognosticoItem).toContainText('Exemplos de prognóstico desfavorável');
    await expect(prognosticoItem).toContainText('doença progressiva/degenerativa');
    await expect(prognosticoItem).toContainText('sem cumular');
    await expect(prognosticoItem).toContainText('art. 7º, II');
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
