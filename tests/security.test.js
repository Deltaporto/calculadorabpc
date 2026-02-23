const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const securityPath = path.join(__dirname, '../src/js/security.js');
const securityContent = fs.readFileSync(securityPath, 'utf8');

function extractExportedFunction(name) {
  const marker = `export function ${name}`;
  const start = securityContent.indexOf(marker);
  if (start === -1) {
    throw new Error(`Function ${name} not found in security.js`);
  }

  const paramsStart = securityContent.indexOf('(', start);
  let paramsEnd = paramsStart;
  let depth = 0;
  while (paramsEnd < securityContent.length) {
    const ch = securityContent[paramsEnd];
    if (ch === '(') depth += 1;
    if (ch === ')') {
      depth -= 1;
      if (depth === 0) break;
    }
    paramsEnd += 1;
  }

  const bodyStart = securityContent.indexOf('{', paramsEnd);
  let bodyEnd = bodyStart;
  let braces = 0;
  while (bodyEnd < securityContent.length) {
    const ch = securityContent[bodyEnd];
    if (ch === '{') braces += 1;
    if (ch === '}') {
      braces -= 1;
      if (braces === 0) break;
    }
    bodyEnd += 1;
  }

  return {
    params: securityContent.slice(paramsStart + 1, paramsEnd),
    body: securityContent.slice(bodyStart + 1, bodyEnd)
  };
}

function buildFunction(name, deps = {}) {
  const extracted = extractExportedFunction(name);
  const depNames = Object.keys(deps);
  const depValues = Object.values(deps);
  const factory = new Function(...depNames, `return function(${extracted.params}) {${extracted.body}};`);
  return factory(...depValues);
}

const escapeHtml = buildFunction('escapeHtml');

test('escapeHtml - basic security', () => {
  assert.strictEqual(escapeHtml('foo'), 'foo', 'No special chars');
  assert.strictEqual(escapeHtml(''), '', 'Empty string');
  assert.strictEqual(escapeHtml(undefined), '', 'Undefined uses default arg ""');
  assert.strictEqual(escapeHtml(null), 'null', 'Null becomes "null" due to String() conversion');

  // Basic HTML entities
  assert.strictEqual(escapeHtml('<'), '&lt;', '< escaped');
  assert.strictEqual(escapeHtml('>'), '&gt;', '> escaped');
  assert.strictEqual(escapeHtml('&'), '&amp;', '& escaped');
  assert.strictEqual(escapeHtml('"'), '&quot;', '" escaped');
  assert.strictEqual(escapeHtml("'"), '&#39;', "' escaped");

  // Combinations
  assert.strictEqual(escapeHtml('<script>'), '&lt;script&gt;', 'Basic script tag');
  assert.strictEqual(escapeHtml('foo & bar'), 'foo &amp; bar', 'Ampersand in text');
  assert.strictEqual(escapeHtml('"quoted"'), '&quot;quoted&quot;', 'Double quotes');
  assert.strictEqual(escapeHtml("'single'"), '&#39;single&#39;', 'Single quotes');
});

test('escapeHtml - XSS vectors', () => {
  // Common XSS payloads
  assert.strictEqual(escapeHtml('<img src=x onerror=alert(1)>'), '&lt;img src=x onerror=alert(1)&gt;', 'Event handler');
  assert.strictEqual(escapeHtml('javascript:alert(1)'), 'javascript:alert(1)', 'Protocol not escaped (only HTML chars are)');
  assert.strictEqual(escapeHtml('<svg/onload=alert(1)>'), '&lt;svg/onload=alert(1)&gt;', 'SVG onload');
  assert.strictEqual(escapeHtml('"><script>alert(1)</script>'), '&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;', 'Break out of attribute');
});

test('escapeHtml - mixed content', () => {
  const input = `<div>"Hello" & 'World'</div>`;
  const expected = `&lt;div&gt;&quot;Hello&quot; &amp; &#39;World&#39;&lt;/div&gt;`;
  assert.strictEqual(escapeHtml(input), expected);
});
