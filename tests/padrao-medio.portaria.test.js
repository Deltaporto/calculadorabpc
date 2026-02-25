const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const mainPath = path.join(__dirname, '../src/js/main.js');
const constantsPath = path.join(__dirname, '../src/js/constants.js');
const portaria34Path = path.join(__dirname, '../docs/normas/portaria-mds-inss-34-2025.txt');

const mainContent = fs.readFileSync(mainPath, 'utf8');
const constantsContent = fs.readFileSync(constantsPath, 'utf8');
const portaria34Content = fs.readFileSync(portaria34Path, 'utf8');

const PADRAO_IDS = ['e1', 'e2', 'e3', 'e4', 'e5', 'd6', 'd7', 'd8', 'd9'];

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

function extractExportedArray(name) {
  const regex = new RegExp(`export const ${name} = \\[([\\s\\S]*?)\\];`);
  const match = constantsContent.match(regex);
  if (!match) {
    throw new Error(`Array ${name} not found in constants.js`);
  }
  return new Function(`return [${match[1]}];`)();
}

function extractConfiguredPadrao() {
  const extracted = extractFunction(mainContent, ['function getPadraoApplyContext'], 'getPadraoApplyContext');
  const match = extracted.body.match(/const padrao = (\{[\s\S]*?\});/);
  if (!match) {
    throw new Error('Configured padrao object not found');
  }
  return new Function(`return (${match[1]});`)();
}

function buildMainFunction(name) {
  const extracted = extractFunction(mainContent, [`function ${name}`], name);
  const factory = new Function(`
    return function(ctx, ...args) {
      with (ctx) {
        return (function(${extracted.params}) {${extracted.body}})(...args);
      }
    };
  `);
  return factory();
}

function parsePadraoFromAnexoII(content) {
  const anexoStart = content.indexOf('ANEXO II');
  assert.notStrictEqual(anexoStart, -1, 'ANEXO II section not found in Portaria 34/2025 text');

  const observacoesStart = content.indexOf('OBSERVAÇÕES', anexoStart);
  const section = content.slice(anexoStart, observacoesStart === -1 ? anexoStart + 2600 : observacoesStart);
  const lines = section.split(/\r?\n/);
  const parsed = {};

  PADRAO_IDS.forEach(id => {
    const markerRegex = new RegExp(`\\(${id}(?:\\)|\\s)`);
    const lineIndex = lines.findIndex(line => markerRegex.test(line));
    assert.notStrictEqual(lineIndex, -1, `Domain marker (${id}) not found in Anexo II`);

    const sameLine = lines[lineIndex] || '';
    const prevLine = lines[lineIndex - 1] || '';
    const nextLine = lines[lineIndex + 1] || '';

    const sameMatch = sameLine.match(/([0-4]),0/);
    const prevMatch = prevLine.match(/([0-4]),0/);
    const nextMatch = nextLine.match(/([0-4]),0/);

    const value = sameMatch ? sameMatch[1] : (prevMatch ? prevMatch[1] : (nextMatch ? nextMatch[1] : null));
    assert.notStrictEqual(value, null, `No qualifier found near (${id})`);
    parsed[id] = Number(value);
  });

  return parsed;
}

function createClassList(initial = []) {
  const classes = new Set(initial);
  return {
    add: (...tokens) => tokens.forEach(token => classes.add(token)),
    remove: (...tokens) => tokens.forEach(token => classes.delete(token)),
    toggle: (token, force) => {
      if (typeof force === 'boolean') {
        if (force) classes.add(token);
        else classes.delete(token);
        return force;
      }
      if (classes.has(token)) {
        classes.delete(token);
        return false;
      }
      classes.add(token);
      return true;
    },
    contains: token => classes.has(token)
  };
}

function createButton(value, activeValue) {
  return {
    dataset: { value: String(value) },
    classList: createClassList(value === activeValue ? ['active'] : [])
  };
}

function createDomainDocument(domainIds, initialState) {
  const buttonMap = Object.fromEntries(
    domainIds.map(id => [id, [0, 1, 2, 3, 4].map(v => createButton(v, initialState[id]))])
  );
  return {
    buttonMap,
    document: {
      querySelectorAll(selector) {
        const match = selector.match(/\[data-domain="([^"]+)"\]/);
        if (!match) return [];
        return buttonMap[match[1]] || [];
      }
    }
  };
}

function getActiveValue(buttons) {
  const active = buttons.find(btn => btn.classList.contains('active'));
  return active ? Number(active.dataset.value) : null;
}

const DOM_ATIV_M = extractExportedArray('DOM_ATIV_M');
const DOM_ATIV_S = extractExportedArray('DOM_ATIV_S');
const configuredPadrao = extractConfiguredPadrao();

const runGetPadraoApplyContext = buildMainFunction('getPadraoApplyContext');
const runApplyPadraoEntries = buildMainFunction('applyPadraoEntries');

test('configured padrao values match Portaria 34/2025 Anexo II', () => {
  const normativePadrao = parsePadraoFromAnexoII(portaria34Content);
  assert.deepStrictEqual(configuredPadrao, normativePadrao);
});

test('getPadraoApplyContext excludes child non-eligible domains by age cut', () => {
  const ctx = {
    DOM_ATIV_M,
    DOM_ATIV_S,
    crianca: true,
    idadeMeses: 5,
    userFilledDomains: new Set(['e1', 'd6', 'd8'])
  };

  const context = runGetPadraoApplyContext(ctx);
  assert.deepStrictEqual(context.eligibleEntries.map(([id]) => id), ['e1', 'e2', 'e3', 'e4', 'e5']);
  assert.deepStrictEqual(context.manuallyFilledEligible.map(([id]) => id), ['e1']);
  assert.deepStrictEqual(context.entriesPreserve.map(([id]) => id), ['e2', 'e3', 'e4', 'e5']);
  assert.deepStrictEqual(context.entriesOverwrite.map(([id]) => id), ['e1', 'e2', 'e3', 'e4', 'e5']);
  assert.strictEqual(context.skippedByAgeCut, 4);
});

test('getPadraoApplyContext keeps all mapped domains in adult mode', () => {
  const ctx = {
    DOM_ATIV_M,
    DOM_ATIV_S,
    crianca: false,
    idadeMeses: 192,
    userFilledDomains: new Set(['e1', 'd6', 'd8'])
  };

  const context = runGetPadraoApplyContext(ctx);
  assert.deepStrictEqual(context.eligibleEntries.map(([id]) => id), PADRAO_IDS);
  assert.deepStrictEqual(context.manuallyFilledEligible.map(([id]) => id), ['e1', 'd6', 'd8']);
  assert.deepStrictEqual(context.entriesPreserve.map(([id]) => id), ['e2', 'e3', 'e4', 'e5', 'd7', 'd9']);
  assert.strictEqual(context.entriesOverwrite.length, 9);
  assert.strictEqual(context.skippedByAgeCut, 0);
});

test('applyPadraoEntries updates state, button activation, and triggers one update', () => {
  const state = { e1: 0, d6: 0, d9: 0 };
  const { document, buttonMap } = createDomainDocument(['e1', 'd6', 'd9'], state);
  let updates = 0;

  const ctx = {
    state,
    document,
    update: () => { updates += 1; },
    getDomainButtons: (id) => document.querySelectorAll(`[data-domain="${id}"] .note-btn`)
  };

  runApplyPadraoEntries(ctx, [['e1', 2], ['d6', 3], ['d9', 3]]);

  assert.deepStrictEqual(state, { e1: 2, d6: 3, d9: 3 });
  assert.strictEqual(getActiveValue(buttonMap.e1), 2);
  assert.strictEqual(getActiveValue(buttonMap.d6), 3);
  assert.strictEqual(getActiveValue(buttonMap.d9), 3);
  assert.strictEqual(updates, 1);
});
