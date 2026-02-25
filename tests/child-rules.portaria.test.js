const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const mainPath = path.join(__dirname, '../src/js/main.js');
const constantsPath = path.join(__dirname, '../src/js/constants.js');

const mainContent = fs.readFileSync(mainPath, 'utf8');
const constantsContent = fs.readFileSync(constantsPath, 'utf8');

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
  const attributes = {};
  return {
    dataset: { value: String(value) },
    classList: createClassList(value === activeValue ? ['active'] : []),
    setAttribute(name, nextValue) {
      attributes[name] = String(nextValue);
    },
    getAttribute(name) {
      return attributes[name];
    }
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
const ALL_ATIV = [...DOM_ATIV_M, ...DOM_ATIV_S];
const ALL_ATIV_IDS = ALL_ATIV.map(d => d.id);

const runGetAgeBounds = buildMainFunction('getAgeBounds');
const runValueToMonths = buildMainFunction('valueToMonths');
const runGetAutoQualifiedChildDomains = buildMainFunction('getAutoQualifiedChildDomains');
const runApplyChildRules = buildMainFunction('applyChildRules');

test('activity domain age cuts remain aligned with Portaria thresholds', () => {
  const cutsById = Object.fromEntries(ALL_ATIV.map(d => [d.id, d.cut]));
  assert.deepStrictEqual(cutsById, {
    d1: 6, d2: 6, d3: 12, d4: 6, d5: 36,
    d6: 84, d7: 12, d8: 6, d9: 36
  });
});

test('age helpers keep unit bounds and conversion consistent', () => {
  assert.deepStrictEqual(runGetAgeBounds({}, 'anos'), { min: 0, max: 15 });
  assert.deepStrictEqual(runGetAgeBounds({}, 'meses'), { min: 0, max: 191 });

  assert.strictEqual(runValueToMonths({}, 0, 'anos'), 0);
  assert.strictEqual(runValueToMonths({}, 15, 'anos'), 180);
  assert.strictEqual(runValueToMonths({}, 191, 'meses'), 191);
});

test('getAutoQualifiedChildDomains respects child mode and cut boundaries', () => {
  const baseCtx = { DOM_ATIV_M, DOM_ATIV_S };

  const notChild = runGetAutoQualifiedChildDomains({ ...baseCtx, crianca: false, idadeMeses: 5 });
  assert.deepStrictEqual(notChild, []);

  const at5Months = runGetAutoQualifiedChildDomains({ ...baseCtx, crianca: true, idadeMeses: 5 });
  assert.deepStrictEqual(at5Months.map(d => d.id), ALL_ATIV_IDS);

  const at6Months = runGetAutoQualifiedChildDomains({ ...baseCtx, crianca: true, idadeMeses: 6 });
  assert.deepStrictEqual(at6Months.map(d => d.id), ['d3', 'd5', 'd6', 'd7', 'd9']);

  const at191Months = runGetAutoQualifiedChildDomains({ ...baseCtx, crianca: true, idadeMeses: 191 });
  assert.deepStrictEqual(at191Months, []);
});

test('applyChildRules forces q4 with lock and restores backed-up values on unlock', () => {
  const originalState = {
    d1: 2, d2: 1, d3: 0, d4: 4, d5: 3,
    d6: 2, d7: 1, d8: 0, d9: 3
  };
  const state = { ...originalState };
  const childDomainBackup = {};
  const { document, buttonMap } = createDomainDocument(ALL_ATIV_IDS, originalState);
  let summaryCalls = 0;

  const ctx = {
    DOM_ATIV_M,
    DOM_ATIV_S,
    document,
    crianca: true,
    idadeMeses: 5,
    state,
    childDomainBackup,
    updateChildAutoSummary: () => { summaryCalls += 1; },
    getDomainButtons: (id) => document.querySelectorAll(`[data-domain="${id}"] .note-btn`)
  };

  runApplyChildRules(ctx);

  ALL_ATIV_IDS.forEach(id => {
    assert.strictEqual(state[id], 4, `Domain ${id} should be forced to q4`);
    assert.strictEqual(childDomainBackup[id], originalState[id], `Domain ${id} should backup original value`);
    assert.strictEqual(getActiveValue(buttonMap[id]), 4, `Domain ${id} active button should be q4`);
    assert.ok(buttonMap[id].every(btn => btn.classList.contains('locked')), `Domain ${id} should be locked`);
  });
  assert.strictEqual(summaryCalls, 1);

  state.d1 = 0;
  runApplyChildRules(ctx);
  assert.strictEqual(state.d1, 4, 'Forced value should remain q4 while locked');
  assert.strictEqual(childDomainBackup.d1, originalState.d1, 'Backup must keep the first pre-lock value');
  assert.strictEqual(summaryCalls, 2);

  ctx.crianca = false;
  ctx.idadeMeses = 192;
  runApplyChildRules(ctx);

  assert.deepStrictEqual(state, originalState);
  assert.deepStrictEqual(childDomainBackup, {});

  ALL_ATIV_IDS.forEach(id => {
    assert.strictEqual(getActiveValue(buttonMap[id]), originalState[id], `Domain ${id} should restore active value`);
    assert.ok(buttonMap[id].every(btn => !btn.classList.contains('locked')), `Domain ${id} should be unlocked`);
  });
  assert.strictEqual(summaryCalls, 3);
});
