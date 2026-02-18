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

function occurrences(text, snippet) {
  return (text.match(new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
}

test('Trace and minuta avoid redundant non-applicable wording', async ({ page }) => {
  const rootDir = process.cwd();
  const { server, url } = await startStaticServer(rootDir);

  try {
    await page.goto(`${url}/index.html`);
    await page.click('button[data-mode="controle"]');

    await page.click('#jcAdminAmbButtons button[data-value="2"]');
    await page.click('#jcAdminAtivButtons button[data-value="2"]');
    await page.click('#jcAdminCorpoButtons button[data-value="2"]');
    await page.click('#jcAdminEstruturasRecButtons button[data-value="nao"]');
    await page.click('#jcAdminProgRecButtons button[data-value="nao"]');
    await page.click('#btnFixarBaseAdmin');

    await page.click('#jcImpedimentoButtons button[data-value="nao"]');
    await page.click('#jcCorpoKeepButtons button[data-value="sim"]');

    const trace = page.locator('#jcTrace');
    await expect(trace).toBeVisible();

    const traceContent = await trace.textContent();
    expect(traceContent).not.toContain('não aplicável. Pergunta não aplicável');
    expect(traceContent).not.toContain('Pergunta não aplicável:');
    expect(occurrences(traceContent, 'mesmo motivo-base da linha de reclassificação')).toBeGreaterThanOrEqual(2);

    await page.click('#btnGerarControleTexto');
    const minuta = await page.inputValue('#textoControleJudicial');
    expect(occurrences(minuta, 'não reconheceu impedimento de longo prazo')).toBe(1);
    expect(minuta).toContain('Ausente o impedimento de longo prazo');
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
