const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// Extract pctToQ from index.html
const htmlPath = path.join(__dirname, '../index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Match the function specifically
const pctToQMatch = htmlContent.match(/function\s+pctToQ\s*\(\s*pct\s*\)\s*\{([\s\S]*?)\}/);

if (!pctToQMatch) {
    console.error('Could not find pctToQ function in index.html');
    process.exit(1);
}

const pctToQ = new Function('pct', pctToQMatch[1]);

test('pctToQ - Boundary values', () => {
    // Range 0: 0-4
    assert.strictEqual(pctToQ(0), 0, '0 should be 0');
    assert.strictEqual(pctToQ(4), 0, '4 should be 0');

    // Range 1: 5-24
    assert.strictEqual(pctToQ(4.1), 1, '4.1 should be 1');
    assert.strictEqual(pctToQ(24), 1, '24 should be 1');

    // Range 2: 25-49
    assert.strictEqual(pctToQ(24.1), 2, '24.1 should be 2');
    assert.strictEqual(pctToQ(49), 2, '49 should be 2');

    // Range 3: 50-95
    assert.strictEqual(pctToQ(49.1), 3, '49.1 should be 3');
    assert.strictEqual(pctToQ(95), 3, '95 should be 3');

    // Range 4: 96-100+
    assert.strictEqual(pctToQ(95.1), 4, '95.1 should be 4');
    assert.strictEqual(pctToQ(100), 4, '100 should be 4');
});

test('pctToQ - Edge cases', () => {
    assert.strictEqual(pctToQ(-10), 0, 'Negative values should be treated as 0');
    assert.strictEqual(pctToQ(110), 4, 'Values over 100 should return 4');
});

test('pctToQ - Intermediate values', () => {
    assert.strictEqual(pctToQ(10), 1, '10 should be 1');
    assert.strictEqual(pctToQ(30), 2, '30 should be 2');
    assert.strictEqual(pctToQ(60), 3, '60 should be 3');
});
