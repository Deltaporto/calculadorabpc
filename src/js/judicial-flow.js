export function resolveAtivMed({ med, computeAtivFromDomains }) {
  if (med.hasAtivMed !== true) return null;
  if (med.ativMode === 'simples') return med.ativMedSimple;
  if (med.ativMode === 'completa') {
    const computed = med.ativMedComputed || computeAtivFromDomains(med.ativMedDomains);
    return computed ? computed.q : null;
  }
  return null;
}

export function getAtivReclassContext({ base, med, corpoFlow, tabelaConclusiva }) {
  if (!base) {
    return {
      showQuestion: false,
      relevant: false,
      code: 'sem_base',
      reason: 'Fixe a base administrativa para avaliar a relevância da reclassificação de Atividades e Participação.'
    };
  }
  if (med.impedimentoLP == null) {
    return {
      showQuestion: false,
      relevant: false,
      code: 'aguardando_impedimento',
      reason: 'Defina primeiro se há impedimento de longo prazo.'
    };
  }
  if (!corpoFlow.ready || corpoFlow.q == null) {
    return {
      showQuestion: false,
      relevant: false,
      code: 'aguardando_funcoes',
      reason: 'Defina primeiro o resultado judicial de Funções do Corpo.'
    };
  }
  if (med.impedimentoLP === false) {
    return {
      showQuestion: false,
      relevant: false,
      code: 'sem_impedimento_lp',
      reason: 'Pergunta não aplicável: não houve reconhecimento de impedimento de longo prazo.'
    };
  }
  if (corpoFlow.q <= 1) {
    return {
      showQuestion: false,
      relevant: false,
      code: 'corpo_nl',
      reason: 'Pergunta não aplicável: com Funções do Corpo judiciais em N/L, reclassificar Atividades e Participação não altera o desfecho da Tabela Conclusiva.'
    };
  }
  const verificacaoComBaseAdministrativa = tabelaConclusiva(base.amb, base.ativ, corpoFlow.q);
  if (verificacaoComBaseAdministrativa) {
    return {
      showQuestion: false,
      relevant: false,
      code: 'verificacao_adm_positiva',
      reason: 'Pergunta não aplicável: com manutenção de Fatores Ambientais e Atividades e Participação administrativas, o resultado já é positivo.'
    };
  }
  return {
    showQuestion: true,
    relevant: true,
    code: 'relevante',
    reason: 'A reclassificação de Atividades e Participação pode ser decisiva neste cenário; informe se a perícia médica trouxe elementos.'
  };
}

export function isCorpoReasonBlocked({ base, reason }) {
  if (!base || !reason) return false;
  if (reason === 'estruturas') return base.corpoReconhecimentoInss.estruturasReconhecidas === true;
  if (reason === 'prognostico') return base.corpoReconhecimentoInss.prognosticoReconhecido === true;
  return false;
}

export function getCorpoReasonBlockedMessage(reason) {
  if (reason === 'estruturas') return 'Motivo indisponível: a base administrativa já registra reconhecimento de alterações em Estruturas do Corpo que configuram maiores limitações do que as observadas em Funções do Corpo.';
  if (reason === 'prognostico') return 'Motivo indisponível: a base administrativa já registra reconhecimento de prognóstico desfavorável pelo INSS.';
  return 'Motivo indisponível para esta base administrativa.';
}

export function resolveCorpoJudFlow({
  base,
  med,
  isCorpoReasonBlocked,
  getCorpoReasonBlockedMessage,
  corpoDomainIds,
  qLabels
}) {
  if (!base) return { ready: false, q: null, reason: 'Fixe a base administrativa antes da requalificação de Funções do Corpo.', mode: 'pending' };
  if (med.corpoKeepAdmin == null) return { ready: false, q: null, reason: 'Em Funções do Corpo, informe se o qualificador administrativo será mantido.', mode: 'pending' };

  if (med.corpoKeepAdmin) {
    return {
      ready: true,
      q: base.corpo,
      mode: 'mantido',
      reason: 'Qualificador administrativo de Funções do Corpo mantido na fase judicial.',
      decreased: false
    };
  }

  if (!med.corpoChangeReason) {
    return { ready: false, q: null, reason: 'Selecione o motivo da alteração de Funções do Corpo.', mode: 'pending' };
  }

  if (isCorpoReasonBlocked(med.corpoChangeReason)) {
    return { ready: false, q: null, reason: getCorpoReasonBlockedMessage(med.corpoChangeReason), mode: 'blocked' };
  }

  if (med.corpoChangeReason === 'estruturas') {
    const q = Math.min(base.corpo + 1, 4);
    return {
      ready: true,
      q,
      mode: 'estruturas',
      reason: 'Regra aplicada: majoração de +1 por alterações em Estruturas do Corpo que configuram maiores limitações do que as observadas em Funções do Corpo, não reconhecidas na fase administrativa.',
      decreased: q < base.corpo
    };
  }

  if (med.corpoChangeReason === 'prognostico') {
    const q = Math.min(base.corpo + 1, 4);
    return {
      ready: true,
      q,
      mode: 'prognostico',
      reason: 'Regra aplicada: majoração de +1 por prognóstico desfavorável não reconhecido na fase administrativa.',
      decreased: q < base.corpo
    };
  }

  if (med.corpoChangeReason === 'dominio_max') {
    const filledDomains = corpoDomainIds.filter(id => med.corpoAdminDomains[id] != null);
    if (!filledDomains.length) {
      return { ready: false, q: null, reason: 'No motivo "Domínio administrativo b1–b8 mais grave", informe ao menos um domínio b1 a b8.', mode: 'pending' };
    }
    const q = filledDomains.reduce((acc, id) => Math.max(acc, med.corpoAdminDomains[id]), 0);
    return {
      ready: true,
      q,
      mode: 'dominio_max',
      reason: 'Regra aplicada: para Funções do Corpo prevalece o domínio administrativo mais grave entre os domínios informados (b1–b8).',
      domainsText: filledDomains.map(id => `${id.toUpperCase()}=${qLabels[med.corpoAdminDomains[id]]}`).join(' · '),
      decreased: q < base.corpo
    };
  }

  if (med.corpoChangeReason === 'rebaixamento') {
    if (med.corpoJudManual == null) {
      return { ready: false, q: null, reason: 'No motivo "Rebaixamento por prova superveniente", selecione o qualificador judicial de Funções do Corpo.', mode: 'pending' };
    }
    const decreased = med.corpoJudManual < base.corpo;
    if (decreased && !med.corpoAlertReductionConfirmed) {
      return {
        ready: false,
        q: med.corpoJudManual,
        reason: 'Confirme a redução do qualificador de Funções do Corpo para prosseguir.',
        mode: 'rebaixamento',
        decreased: true,
        needsReductionConfirm: true
      };
    }
    return {
      ready: true,
      q: med.corpoJudManual,
      mode: 'rebaixamento',
      reason: 'Regra aplicada: rebaixamento por prova superveniente, com fixação manual do qualificador judicial.',
      decreased
    };
  }

  return { ready: false, q: null, reason: 'Motivo de alteração de Funções do Corpo inválido.', mode: 'invalid' };
}

export function getMedBlockingReason({
  adminBase,
  med,
  resolveCorpoJudFlow,
  getAtivReclassContext,
  updateAtivMedComputed
}) {
  if (!adminBase) return 'Fixe a base administrativa para iniciar a etapa médica.';
  if (med.impedimentoLP == null) return 'Informe se há impedimento de longo prazo.';

  const corpoFlow = resolveCorpoJudFlow();
  if (!corpoFlow.ready || corpoFlow.q == null) return corpoFlow.reason;

  const ativContext = getAtivReclassContext(corpoFlow);
  if (!ativContext.showQuestion) return '';
  if (med.hasAtivMed == null) return 'Informe se a perícia médica trouxe elementos para requalificar Atividades e Participação.';
  if (!med.hasAtivMed) return '';
  if (med.ativMode == null) return 'Selecione o modo de requalificação de Atividades e Participação (simples ou completa).';

  if (med.ativMode === 'simples') {
    if (med.ativMedSimple == null) return 'No modo simples, selecione o qualificador final de Atividades e Participação.';
    if (!med.ativMedJustification.trim()) return 'No modo simples, informe a justificativa médica de Atividades e Participação.';
    return '';
  }

  if (med.ativMode === 'completa') {
    const computed = updateAtivMedComputed();
    if (!computed) return 'No modo completo de Atividades e Participação, preencha todos os domínios d1 a d9.';
    return '';
  }

  return 'Modo de requalificação de Atividades e Participação inválido.';
}

export function computeJudicialTriage({
  adminBase,
  med,
  isAdminDraftDirty,
  resolveCorpoJudFlow,
  getAtivReclassContext,
  getMedBlockingReason,
  resolveAtivMed,
  tabelaConclusiva
}) {
  if (!adminBase) {
    return { ready: false, status: 'pending', testeA: null, testeB: null, reason: 'Fixe a base administrativa para iniciar a triagem.', route: 'pendente_base' };
  }
  if (isAdminDraftDirty()) {
    return { ready: false, status: 'pending', testeA: null, testeB: null, reason: 'Há alterações no rascunho administrativo. Refixe a base antes da triagem.', route: 'pendente_refixacao' };
  }

  const base = adminBase;
  const corpoFlow = resolveCorpoJudFlow();
  const corpoJud = corpoFlow.q;
  const ativContext = getAtivReclassContext(corpoFlow);
  const medBlock = getMedBlockingReason();
  const ativMedResolved = resolveAtivMed();

  if (medBlock) {
    return { ready: false, status: 'pending', testeA: null, testeB: null, reason: medBlock, route: 'pendente_medica' };
  }

  if (med.impedimentoLP === false) {
    return {
      ready: true,
      status: 'dispensa',
      testeA: null,
      testeB: null,
      reason: 'A perícia médica judicial não reconheceu impedimento de longo prazo; nesta triagem, a avaliação social judicial é dispensável.',
      route: 'sem_impedimento_lp'
    };
  }

  const testeA = tabelaConclusiva(base.amb, base.ativ, corpoJud);
  if (testeA) {
    const modeLabel = corpoFlow.mode === 'mantido'
      ? 'mantendo-se Funções do Corpo no patamar administrativo'
      : 'com reclassificação de Funções do Corpo';
    return {
      ready: true,
      status: 'dispensa',
      testeA,
      testeB: null,
      reason: `Resultado positivo na verificação com manutenção de Fatores Ambientais e Atividades e Participação administrativas, ${modeLabel}.`,
      route: 'verificacao_administrativa_positiva'
    };
  }

  if (!ativContext.showQuestion && ativContext.code === 'corpo_nl') {
    return {
      ready: true,
      status: 'dispensa',
      testeA,
      testeB: null,
      reason: 'Com Funções do Corpo judiciais em N/L, a reclassificação de Atividades e Participação não altera o desfecho da Tabela Conclusiva; a avaliação social judicial é dispensável para esta triagem.',
      route: 'corpo_nl_irrelevante'
    };
  }

  let testeB = null;
  if (ativContext.showQuestion && med.hasAtivMed) {
    testeB = tabelaConclusiva(base.amb, ativMedResolved, corpoJud);
    if (testeB) {
      const modo = med.ativMode === 'completa' ? 'modo completo (fórmula d1–d9)' : 'modo simples';
      return {
        ready: true,
        status: 'dispensa',
        testeA,
        testeB,
        reason: `Resultado positivo na verificação com reclassificação médica de Atividades e Participação (${modo}).`,
        route: 'verificacao_atividades_medicas_positiva'
      };
    }
  }

  return {
    ready: true,
    status: 'necessaria',
    testeA,
    testeB,
    reason: 'A prova médica isolada não produziu resultado positivo nas verificações disponíveis; recomenda-se avaliação social judicial com potencial de requalificação de Fatores Ambientais e Atividades e Participação.',
    route: 'avaliacao_social_necessaria'
  };
}
