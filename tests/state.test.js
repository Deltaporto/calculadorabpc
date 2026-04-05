const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const sourcePath = path.join(__dirname, '../src/js/state.js');
const sourceContent = fs.readFileSync(sourcePath, 'utf8');

function extractExportedFunction(name) {
  const marker = `export function ${name}`;
  const start = sourceContent.indexOf(marker);
  if (start === -1) {
    throw new Error(`Function ${name} not found in state.js`);
  }

  const paramsStart = sourceContent.indexOf('(', start);
  let paramsEnd = paramsStart;
  let depth = 0;
  while (paramsEnd < sourceContent.length) {
    const ch = sourceContent[paramsEnd];
    if (ch === '(') depth += 1;
    if (ch === ')') {
      depth -= 1;
      if (depth === 0) break;
    }
    paramsEnd += 1;
  }

  const bodyStart = sourceContent.indexOf('{', paramsEnd);
  let bodyEnd = bodyStart;
  let braces = 0;
  while (bodyEnd < sourceContent.length) {
    const ch = sourceContent[bodyEnd];
    if (ch === '{') braces += 1;
    if (ch === '}') {
      braces -= 1;
      if (braces === 0) break;
    }
    bodyEnd += 1;
  }

  return {
    params: sourceContent.slice(paramsStart + 1, paramsEnd),
    body: sourceContent.slice(bodyStart + 1, bodyEnd)
  };
}

function buildFunction(name, deps = {}) {
  const extracted = extractExportedFunction(name);
  const depNames = Object.keys(deps);
  const depValues = Object.values(deps);
  const factory = new Function(...depNames, `return function(${extracted.params}) {${extracted.body}};`);
  return factory(...depValues);
}

const createDomainNameById = buildFunction('createDomainNameById');

// ---------------------------------------------------------------------------
// createDomainNameById
// ---------------------------------------------------------------------------

test('createDomainNameById - returns empty object for empty domains array', () => {
  const domains = [];
  const result = createDomainNameById(domains);
  assert.deepStrictEqual(result, {});
});

test('createDomainNameById - maps single domain correctly', () => {
  const domains = [{ id: 'd1', name: 'Domain 1' }];
  const result = createDomainNameById(domains);
  assert.deepStrictEqual(result, { d1: 'Domain 1' });
});

test('createDomainNameById - maps multiple domains correctly', () => {
  const domains = [
    { id: 'd1', name: 'Domain 1' },
    { id: 'd2', name: 'Domain 2' },
    { id: 'd3', name: 'Domain 3' }
  ];
  const result = createDomainNameById(domains);
  assert.deepStrictEqual(result, {
    d1: 'Domain 1',
    d2: 'Domain 2',
    d3: 'Domain 3'
  });
});

test('createDomainNameById - handles domains with missing name or id fields as undefined', () => {
  const domains = [
    { id: 'd1' },
    { name: 'Domain 2' }
  ];
  const result = createDomainNameById(domains);
  assert.deepStrictEqual(result, {
    d1: undefined,
    undefined: 'Domain 2'
  });
});

test('createDomainNameById - handles mixed domains array', () => {
  const domains = [
    { id: 'd1', name: 'Domain 1', extra: 'ignored' },
    { id: 'd2', name: '' }
  ];
  const result = createDomainNameById(domains);
  assert.deepStrictEqual(result, {
    d1: 'Domain 1',
    d2: ''
  });
});
