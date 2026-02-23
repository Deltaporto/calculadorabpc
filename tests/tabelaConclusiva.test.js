const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const calculationsPath = path.join(__dirname, '../src/js/calculations.js');
const calculationsContent = fs.readFileSync(calculationsPath, 'utf8');

// Helper functions extracted from existing tests (e.g. calculations.test.js) to maintain consistency
// with the project's testing strategy for ES Modules in a CommonJS test environment.
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

const tabelaConclusiva = buildFunction('tabelaConclusiva');

// Define expected logic (Oracle)
function expectedLogic(amb, ativ, corpo) {
  // Regra 1: Corpo N/L (0 ou 1) indefere
  if (corpo <= 1) return false;
  // Regra 2: Atividades N/L (0 ou 1) indefere
  if (ativ <= 1) return false;
  // Regra 3: Corpo G/C (3 ou 4) defere (assumindo regra 2 ok)
  if (corpo >= 3) return true;
  // Regra 4: Atividades G/C (3 ou 4) defere (assumindo regra 1 ok)
  if (ativ >= 3) return true;
  // Regra 5: Empate (Corpo 2 e Ativ 2) -> Fatores Ambientais desempatam (G/C defere)
  return amb >= 3;
}

test('tabelaConclusiva - Regras de Indeferimento (Corpo/Ativ <= 1)', () => {
  // Corpo 0/1 indefere independente de outros fatores
  assert.strictEqual(tabelaConclusiva(4, 4, 0), false, 'Corpo 0 (N) deve indeferir');
  assert.strictEqual(tabelaConclusiva(4, 4, 1), false, 'Corpo 1 (L) deve indeferir');

  // Atividades 0/1 indefere independente de outros fatores (exceto se corpo já indeferiu, mas regra é igual)
  assert.strictEqual(tabelaConclusiva(4, 0, 4), false, 'Ativ 0 (N) deve indeferir');
  assert.strictEqual(tabelaConclusiva(4, 1, 4), false, 'Ativ 1 (L) deve indeferir');
});

test('tabelaConclusiva - Regras de Deferimento Direto (Corpo/Ativ >= 3)', () => {
  // Corpo >= 3 defere (se ativ > 1)
  assert.strictEqual(tabelaConclusiva(0, 2, 3), true, 'Corpo 3 (G) com Ativ 2 deve deferir');
  assert.strictEqual(tabelaConclusiva(0, 2, 4), true, 'Corpo 4 (C) com Ativ 2 deve deferir');

  // Ativ >= 3 defere (se corpo > 1)
  assert.strictEqual(tabelaConclusiva(0, 3, 2), true, 'Ativ 3 (G) com Corpo 2 deve deferir');
  assert.strictEqual(tabelaConclusiva(0, 4, 2), true, 'Ativ 4 (C) com Corpo 2 deve deferir');
});

test('tabelaConclusiva - Regra de Desempate (Corpo 2, Ativ 2)', () => {
  // Amb < 3 -> Indefere
  assert.strictEqual(tabelaConclusiva(0, 2, 2), false, 'M-M com Amb 0 (N) deve indeferir');
  assert.strictEqual(tabelaConclusiva(1, 2, 2), false, 'M-M com Amb 1 (L) deve indeferir');
  assert.strictEqual(tabelaConclusiva(2, 2, 2), false, 'M-M com Amb 2 (M) deve indeferir');

  // Amb >= 3 -> Defere
  assert.strictEqual(tabelaConclusiva(3, 2, 2), true, 'M-M com Amb 3 (G) deve deferir');
  assert.strictEqual(tabelaConclusiva(4, 2, 2), true, 'M-M com Amb 4 (C) deve deferir');
});

test('tabelaConclusiva - Tabela Verdade Completa (125 combinações)', () => {
  let testedCount = 0;
  for (let amb = 0; amb <= 4; amb++) {
    for (let ativ = 0; ativ <= 4; ativ++) {
      for (let corpo = 0; corpo <= 4; corpo++) {
        const result = tabelaConclusiva(amb, ativ, corpo);
        const expected = expectedLogic(amb, ativ, corpo);
        assert.strictEqual(
          result,
          expected,
          `Falha na combinação: Amb=${amb}, Ativ=${ativ}, Corpo=${corpo}. Obtido: ${result}, Esperado: ${expected}`
        );
        testedCount++;
      }
    }
  }
  assert.strictEqual(testedCount, 125, 'Todas as 125 combinações devem ser testadas');
});
