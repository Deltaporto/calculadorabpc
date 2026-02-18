const http = require('http');
const fs = require('fs');
const path = require('path');

const host = '127.0.0.1';
const port = Number(process.env.PORT) || 8000;
const root = process.cwd();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.pdf': 'application/pdf',
  '.md': 'text/markdown; charset=utf-8',
  '.map': 'application/json; charset=utf-8'
};

function resolvePath(urlPathname) {
  const decoded = decodeURIComponent(urlPathname.split('?')[0]);
  const normalized = path.normalize(decoded).replace(/^([.][.][/\\])+/, '');
  const relative = normalized === '/' ? '/index.html' : normalized;
  const filePath = path.join(root, relative);
  if (!filePath.startsWith(root)) return null;
  return filePath;
}

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, {
    'Content-Type': type,
    'Cache-Control': 'no-store'
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  if ((req.url || '').split('?')[0] === '/favicon.ico') {
    res.writeHead(204, { 'Cache-Control': 'no-store' });
    res.end();
    return;
  }

  const filePath = resolvePath(req.url || '/');
  if (!filePath) {
    send(res, 403, 'Forbidden');
    return;
  }

  fs.stat(filePath, (statErr, stat) => {
    if (statErr) {
      send(res, 404, 'Not Found');
      return;
    }

    const finalPath = stat.isDirectory() ? path.join(filePath, 'index.html') : filePath;
    fs.readFile(finalPath, (readErr, data) => {
      if (readErr) {
        send(res, 404, 'Not Found');
        return;
      }

      const ext = path.extname(finalPath).toLowerCase();
      const type = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': type,
        'Cache-Control': 'no-store'
      });
      res.end(data);
    });
  });
});

server.listen(port, host, () => {
  console.log(`Servidor local: http://${host}:${port}/index.html`);
});

process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
