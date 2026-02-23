const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const calculationsPath = path.join(__dirname, '../src/js/calculations.js');
const calculationsContent = fs.readFileSync(calculationsPath, 'utf8');

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

const pctToQ = buildFunction('pctToQ');
const tabelaConclusiva = buildFunction('tabelaConclusiva');
const calcAmbienteFromState = buildFunction('calcAmbienteFromState', { pctToQ });
const calcAtividadesFromState = buildFunction('calcAtividadesFromState', { pctToQ });
const calcCorpoFromState = buildFunction('calcCorpoFromState');
const computeAtivFromDomains = buildFunction('computeAtivFromDomains', { pctToQ });

test('tabelaConclusiva - regras principais', () => {
  assert.strictEqual(tabelaConclusiva(4, 2, 1), false, 'Corpo N/L sempre indefere');
  assert.strictEqual(tabelaConclusiva(4, 1, 4), false, 'Atividades N/L sempre indefere');
  assert.strictEqual(tabelaConclusiva(0, 2, 3), true, 'Corpo G/C com Atividades >= M defere');
  assert.strictEqual(tabelaConclusiva(0, 3, 2), true, 'Atividades G/C com Corpo >= M defere');
  assert.strictEqual(tabelaConclusiva(2, 2, 2), false, 'M-M com Amb M indefere');
  assert.strictEqual(tabelaConclusiva(3, 2, 2), true, 'M-M com Amb G/C defere');
});

test('calcAmbienteFromState e calcAtividadesFromState - cálculos básicos', () => {
  const ambiente = calcAmbienteFromState({ e1: 2, e2: 1 }, [{ id: 'e1' }, { id: 'e2' }], pctToQ);
  assert.deepStrictEqual(ambiente, { sum: 3, pct: 14.9, q: 1 });

  const atividades = calcAtividadesFromState({ d1: 4, d2: 4 }, [{ id: 'd1' }, { id: 'd2' }], pctToQ);
  assert.deepStrictEqual(atividades, { sum: 8, pct: 22.1, q: 1 });
});

test('calcCorpoFromState - majoração', () => {
  const domains = [{ id: 'b1' }, { id: 'b2' }, { id: 'b3' }];

  const semMajoracao = calcCorpoFromState({ b1: 1, b2: 3, b3: 2 }, domains, { progDesfav: false, estrMaior: false });
  assert.deepStrictEqual(semMajoracao, { max: 3, final: 3, majorado: false, q: 3 });

  const comMajoracao = calcCorpoFromState({ b1: 1, b2: 3, b3: 2 }, domains, { progDesfav: true, estrMaior: false });
  assert.deepStrictEqual(comMajoracao, { max: 3, final: 4, majorado: true, q: 4 });

  const tetoQualificador = calcCorpoFromState({ b1: 4, b2: 2, b3: 1 }, domains, { progDesfav: true, estrMaior: true });
  assert.deepStrictEqual(tetoQualificador, { max: 4, final: 4, majorado: false, q: 4 });
});

test('computeAtivFromDomains - completo e incompleto', () => {
  const ids = ['d1', 'd2', 'd3'];
  assert.strictEqual(computeAtivFromDomains({ d1: 2, d2: 3 }, ids, pctToQ), null, 'Sem todos domínios deve retornar null');

  const computed = computeAtivFromDomains({ d1: 2, d2: 3, d3: 4 }, ids, pctToQ);
  assert.deepStrictEqual(computed, { sum: 9, pct: 24.9, q: 1 });
});
