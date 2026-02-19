const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const judicialTextPath = path.join(__dirname, '../src/js/judicial-text.js');
const judicialTextContent = fs.readFileSync(judicialTextPath, 'utf8');
const constantsPath = path.join(__dirname, '../src/js/constants.js');
const constantsContent = fs.readFileSync(constantsPath, 'utf8');

function extractExportedFunction(content, name) {
  const marker = `export function ${name}`;
  const start = content.indexOf(marker);
  if (start === -1) throw new Error(`Function ${name} not found`);
  const paramsStart = content.indexOf('(', start);
  let paramsEnd = paramsStart;
  let depth = 0;
  while (paramsEnd < content.length) {
    const ch = content[paramsEnd];
    if (ch === '(') depth += 1;
    if (ch === ')') { depth -= 1; if (depth === 0) break; }
    paramsEnd += 1;
  }
  const bodyStart = content.indexOf('{', paramsEnd);
  let bodyEnd = bodyStart;
  let braces = 0;
  while (bodyEnd < content.length) {
    const ch = content[bodyEnd];
    if (ch === '{') braces += 1;
    if (ch === '}') { braces -= 1; if (braces === 0) break; }
    bodyEnd += 1;
  }
  return {
    params: content.slice(paramsStart + 1, paramsEnd),
    body: content.slice(bodyStart + 1, bodyEnd)
  };
}

function extractConstant(content, name) {
  const marker = `export const ${name} = `;
  const start = content.indexOf(marker);
  if (start === -1) throw new Error(`Constant ${name} not found`);
  const objStart = content.indexOf('{', start);
  let objEnd = objStart;
  let braces = 0;
  while (objEnd < content.length) {
    if (content[objEnd] === '{') braces += 1;
    if (content[objEnd] === '}') { braces -= 1; if (braces === 0) break; }
    objEnd += 1;
  }
  const objStr = content.slice(objStart, objEnd + 1);
  return new Function(`return ${objStr}`)();
}

function buildFunction(content, name, deps = {}) {
  const extracted = extractExportedFunction(content, name);
  const depNames = Object.keys(deps);
  const depValues = Object.values(deps);
  const factory = new Function(...depNames, `return function(${extracted.params}) {${extracted.body}};`);
  return factory(...depValues);
}

const Q_FULL = extractConstant(constantsContent, 'Q_FULL');
const buildJudicialControlText = buildFunction(judicialTextContent, 'buildJudicialControlText', { Q_FULL });

// --- Test helpers ---

function makeBase(overrides = {}) {
  return {
    amb: 2, ativ: 2, corpo: 2,
    corpoReconhecimentoInss: { estruturasReconhecidas: false, prognosticoReconhecido: false },
    ...overrides
  };
}

function makeMed(overrides = {}) {
  return { impedimentoLP: true, hasAtivMed: false, ativMode: null, ...overrides };
}

function makeCorpoFlow(overrides = {}) {
  return { ready: true, q: 3, mode: 'estruturas', ...overrides };
}

function fakeTriage(overrides = {}) {
  return { ready: true, status: 'dispensa', testeA: true, testeB: null, route: 'verificacao_administrativa_positiva', ...overrides };
}

function fakeGetItemNumber() {
  return 42;
}

// --- Tests ---

test('buildJudicialControlText - sem adminBase retorna placeholder', () => {
  const result = buildJudicialControlText({
    adminBase: null,
    triage: fakeTriage(),
    med: makeMed(),
    corpoFlow: makeCorpoFlow(),
    ativMedResolved: null,
    getItemNumber: fakeGetItemNumber
  });
  assert.strictEqual(result, 'Fixe a base administrativa para habilitar a minuta do Controle Judicial.');
});

test('buildJudicialControlText - triage not ready retorna placeholder', () => {
  const result = buildJudicialControlText({
    adminBase: makeBase(),
    triage: fakeTriage({ ready: false }),
    med: makeMed(),
    corpoFlow: makeCorpoFlow(),
    ativMedResolved: null,
    getItemNumber: fakeGetItemNumber
  });
  assert.strictEqual(result, 'Complete a etapa da perícia médica judicial para concluir a triagem probatória.');
});

test('buildJudicialControlText - reconhecimento: est + prog', () => {
  const result = buildJudicialControlText({
    adminBase: makeBase({
      corpoReconhecimentoInss: { estruturasReconhecidas: true, prognosticoReconhecido: true }
    }),
    triage: fakeTriage(),
    med: makeMed(),
    corpoFlow: makeCorpoFlow(),
    ativMedResolved: null,
    getItemNumber: fakeGetItemNumber
  });
  assert.ok(
    result.includes('tanto as alterações em Estruturas do Corpo quanto o prognóstico desfavorável'),
    'Deve conter frase de reconhecimento de est + prog'
  );
});

test('buildJudicialControlText - reconhecimento: somente est', () => {
  const result = buildJudicialControlText({
    adminBase: makeBase({
      corpoReconhecimentoInss: { estruturasReconhecidas: true, prognosticoReconhecido: false }
    }),
    triage: fakeTriage(),
    med: makeMed(),
    corpoFlow: makeCorpoFlow(),
    ativMedResolved: null,
    getItemNumber: fakeGetItemNumber
  });
  assert.ok(
    result.includes('reconhecido alterações em Estruturas do Corpo, mas não prognóstico'),
    'Deve conter frase de reconhecimento somente est'
  );
});

test('buildJudicialControlText - reconhecimento: somente prog', () => {
  const result = buildJudicialControlText({
    adminBase: makeBase({
      corpoReconhecimentoInss: { estruturasReconhecidas: false, prognosticoReconhecido: true }
    }),
    triage: fakeTriage(),
    med: makeMed(),
    corpoFlow: makeCorpoFlow(),
    ativMedResolved: null,
    getItemNumber: fakeGetItemNumber
  });
  assert.ok(
    result.includes('reconhecido prognóstico desfavorável, mas não alterações'),
    'Deve conter frase de reconhecimento somente prog'
  );
});

test('buildJudicialControlText - reconhecimento: nenhum', () => {
  const result = buildJudicialControlText({
    adminBase: makeBase(),
    triage: fakeTriage(),
    med: makeMed(),
    corpoFlow: makeCorpoFlow(),
    ativMedResolved: null,
    getItemNumber: fakeGetItemNumber
  });
  assert.ok(!result.includes('reconhecido'), 'Sem reconhecimento, texto não deve conter "reconhecido"');
});

test('buildJudicialControlText - dispensa sem_impedimento_lp', () => {
  const result = buildJudicialControlText({
    adminBase: makeBase(),
    triage: fakeTriage({ route: 'sem_impedimento_lp' }),
    med: makeMed({ impedimentoLP: false }),
    corpoFlow: makeCorpoFlow(),
    ativMedResolved: null,
    getItemNumber: fakeGetItemNumber
  });
  assert.ok(
    result.includes('não reconheceu o impedimento de longo prazo'),
    'Deve mencionar ausência de impedimento LP'
  );
  assert.ok(
    result.includes('avaliação social não precisa ser renovada'),
    'Deve mencionar dispensa de avaliação social'
  );
});

test('buildJudicialControlText - dispensa verificacao_administrativa_positiva', () => {
  const result = buildJudicialControlText({
    adminBase: makeBase(),
    triage: fakeTriage({ route: 'verificacao_administrativa_positiva', testeA: true }),
    med: makeMed(),
    corpoFlow: makeCorpoFlow(),
    ativMedResolved: null,
    getItemNumber: fakeGetItemNumber
  });
  assert.ok(
    result.includes('Tabela Conclusiva (item 42'),
    'Deve referenciar item da Tabela Conclusiva'
  );
  assert.ok(
    result.includes('resultado foi positivo'),
    'Deve mencionar resultado positivo'
  );
  assert.ok(
    result.includes('dispensando'),
    'Deve mencionar dispensa da avaliação social'
  );
});

test('buildJudicialControlText - dispensa corpo_nl_irrelevante', () => {
  const result = buildJudicialControlText({
    adminBase: makeBase(),
    triage: fakeTriage({ route: 'corpo_nl_irrelevante', testeA: false }),
    med: makeMed(),
    corpoFlow: makeCorpoFlow({ q: 1 }),
    ativMedResolved: null,
    getItemNumber: fakeGetItemNumber
  });
  assert.ok(
    result.includes('alteração leve'),
    'Deve mencionar nível do corpo (leve)'
  );
  assert.ok(
    result.includes('art. 8º, I'),
    'Deve citar art. 8º, I, da referida Portaria'
  );
  assert.ok(
    result.includes('dispensável'),
    'Deve mencionar dispensa da avaliação social'
  );
});

test('buildJudicialControlText - dispensa testeB positivo', () => {
  const result = buildJudicialControlText({
    adminBase: makeBase(),
    triage: fakeTriage({ route: 'testeB_positivo', testeA: false, testeB: true }),
    med: makeMed({ hasAtivMed: true }),
    corpoFlow: makeCorpoFlow(),
    ativMedResolved: 3,
    getItemNumber: fakeGetItemNumber
  });
  assert.ok(
    result.includes('resultado negativo'),
    'Deve mencionar resultado negativo do testeA'
  );
  assert.ok(
    result.includes('reclassificação médica de Atividades'),
    'Deve mencionar reclassificação médica de Atividades'
  );
  assert.ok(
    result.includes('obteve resultado positivo'),
    'Deve mencionar resultado positivo do testeB'
  );
});

test('buildJudicialControlText - necessaria com ativMedResolved', () => {
  const result = buildJudicialControlText({
    adminBase: makeBase(),
    triage: fakeTriage({ status: 'necessaria', testeA: false, testeB: false, route: null }),
    med: makeMed({ hasAtivMed: true }),
    corpoFlow: makeCorpoFlow(),
    ativMedResolved: 2,
    getItemNumber: fakeGetItemNumber
  });
  assert.ok(
    result.includes('resultado permaneceu negativo tanto com os qualificadores administrativos'),
    'Deve mencionar testeA negativo'
  );
  assert.ok(
    result.includes('reclassificação médica de Atividades e Participação'),
    'Deve mencionar testeB negativo'
  );
  assert.ok(
    result.includes('renovação da avaliação social em juízo'),
    'Deve mencionar necessidade de avaliação social'
  );
  assert.ok(
    result.includes('reclassificar Fatores Ambientais'),
    'Deve explicar o que a avaliação social pode reclassificar'
  );
});

test('buildJudicialControlText - necessaria sem ativMedResolved', () => {
  const result = buildJudicialControlText({
    adminBase: makeBase(),
    triage: fakeTriage({ status: 'necessaria', testeA: false, testeB: null, route: null }),
    med: makeMed(),
    corpoFlow: makeCorpoFlow(),
    ativMedResolved: null,
    getItemNumber: fakeGetItemNumber
  });
  assert.ok(
    result.includes('sem trazer elementos para reclassificação de Atividades'),
    'Deve mencionar ausência de reclassificação de Atividades'
  );
  assert.ok(
    result.includes('resultado permaneceu negativo'),
    'Deve mencionar resultado negativo'
  );
  assert.ok(
    result.includes('renovação da avaliação social em juízo'),
    'Deve mencionar necessidade de avaliação social'
  );
  assert.ok(
    result.includes('domínios sociais de Atividades e Participação'),
    'Deve explicar utilidade da avaliação social'
  );
});
