const { test } = require('node:test');
const assert = require('node:assert');
const { spawn } = require('node:child_process');
const http = require('node:http');
const path = require('node:path');

const SERVER_PATH = path.join(__dirname, '..', 'scripts', 'serve.js');
const PORT = 8082;

function startServer() {
  return new Promise((resolve, reject) => {
    const server = spawn('node', [SERVER_PATH], {
      env: { ...process.env, PORT: PORT },
      stdio: 'pipe'
    });

    let stdout = '';
    const onData = (data) => {
      stdout += data.toString();
      if (stdout.includes('Servidor local:')) {
        server.stdout.removeListener('data', onData);
        resolve(server);
      }
    };
    server.stdout.on('data', onData);

    server.on('error', reject);
  });
}

function makeRequest(path) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: '127.0.0.1',
            port: PORT,
            path: path,
            method: 'GET',
        }, (res) => {
            // Consume data to free up memory
            res.resume();
            resolve(res);
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.end();
    });
}

test('Server Security', async (t) => {
    let server;
    try {
        server = await startServer();
    } catch (e) {
        console.error("Failed to start server", e);
        return;
    }

    await t.test('Server handles malformed URI without crashing', async () => {
        try {
            const res = await makeRequest('/%');
            assert.ok(res.statusCode === 400 || res.statusCode === 403 || res.statusCode === 404, 'Should return an error status code, got ' + res.statusCode);
        } catch (e) {
            if (e.code === 'ECONNRESET' || e.message === 'socket hang up') {
                assert.fail('Server crashed: ' + e.message);
            } else {
                throw e;
            }
        }
    });

    await t.test('Server handles null bytes (%00) without crashing', async () => {
        try {
            const res = await makeRequest('/src/%00');
            assert.ok(res.statusCode === 400 || res.statusCode === 403 || res.statusCode === 404, 'Should return an error status code, got ' + res.statusCode);
        } catch (e) {
            if (e.code === 'ECONNRESET' || e.message === 'socket hang up') {
                assert.fail('Server crashed: ' + e.message);
            } else {
                throw e;
            }
        }
    });

    // Verify server is still running by making a valid request
    await t.test('Server is still alive', async () => {
         try {
            const res = await makeRequest('/index.html');
            assert.strictEqual(res.statusCode, 200);
        } catch (e) {
             assert.fail('Server is not reachable: ' + e.message);
        }
    });

    server.kill();
});
