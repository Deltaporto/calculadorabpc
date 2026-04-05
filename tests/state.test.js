const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const statePath = path.join(__dirname, '../src/js/state.js');
const stateContent = fs.readFileSync(statePath, 'utf8');

// Helper function extracted from existing tests to maintain consistency
// with the project's testing strategy for ES Modules in a CommonJS test environment.
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

function buildFunction(name) {
  const extracted = extractExportedFunction(name);
  return new Function(extracted.params, extracted.body);
}

const createDomainState = buildFunction('createDomainState');

test('createDomainState - basic conversion', () => {
    const domains = [
        { id: 'dom1' },
        { id: 'dom2' },
        { id: 'dom3' }
    ];
    const result = createDomainState(domains);

    assert.deepStrictEqual(result, {
        dom1: 0,
        dom2: 0,
        dom3: 0
    });
});

test('createDomainState - empty array', () => {
    const result = createDomainState([]);
    assert.deepStrictEqual(result, {});
});

test('createDomainState - missing ids', () => {
    const domains = [
        { id: 'dom1' },
        { otherProp: 'value' },
        { id: 'dom3' }
    ];
    const result = createDomainState(domains);

    assert.deepStrictEqual(result, {
        dom1: 0,
        undefined: 0,
        dom3: 0
    });
});
