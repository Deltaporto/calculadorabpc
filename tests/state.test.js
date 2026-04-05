const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const statePath = path.join(__dirname, '../src/js/state.js');
const stateContent = fs.readFileSync(statePath, 'utf8');

function extractExportedFunction(name) {
  const marker = `export function ${name}`;
  const start = stateContent.indexOf(marker);
  if (start === -1) {
    throw new Error(`Function ${name} not found in state.js`);
  }

  const paramsStart = stateContent.indexOf('(', start);
  let paramsEnd = paramsStart;
  let depth = 0;
  while (paramsEnd < stateContent.length) {
    const ch = stateContent[paramsEnd];
    if (ch === '(') depth += 1;
    if (ch === ')') {
      depth -= 1;
      if (depth === 0) break;
    }
    paramsEnd += 1;
  }

  const bodyStart = stateContent.indexOf('{', paramsEnd);
  let bodyEnd = bodyStart;
  let braces = 0;
  while (bodyEnd < stateContent.length) {
    const ch = stateContent[bodyEnd];
    if (ch === '{') braces += 1;
    if (ch === '}') {
      braces -= 1;
      if (braces === 0) break;
    }
    bodyEnd += 1;
  }

  return {
    params: stateContent.slice(paramsStart + 1, paramsEnd),
    body: stateContent.slice(bodyStart + 1, bodyEnd)
  };
}

function buildFunction(name, deps = {}) {
  const extracted = extractExportedFunction(name);
  const depNames = Object.keys(deps);
  const depValues = Object.values(deps);
  const factory = new Function(...depNames, `return function(${extracted.params}) {${extracted.body}};`);
  return factory(...depValues);
}

const createEmptyDomains = buildFunction('createEmptyDomains');

test('createEmptyDomains - empty array', () => {
  const result = createEmptyDomains([]);
  assert.deepStrictEqual(result, {});
});

test('createEmptyDomains - single domain', () => {
  const result = createEmptyDomains(['e1']);
  assert.deepStrictEqual(result, { e1: null });
});

test('createEmptyDomains - multiple domains', () => {
  const result = createEmptyDomains(['e1', 'd2', 'b3']);
  assert.deepStrictEqual(result, { e1: null, d2: null, b3: null });
});

test('createEmptyDomains - duplicate domains', () => {
  const result = createEmptyDomains(['e1', 'e1', 'b3']);
  // Keys should just overwrite, so e1 appears once.
  assert.deepStrictEqual(result, { e1: null, b3: null });
});

test('createEmptyDomains - handles numeric strings as keys', () => {
  const result = createEmptyDomains(['1', '2']);
  assert.deepStrictEqual(result, { '1': null, '2': null });
});
