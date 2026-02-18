export function bindQGroup(groupId, onPick, onRender, onInteraction = null) {
  document.getElementById(groupId).addEventListener('click', e => {
    const btn = e.target.closest('.jc-q-btn');
    if (!btn) return;
    onPick(+btn.dataset.value);
    if (onInteraction) onInteraction(groupId);
    onRender();
  });
}

export function bindSegmented(groupId, onPick, onRender, onInteraction = null) {
  document.getElementById(groupId).addEventListener('click', e => {
    const btn = e.target.closest('.jc-seg-btn');
    if (!btn) return;
    onPick(btn.dataset.value);
    if (onInteraction) onInteraction(groupId);
    onRender();
  });
}

export function bindJudicialControlEvents({
  judicialControl,
  JC_CORPO_RECLASS_DOMAINS,
  JC_ATIV_RECLASS_DOMAINS,
  clearJudicialTextArea,
  resetCorpoChangeDetails,
  isCorpoReasonBlocked,
  renderJudicialControl,
  computeAtivFromDomains,
  createEmptyAtivReclassDomains,
  getAtivReclassContext,
  resolveCorpoJudFlow,
  resetAtivMedReclassFields,
  renderJudicialControlText,
  generateAndCopyJudicialText,
  copyJudicialControlText,
  clearJudicialMedicalAndTriage,
  notifyInteraction = () => {}
}) {
  bindQGroup('jcAdminAmbButtons', value => {
    judicialControl.adminDraft.amb = value;
    clearJudicialTextArea();
  }, renderJudicialControl, notifyInteraction);

  bindQGroup('jcAdminAtivButtons', value => {
    judicialControl.adminDraft.ativ = value;
    clearJudicialTextArea();
  }, renderJudicialControl, notifyInteraction);

  bindQGroup('jcAdminCorpoButtons', value => {
    judicialControl.adminDraft.corpo = value;
    clearJudicialTextArea();
  }, renderJudicialControl, notifyInteraction);

  bindSegmented('jcAdminEstruturasRecButtons', value => {
    judicialControl.adminDraft.corpoReconhecimentoInss.estruturasReconhecidas = value === 'sim';
    clearJudicialTextArea();
  }, renderJudicialControl, notifyInteraction);

  bindSegmented('jcAdminProgRecButtons', value => {
    judicialControl.adminDraft.corpoReconhecimentoInss.prognosticoReconhecido = value === 'sim';
    clearJudicialTextArea();
  }, renderJudicialControl, notifyInteraction);

  bindSegmented('jcCorpoKeepButtons', value => {
    if (!judicialControl.adminBase) return;
    judicialControl.med.corpoKeepAdmin = value === 'sim';
    resetCorpoChangeDetails();
    if (judicialControl.med.corpoKeepAdmin) {
      judicialControl.med.corpoJud = judicialControl.adminBase.corpo;
    }
    clearJudicialTextArea();
  }, renderJudicialControl, notifyInteraction);

  bindQGroup('jcCorpoManualButtons', value => {
    if (!judicialControl.adminBase || judicialControl.med.corpoKeepAdmin !== false || judicialControl.med.corpoChangeReason !== 'rebaixamento') return;
    judicialControl.med.corpoJudManual = value;
    judicialControl.med.corpoAlertReductionConfirmed = false;
    clearJudicialTextArea();
  }, renderJudicialControl, notifyInteraction);

  JC_CORPO_RECLASS_DOMAINS.forEach(id => {
    bindQGroup(`jcCorpo${id.toUpperCase()}Buttons`, value => {
      if (!judicialControl.adminBase || judicialControl.med.corpoKeepAdmin !== false || judicialControl.med.corpoChangeReason !== 'dominio_max') return;
      judicialControl.med.corpoAdminDomains[id] = value;
      judicialControl.med.corpoAlertReductionConfirmed = false;
      clearJudicialTextArea();
    }, renderJudicialControl, notifyInteraction);
  });

  document.getElementById('jcCorpoReasonSelect').addEventListener('change', e => {
    if (!judicialControl.adminBase || judicialControl.med.corpoKeepAdmin !== false) return;
    const nextReason = e.target.value || null;
    if (nextReason && isCorpoReasonBlocked(nextReason)) {
      e.target.value = '';
      return;
    }
    resetCorpoChangeDetails();
    judicialControl.med.corpoChangeReason = nextReason;
    clearJudicialTextArea();
    notifyInteraction('jcCorpoReasonSelect');
    renderJudicialControl();
  });

  document.getElementById('jcCorpoReductionConfirm').addEventListener('change', e => {
    if (!judicialControl.adminBase) return;
    judicialControl.med.corpoAlertReductionConfirmed = e.target.checked;
    clearJudicialTextArea();
    notifyInteraction('jcCorpoReductionConfirm');
    renderJudicialControl();
  });

  bindQGroup('jcAtivMedSimpleButtons', value => {
    if (!judicialControl.adminBase || judicialControl.med.hasAtivMed !== true || judicialControl.med.ativMode !== 'simples') return;
    judicialControl.med.ativMedSimple = value;
    clearJudicialTextArea();
  }, renderJudicialControl, notifyInteraction);

  JC_ATIV_RECLASS_DOMAINS.forEach(id => {
    bindQGroup(`jcAtiv${id.toUpperCase()}Buttons`, value => {
      if (!judicialControl.adminBase || judicialControl.med.hasAtivMed !== true || judicialControl.med.ativMode !== 'completa') return;
      judicialControl.med.ativMedDomains[id] = value;
      judicialControl.med.ativMedComputed = computeAtivFromDomains(judicialControl.med.ativMedDomains);
      clearJudicialTextArea();
    }, renderJudicialControl, notifyInteraction);
  });

  bindSegmented('jcAtivModeButtons', value => {
    if (!judicialControl.adminBase || judicialControl.med.hasAtivMed !== true) return;
    judicialControl.med.ativMode = value;
    if (value === 'simples') {
      judicialControl.med.ativMedDomains = createEmptyAtivReclassDomains();
      judicialControl.med.ativMedComputed = null;
    } else if (value === 'completa') {
      judicialControl.med.ativMedSimple = null;
      judicialControl.med.ativMedJustification = '';
      judicialControl.med.ativMedComputed = computeAtivFromDomains(judicialControl.med.ativMedDomains);
    }
    clearJudicialTextArea();
  }, renderJudicialControl, notifyInteraction);

  bindSegmented('jcImpedimentoButtons', value => {
    if (!judicialControl.adminBase) return;
    judicialControl.med.impedimentoLP = value === 'sim';
    clearJudicialTextArea();
  }, renderJudicialControl, notifyInteraction);

  bindSegmented('jcHasAtivMedButtons', value => {
    if (!judicialControl.adminBase) return;
    const ativContext = getAtivReclassContext(resolveCorpoJudFlow());
    if (!ativContext.showQuestion) return;
    judicialControl.med.hasAtivMed = value === 'sim';
    if (!judicialControl.med.hasAtivMed) resetAtivMedReclassFields();
    clearJudicialTextArea();
  }, renderJudicialControl, notifyInteraction);

  document.getElementById('jcAtivMedJustification').addEventListener('input', e => {
    if (!judicialControl.adminBase || judicialControl.med.hasAtivMed !== true) return;
    judicialControl.med.ativMedJustification = e.target.value;
    clearJudicialTextArea();
    notifyInteraction('jcAtivMedJustification');
    renderJudicialControl();
  });

  document.getElementById('btnGerarControleTexto').addEventListener('click', () => {
    renderJudicialControlText();
    document.getElementById('copyFeedbackControle').textContent = '';
  });

  document.getElementById('btnGerarCopiarControleTexto').addEventListener('click', generateAndCopyJudicialText);
  document.getElementById('btnCopiarControleTexto').addEventListener('click', copyJudicialControlText);
  document.getElementById('btnLimparControleJudicial').addEventListener('click', () => {
    notifyInteraction('btnLimparControleJudicial');
    clearJudicialMedicalAndTriage();
  });
}
