export function createDomainState(domains) {
  const state = {};
  domains.forEach(d => {
    state[d.id] = 0;
  });
  return state;
}

export function createDomainNameById(domains) {
  // ⚡ Optimization: Native for-loop to avoid Array.prototype.reduce callback allocation overhead
  const acc = {};
  for (let i = 0; i < domains.length; i++) {
    acc[domains[i].id] = domains[i].name;
  }
  return acc;
}

export function createEmptyAdminCorpoRecognition() {
  return { estruturasReconhecidas: null, prognosticoReconhecido: null };
}

export function createEmptyDomains(domainIds) {
  // ⚡ Optimization: Native for-loop to avoid Array.prototype.reduce callback allocation overhead
  const acc = {};
  for (let i = 0; i < domainIds.length; i++) {
    acc[domainIds[i]] = null;
  }
  return acc;
}

export function createEmptyJudicialMed(corpoDomainIds, ativDomainIds) {
  return {
    impedimentoLP: null,
    corpoJud: null,
    corpoKeepAdmin: null,
    corpoChangeReason: null,
    corpoAdminDomains: createEmptyDomains(corpoDomainIds),
    corpoJudManual: null,
    corpoAlertReductionConfirmed: false,
    hasAtivMed: null,
    ativMode: null,
    ativMedSimple: null,
    ativMedJustification: '',
    ativMedDomains: createEmptyDomains(ativDomainIds),
    ativMedComputed: null
  };
}

export function createJudicialControl(corpoDomainIds, ativDomainIds) {
  return {
    adminDraft: {
      amb: null,
      ativ: null,
      corpo: null,
      corpoReconhecimentoInss: createEmptyAdminCorpoRecognition()
    },
    adminBase: null,
    med: createEmptyJudicialMed(corpoDomainIds, ativDomainIds),
    triage: { ready: false, status: 'pending', testeA: null, testeB: null, reason: '', route: null },
    ui: { activeStep: 1, progressPct: 25, blockReason: '' }
  };
}
