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

test('Portaria prioritizes PDF links and keeps in-app text as secondary', async ({ page }) => {
  const rootDir = process.cwd();
  const { server, url } = await startStaticServer(rootDir);

  try {
    await page.goto(`${url}/index.html`);

    await expect(page.locator('#headerPortariaPdfLink')).toHaveAttribute('href', 'docs/normas/portaria-conjunta-2-2015.pdf');
    await expect(page.locator('#headerPortariaPdfLink')).toHaveAttribute('title', /nova aba/i);
    await expect(page.locator('#footerPortariaPdfLink')).toHaveAttribute('href', 'docs/normas/portaria-conjunta-2-2015.pdf');
    await expect(page.locator('#footerPortariaPdfLink')).toHaveAttribute('title', /nova aba/i);

    await page.click('#openPortariaTextBtn');
    await expect(page.locator('#portariaModal')).toBeVisible();
    await expect(page.locator('#portariaStatus')).toContainText('Texto da Portaria carregado.');
    await expect(page.locator('#portariaContent')).toContainText('PORTARIA CONJUNTA MDS/INSS');
    await expect(page.locator('#portariaPdfLink')).toHaveAttribute('href', 'docs/normas/portaria-conjunta-2-2015.pdf');

    await page.keyboard.press('Escape');
    await expect(page.locator('#portariaModal')).toBeHidden();
    await expect.poll(async () => (
      page.evaluate(() => document.activeElement && document.activeElement.id)
    )).toBe('openPortariaTextBtn');
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
