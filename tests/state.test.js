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

const createEmptyAdminCorpoRecognition = buildFunction('createEmptyAdminCorpoRecognition');
const createEmptyDomains = buildFunction('createEmptyDomains');
const createEmptyJudicialMed = buildFunction('createEmptyJudicialMed', { createEmptyDomains });
const createJudicialControl = buildFunction('createJudicialControl', { createEmptyAdminCorpoRecognition, createEmptyJudicialMed });

test('createJudicialControl - returns expected initial state structure', () => {
  const corpoDomainIds = ['b1', 'b2'];
  const ativDomainIds = ['d1', 'd2', 'd3'];

  const state = createJudicialControl(corpoDomainIds, ativDomainIds);

  // Assert basic top-level properties
  assert.ok(state.adminDraft, 'adminDraft should be present');
  assert.strictEqual(state.adminBase, null, 'adminBase should be null initially');
  assert.ok(state.med, 'med should be present');
  assert.ok(state.triage, 'triage should be present');
  assert.ok(state.ui, 'ui should be present');

  // Assert adminDraft
  assert.deepStrictEqual(state.adminDraft, {
    amb: null,
    ativ: null,
    corpo: null,
    corpoReconhecimentoInss: { estruturasReconhecidas: null, prognosticoReconhecido: null }
  }, 'adminDraft should match expected default structure');

  // Assert med
  assert.deepStrictEqual(state.med, {
    impedimentoLP: null,
    corpoJud: null,
    corpoKeepAdmin: null,
    corpoChangeReason: null,
    corpoAdminDomains: { b1: null, b2: null },
    corpoJudManual: null,
    corpoAlertReductionConfirmed: false,
    hasAtivMed: null,
    ativMode: null,
    ativMedSimple: null,
    ativMedJustification: '',
    ativMedDomains: { d1: null, d2: null, d3: null },
    ativMedComputed: null
  }, 'med should match expected default structure and include dynamic domains');

  // Assert triage
  assert.deepStrictEqual(state.triage, {
    ready: false,
    status: 'pending',
    testeA: null,
    testeB: null,
    reason: '',
    route: null
  }, 'triage should match expected default structure');

  // Assert ui
  assert.deepStrictEqual(state.ui, {
    activeStep: 1,
    progressPct: 25,
    blockReason: ''
  }, 'ui should match expected default structure');
});

test('createJudicialControl - instances should be independent', () => {
    const s1 = createJudicialControl(['b1'], ['d1']);
    const s2 = createJudicialControl(['b1'], ['d1']);

    assert.notStrictEqual(s1, s2, 'Should return new object instances');
    assert.notStrictEqual(s1.adminDraft, s2.adminDraft, 'Nested objects should be new instances');
    assert.notStrictEqual(s1.med, s2.med, 'Nested objects should be new instances');
});
