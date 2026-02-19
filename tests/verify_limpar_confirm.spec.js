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

test('Verify Limpar Confirmation Dialogs', async ({ page }) => {
  const rootDir = process.cwd();
  const { server, url } = await startStaticServer(rootDir);

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

  try {
    await page.goto(`${url}/index.html`);

    // 1. Calculator Limpar
    await page.click('button[data-mode="simulador"]');
    await page.click('#domAmb button[data-value="2"]'); // Set Ambient E1 to 2

    // Check if data is set
    await expect(page.locator('#domAmb button[data-value="2"]').first()).toHaveClass(/active/);

    console.log('Clicking Limpar...');

    let dialogMessage = '';
    const dialogReceived = new Promise(resolve => {
        page.once('dialog', async dialog => {
            dialogMessage = dialog.message();
            console.log('Dialog appeared:', dialogMessage);
            await dialog.accept();
            resolve();
        });
    });

    await page.click('#btnLimpar');
    await dialogReceived;

    if (dialogMessage.includes('limpar')) {
        console.log('SUCCESS: Calculator dialog appeared');
    } else {
        console.log('FAILURE: No Calculator dialog');
    }

    // 2. Judicial Control Limpar (btnLimparControleJudicial)
    await page.click('button[data-mode="controle"]');
    // Fix base
    await page.click('#jcAdminAmbButtons button[data-value="0"]');
    await page.click('#jcAdminAtivButtons button[data-value="0"]');
    await page.click('#jcAdminCorpoButtons button[data-value="0"]');
    await page.click('#jcAdminEstruturasRecButtons button[data-value="nao"]');
    await page.click('#jcAdminProgRecButtons button[data-value="nao"]');
    await page.click('#btnFixarBaseAdmin');

    console.log('Clicking Limpar Judicial...');

    let jcDialogMessage = '';
    const jcDialogReceived = new Promise(resolve => {
        page.once('dialog', async dialog => {
            jcDialogMessage = dialog.message();
            console.log('JC Dialog appeared:', jcDialogMessage);
            await dialog.accept();
            resolve();
        });
    });

    await page.click('#btnLimparControleJudicial');
    await jcDialogReceived;

    if (jcDialogMessage.includes('limpar')) {
        console.log('SUCCESS: JC dialog appeared');
    } else {
        console.log('FAILURE: No JC dialog');
    }

  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
