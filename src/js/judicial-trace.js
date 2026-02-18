export function createCorpoFlowTraceLineElement({ corpoFlow, adminBase, med, reasonLabels, qLabels, createTraceLine }) {
  if (!adminBase) {
    return createTraceLine('<strong>Funções do Corpo</strong>: base administrativa não fixada.');
  }
  if (med.corpoKeepAdmin == null) {
    return createTraceLine('<strong>Funções do Corpo</strong>: aguardando decisão sobre manter ou alterar o qualificador administrativo.');
  }
  if (med.corpoKeepAdmin) {
    return createTraceLine(`<strong>Funções do Corpo</strong>: qualificador administrativo mantido em <strong>${qLabels[adminBase.corpo]}</strong>.`);
  }
  if (!med.corpoChangeReason) {
    return createTraceLine('<strong>Funções do Corpo</strong>: aguardando seleção do motivo da alteração.');
  }
  if (!corpoFlow.ready && corpoFlow.q == null) {
    return createTraceLine(`<strong>Funções do Corpo</strong>: ${corpoFlow.reason}`);
  }

  const motivo = reasonLabels[med.corpoChangeReason] || 'Motivo não identificado';
  const details = corpoFlow.mode === 'dominio_max' && corpoFlow.domainsText ? ` Domínios: ${corpoFlow.domainsText}.` : '';
  const pendencia = !corpoFlow.ready ? ` Pendência: ${corpoFlow.reason}` : '';
  return createTraceLine(`<strong>Funções do Corpo</strong>: motivo "${motivo}". ${corpoFlow.reason} Resultado judicial: <strong>${qLabels[corpoFlow.q]}</strong>.${details}${pendencia}`);
}

export function createAtivMedTraceLineElement({
  ativContext,
  med,
  resolveAtivMed,
  computeAtivFromDomains,
  ativDomainIds,
  qLabels,
  createTraceLine
}) {
  if (ativContext && !ativContext.showQuestion) {
    return createTraceLine(`<strong>Reclassificação médica de Atividades e Participação</strong>: não aplicável. ${ativContext.reason}`);
  }
  if (med.hasAtivMed !== true) {
    return createTraceLine('<strong>Origem da reclassificação médica de Atividades e Participação</strong>: não aplicada (sem elementos médicos para requalificar Atividades e Participação).');
  }

  const ativMedResolved = resolveAtivMed();
  if (med.ativMode === 'simples') {
    const raw = med.ativMedJustification.trim();
    const preview = raw.length > 160 ? `${raw.slice(0, 157)}...` : raw;
    const line = document.createElement('div');
    line.className = 'jc-trace-line';
    line.innerHTML = `<strong>Origem da reclassificação médica de Atividades e Participação</strong>: modo simples, qualificador final de Atividades e Participação em <strong>${qLabels[ativMedResolved]}</strong>; justificativa médica: `;
    line.appendChild(document.createTextNode(`"${preview}".`));
    return line;
  }

  if (med.ativMode === 'completa') {
    const computed = med.ativMedComputed || computeAtivFromDomains(med.ativMedDomains);
    const details = ativDomainIds.map(id => `${id.toUpperCase()}=${qLabels[med.ativMedDomains[id]]}`).join(' · ');
    if (!computed) {
      return createTraceLine('<strong>Origem da reclassificação médica de Atividades e Participação</strong>: modo completo (d1–d9) ainda incompleto.');
    }
    return createTraceLine(`<strong>Origem da reclassificação médica de Atividades e Participação</strong>: modo completo (${details}); Σ=${computed.sum}, %=${computed.pct}, qualificador final de Atividades e Participação em <strong>${qLabels[computed.q]}</strong>.`);
  }

  return createTraceLine('<strong>Origem da reclassificação médica de Atividades e Participação</strong>: modo não definido.');
}
