export function bindQGroup(groupId, onPick, onRender) {
  document.getElementById(groupId).addEventListener('click', e => {
    const btn = e.target.closest('.jc-q-btn');
    if (!btn) return;
    onPick(+btn.dataset.value);
    onRender();
  });
}

export function bindSegmented(groupId, onPick, onRender) {
  document.getElementById(groupId).addEventListener('click', e => {
    const btn = e.target.closest('.jc-seg-btn');
    if (!btn) return;
    onPick(btn.dataset.value);
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
  clearJudicialMedicalAndTriage
}) {
  bindQGroup('jcAdminAmbButtons', value => {
    judicialControl.adminDraft.amb = value;
    clearJudicialTextArea();
  }, renderJudicialControl);

  bindQGroup('jcAdminAtivButtons', value => {
    judicialControl.adminDraft.ativ = value;
    clearJudicialTextArea();
  }, renderJudicialControl);

  bindQGroup('jcAdminCorpoButtons', value => {
    judicialControl.adminDraft.corpo = value;
    clearJudicialTextArea();
  }, renderJudicialControl);

  bindSegmented('jcAdminEstruturasRecButtons', value => {
    judicialControl.adminDraft.corpoReconhecimentoInss.estruturasReconhecidas = value === 'sim';
    clearJudicialTextArea();
  }, renderJudicialControl);

  bindSegmented('jcAdminProgRecButtons', value => {
    judicialControl.adminDraft.corpoReconhecimentoInss.prognosticoReconhecido = value === 'sim';
    clearJudicialTextArea();
  }, renderJudicialControl);

  bindSegmented('jcCorpoKeepButtons', value => {
    if (!judicialControl.adminBase) return;
    judicialControl.med.corpoKeepAdmin = value === 'sim';
    resetCorpoChangeDetails();
    if (judicialControl.med.corpoKeepAdmin) {
      judicialControl.med.corpoJud = judicialControl.adminBase.corpo;
    }
    clearJudicialTextArea();
  }, renderJudicialControl);

  bindQGroup('jcCorpoManualButtons', value => {
    if (!judicialControl.adminBase || judicialControl.med.corpoKeepAdmin !== false || judicialControl.med.corpoChangeReason !== 'rebaixamento') return;
    judicialControl.med.corpoJudManual = value;
    judicialControl.med.corpoAlertReductionConfirmed = false;
    clearJudicialTextArea();
  }, renderJudicialControl);

  JC_CORPO_RECLASS_DOMAINS.forEach(id => {
    bindQGroup(`jcCorpo${id.toUpperCase()}Buttons`, value => {
      if (!judicialControl.adminBase || judicialControl.med.corpoKeepAdmin !== false || judicialControl.med.corpoChangeReason !== 'dominio_max') return;
      judicialControl.med.corpoAdminDomains[id] = value;
      judicialControl.med.corpoAlertReductionConfirmed = false;
      clearJudicialTextArea();
    }, renderJudicialControl);
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
    renderJudicialControl();
  });

  document.getElementById('jcCorpoReductionConfirm').addEventListener('change', e => {
    if (!judicialControl.adminBase) return;
    judicialControl.med.corpoAlertReductionConfirmed = e.target.checked;
    clearJudicialTextArea();
    renderJudicialControl();
  });

  bindQGroup('jcAtivMedSimpleButtons', value => {
    if (!judicialControl.adminBase || judicialControl.med.hasAtivMed !== true || judicialControl.med.ativMode !== 'simples') return;
    judicialControl.med.ativMedSimple = value;
    clearJudicialTextArea();
  }, renderJudicialControl);

  JC_ATIV_RECLASS_DOMAINS.forEach(id => {
    bindQGroup(`jcAtiv${id.toUpperCase()}Buttons`, value => {
      if (!judicialControl.adminBase || judicialControl.med.hasAtivMed !== true || judicialControl.med.ativMode !== 'completa') return;
      judicialControl.med.ativMedDomains[id] = value;
      judicialControl.med.ativMedComputed = computeAtivFromDomains(judicialControl.med.ativMedDomains);
      clearJudicialTextArea();
    }, renderJudicialControl);
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
  }, renderJudicialControl);

  bindSegmented('jcImpedimentoButtons', value => {
    if (!judicialControl.adminBase) return;
    judicialControl.med.impedimentoLP = value === 'sim';
    clearJudicialTextArea();
  }, renderJudicialControl);

  bindSegmented('jcHasAtivMedButtons', value => {
    if (!judicialControl.adminBase) return;
    const ativContext = getAtivReclassContext(resolveCorpoJudFlow());
    if (!ativContext.showQuestion) return;
    judicialControl.med.hasAtivMed = value === 'sim';
    if (!judicialControl.med.hasAtivMed) resetAtivMedReclassFields();
    clearJudicialTextArea();
  }, renderJudicialControl);

  document.getElementById('jcAtivMedJustification').addEventListener('input', e => {
    if (!judicialControl.adminBase || judicialControl.med.hasAtivMed !== true) return;
    judicialControl.med.ativMedJustification = e.target.value;
    clearJudicialTextArea();
    renderJudicialControl();
  });

  document.getElementById('btnGerarControleTexto').addEventListener('click', () => {
    renderJudicialControlText();
    document.getElementById('copyFeedbackControle').textContent = '';
  });

  document.getElementById('btnGerarCopiarControleTexto').addEventListener('click', generateAndCopyJudicialText);
  document.getElementById('btnCopiarControleTexto').addEventListener('click', copyJudicialControlText);
  document.getElementById('btnLimparControleJudicial').addEventListener('click', clearJudicialMedicalAndTriage);
}
