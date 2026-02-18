const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const sourcePath = path.join(__dirname, '../src/js/judicial-flow.js');
const sourceContent = fs.readFileSync(sourcePath, 'utf8');

function extractExportedFunction(name) {
  const marker = `export function ${name}`;
  const start = sourceContent.indexOf(marker);
  if (start === -1) {
    throw new Error(`Function ${name} not found in judicial-flow.js`);
  }

  const paramsStart = sourceContent.indexOf('(', start);
  let paramsEnd = paramsStart;
  let depth = 0;
  while (paramsEnd < sourceContent.length) {
    const ch = sourceContent[paramsEnd];
    if (ch === '(') depth += 1;
    if (ch === ')') {
      depth -= 1;
      if (depth === 0) break;
    }
    paramsEnd += 1;
  }

  const bodyStart = sourceContent.indexOf('{', paramsEnd);
  let bodyEnd = bodyStart;
  let braces = 0;
  while (bodyEnd < sourceContent.length) {
    const ch = sourceContent[bodyEnd];
    if (ch === '{') braces += 1;
    if (ch === '}') {
      braces -= 1;
      if (braces === 0) break;
    }
    bodyEnd += 1;
  }

  return {
    params: sourceContent.slice(paramsStart + 1, paramsEnd),
    body: sourceContent.slice(bodyStart + 1, bodyEnd)
  };
}

function buildFunction(name, deps = {}) {
  const extracted = extractExportedFunction(name);
  const depNames = Object.keys(deps);
  const depValues = Object.values(deps);
  const factory = new Function(...depNames, `return function(${extracted.params}) {${extracted.body}};`);
  return factory(...depValues);
}

const resolveAtivMed = buildFunction('resolveAtivMed');
const getAtivReclassContext = buildFunction('getAtivReclassContext');
const isCorpoReasonBlocked = buildFunction('isCorpoReasonBlocked');
const getCorpoReasonBlockedMessage = buildFunction('getCorpoReasonBlockedMessage');
const resolveCorpoJudFlow = buildFunction('resolveCorpoJudFlow');
const getMedBlockingReason = buildFunction('getMedBlockingReason');
const computeJudicialTriage = buildFunction('computeJudicialTriage');

// ---------------------------------------------------------------------------
// resolveAtivMed
// ---------------------------------------------------------------------------

test('resolveAtivMed - hasAtivMed false returns null', () => {
  const result = resolveAtivMed({
    med: { hasAtivMed: false },
    computeAtivFromDomains: () => null
  });
  assert.strictEqual(result, null);
});

test('resolveAtivMed - hasAtivMed null returns null', () => {
  const result = resolveAtivMed({
    med: { hasAtivMed: null },
    computeAtivFromDomains: () => null
  });
  assert.strictEqual(result, null);
});

test('resolveAtivMed - simples mode returns ativMedSimple', () => {
  const result = resolveAtivMed({
    med: { hasAtivMed: true, ativMode: 'simples', ativMedSimple: 3 },
    computeAtivFromDomains: () => null
  });
  assert.strictEqual(result, 3);
});

test('resolveAtivMed - completa with existing ativMedComputed returns its q', () => {
  const result = resolveAtivMed({
    med: { hasAtivMed: true, ativMode: 'completa', ativMedComputed: { q: 2 }, ativMedDomains: {} },
    computeAtivFromDomains: () => { throw new Error('should not be called'); }
  });
  assert.strictEqual(result, 2);
});

test('resolveAtivMed - completa without computed calls computeAtivFromDomains', () => {
  let called = false;
  const result = resolveAtivMed({
    med: { hasAtivMed: true, ativMode: 'completa', ativMedComputed: null, ativMedDomains: { d1: 3 } },
    computeAtivFromDomains: (domains) => { called = true; return { q: 4 }; }
  });
  assert.strictEqual(called, true);
  assert.strictEqual(result, 4);
});

test('resolveAtivMed - unknown mode returns null', () => {
  const result = resolveAtivMed({
    med: { hasAtivMed: true, ativMode: 'desconhecido' },
    computeAtivFromDomains: () => null
  });
  assert.strictEqual(result, null);
});

// ---------------------------------------------------------------------------
// getAtivReclassContext
// ---------------------------------------------------------------------------

test('getAtivReclassContext - no base returns sem_base', () => {
  const result = getAtivReclassContext({
    base: null,
    med: {},
    corpoFlow: {},
    tabelaConclusiva: () => false
  });
  assert.strictEqual(result.code, 'sem_base');
  assert.strictEqual(result.showQuestion, false);
});

test('getAtivReclassContext - impedimentoLP null returns aguardando_impedimento', () => {
  const result = getAtivReclassContext({
    base: { amb: 2, ativ: 2, corpo: 2 },
    med: { impedimentoLP: null },
    corpoFlow: { ready: true, q: 2 },
    tabelaConclusiva: () => false
  });
  assert.strictEqual(result.code, 'aguardando_impedimento');
});

test('getAtivReclassContext - corpoFlow not ready returns aguardando_funcoes', () => {
  const result = getAtivReclassContext({
    base: { amb: 2, ativ: 2, corpo: 2 },
    med: { impedimentoLP: true },
    corpoFlow: { ready: false, q: null },
    tabelaConclusiva: () => false
  });
  assert.strictEqual(result.code, 'aguardando_funcoes');
});

test('getAtivReclassContext - impedimentoLP false returns sem_impedimento_lp', () => {
  const result = getAtivReclassContext({
    base: { amb: 2, ativ: 2, corpo: 2 },
    med: { impedimentoLP: false },
    corpoFlow: { ready: true, q: 3 },
    tabelaConclusiva: () => false
  });
  assert.strictEqual(result.code, 'sem_impedimento_lp');
});

test('getAtivReclassContext - corpoFlow.q <= 1 returns corpo_nl', () => {
  const result = getAtivReclassContext({
    base: { amb: 2, ativ: 2, corpo: 2 },
    med: { impedimentoLP: true },
    corpoFlow: { ready: true, q: 1 },
    tabelaConclusiva: () => false
  });
  assert.strictEqual(result.code, 'corpo_nl');
});

test('getAtivReclassContext - tabelaConclusiva positive returns verificacao_adm_positiva', () => {
  const result = getAtivReclassContext({
    base: { amb: 4, ativ: 3, corpo: 3 },
    med: { impedimentoLP: true },
    corpoFlow: { ready: true, q: 3 },
    tabelaConclusiva: () => true
  });
  assert.strictEqual(result.code, 'verificacao_adm_positiva');
});

test('getAtivReclassContext - all conditions pass returns relevante', () => {
  const result = getAtivReclassContext({
    base: { amb: 2, ativ: 2, corpo: 2 },
    med: { impedimentoLP: true },
    corpoFlow: { ready: true, q: 2 },
    tabelaConclusiva: () => false
  });
  assert.strictEqual(result.code, 'relevante');
  assert.strictEqual(result.showQuestion, true);
  assert.strictEqual(result.relevant, true);
});

test('getAtivReclassContext - corpoFlow.q == null returns aguardando_funcoes', () => {
  const result = getAtivReclassContext({
    base: { amb: 2, ativ: 2, corpo: 2 },
    med: { impedimentoLP: true },
    corpoFlow: { ready: true, q: null },
    tabelaConclusiva: () => false
  });
  assert.strictEqual(result.code, 'aguardando_funcoes');
});

test('getAtivReclassContext - corpoFlow.q = 0 (N) returns corpo_nl', () => {
  const result = getAtivReclassContext({
    base: { amb: 2, ativ: 2, corpo: 2 },
    med: { impedimentoLP: true },
    corpoFlow: { ready: true, q: 0 },
    tabelaConclusiva: () => false
  });
  assert.strictEqual(result.code, 'corpo_nl');
});

// ---------------------------------------------------------------------------
// isCorpoReasonBlocked
// ---------------------------------------------------------------------------

test('isCorpoReasonBlocked - base null returns false', () => {
  assert.strictEqual(isCorpoReasonBlocked({ base: null, reason: 'estruturas' }), false);
});

test('isCorpoReasonBlocked - reason null returns false', () => {
  assert.strictEqual(isCorpoReasonBlocked({ base: { corpoReconhecimentoInss: {} }, reason: null }), false);
});

test('isCorpoReasonBlocked - estruturas recognized returns true', () => {
  const base = { corpoReconhecimentoInss: { estruturasReconhecidas: true } };
  assert.strictEqual(isCorpoReasonBlocked({ base, reason: 'estruturas' }), true);
});

test('isCorpoReasonBlocked - estruturas not recognized returns false', () => {
  const base = { corpoReconhecimentoInss: { estruturasReconhecidas: false } };
  assert.strictEqual(isCorpoReasonBlocked({ base, reason: 'estruturas' }), false);
});

test('isCorpoReasonBlocked - prognostico recognized returns true', () => {
  const base = { corpoReconhecimentoInss: { prognosticoReconhecido: true } };
  assert.strictEqual(isCorpoReasonBlocked({ base, reason: 'prognostico' }), true);
});

test('isCorpoReasonBlocked - prognostico not recognized returns false', () => {
  const base = { corpoReconhecimentoInss: { prognosticoReconhecido: false } };
  assert.strictEqual(isCorpoReasonBlocked({ base, reason: 'prognostico' }), false);
});

test('isCorpoReasonBlocked - unknown reason returns false', () => {
  const base = { corpoReconhecimentoInss: { estruturasReconhecidas: true, prognosticoReconhecido: true } };
  assert.strictEqual(isCorpoReasonBlocked({ base, reason: 'outro' }), false);
});

// ---------------------------------------------------------------------------
// getCorpoReasonBlockedMessage
// ---------------------------------------------------------------------------

test('getCorpoReasonBlockedMessage - estruturas returns specific message', () => {
  const msg = getCorpoReasonBlockedMessage('estruturas');
  assert.ok(msg.includes('alterações em Estruturas do Corpo'));
});

test('getCorpoReasonBlockedMessage - prognostico returns specific message', () => {
  const msg = getCorpoReasonBlockedMessage('prognostico');
  assert.ok(msg.includes('prognóstico desfavorável'));
});

test('getCorpoReasonBlockedMessage - fallback returns generic message', () => {
  const msg = getCorpoReasonBlockedMessage('outro');
  assert.strictEqual(msg, 'Motivo indisponível para esta base administrativa.');
});

// ---------------------------------------------------------------------------
// resolveCorpoJudFlow
// ---------------------------------------------------------------------------

const qLabels = { 0: 'N', 1: 'L', 2: 'M', 3: 'G', 4: 'C' };
const corpoDomainIds = ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8'];

function makeCorpoArgs(overrides = {}) {
  return {
    base: { corpo: 2, corpoReconhecimentoInss: { estruturasReconhecidas: false, prognosticoReconhecido: false } },
    med: { corpoKeepAdmin: null, corpoChangeReason: null, corpoAdminDomains: {}, corpoJudManual: null, corpoAlertReductionConfirmed: false },
    isCorpoReasonBlocked: (reason) => isCorpoReasonBlocked({ base: overrides.base || { corpo: 2, corpoReconhecimentoInss: { estruturasReconhecidas: false, prognosticoReconhecido: false } }, reason }),
    getCorpoReasonBlockedMessage: (reason) => getCorpoReasonBlockedMessage(reason),
    corpoDomainIds,
    qLabels,
    ...overrides
  };
}

test('resolveCorpoJudFlow - no base returns pending', () => {
  const result = resolveCorpoJudFlow(makeCorpoArgs({ base: null }));
  assert.strictEqual(result.ready, false);
  assert.strictEqual(result.mode, 'pending');
});

test('resolveCorpoJudFlow - corpoKeepAdmin null returns pending', () => {
  const result = resolveCorpoJudFlow(makeCorpoArgs());
  assert.strictEqual(result.ready, false);
  assert.strictEqual(result.mode, 'pending');
});

test('resolveCorpoJudFlow - corpoKeepAdmin true (mantido) returns ready with base.corpo', () => {
  const result = resolveCorpoJudFlow(makeCorpoArgs({
    med: { corpoKeepAdmin: true }
  }));
  assert.strictEqual(result.ready, true);
  assert.strictEqual(result.q, 2);
  assert.strictEqual(result.mode, 'mantido');
  assert.strictEqual(result.decreased, false);
});

test('resolveCorpoJudFlow - no corpoChangeReason returns pending', () => {
  const result = resolveCorpoJudFlow(makeCorpoArgs({
    med: { corpoKeepAdmin: false, corpoChangeReason: null }
  }));
  assert.strictEqual(result.ready, false);
  assert.strictEqual(result.mode, 'pending');
});

test('resolveCorpoJudFlow - blocked reason returns blocked mode', () => {
  const base = { corpo: 2, corpoReconhecimentoInss: { estruturasReconhecidas: true, prognosticoReconhecido: false } };
  const result = resolveCorpoJudFlow(makeCorpoArgs({
    base,
    med: { corpoKeepAdmin: false, corpoChangeReason: 'estruturas' },
    isCorpoReasonBlocked: (reason) => isCorpoReasonBlocked({ base, reason })
  }));
  assert.strictEqual(result.ready, false);
  assert.strictEqual(result.mode, 'blocked');
});

test('resolveCorpoJudFlow - estruturas with corpo 2 returns q=3', () => {
  const result = resolveCorpoJudFlow(makeCorpoArgs({
    med: { corpoKeepAdmin: false, corpoChangeReason: 'estruturas' }
  }));
  assert.strictEqual(result.ready, true);
  assert.strictEqual(result.q, 3);
  assert.strictEqual(result.mode, 'estruturas');
  assert.strictEqual(result.decreased, false);
});

test('resolveCorpoJudFlow - estruturas with corpo 4 capped at 4', () => {
  const base = { corpo: 4, corpoReconhecimentoInss: { estruturasReconhecidas: false, prognosticoReconhecido: false } };
  const result = resolveCorpoJudFlow(makeCorpoArgs({
    base,
    med: { corpoKeepAdmin: false, corpoChangeReason: 'estruturas' },
    isCorpoReasonBlocked: (reason) => isCorpoReasonBlocked({ base, reason })
  }));
  assert.strictEqual(result.ready, true);
  assert.strictEqual(result.q, 4);
});

test('resolveCorpoJudFlow - prognostico with corpo 3 returns q=4', () => {
  const base = { corpo: 3, corpoReconhecimentoInss: { estruturasReconhecidas: false, prognosticoReconhecido: false } };
  const result = resolveCorpoJudFlow(makeCorpoArgs({
    base,
    med: { corpoKeepAdmin: false, corpoChangeReason: 'prognostico' },
    isCorpoReasonBlocked: (reason) => isCorpoReasonBlocked({ base, reason })
  }));
  assert.strictEqual(result.ready, true);
  assert.strictEqual(result.q, 4);
  assert.strictEqual(result.mode, 'prognostico');
});

test('resolveCorpoJudFlow - dominio_max no domains returns pending', () => {
  const result = resolveCorpoJudFlow(makeCorpoArgs({
    med: { corpoKeepAdmin: false, corpoChangeReason: 'dominio_max', corpoAdminDomains: {} }
  }));
  assert.strictEqual(result.ready, false);
  assert.strictEqual(result.mode, 'pending');
});

test('resolveCorpoJudFlow - dominio_max with domains uses max', () => {
  const result = resolveCorpoJudFlow(makeCorpoArgs({
    med: { corpoKeepAdmin: false, corpoChangeReason: 'dominio_max', corpoAdminDomains: { b1: 1, b3: 4, b5: 2 } }
  }));
  assert.strictEqual(result.ready, true);
  assert.strictEqual(result.q, 4);
  assert.strictEqual(result.mode, 'dominio_max');
  assert.ok(result.domainsText.includes('B1=L'));
  assert.ok(result.domainsText.includes('B3=C'));
  assert.ok(result.domainsText.includes('B5=M'));
});

test('resolveCorpoJudFlow - rebaixamento no manual returns pending', () => {
  const result = resolveCorpoJudFlow(makeCorpoArgs({
    med: { corpoKeepAdmin: false, corpoChangeReason: 'rebaixamento', corpoJudManual: null }
  }));
  assert.strictEqual(result.ready, false);
  assert.strictEqual(result.mode, 'pending');
});

test('resolveCorpoJudFlow - rebaixamento with decrease no confirm returns needsReductionConfirm', () => {
  const result = resolveCorpoJudFlow(makeCorpoArgs({
    med: { corpoKeepAdmin: false, corpoChangeReason: 'rebaixamento', corpoJudManual: 1, corpoAlertReductionConfirmed: false }
  }));
  assert.strictEqual(result.ready, false);
  assert.strictEqual(result.q, 1);
  assert.strictEqual(result.needsReductionConfirm, true);
  assert.strictEqual(result.decreased, true);
});

test('resolveCorpoJudFlow - rebaixamento with decrease confirmed returns ready', () => {
  const result = resolveCorpoJudFlow(makeCorpoArgs({
    med: { corpoKeepAdmin: false, corpoChangeReason: 'rebaixamento', corpoJudManual: 1, corpoAlertReductionConfirmed: true }
  }));
  assert.strictEqual(result.ready, true);
  assert.strictEqual(result.q, 1);
  assert.strictEqual(result.mode, 'rebaixamento');
  assert.strictEqual(result.decreased, true);
});

test('resolveCorpoJudFlow - rebaixamento no decrease returns ready', () => {
  const result = resolveCorpoJudFlow(makeCorpoArgs({
    med: { corpoKeepAdmin: false, corpoChangeReason: 'rebaixamento', corpoJudManual: 3, corpoAlertReductionConfirmed: false }
  }));
  assert.strictEqual(result.ready, true);
  assert.strictEqual(result.q, 3);
  assert.strictEqual(result.mode, 'rebaixamento');
  assert.strictEqual(result.decreased, false);
});

// ---------------------------------------------------------------------------
// getMedBlockingReason
// ---------------------------------------------------------------------------

function makeMedBlockArgs(overrides = {}) {
  const defaults = {
    adminBase: { amb: 2, ativ: 2, corpo: 2 },
    med: { impedimentoLP: true, hasAtivMed: null, ativMode: null, ativMedSimple: null, ativMedJustification: '', ativMedComputed: null },
    resolveCorpoJudFlow: () => ({ ready: true, q: 2, mode: 'mantido' }),
    getAtivReclassContext: () => ({ showQuestion: true, relevant: true, code: 'relevante' }),
    updateAtivMedComputed: () => null
  };
  return { ...defaults, ...overrides };
}

test('getMedBlockingReason - no adminBase returns blocking message', () => {
  const result = getMedBlockingReason(makeMedBlockArgs({ adminBase: null }));
  assert.ok(result.includes('Fixe a base administrativa'));
});

test('getMedBlockingReason - impedimentoLP null returns blocking message', () => {
  const result = getMedBlockingReason(makeMedBlockArgs({
    med: { impedimentoLP: null }
  }));
  assert.ok(result.includes('impedimento de longo prazo'));
});

test('getMedBlockingReason - corpoFlow not ready returns corpoFlow reason', () => {
  const result = getMedBlockingReason(makeMedBlockArgs({
    resolveCorpoJudFlow: () => ({ ready: false, q: null, reason: 'corpo not ready' })
  }));
  assert.strictEqual(result, 'corpo not ready');
});

test('getMedBlockingReason - ativContext hidden returns empty string', () => {
  const result = getMedBlockingReason(makeMedBlockArgs({
    getAtivReclassContext: () => ({ showQuestion: false, code: 'sem_impedimento_lp' })
  }));
  assert.strictEqual(result, '');
});

test('getMedBlockingReason - hasAtivMed null returns blocking message', () => {
  const result = getMedBlockingReason(makeMedBlockArgs({
    med: { impedimentoLP: true, hasAtivMed: null }
  }));
  assert.ok(result.includes('requalificar Atividades e Participação'));
});

test('getMedBlockingReason - hasAtivMed false returns empty string', () => {
  const result = getMedBlockingReason(makeMedBlockArgs({
    med: { impedimentoLP: true, hasAtivMed: false }
  }));
  assert.strictEqual(result, '');
});

test('getMedBlockingReason - ativMode null returns blocking message', () => {
  const result = getMedBlockingReason(makeMedBlockArgs({
    med: { impedimentoLP: true, hasAtivMed: true, ativMode: null }
  }));
  assert.ok(result.includes('modo de requalificação'));
});

test('getMedBlockingReason - simples incomplete no qualifier returns blocking message', () => {
  const result = getMedBlockingReason(makeMedBlockArgs({
    med: { impedimentoLP: true, hasAtivMed: true, ativMode: 'simples', ativMedSimple: null, ativMedJustification: 'justificativa' }
  }));
  assert.ok(result.includes('qualificador final'));
});

test('getMedBlockingReason - simples incomplete no justification returns blocking message', () => {
  const result = getMedBlockingReason(makeMedBlockArgs({
    med: { impedimentoLP: true, hasAtivMed: true, ativMode: 'simples', ativMedSimple: 3, ativMedJustification: '   ' }
  }));
  assert.ok(result.includes('justificativa médica'));
});

test('getMedBlockingReason - simples complete returns empty string', () => {
  const result = getMedBlockingReason(makeMedBlockArgs({
    med: { impedimentoLP: true, hasAtivMed: true, ativMode: 'simples', ativMedSimple: 3, ativMedJustification: 'razao medica' }
  }));
  assert.strictEqual(result, '');
});

test('getMedBlockingReason - completa incomplete returns blocking message', () => {
  const result = getMedBlockingReason(makeMedBlockArgs({
    med: { impedimentoLP: true, hasAtivMed: true, ativMode: 'completa' },
    updateAtivMedComputed: () => null
  }));
  assert.ok(result.includes('preencha todos os domínios'));
});

test('getMedBlockingReason - completa complete returns empty string', () => {
  const result = getMedBlockingReason(makeMedBlockArgs({
    med: { impedimentoLP: true, hasAtivMed: true, ativMode: 'completa' },
    updateAtivMedComputed: () => ({ q: 3 })
  }));
  assert.strictEqual(result, '');
});

// ---------------------------------------------------------------------------
// computeJudicialTriage
// ---------------------------------------------------------------------------

function makeTriageArgs(overrides = {}) {
  const defaults = {
    adminBase: { amb: 2, ativ: 2, corpo: 2 },
    med: { impedimentoLP: true, hasAtivMed: false },
    isAdminDraftDirty: () => false,
    resolveCorpoJudFlow: () => ({ ready: true, q: 2, mode: 'mantido' }),
    getAtivReclassContext: () => ({ showQuestion: false, code: 'sem_impedimento_lp' }),
    getMedBlockingReason: () => '',
    resolveAtivMed: () => null,
    tabelaConclusiva: () => false
  };
  return { ...defaults, ...overrides };
}

test('computeJudicialTriage - no adminBase returns pendente_base', () => {
  const result = computeJudicialTriage(makeTriageArgs({ adminBase: null }));
  assert.strictEqual(result.route, 'pendente_base');
  assert.strictEqual(result.ready, false);
});

test('computeJudicialTriage - dirty draft returns pendente_refixacao', () => {
  const result = computeJudicialTriage(makeTriageArgs({
    isAdminDraftDirty: () => true
  }));
  assert.strictEqual(result.route, 'pendente_refixacao');
  assert.strictEqual(result.ready, false);
});

test('computeJudicialTriage - medBlock present returns pendente_medica', () => {
  const result = computeJudicialTriage(makeTriageArgs({
    getMedBlockingReason: () => 'algo pendente'
  }));
  assert.strictEqual(result.route, 'pendente_medica');
  assert.strictEqual(result.reason, 'algo pendente');
});

test('computeJudicialTriage - impedimentoLP false returns sem_impedimento_lp', () => {
  const result = computeJudicialTriage(makeTriageArgs({
    med: { impedimentoLP: false, hasAtivMed: false }
  }));
  assert.strictEqual(result.route, 'sem_impedimento_lp');
  assert.strictEqual(result.ready, true);
  assert.strictEqual(result.status, 'dispensa');
});

test('computeJudicialTriage - testeA positive returns verificacao_administrativa_positiva', () => {
  const result = computeJudicialTriage(makeTriageArgs({
    med: { impedimentoLP: true, hasAtivMed: false },
    tabelaConclusiva: () => true,
    getAtivReclassContext: () => ({ showQuestion: false, code: 'verificacao_adm_positiva' })
  }));
  assert.strictEqual(result.route, 'verificacao_administrativa_positiva');
  assert.strictEqual(result.ready, true);
  assert.strictEqual(result.status, 'dispensa');
});

test('computeJudicialTriage - corpo_nl returns corpo_nl_irrelevante', () => {
  const result = computeJudicialTriage(makeTriageArgs({
    med: { impedimentoLP: true, hasAtivMed: false },
    resolveCorpoJudFlow: () => ({ ready: true, q: 1, mode: 'mantido' }),
    getAtivReclassContext: () => ({ showQuestion: false, code: 'corpo_nl' }),
    tabelaConclusiva: () => false
  }));
  assert.strictEqual(result.route, 'corpo_nl_irrelevante');
  assert.strictEqual(result.ready, true);
  assert.strictEqual(result.status, 'dispensa');
});

test('computeJudicialTriage - testeB positive returns verificacao_atividades_medicas_positiva', () => {
  let callCount = 0;
  const result = computeJudicialTriage(makeTriageArgs({
    med: { impedimentoLP: true, hasAtivMed: true, ativMode: 'simples' },
    resolveCorpoJudFlow: () => ({ ready: true, q: 2, mode: 'mantido' }),
    getAtivReclassContext: () => ({ showQuestion: true, relevant: true, code: 'relevante' }),
    resolveAtivMed: () => 3,
    tabelaConclusiva: (amb, ativ, corpo) => {
      callCount++;
      // First call is testeA (returns false), second is testeB (returns true)
      return callCount >= 2;
    }
  }));
  assert.strictEqual(result.route, 'verificacao_atividades_medicas_positiva');
  assert.strictEqual(result.ready, true);
  assert.strictEqual(result.status, 'dispensa');
});

test('computeJudicialTriage - all negative returns avaliacao_social_necessaria', () => {
  const result = computeJudicialTriage(makeTriageArgs({
    med: { impedimentoLP: true, hasAtivMed: true, ativMode: 'simples' },
    resolveCorpoJudFlow: () => ({ ready: true, q: 2, mode: 'mantido' }),
    getAtivReclassContext: () => ({ showQuestion: true, relevant: true, code: 'relevante' }),
    resolveAtivMed: () => 2,
    tabelaConclusiva: () => false
  }));
  assert.strictEqual(result.route, 'avaliacao_social_necessaria');
  assert.strictEqual(result.ready, true);
  assert.strictEqual(result.status, 'necessaria');
});
