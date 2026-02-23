const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const calculationsPath = path.join(__dirname, '../src/js/calculations.js');
const mainPath = path.join(__dirname, '../src/js/main.js');
const portariaPath = path.join(__dirname, '../docs/normas/portaria-conjunta-2-2015.txt');

const calculationsContent = fs.readFileSync(calculationsPath, 'utf8');
const mainContent = fs.readFileSync(mainPath, 'utf8');
const portariaContent = fs.readFileSync(portariaPath, 'utf8');

const LETTER_TO_QUALIFIER = { N: 0, L: 1, M: 2, G: 3, C: 4 };
const QUALIFIER_TO_LETTER = ['N', 'L', 'M', 'G', 'C'];

function extractFunction(source, markers, debugName) {
  let start = -1;
  for (const marker of markers) {
    start = source.indexOf(marker);
    if (start !== -1) break;
  }

  if (start === -1) {
    throw new Error(`Function ${debugName} not found`);
  }

  const paramsStart = source.indexOf('(', start);
  let paramsEnd = paramsStart;
  let depth = 0;
  while (paramsEnd < source.length) {
    const ch = source[paramsEnd];
    if (ch === '(') depth += 1;
    if (ch === ')') {
      depth -= 1;
      if (depth === 0) break;
    }
    paramsEnd += 1;
  }

  const bodyStart = source.indexOf('{', paramsEnd);
  let bodyEnd = bodyStart;
  let braces = 0;
  while (bodyEnd < source.length) {
    const ch = source[bodyEnd];
    if (ch === '{') braces += 1;
    if (ch === '}') {
      braces -= 1;
      if (braces === 0) break;
    }
    bodyEnd += 1;
  }

  return {
    params: source.slice(paramsStart + 1, paramsEnd),
    body: source.slice(bodyStart + 1, bodyEnd)
  };
}

function buildFunction(source, name) {
  const extracted = extractFunction(source, [`export function ${name}`, `function ${name}`], name);
  return new Function(`return function(${extracted.params}) {${extracted.body}};`)();
}

function parseAnexoIVRows(content) {
  const rows = [];
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const match = line.match(/^\s*(\d+)\.\s*([NLMGC])\s+([NLMGC])\s+([NLMGC])\s+(Sim|Não|Nao)\s*$/i);
    if (!match) continue;

    const item = Number(match[1]);
    const ambLetter = match[2].toUpperCase();
    const ativLetter = match[3].toUpperCase();
    const corpoLetter = match[4].toUpperCase();
    const result = match[5].toLowerCase();

    rows.push({
      item,
      amb: LETTER_TO_QUALIFIER[ambLetter],
      ativ: LETTER_TO_QUALIFIER[ativLetter],
      corpo: LETTER_TO_QUALIFIER[corpoLetter],
      yes: result === 'sim'
    });
  }

  return rows.sort((a, b) => a.item - b.item);
}

const tabelaConclusiva = buildFunction(calculationsContent, 'tabelaConclusiva');
const getItemNumber = buildFunction(mainContent, 'getItemNumber');
const anexoIVRows = parseAnexoIVRows(portariaContent);

test('Anexo IV parser reads all 125 normative rows', () => {
  assert.strictEqual(anexoIVRows.length, 125, 'Anexo IV should contain 125 rows');
  assert.strictEqual(anexoIVRows[0].item, 1, 'First item should be 1');
  assert.strictEqual(anexoIVRows[124].item, 125, 'Last item should be 125');

  anexoIVRows.forEach((row, index) => {
    assert.strictEqual(
      row.item,
      index + 1,
      `Row numbering gap around item ${row.item}`
    );
  });
});

test('tabelaConclusiva matches every Sim/Não decision from Anexo IV', () => {
  anexoIVRows.forEach(row => {
    const computed = tabelaConclusiva(row.amb, row.ativ, row.corpo);
    assert.strictEqual(
      computed,
      row.yes,
      `Mismatch at item ${row.item}: e=${QUALIFIER_TO_LETTER[row.amb]}, d=${QUALIFIER_TO_LETTER[row.ativ]}, b=${QUALIFIER_TO_LETTER[row.corpo]}`
    );
  });
});

test('getItemNumber matches Anexo IV row numbering', () => {
  anexoIVRows.forEach(row => {
    const item = getItemNumber(row.amb, row.ativ, row.corpo);
    assert.strictEqual(
      item,
      row.item,
      `Wrong item mapping for e=${QUALIFIER_TO_LETTER[row.amb]}, d=${QUALIFIER_TO_LETTER[row.ativ]}, b=${QUALIFIER_TO_LETTER[row.corpo]}`
    );
  });
});
