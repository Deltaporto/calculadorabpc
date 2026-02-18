export function createDomainState(domains) {
  const state = {};
  domains.forEach(d => {
    state[d.id] = 0;
  });
  return state;
}

export function createDomainNameById(domains) {
  return domains.reduce((acc, d) => {
    acc[d.id] = d.name;
    return acc;
  }, {});
}

export function createEmptyAdminCorpoRecognition() {
  return { estruturasReconhecidas: null, prognosticoReconhecido: null };
}

export function createEmptyCorpoReclassDomains(corpoDomainIds) {
  return corpoDomainIds.reduce((acc, id) => {
    acc[id] = null;
    return acc;
  }, {});
}

export function createEmptyAtivReclassDomains(ativDomainIds) {
  return ativDomainIds.reduce((acc, id) => {
    acc[id] = null;
    return acc;
  }, {});
}

export function createEmptyJudicialMed(corpoDomainIds, ativDomainIds) {
  return {
    impedimentoLP: null,
    corpoJud: null,
    corpoKeepAdmin: null,
    corpoChangeReason: null,
    corpoAdminDomains: createEmptyCorpoReclassDomains(corpoDomainIds),
    corpoJudManual: null,
    corpoAlertReductionConfirmed: false,
    hasAtivMed: null,
    ativMode: null,
    ativMedSimple: null,
    ativMedJustification: '',
    ativMedDomains: createEmptyAtivReclassDomains(ativDomainIds),
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
