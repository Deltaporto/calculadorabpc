const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const calculationsPath = path.join(__dirname, '../src/js/calculations.js');
const calculationsContent = fs.readFileSync(calculationsPath, 'utf8');

const MULTIPLIER_ATIVIDADES = 100 / 36;

function extractExportedFunction(name) {
  const marker = `export function ${name}`;
  const start = calculationsContent.indexOf(marker);
  if (start === -1) {
    throw new Error(`Function ${name} not found in calculations.js`);
  }

  const paramsStart = calculationsContent.indexOf('(', start);
  let paramsEnd = paramsStart;
  let depth = 0;
  while (paramsEnd < calculationsContent.length) {
    const ch = calculationsContent[paramsEnd];
    if (ch === '(') depth += 1;
    if (ch === ')') {
      depth -= 1;
      if (depth === 0) break;
    }
    paramsEnd += 1;
  }

  const bodyStart = calculationsContent.indexOf('{', paramsEnd);
  let bodyEnd = bodyStart;
  let braces = 0;
  while (bodyEnd < calculationsContent.length) {
    const ch = calculationsContent[bodyEnd];
    if (ch === '{') braces += 1;
    if (ch === '}') {
      braces -= 1;
      if (braces === 0) break;
    }
    bodyEnd += 1;
  }

  return {
    params: calculationsContent.slice(paramsStart + 1, paramsEnd),
    body: calculationsContent.slice(bodyStart + 1, bodyEnd)
  };
}

function buildFunction(name, deps = {}) {
  const extracted = extractExportedFunction(name);
  const depNames = Object.keys(deps);
  const depValues = Object.values(deps);
  const factory = new Function(...depNames, `return function(${extracted.params}) {${extracted.body}};`);
  return factory(...depValues);
}

function expectedQualifier(pct) {
  const normalized = Math.max(0, pct);
  if (normalized < 5) return 0;
  if (normalized < 25) return 1;
  if (normalized < 50) return 2;
  if (normalized < 96) return 3;
  return 4;
}

function buildDomains(prefix, count) {
  return Array.from({ length: count }, (_, i) => ({ id: `${prefix}${i + 1}` }));
}

function distributeSumAcrossDomains(sum, ids) {
  const state = Object.fromEntries(ids.map(id => [id, 0]));
  let remaining = sum;
  for (const id of ids) {
    const value = Math.min(4, remaining);
    state[id] = value;
    remaining -= value;
    if (remaining <= 0) break;
  }
  return state;
}

const pctToQ = buildFunction('pctToQ');
const calculateScore = buildFunction('calculateScore');
const calcAmbienteFromState = buildFunction('calcAmbienteFromState', { pctToQ, calculateScore });
const calcAtividadesFromState = buildFunction('calcAtividadesFromState', { pctToQ, calculateScore, MULTIPLIER_ATIVIDADES });
const calcCorpoFromState = buildFunction('calcCorpoFromState');
const computeAtivFromDomains = buildFunction('computeAtivFromDomains', { pctToQ, MULTIPLIER_ATIVIDADES });

test('pctToQ follows Portaria bands (0-4, 5-24, 25-49, 50-95, 96-100)', () => {
  const cases = [
    [0, 0], [4, 0], [4.9, 0],
    [5, 1], [24, 1], [24.9, 1],
    [25, 2], [49, 2], [49.9, 2],
    [50, 3], [95, 3], [95.9, 3],
    [96, 4], [100, 4]
  ];

  cases.forEach(([pct, expected]) => {
    assert.strictEqual(pctToQ(pct), expected, `pctToQ(${pct}) should be ${expected}`);
  });

  for (let p = 0; p <= 1000; p++) {
    const pct = p / 10;
    assert.strictEqual(
      pctToQ(pct),
      expectedQualifier(pct),
      `Unexpected qualifier at pct=${pct}`
    );
  }
});

test('calcAmbienteFromState follows formula [(e1+...+e5) * 5] - 0.1', () => {
  const domains = buildDomains('e', 5);

  const zero = calcAmbienteFromState({ e1: 0, e2: 0, e3: 0, e4: 0, e5: 0 }, domains, pctToQ);
  assert.deepStrictEqual(zero, { sum: 0, pct: 0, q: 0 });

  const medium = calcAmbienteFromState({ e1: 2, e2: 2, e3: 2, e4: 2, e5: 2 }, domains, pctToQ);
  assert.deepStrictEqual(medium, { sum: 10, pct: 49.9, q: 2 });

  const max = calcAmbienteFromState({ e1: 4, e2: 4, e3: 4, e4: 4, e5: 4 }, domains, pctToQ);
  assert.deepStrictEqual(max, { sum: 20, pct: 99.9, q: 4 });
});

test('calcAtividadesFromState follows formula [(d1+...+d9) * 2.777...] - 0.1', () => {
  const domains = buildDomains('d', 9);

  const zeroState = Object.fromEntries(domains.map(d => [d.id, 0]));
  const zero = calcAtividadesFromState(zeroState, domains, pctToQ);
  assert.deepStrictEqual(zero, { sum: 0, pct: 0, q: 0 });

  const sum18State = distributeSumAcrossDomains(18, domains.map(d => d.id));
  const medium = calcAtividadesFromState(sum18State, domains, pctToQ);
  assert.strictEqual(medium.sum, 18);
  assert.strictEqual(medium.pct, 49.9);
  assert.strictEqual(medium.q, 2);

  const maxState = Object.fromEntries(domains.map(d => [d.id, 4]));
  const max = calcAtividadesFromState(maxState, domains, pctToQ);
  assert.deepStrictEqual(max, { sum: 36, pct: 99.9, q: 4 });
});

test('computeAtivFromDomains keeps formula and category boundaries', () => {
  const ids = buildDomains('d', 9).map(d => d.id);
  const sumsToValidate = [0, 2, 9, 10, 18, 19, 35, 36];

  sumsToValidate.forEach(sum => {
    const domains = distributeSumAcrossDomains(sum, ids);
    const result = computeAtivFromDomains(domains, ids, pctToQ);
    const pctRaw = Math.max(0, (sum * MULTIPLIER_ATIVIDADES) - 0.1);
    const expected = {
      sum,
      pct: +pctRaw.toFixed(1),
      q: expectedQualifier(pctRaw)
    };
    assert.deepStrictEqual(result, expected, `Mismatch for sum=${sum}`);
  });
});

test('calcCorpoFromState keeps max rule and non-cumulative +1 majoration', () => {
  const domains = buildDomains('b', 8);
  const baseState = { b1: 1, b2: 2, b3: 2, b4: 0, b5: 1, b6: 2, b7: 1, b8: 0 };
  const alreadyHighState = { b1: 3, b2: 2, b3: 1, b4: 0, b5: 1, b6: 2, b7: 0, b8: 1 };
  const capState = { b1: 4, b2: 3, b3: 2, b4: 1, b5: 4, b6: 2, b7: 1, b8: 0 };

  const noMajoration = calcCorpoFromState(baseState, domains, { progDesfav: false, estrMaior: false });
  assert.deepStrictEqual(noMajoration, { max: 2, final: 2, majorado: false, q: 2 });

  const singleMajoration = calcCorpoFromState(baseState, domains, { progDesfav: true, estrMaior: false });
  assert.deepStrictEqual(singleMajoration, { max: 2, final: 3, majorado: true, q: 3 });

  const nonCumulativeMajoration = calcCorpoFromState(baseState, domains, { progDesfav: true, estrMaior: true });
  assert.deepStrictEqual(nonCumulativeMajoration, { max: 2, final: 3, majorado: true, q: 3 });

  const raisedToCap = calcCorpoFromState(alreadyHighState, domains, { progDesfav: true, estrMaior: true });
  assert.deepStrictEqual(raisedToCap, { max: 3, final: 4, majorado: true, q: 4 });

  const capped = calcCorpoFromState(capState, domains, { progDesfav: true, estrMaior: true });
  assert.deepStrictEqual(capped, { max: 4, final: 4, majorado: false, q: 4 });
});
