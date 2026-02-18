import {
  CHILD_AGE_LIMIT_MONTHS,
  DOM_AMB,
  DOM_ATIV_M,
  DOM_ATIV_S,
  DOM_CORPO,
  JC_ATIV_RECLASS_DOMAINS,
  JC_CORPO_REASON_LABELS,
  JC_CORPO_RECLASS_DOMAINS,
  Q_FULL,
  Q_LABELS,
  Q_NAMES
} from './constants.js';
import {
  createDomainNameById,
  createDomainState,
  createEmptyAdminCorpoRecognition as createEmptyAdminCorpoRecognitionState,
  createEmptyAtivReclassDomains as createEmptyAtivReclassDomainsState,
  createEmptyCorpoReclassDomains as createEmptyCorpoReclassDomainsState,
  createEmptyJudicialMed as createEmptyJudicialMedState,
  createJudicialControl
} from './state.js';
import {
  calcAmbienteFromState,
  calcAtividadesFromState,
  calcCorpoFromState,
  computeAtivFromDomains as computeAtivFromDomainsFromState,
  getDecisionReason as getDecisionReasonFromScale,
  pctToQ,
  tabelaConclusiva
} from './calculations.js';
import {
  buildDomainRows as buildDomainRowsView,
  buildTabelaGrid as buildTabelaGridView
} from './dom-builders.js';
import { initStaticRatingA11yLabels } from './a11y.js';
import { highlightActiveCell, runMainUpdate } from './ui-render.js';
import { bindJudicialControlEvents } from './events.js';
import {
  computeJudicialTriage as computeJudicialTriageFlow,
  getAtivReclassContext as getAtivReclassContextFlow,
  getCorpoReasonBlockedMessage as getCorpoReasonBlockedMessageFlow,
  getMedBlockingReason as getMedBlockingReasonFlow,
  isCorpoReasonBlocked as isCorpoReasonBlockedFlow,
  resolveAtivMed as resolveAtivMedFlow,
  resolveCorpoJudFlow as resolveCorpoJudFlowFlow
} from './judicial-flow.js';
import {
  createAtivMedTraceLineElement,
  createCorpoFlowTraceLineElement
} from './judicial-trace.js';
import { buildJudicialControlText } from './judicial-text.js';
import { bindAppEvents } from './app-events.js';

// ============ STATE ============
const ALL_DOMAINS = [...DOM_AMB, ...DOM_CORPO, ...DOM_ATIV_M, ...DOM_ATIV_S];
const ATIV_DOMAINS = [...DOM_ATIV_M, ...DOM_ATIV_S];
const state = createDomainState(ALL_DOMAINS);
const domainNameById = createDomainNameById(ALL_DOMAINS);
let progDesfav = false, estrMaior = false, impedimento = false, crianca = false, idadeMeses = CHILD_AGE_LIMIT_MONTHS, idadeValor = 15, idadeUnidade = 'anos';
let savedINSS = null;
let uiMode = 'controle';

function createEmptyAdminCorpoRecognition() {
  return createEmptyAdminCorpoRecognitionState();
}

function createEmptyCorpoReclassDomains() {
  return createEmptyCorpoReclassDomainsState(JC_CORPO_RECLASS_DOMAINS);
}

function createEmptyAtivReclassDomains() {
  return createEmptyAtivReclassDomainsState(JC_ATIV_RECLASS_DOMAINS);
}

function createEmptyJudicialMed() {
  return createEmptyJudicialMedState(JC_CORPO_RECLASS_DOMAINS, JC_ATIV_RECLASS_DOMAINS);
}

const judicialControl = createJudicialControl(JC_CORPO_RECLASS_DOMAINS, JC_ATIV_RECLASS_DOMAINS);
let currentAmbTab = 0;
const childDomainBackup = {};
const userFilledDomains = new Set();
let pendingJudicialInteraction = null;

const JC_STEP_GUIDANCE = {
  admin: { box: 'jcAdminGuidance', text: 'jcAdminGuidanceText' },
  med: { box: 'jcMedGuidance', text: 'jcMedGuidanceText' },
  triagem: { box: 'jcTriagemGuidance', text: 'jcTriagemGuidanceText' },
  texto: { box: 'jcTextoGuidance', text: 'jcTextoGuidanceText' }
};

// ============ CALCULATION ============
function calcAmbiente() {
  return calcAmbienteFromState(state, DOM_AMB, pctToQ);
}

function calcAtividades() {
  return calcAtividadesFromState(state, ATIV_DOMAINS, pctToQ);
}

function calcCorpo() {
  return calcCorpoFromState(state, DOM_CORPO, { progDesfav, estrMaior });
}

function getDecisionReason(ambQ, ativQ, corpoQ, yes) {
  return getDecisionReasonFromScale(ambQ, ativQ, corpoQ, yes, Q_LABELS, Q_NAMES);
}
function iconMarkup(name, cls = 'ui-icon') {
  return `<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
}
function setDecisionIcon(name) {
  document.getElementById('decIcon').innerHTML = iconMarkup(name, 'ui-icon lg');
}
function getItemNumber(amb, ativ, corpo) {
  // Items ordered: corpo C→N, for each corpo: ativ C→N, for each ativ: amb C→N
  const corpoOrder = [4, 3, 2, 1, 0], ativOrder = [4, 3, 2, 1, 0], ambOrder = [4, 3, 2, 1, 0];
  let n = 0;
  for (const c of corpoOrder) for (const a of ativOrder) for (const e of ambOrder) {
    n++; if (c === corpo && a === ativ && e === amb) return n;
  }
  return n;
}

function createTraceLine(html) {
  const div = document.createElement('div');
  div.className = 'jc-trace-line';
  div.innerHTML = html;
  return div;
}

function computeAtivFromDomains(domains) {
  return computeAtivFromDomainsFromState(domains, JC_ATIV_RECLASS_DOMAINS, pctToQ);
}

function updateAtivMedComputed() {
  const m = judicialControl.med;
  if (m.ativMode !== 'completa' || m.hasAtivMed !== true) {
    m.ativMedComputed = null;
    return null;
  }
  m.ativMedComputed = computeAtivFromDomains(m.ativMedDomains);
  return m.ativMedComputed;
}

function resolveAtivMed() {
  return resolveAtivMedFlow({
    med: judicialControl.med,
    computeAtivFromDomains
  });
}

function getAtivReclassContext(corpoFlowParam = null) {
  return getAtivReclassContextFlow({
    base: judicialControl.adminBase,
    med: judicialControl.med,
    corpoFlow: corpoFlowParam || resolveCorpoJudFlow(),
    tabelaConclusiva
  });
}

function isCorpoReasonBlocked(reason) {
  return isCorpoReasonBlockedFlow({
    base: judicialControl.adminBase,
    reason
  });
}

function getCorpoReasonBlockedMessage(reason) {
  return getCorpoReasonBlockedMessageFlow(reason);
}

function resolveCorpoJudFlow() {
  return resolveCorpoJudFlowFlow({
    base: judicialControl.adminBase,
    med: judicialControl.med,
    isCorpoReasonBlocked,
    getCorpoReasonBlockedMessage,
    corpoDomainIds: JC_CORPO_RECLASS_DOMAINS,
    qLabels: Q_LABELS
  });
}

function getCorpoFlowTraceLineElement(corpoFlow) {
  return createCorpoFlowTraceLineElement({
    corpoFlow,
    adminBase: judicialControl.adminBase,
    med: judicialControl.med,
    reasonLabels: JC_CORPO_REASON_LABELS,
    qLabels: Q_LABELS,
    createTraceLine
  });
}

// ============ DOM BUILDERS ============
function buildDomainRows(container, domains) {
  buildDomainRowsView(container, domains, Q_LABELS, Q_NAMES);
}
let lastAmbTabForGrid = null;
function buildTabelaGrid() {
  if (lastAmbTabForGrid === currentAmbTab) return;
  lastAmbTabForGrid = currentAmbTab;
  buildTabelaGridView(document.getElementById('tGrid'), Q_LABELS, currentAmbTab, tabelaConclusiva);
}

// ============ UI UPDATE ============
function update() {
  runMainUpdate({
    calcAmbiente,
    calcAtividades,
    calcCorpo,
    qLabels: Q_LABELS,
    qNames: Q_NAMES,
    qFull: Q_FULL,
    impedimento,
    tabelaConclusiva,
    getDecisionReason,
    getItemNumber,
    setDecisionIcon,
    setCurrentAmbTab: value => { currentAmbTab = value; },
    buildTabelaGrid,
    savedINSS,
    updateComparison,
    renderStandardText,
    uiMode,
    updateAdminAutofillShortcut
  });
}

// ============ EVENT HANDLERS ============
function handleDomainButtonClick({ button, group, domain, value }) {
  if (!button || button.classList.contains('locked')) return;
  group.querySelectorAll('.note-btn').forEach(noteButton => noteButton.classList.remove('active'));
  button.classList.add('active');
  state[domain] = value;
  userFilledDomains.add(domain);
  update();
}

function handleToggleProg(checked) {
  progDesfav = checked;
  update();
}

function handleToggleEstr(checked) {
  estrMaior = checked;
  update();
}

function handleToggleImpedimento(checked) {
  impedimento = checked;
  update();
}

function handleToggleDark(checked) {
  document.documentElement.dataset.theme = checked ? 'dark' : '';
}

// Children mode by explicit selection
function getAgeBounds(unit) {
  return unit === 'anos' ? { min: 0, max: 15 } : { min: 0, max: 191 };
}
function valueToMonths(value, unit) {
  return unit === 'anos' ? value * 12 : value;
}
function syncChildModeByControls() {
  const wrap = document.getElementById('idadeWrap');
  const input = document.getElementById('inputIdade');
  const unitSel = document.getElementById('inputIdadeUnidade');
  const faixa = document.getElementById('faixaEtaria');

  wrap.classList.toggle('hidden', !crianca);
  idadeUnidade = unitSel.value;
  const bounds = getAgeBounds(idadeUnidade);
  input.min = bounds.min;
  input.max = bounds.max;
  input.step = 1;

  if (!crianca) {
    idadeMeses = CHILD_AGE_LIMIT_MONTHS;
    faixa.textContent = 'Padrão: 16 anos ou mais';
    document.getElementById('childAutoSummary').classList.add('hidden');
    return;
  }

  idadeValor = Math.max(bounds.min, Math.min(bounds.max, Math.floor(+input.value || 0)));
  input.value = idadeValor;
  idadeMeses = valueToMonths(idadeValor, idadeUnidade);
  faixa.textContent = `${idadeMeses} meses`;
}
function handleToggleMenor16(checked) {
  crianca = checked;
  syncChildModeByControls();
  applyChildRules();
  update();
}

function handleInputIdade() {
  syncChildModeByControls();
  applyChildRules();
  update();
}

function handleChangeIdadeUnidade(nextUnit) {
  const input = document.getElementById('inputIdade');
  const currentValue = Math.max(0, Math.floor(+input.value || 0));
  const currentMonths = valueToMonths(currentValue, idadeUnidade);
  input.value = nextUnit === 'anos' ? Math.floor(currentMonths / 12) : currentMonths;
  syncChildModeByControls();
  applyChildRules();
  update();
}

function applyChildRules() {
  [...DOM_ATIV_M, ...DOM_ATIV_S].forEach(d => {
    const btns = document.querySelectorAll(`[data-domain="${d.id}"] .note-btn`);
    if (crianca && idadeMeses < d.cut) {
      if (!(d.id in childDomainBackup)) childDomainBackup[d.id] = state[d.id];
      state[d.id] = 4;
      btns.forEach(b => {
        b.classList.toggle('active', +b.dataset.value === 4);
        b.classList.add('locked');
      });
    } else {
      if (d.id in childDomainBackup) {
        state[d.id] = childDomainBackup[d.id];
        delete childDomainBackup[d.id];
      }
      btns.forEach(b => {
        b.classList.remove('locked');
        b.classList.toggle('active', +b.dataset.value === state[d.id]);
      });
    }
  });
  updateChildAutoSummary();
}

function handleAmbTabClick({ tab, value }) {
  currentAmbTab = value;
  document.querySelectorAll('.amb-tab').forEach(ambTab => ambTab.classList.remove('active'));
  tab.classList.add('active');
  buildTabelaGrid();
  const ativ = calcAtividades();
  const corpo = calcCorpo();
  highlightActiveCell(ativ.q, corpo.q);
}

// Padrão Médio Social
function handleApplyPadrao() {
  const padrao = { e1: 2, e2: 2, e3: 2, e4: 1, e5: 2, d6: 3, d7: 2, d8: 3, d9: 3 };
  const padraoEntries = Object.entries(padrao);
  const overwriteFilled = document.getElementById('togglePadraoOverwrite').checked;
  let skippedByAgeCut = 0;
  const eligibleEntries = padraoEntries.filter(([id]) => {
    if (crianca) {
      const d = [...DOM_ATIV_M, ...DOM_ATIV_S].find(x => x.id === id);
      if (d && idadeMeses < d.cut) { skippedByAgeCut++; return false; }
    }
    return true;
  });
  const manuallyFilledEligible = eligibleEntries.filter(([id]) => userFilledDomains.has(id));
  const entriesToApply = overwriteFilled
    ? eligibleEntries
    : eligibleEntries.filter(([id]) => !userFilledDomains.has(id));

  if (!eligibleEntries.length) {
    alert('Padrão Médio Social não aplicado: nenhum domínio está elegível em razão dos pontos de corte etários.');
    return;
  }

  if (!entriesToApply.length) {
    alert('Padrão Médio Social não aplicado: todos os domínios elegíveis já foram preenchidos manualmente e a sobrescrita está desativada.');
    return;
  }

  if (!overwriteFilled && manuallyFilledEligible.length > 0) {
    const appliedList = entriesToApply.map(([id]) => `${id.toUpperCase()} (${domainNameById[id]})`).join(', ');
    const confirmMessage = [
      'Foram encontrados domínios do Padrão Médio Social já preenchidos manualmente.',
      '',
      'Como a opção "Sobrescrever domínios preenchidos" está desativada, esses domínios serão preservados.',
      `Serão atualizados ${entriesToApply.length} domínio(s):`,
      appliedList,
      '',
      `Domínios manuais preservados: ${manuallyFilledEligible.length}.`,
      `Domínios não aplicáveis por ponto de corte etário: ${skippedByAgeCut}.`
    ].join('\n');
    if (!window.confirm(confirmMessage)) return;
  }

  entriesToApply.forEach(([id, v]) => {
    state[id] = v;
    const btns = document.querySelectorAll(`[data-domain="${id}"] .note-btn`);
    btns.forEach(b => { b.classList.remove('active'); if (+b.dataset.value === v) b.classList.add('active') });
  });
  update();
}

// Clear
function handleLimpar() {
  Object.keys(state).forEach(k => state[k] = 0);
  Object.keys(childDomainBackup).forEach(k => delete childDomainBackup[k]);
  userFilledDomains.clear();
  progDesfav = false; estrMaior = false; impedimento = false;
  crianca = false; idadeValor = 15; idadeUnidade = 'anos'; idadeMeses = CHILD_AGE_LIMIT_MONTHS;
  document.getElementById('toggleProg').checked = false;
  document.getElementById('toggleEstr').checked = false;
  document.getElementById('togglePadraoOverwrite').checked = false;
  document.getElementById('toggleImpedimento').checked = false;
  document.getElementById('toggleMenor16').checked = false;
  document.getElementById('inputIdade').value = idadeValor;
  document.getElementById('inputIdadeUnidade').value = idadeUnidade;
  syncChildModeByControls();
  document.querySelectorAll('.note-btn').forEach(b => { b.classList.remove('active', 'locked'); if (+b.dataset.value === 0) b.classList.add('active') });
  applyChildRules();
  update();
}

// Save/Comparison + Judicial Control
function updateComparison(amb, ativ, corpo) {
  if (!savedINSS) return;
  const s = savedINSS;
  document.getElementById('compINSSq').textContent = `Fatores Ambientais: ${Q_LABELS[s.amb]} · Atividades e Participação: ${Q_LABELS[s.ativ]} · Funções do Corpo: ${Q_LABELS[s.corpo]}`;
  document.getElementById('compINSSr').innerHTML = `${iconMarkup(s.result ? 'check-circle' : 'x-circle', 'ui-icon sm')} ${s.result ? 'DEFERIDO' : 'INDEFERIDO'}`;
  document.getElementById('compINSSr').className = 'comp-result ' + (s.result ? 'yes' : 'no');
  const curResult = impedimento ? false : tabelaConclusiva(amb.q, ativ.q, corpo.q);
  document.getElementById('compPERq').textContent = `Fatores Ambientais: ${Q_LABELS[amb.q]} · Atividades e Participação: ${Q_LABELS[ativ.q]} · Funções do Corpo: ${Q_LABELS[corpo.q]}`;
  document.getElementById('compPERr').innerHTML = `${iconMarkup(curResult ? 'check-circle' : 'x-circle', 'ui-icon sm')} ${curResult ? 'DEFERIDO' : 'INDEFERIDO'}`;
  document.getElementById('compPERr').className = 'comp-result ' + (curResult ? 'yes' : 'no');
  let changes = [];
  if (s.amb !== amb.q) changes.push(`Fatores Ambientais: ${Q_LABELS[s.amb]}→${Q_LABELS[amb.q]}`);
  if (s.ativ !== ativ.q) changes.push(`Atividades e Participação: ${Q_LABELS[s.ativ]}→${Q_LABELS[ativ.q]}`);
  if (s.corpo !== corpo.q) changes.push(`Funções do Corpo: ${Q_LABELS[s.corpo]}→${Q_LABELS[corpo.q]}`);
  if (!s.result && curResult) changes.push(`${iconMarkup('swap', 'ui-icon sm')} Resultado REVERTIDO: Indeferido → Deferido`);
  else if (s.result && !curResult) changes.push(`${iconMarkup('swap', 'ui-icon sm')} Resultado REVERTIDO: Deferido → Indeferido`);
  document.getElementById('compChange').innerHTML = changes.length ? changes.join(' · ') : 'Sem alteração no resultado';
}

function setStepState(id, state, text) {
  const el = document.getElementById(id);
  el.className = `jc-step-state ${state}`;
  el.textContent = text;
}

function setStatusBadge(kind, text) {
  const badge = document.getElementById('jcStatusBadge');
  badge.className = `jc-status-badge ${kind}`;
  badge.innerHTML = text;
}

function setWhyBlocked(message = '') {
  const box = document.getElementById('jcWhyBlocked');
  const text = box.querySelector('span');
  if (!message) {
    box.classList.add('hidden');
    text.textContent = '';
    return;
  }
  box.classList.remove('hidden');
  text.textContent = message;
}

function notifyJudicialInteraction(sourceId) {
  pendingJudicialInteraction = { sourceId, at: Date.now() };
}

function uniquePendingTargetIds(items = []) {
  return [...new Set(items.map(item => item.invalidId || item.targetId).filter(Boolean))];
}

function clearJudicialInvalidHighlights() {
  document.querySelectorAll('.jc-invalid').forEach(el => el.classList.remove('jc-invalid'));
}

function markJudicialInvalidTargets(targetIds = []) {
  targetIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('jc-invalid');
  });
}

function getGuidanceFocusElement(target) {
  if (!target) return null;
  if (target.matches('button, select, textarea, input, [tabindex]:not([tabindex="-1"])')) return target;
  return target.querySelector('button:not([disabled]), select:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])');
}

function focusJudicialTarget(targetId, options = {}) {
  if (!targetId) return false;
  const target = document.getElementById(targetId);
  if (!target) return false;
  if (!options.force && (target.classList.contains('hidden') || target.closest('.hidden'))) return false;

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rect = target.getBoundingClientRect();
  const visibilityPadding = options.force ? 0 : 72;
  const withinViewport = rect.top >= visibilityPadding && rect.bottom <= (window.innerHeight - visibilityPadding);
  if (options.force || !withinViewport) {
    target.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: options.force ? 'center' : 'nearest'
    });
  }
  const focusable = getGuidanceFocusElement(target);
  if (focusable) {
    try {
      focusable.focus({ preventScroll: true });
    } catch {
      focusable.focus();
    }
  }
  target.classList.add('jc-next-target');
  window.setTimeout(() => target.classList.remove('jc-next-target'), 1200);
  return true;
}

function maybeAdvanceToNextPending(nextTargetId) {
  const interaction = pendingJudicialInteraction;
  pendingJudicialInteraction = null;
  if (!interaction || !nextTargetId) return;
  if (interaction.sourceId === nextTargetId) return;
  focusJudicialTarget(nextTargetId);
}

function setStepGuidance(stepKey, {
  tone = 'pending',
  text = ''
} = {}) {
  const cfg = JC_STEP_GUIDANCE[stepKey];
  if (!cfg) return;
  const box = document.getElementById(cfg.box);
  const textEl = document.getElementById(cfg.text);
  if (!box || !textEl) return;

  box.className = `jc-step-guidance ${tone}`;
  textEl.textContent = text;
}

function buildPendingGuidanceText(items, doneText) {
  if (!items.length) return doneText;
  if (items.length === 1) return `Falta 1 definição: ${items[0].label}`;
  return `Faltam ${items.length} definições. Próxima: ${items[0].label}`;
}



function getAdminPendingItems() {
  const d = judicialControl.adminDraft;
  const items = [];
  if (d.amb == null) items.push({ label: 'selecione Fatores Ambientais (final)', targetId: 'jcAdminAmbButtons' });
  if (d.ativ == null) items.push({ label: 'selecione Atividades e Participação (final)', targetId: 'jcAdminAtivButtons' });
  if (d.corpo == null) items.push({ label: 'selecione Funções do Corpo (final)', targetId: 'jcAdminCorpoButtons' });
  if (d.corpoReconhecimentoInss.estruturasReconhecidas == null) {
    items.push({ label: 'informe se o INSS reconheceu estruturas mais limitantes', targetId: 'jcAdminEstruturasRecButtons' });
  }
  if (d.corpoReconhecimentoInss.prognosticoReconhecido == null) {
    items.push({ label: 'informe se o INSS reconheceu prognóstico desfavorável', targetId: 'jcAdminProgRecButtons' });
  }
  const draftReady = items.length === 0;
  const draftDirty = isAdminDraftDirty();
  if (draftReady && (!judicialControl.adminBase || draftDirty)) {
    items.push({
      label: draftDirty ? 'clique em "Fixar base administrativa" para revalidar a base' : 'clique em "Fixar base administrativa"',
      targetId: 'btnFixarBaseAdmin'
    });
  }
  return items;
}

function getMedPendingItems(corpoFlow, ativContext) {
  const m = judicialControl.med;
  const items = [];

  if (m.impedimentoLP == null) {
    items.push({ label: 'informe impedimento de longo prazo', targetId: 'jcImpedimentoButtons' });
  }

  if (m.corpoKeepAdmin == null) {
    items.push({ label: 'defina se mantém ou altera Funções do Corpo', targetId: 'jcCorpoKeepButtons' });
  } else if (m.corpoKeepAdmin === false) {
    if (!m.corpoChangeReason) {
      items.push({ label: 'selecione o motivo da alteração de Funções do Corpo', targetId: 'jcCorpoReasonSelect' });
    } else if (m.corpoChangeReason === 'dominio_max') {
      const hasAnyDomain = JC_CORPO_RECLASS_DOMAINS.some(id => m.corpoAdminDomains[id] != null);
      if (!hasAnyDomain) {
        items.push({
          label: 'informe ao menos um domínio b1-b8 em Funções do Corpo',
          targetId: 'jcCorpoB1Buttons',
          invalidId: 'jcCorpoDomainWrap'
        });
      }
    } else if (m.corpoChangeReason === 'rebaixamento' && m.corpoJudManual == null) {
      items.push({ label: 'informe o qualificador judicial manual de Funções do Corpo', targetId: 'jcCorpoManualButtons' });
    }

    const hasReduction = judicialControl.adminBase && corpoFlow.q != null && corpoFlow.q < judicialControl.adminBase.corpo;
    if (hasReduction && !m.corpoAlertReductionConfirmed) {
      items.push({
        label: 'confirme a redução de Funções do Corpo com prova superveniente',
        targetId: 'jcCorpoReductionConfirm',
        invalidId: 'jcCorpoReductionAlert'
      });
    }
  }

  if (ativContext.showQuestion) {
    if (m.hasAtivMed == null) {
      items.push({
        label: 'informe se a perícia trouxe elementos para requalificar Atividades e Participação',
        targetId: 'jcHasAtivMedButtons'
      });
    } else if (m.hasAtivMed === true) {
      if (!m.ativMode) {
        items.push({ label: 'escolha o modo de requalificação de Atividades e Participação', targetId: 'jcAtivModeButtons' });
      } else if (m.ativMode === 'simples') {
        if (m.ativMedSimple == null) {
          items.push({ label: 'informe o qualificador final de Atividades e Participação', targetId: 'jcAtivMedSimpleButtons' });
        }
        if (!m.ativMedJustification.trim()) {
          items.push({ label: 'preencha a justificativa médica do modo simples', targetId: 'jcAtivMedJustification' });
        }
      } else if (m.ativMode === 'completa') {
        JC_ATIV_RECLASS_DOMAINS.forEach(id => {
          if (m.ativMedDomains[id] == null) {
            items.push({
              label: `preencha ${id.toUpperCase()} em Atividades e Participação`,
              targetId: `jcAtiv${id.toUpperCase()}Buttons`
            });
          }
        });
      }
    }
  }

  return items;
}

function getTracePrimaryCauseCode(med, ativContext) {
  if (!ativContext) return 'OTHER';
  if (med.impedimentoLP === false || ativContext.code === 'sem_impedimento_lp') return 'NO_LONG_TERM_IMPEDIMENT';
  if (ativContext.code === 'corpo_nl') return 'BODY_NL_IRRELEVANT';
  if (ativContext.code === 'verificacao_adm_positiva') return 'ADMIN_CHECK_ALREADY_POSITIVE';
  if (med.hasAtivMed === false) return 'NO_MED_ELEMENTS';
  return 'OTHER';
}

function getTraceSecondaryReferenceSentence(causeCode) {
  if (causeCode === 'NO_LONG_TERM_IMPEDIMENT') {
    return 'não aplicável (mesmo motivo-base da linha de reclassificação: ausência de impedimento de longo prazo).';
  }
  if (causeCode === 'BODY_NL_IRRELEVANT') {
    return 'não aplicável (mesmo motivo-base da linha de reclassificação: Funções do Corpo judiciais em N/L).';
  }
  if (causeCode === 'ADMIN_CHECK_ALREADY_POSITIVE') {
    return 'não aplicável (mesmo motivo-base da linha de reclassificação: manutenção administrativa já positiva).';
  }
  return 'não aplicável (mesmo motivo-base da linha de reclassificação).';
}

function syncModeSwitcher() {
  document.querySelectorAll('#modeSwitcher .mode-btn').forEach(btn => {
    const isActive = btn.dataset.mode === uiMode;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive);
  });
}

function scrollToJudicialControlSection() {
  const section = document.getElementById('judicialControlSection');
  if (!section) return;
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      section.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });
}

function renderModeVisibility(options = {}) {
  const app = document.querySelector('.app');
  const details = document.getElementById('simuladorDetails');
  const textoSection = document.getElementById('textoSection');
  app.classList.toggle('mode-simulador', uiMode === 'simulador');
  app.classList.toggle('mode-controle', uiMode === 'controle');
  textoSection.classList.toggle('hidden', uiMode !== 'simulador');
  if (uiMode === 'simulador') {
    details.open = true;
  } else if (!options.preserveAccordionState) {
    details.open = false;
  }
  syncModeSwitcher();
}

function setUIMode(mode, options = {}) {
  if (!['simulador', 'controle'].includes(mode)) return;
  if (uiMode === mode) {
    renderModeVisibility({ preserveAccordionState: true, ...options });
    if (mode === 'controle' && options.scrollToJudicial) scrollToJudicialControlSection();
    return;
  }
  uiMode = mode;
  renderModeVisibility(options);
  if (mode === 'simulador') renderStandardText();
  if (mode === 'controle' && options.scrollToJudicial) scrollToJudicialControlSection();
}

function getActiveJudicialStep() {
  const triageReady = judicialControl.triage && judicialControl.triage.ready;
  if (!judicialControl.adminBase) return 1;
  if (!getMedComplete()) return 2;
  if (!triageReady) return 3;
  return 4;
}

function getJudicialProgressPct(activeStep) {
  return Math.max(25, Math.min(100, activeStep * 25));
}

function renderJudicialProgress() {
  const labels = ['Base administrativa', 'Perícia médica', 'Triagem probatória', 'Texto da decisão'];
  const stepIds = ['stepAdmin', 'stepMed', 'stepTriagem', 'stepTexto'];
  const activeStep = getActiveJudicialStep();
  const progressPct = getJudicialProgressPct(activeStep);
  judicialControl.ui.activeStep = activeStep;
  judicialControl.ui.progressPct = progressPct;

  document.getElementById('jcProgressBar').style.width = `${progressPct}%`;
  document.getElementById('jcProgressPct').textContent = `${progressPct}%`;
  document.getElementById('jcProgressLabel').textContent = `Etapa ${activeStep} de 4 · ${labels[activeStep - 1]}`;
  stepIds.forEach((id, idx) => {
    document.getElementById(id).classList.toggle('active-step', idx + 1 === activeStep);
  });
}

function syncQButtonGroup(groupId, value) {
  document.querySelectorAll(`#${groupId} .jc-q-btn`).forEach(btn => {
    btn.classList.toggle('active', value != null && +btn.dataset.value === value);
  });
}

function syncSegmentedGroup(groupId, value) {
  document.querySelectorAll(`#${groupId} .jc-seg-btn`).forEach(btn => {
    btn.classList.toggle('active', value != null && btn.dataset.value === value);
  });
}

function clearJudicialTextArea() {
  document.getElementById('textoControleJudicial').value = '';
  document.getElementById('copyFeedbackControle').textContent = '';
}

function resetAtivMedReclassFields() {
  judicialControl.med.ativMode = null;
  judicialControl.med.ativMedSimple = null;
  judicialControl.med.ativMedJustification = '';
  judicialControl.med.ativMedDomains = createEmptyAtivReclassDomains();
  judicialControl.med.ativMedComputed = null;
}

function resetCorpoChangeDetails() {
  judicialControl.med.corpoChangeReason = null;
  judicialControl.med.corpoAdminDomains = createEmptyCorpoReclassDomains();
  judicialControl.med.corpoJudManual = null;
  judicialControl.med.corpoAlertReductionConfirmed = false;
  judicialControl.med.corpoJud = null;
}

function resetCorpoReclassFields() {
  judicialControl.med.corpoKeepAdmin = null;
  resetCorpoChangeDetails();
}

function getAdminDraftComplete() {
  const d = judicialControl.adminDraft;
  return d.amb != null
    && d.ativ != null
    && d.corpo != null
    && d.corpoReconhecimentoInss.estruturasReconhecidas != null
    && d.corpoReconhecimentoInss.prognosticoReconhecido != null;
}

function isAdminDraftDirty() {
  if (!judicialControl.adminBase) return false;
  const d = judicialControl.adminDraft;
  const b = judicialControl.adminBase;
  if (d.amb !== b.amb || d.ativ !== b.ativ || d.corpo !== b.corpo) return true;
  if (d.corpoReconhecimentoInss.estruturasReconhecidas !== b.corpoReconhecimentoInss.estruturasReconhecidas) return true;
  if (d.corpoReconhecimentoInss.prognosticoReconhecido !== b.corpoReconhecimentoInss.prognosticoReconhecido) return true;
  return false;
}

function getMedBlockingReason() {
  const m = judicialControl.med;
  const corpoFlow = resolveCorpoJudFlow();
  m.corpoJud = corpoFlow.q;
  return getMedBlockingReasonFlow({
    adminBase: judicialControl.adminBase,
    med: m,
    resolveCorpoJudFlow,
    getAtivReclassContext,
    updateAtivMedComputed
  });
}

function getMedComplete() {
  return !getMedBlockingReason();
}

function getAtivMedTraceLineElement(ativContext = null) {
  return createAtivMedTraceLineElement({
    ativContext,
    med: judicialControl.med,
    resolveAtivMed,
    computeAtivFromDomains,
    ativDomainIds: JC_ATIV_RECLASS_DOMAINS,
    qLabels: Q_LABELS,
    createTraceLine
  });
}

function computeJudicialTriage() {
  return computeJudicialTriageFlow({
    adminBase: judicialControl.adminBase,
    med: judicialControl.med,
    isAdminDraftDirty,
    resolveCorpoJudFlow,
    getAtivReclassContext,
    getMedBlockingReason,
    resolveAtivMed,
    tabelaConclusiva
  });
}

function renderAdminFixedSummary() {
  const summary = document.getElementById('jcAdminFixedSummary');
  if (!judicialControl.adminBase) {
    summary.textContent = 'Base administrativa ainda não fixada.';
    return;
  }
  const b = judicialControl.adminBase;
  const reconhecimentoText = ` Reconhecimento INSS: estruturas mais graves ${b.corpoReconhecimentoInss.estruturasReconhecidas ? 'reconhecidas' : 'não reconhecidas'}, prognóstico desfavorável ${b.corpoReconhecimentoInss.prognosticoReconhecido ? 'reconhecido' : 'não reconhecido'}.`;
  const dirtyText = isAdminDraftDirty() ? ' Existem alterações no rascunho; clique em "Fixar base administrativa" para atualizar a base vigente.' : '';
  summary.textContent = `Base fixada: Fatores Ambientais ${Q_LABELS[b.amb]} (${Q_NAMES[b.amb]}), Atividades e Participação ${Q_LABELS[b.ativ]} (${Q_NAMES[b.ativ]}), Funções do Corpo ${Q_LABELS[b.corpo]} (${Q_NAMES[b.corpo]}).${reconhecimentoText}${dirtyText}`;
}

function formatQualifierTuple(values) {
  const ambLabel = values.amb == null ? '—' : Q_LABELS[values.amb];
  const ativLabel = values.ativ == null ? '—' : Q_LABELS[values.ativ];
  const corpoLabel = values.corpo == null ? '—' : Q_LABELS[values.corpo];
  return `Fatores Ambientais ${ambLabel} · Atividades e Participação ${ativLabel} · Funções do Corpo ${corpoLabel}`;
}

function updateAdminAutofillShortcut() {
  const details = document.getElementById('jcAutoFillDetails');
  const hint = document.getElementById('jcAutoFillHint');
  if (!details || !hint) return;

  const draft = judicialControl.adminDraft;
  const calc = { amb: calcAmbiente().q, ativ: calcAtividades().q, corpo: calcCorpo().q };
  const draftValues = [draft.amb, draft.ativ, draft.corpo];
  const draftComplete = draftValues.every(v => v != null);
  const draftHasAny = draftValues.some(v => v != null);
  const calcHasNonNeutral = calc.amb !== 0 || calc.ativ !== 0 || calc.corpo !== 0;
  const differs = draft.amb !== calc.amb || draft.ativ !== calc.ativ || draft.corpo !== calc.corpo;
  const shouldShow = differs && (calcHasNonNeutral || draftHasAny);

  details.classList.toggle('hidden', !shouldShow);
  if (!shouldShow) {
    details.open = false;
    hint.textContent = '';
    return;
  }

  const calcText = formatQualifierTuple(calc);
  if (!draftComplete) {
    hint.textContent = `Atalho opcional: copiar os qualificadores atuais da Calculadora (${calcText}) para o rascunho desta etapa. Depois, revise e clique em "Fixar base administrativa".`;
    return;
  }

  const draftText = formatQualifierTuple(draft);
  hint.textContent = `Rascunho atual: ${draftText}. Calculadora: ${calcText}. Use o atalho para substituir rapidamente o rascunho e, em seguida, fixe a base administrativa.`;
}

function applyCurrentQualifiersAsAdminDraft() {
  const amb = calcAmbiente(), ativ = calcAtividades(), corpo = calcCorpo();
  judicialControl.adminDraft.amb = amb.q;
  judicialControl.adminDraft.ativ = ativ.q;
  judicialControl.adminDraft.corpo = corpo.q;
  renderJudicialControl();
}

function fixAdminBaseFromDraft() {
  if (!getAdminDraftComplete()) {
    notifyJudicialInteraction('btnFixarBaseAdmin');
    alert('Preencha os três qualificadores finais da base administrativa e os reconhecimentos do INSS em Funções do Corpo.');
    renderJudicialControl();
    return;
  }
  judicialControl.adminBase = {
    amb: judicialControl.adminDraft.amb,
    ativ: judicialControl.adminDraft.ativ,
    corpo: judicialControl.adminDraft.corpo,
    corpoReconhecimentoInss: { ...judicialControl.adminDraft.corpoReconhecimentoInss }
  };
  judicialControl.med = createEmptyJudicialMed();

  savedINSS = {
    amb: judicialControl.adminBase.amb,
    ativ: judicialControl.adminBase.ativ,
    corpo: judicialControl.adminBase.corpo,
    result: tabelaConclusiva(judicialControl.adminBase.amb, judicialControl.adminBase.ativ, judicialControl.adminBase.corpo),
    impedimento: false,
    item: getItemNumber(judicialControl.adminBase.amb, judicialControl.adminBase.ativ, judicialControl.adminBase.corpo)
  };
  document.getElementById('compSection').classList.remove('hidden');
  document.getElementById('btnClearComp').classList.remove('hidden');
  updateComparison(calcAmbiente(), calcAtividades(), calcCorpo());
  clearJudicialTextArea();
  notifyJudicialInteraction('btnFixarBaseAdmin');
  renderJudicialControl();
}

function resetJudicialControl() {
  pendingJudicialInteraction = null;
  judicialControl.adminDraft = {
    amb: null,
    ativ: null,
    corpo: null,
    corpoReconhecimentoInss: createEmptyAdminCorpoRecognition()
  };
  judicialControl.adminBase = null;
  judicialControl.med = createEmptyJudicialMed();
  judicialControl.triage = { ready: false, status: 'pending', testeA: null, testeB: null, reason: '', route: null };
  judicialControl.ui = { activeStep: 1, progressPct: 25, blockReason: '' };
  clearJudicialTextArea();
}

function clearJudicialMedicalAndTriage() {
  judicialControl.med = createEmptyJudicialMed();
  judicialControl.triage = { ready: false, status: 'pending', testeA: null, testeB: null, reason: '', route: null };
  clearJudicialTextArea();
  renderJudicialControl();
  document.getElementById('copyFeedbackControle').textContent = judicialControl.adminBase
    ? 'Etapa médica e triagem reiniciadas. A base administrativa foi mantida.'
    : 'Controle judicial limpo.';
}

function renderJudicialControl() {
  syncQButtonGroup('jcAdminAmbButtons', judicialControl.adminDraft.amb);
  syncQButtonGroup('jcAdminAtivButtons', judicialControl.adminDraft.ativ);
  syncQButtonGroup('jcAdminCorpoButtons', judicialControl.adminDraft.corpo);
  syncSegmentedGroup('jcAdminEstruturasRecButtons', judicialControl.adminDraft.corpoReconhecimentoInss.estruturasReconhecidas == null ? null : (judicialControl.adminDraft.corpoReconhecimentoInss.estruturasReconhecidas ? 'sim' : 'nao'));
  syncSegmentedGroup('jcAdminProgRecButtons', judicialControl.adminDraft.corpoReconhecimentoInss.prognosticoReconhecido == null ? null : (judicialControl.adminDraft.corpoReconhecimentoInss.prognosticoReconhecido ? 'sim' : 'nao'));
  syncSegmentedGroup('jcCorpoKeepButtons', judicialControl.med.corpoKeepAdmin == null ? null : (judicialControl.med.corpoKeepAdmin ? 'sim' : 'nao'));
  syncQButtonGroup('jcCorpoManualButtons', judicialControl.med.corpoJudManual);
  JC_CORPO_RECLASS_DOMAINS.forEach(id => {
    syncQButtonGroup(`jcCorpo${id.toUpperCase()}Buttons`, judicialControl.med.corpoAdminDomains[id]);
  });
  syncQButtonGroup('jcAtivMedSimpleButtons', judicialControl.med.ativMedSimple);
  updateAdminAutofillShortcut();
  JC_ATIV_RECLASS_DOMAINS.forEach(id => {
    syncQButtonGroup(`jcAtiv${id.toUpperCase()}Buttons`, judicialControl.med.ativMedDomains[id]);
  });
  syncSegmentedGroup('jcImpedimentoButtons', judicialControl.med.impedimentoLP == null ? null : (judicialControl.med.impedimentoLP ? 'sim' : 'nao'));
  syncSegmentedGroup('jcAtivModeButtons', judicialControl.med.ativMode);
  let corpoFlow = resolveCorpoJudFlow();
  judicialControl.med.corpoJud = corpoFlow.q;
  const reasonSelect = document.getElementById('jcCorpoReasonSelect');
  const reasonHint = document.getElementById('jcCorpoReasonHint');
  [...reasonSelect.options].forEach(opt => {
    if (!opt.value) return;
    opt.disabled = isCorpoReasonBlocked(opt.value);
  });
  if (judicialControl.med.corpoChangeReason && isCorpoReasonBlocked(judicialControl.med.corpoChangeReason)) {
    resetCorpoChangeDetails();
    corpoFlow = resolveCorpoJudFlow();
    judicialControl.med.corpoJud = corpoFlow.q;
  }
  reasonSelect.value = judicialControl.med.corpoChangeReason || '';
  if (!judicialControl.adminBase) {
    reasonHint.textContent = 'Fixe a base administrativa para habilitar os motivos.';
  } else if (judicialControl.med.corpoKeepAdmin === false) {
    reasonHint.textContent = judicialControl.med.corpoChangeReason
      ? (isCorpoReasonBlocked(judicialControl.med.corpoChangeReason)
        ? getCorpoReasonBlockedMessage(judicialControl.med.corpoChangeReason)
        : (JC_CORPO_REASON_LABELS[judicialControl.med.corpoChangeReason] || ''))
      : 'Selecione um motivo para definir o qualificador judicial de Funções do Corpo.';
  } else {
    reasonHint.textContent = '';
  }
  const showCorpoChange = judicialControl.med.corpoKeepAdmin === false;
  const showCorpoDomains = showCorpoChange && judicialControl.med.corpoChangeReason === 'dominio_max';
  const showCorpoManual = showCorpoChange && judicialControl.med.corpoChangeReason === 'rebaixamento';
  document.getElementById('jcCorpoChangeWrap').classList.toggle('hidden', !showCorpoChange);
  document.getElementById('jcCorpoDomainWrap').classList.toggle('hidden', !showCorpoDomains);
  document.getElementById('jcCorpoManualWrap').classList.toggle('hidden', !showCorpoManual);
  const reductionAlert = document.getElementById('jcCorpoReductionAlert');
  const reductionConfirm = document.getElementById('jcCorpoReductionConfirm');
  const hasReduction = showCorpoChange && corpoFlow.q != null && judicialControl.adminBase && corpoFlow.q < judicialControl.adminBase.corpo;
  reductionAlert.classList.toggle('hidden', !hasReduction);
  reductionConfirm.checked = !!judicialControl.med.corpoAlertReductionConfirmed;
  const corpoSummary = document.getElementById('jcCorpoResultSummary');
  if (!judicialControl.adminBase) {
    corpoSummary.textContent = 'Resultado de Funções do Corpo aguardando base administrativa.';
  } else if (judicialControl.med.corpoKeepAdmin == null) {
    corpoSummary.textContent = `Base administrativa em Funções do Corpo: ${Q_LABELS[judicialControl.adminBase.corpo]} (${Q_NAMES[judicialControl.adminBase.corpo]}). Informe se deseja manter ou alterar.`;
  } else if (!corpoFlow.ready && corpoFlow.q == null) {
    corpoSummary.textContent = corpoFlow.reason;
  } else {
    const motivo = corpoFlow.mode === 'mantido' ? 'manutenção administrativa' : (JC_CORPO_REASON_LABELS[judicialControl.med.corpoChangeReason] || 'motivo não identificado');
    const extra = corpoFlow.mode === 'dominio_max' && corpoFlow.domainsText ? ` Domínios: ${corpoFlow.domainsText}.` : '';
    const pendencia = !corpoFlow.ready ? ` Pendência: ${corpoFlow.reason}` : '';
    corpoSummary.textContent = `Resultado judicial de Funções do Corpo: ${Q_LABELS[corpoFlow.q]} (${Q_NAMES[corpoFlow.q]}), por ${motivo}.${extra}${pendencia}`;
  }
  const ativContext = getAtivReclassContext(corpoFlow);
  const hasAtivField = document.getElementById('jcHasAtivMedField');
  const hasAtivHint = document.getElementById('jcHasAtivMedHint');
  const ativNotApplicableNote = document.getElementById('jcAtivNotApplicableNote');
  if (!ativContext.showQuestion) {
    judicialControl.med.hasAtivMed = null;
    resetAtivMedReclassFields();
  }
  hasAtivField.classList.toggle('hidden', !ativContext.showQuestion);
  if (ativContext.showQuestion) {
    hasAtivHint.textContent = `${ativContext.reason} Se “Sim”, escolha o modo de requalificação abaixo.`;
    ativNotApplicableNote.classList.add('hidden');
    ativNotApplicableNote.textContent = '';
  } else {
    hasAtivHint.textContent = 'Se “Sim”, escolha o modo de requalificação abaixo.';
    const showAtivContextNote = ['sem_impedimento_lp', 'corpo_nl', 'verificacao_adm_positiva'].includes(ativContext.code);
    ativNotApplicableNote.textContent = showAtivContextNote ? ativContext.reason : '';
    ativNotApplicableNote.classList.toggle('hidden', !showAtivContextNote);
  }
  syncSegmentedGroup('jcHasAtivMedButtons', judicialControl.med.hasAtivMed == null ? null : (judicialControl.med.hasAtivMed ? 'sim' : 'nao'));
  const showAtivMed = ativContext.showQuestion && judicialControl.med.hasAtivMed === true;
  const isSimple = showAtivMed && judicialControl.med.ativMode === 'simples';
  const isComplete = showAtivMed && judicialControl.med.ativMode === 'completa';
  document.getElementById('jcAtivMedWrap').classList.toggle('hidden', !showAtivMed);
  document.getElementById('jcAtivModeSimpleWrap').classList.toggle('hidden', !isSimple);
  document.getElementById('jcAtivModeCompleteWrap').classList.toggle('hidden', !isComplete);
  const justField = document.getElementById('jcAtivMedJustification');
  if (justField.value !== judicialControl.med.ativMedJustification) {
    justField.value = judicialControl.med.ativMedJustification;
  }
  const computed = updateAtivMedComputed();
  const summary = document.getElementById('jcAtivComputedSummary');
  if (!isComplete) {
    summary.textContent = 'Preencha d1–d9 para calcular o qualificador final de Atividades e Participação.';
  } else if (!computed) {
    const filled = JC_ATIV_RECLASS_DOMAINS.filter(id => judicialControl.med.ativMedDomains[id] != null).length;
    summary.textContent = `Preenchimento parcial: ${filled}/9 domínios. O qualificador final só será calculado após completar d1–d9.`;
  } else {
    summary.textContent = `Cálculo automático: (Σ × 2,777...) − 0,1 = ${computed.pct}% · Σ=${computed.sum} · qualificador final de Atividades e Participação = ${Q_LABELS[computed.q]} (${Q_NAMES[computed.q]}).`;
  }
  renderAdminFixedSummary();
  clearJudicialInvalidHighlights();

  const adminDone = !!judicialControl.adminBase;
  const adminDraftReady = getAdminDraftComplete();
  const adminDirty = isAdminDraftDirty();
  const adminStateClass = !adminDone ? 'pending' : (adminDirty ? 'pending' : 'done');
  const adminStateText = !adminDone ? (adminDraftReady ? 'Pronta para fixar' : 'Pendente') : (adminDirty ? 'Revalidar base' : 'Concluída');
  setStepState('jcAdminState', adminStateClass, adminStateText);
  const adminPendingItems = getAdminPendingItems();
  setStepGuidance('admin', adminPendingItems.length
    ? {
      tone: 'pending',
      text: buildPendingGuidanceText(adminPendingItems, 'Etapa 1 pronta para fixação da base administrativa.')
    }
    : {
      tone: 'done',
      text: 'Etapa 1 concluída. Base administrativa fixada.'
    });

  if (!adminDone) {
    const blockReason = 'Etapa 2 bloqueada: primeiro fixe a base administrativa na etapa 1.';
    const nextTargetId = adminPendingItems[0]?.targetId || '';
    judicialControl.ui.blockReason = blockReason;
    setStepState('jcMedState', 'blocked', 'Bloqueada');
    setStepState('jcTriagemState', 'pending', 'Pendente');
    setStepState('jcTextoState', 'blocked', 'Aguardando triagem');
    setStepGuidance('med', {
      tone: 'blocked',
      text: 'Etapa 2 bloqueada até fixar a base administrativa.'
    });
    setStepGuidance('triagem', {
      tone: 'blocked',
      text: 'Triagem bloqueada até concluir as etapas 1 e 2.'
    });
    setStepGuidance('texto', {
      tone: 'blocked',
      text: 'A minuta da decisão será liberada após a triagem.'
    });
    setStatusBadge('pending', `${iconMarkup('alert', 'ui-icon sm')} Preencha as etapas 1 e 2 para liberar a conclusão probatória.`);
    document.getElementById('jcTrace').innerHTML = `<div class="jc-trace-line">Etapa 1: fixe a base administrativa do INSS para iniciar o controle judicial.</div>`;
    setWhyBlocked(blockReason);
    renderJudicialProgress();
    markJudicialInvalidTargets(uniquePendingTargetIds(adminPendingItems));
    maybeAdvanceToNextPending(nextTargetId);
    return;
  }

  const medDone = getMedComplete();
  const medPendingItems = getMedPendingItems(corpoFlow, ativContext);
  setStepState('jcMedState', medDone ? 'done' : 'pending', medDone ? 'Concluída' : 'Pendente');
  setStepGuidance('med', medPendingItems.length
    ? {
      tone: 'pending',
      text: buildPendingGuidanceText(medPendingItems, 'Etapa 2 concluída.')
    }
    : {
      tone: 'done',
      text: 'Etapa 2 concluída. Triagem pronta para análise.'
    });
  const triage = computeJudicialTriage();
  judicialControl.triage = triage;

  if (!triage.ready) {
    const nextTargetId = medPendingItems[0]?.targetId || adminPendingItems[0]?.targetId || '';
    judicialControl.ui.blockReason = triage.reason;
    setStepState('jcTriagemState', 'pending', 'Pendente');
    setStepState('jcTextoState', 'blocked', 'Aguardando triagem');
    setStepGuidance('triagem', {
      tone: 'pending',
      text: triage.reason
    });
    setStepGuidance('texto', {
      tone: 'blocked',
      text: 'A minuta será liberada após a conclusão da triagem probatória.'
    });
    setStatusBadge('pending', `${iconMarkup('alert', 'ui-icon sm')} ${triage.reason}`);
    document.getElementById('jcTrace').innerHTML = `<div class="jc-trace-line">${triage.reason}</div>`;
    setWhyBlocked(triage.reason);
    renderJudicialProgress();
    const activeStep = getActiveJudicialStep();
    if (activeStep === 1) {
      markJudicialInvalidTargets(uniquePendingTargetIds(adminPendingItems));
    } else if (activeStep === 2) {
      markJudicialInvalidTargets(uniquePendingTargetIds(medPendingItems));
    }
    maybeAdvanceToNextPending(nextTargetId);
    return;
  }

  judicialControl.ui.blockReason = '';
  setStepState('jcTriagemState', 'done', 'Concluída');
  setStepState('jcTextoState', 'done', 'Pronta');
  const b = judicialControl.adminBase;
  const m = judicialControl.med;
  const ativMedResolved = resolveAtivMed();

  const traceContainer = document.getElementById('jcTrace');
  traceContainer.replaceChildren();

  // Line 1
  traceContainer.appendChild(createTraceLine(`<strong>Base administrativa fixada</strong>: Fatores Ambientais ${Q_LABELS[b.amb]} · Atividades e Participação ${Q_LABELS[b.ativ]} · Funções do Corpo ${Q_LABELS[b.corpo]}.`));

  // Line 2
  traceContainer.appendChild(createTraceLine(`<strong>Perícia médica judicial</strong>: impedimento de longo prazo = <strong>${m.impedimentoLP ? 'Sim' : 'Não'}</strong>.`));

  // Line 3
  traceContainer.appendChild(getCorpoFlowTraceLineElement(corpoFlow));

  // Line 4
  const ativLine = getAtivMedTraceLineElement(ativContext);
  if (ativLine) traceContainer.appendChild(ativLine);
  const traceCauseCode = getTracePrimaryCauseCode(m, ativContext);

  // Line 5 (Test A)
  if (m.impedimentoLP) {
    traceContainer.appendChild(createTraceLine(`<strong>Verificação com manutenção de Atividades e Participação administrativas</strong>: tabela(Fatores Ambientais ${Q_LABELS[b.amb]}, Atividades e Participação ${Q_LABELS[b.ativ]}, Funções do Corpo judiciais ${Q_LABELS[corpoFlow.q]}) = <strong>${triage.testeA ? 'Sim' : 'Não'}</strong>.`));
  } else {
    traceContainer.appendChild(createTraceLine(`<strong>Verificação com manutenção de Atividades e Participação administrativas</strong>: ${getTraceSecondaryReferenceSentence(traceCauseCode)}`));
  }

  // Line 6 (Test B)
  if (!ativContext.showQuestion) {
    traceContainer.appendChild(createTraceLine(`<strong>Verificação com reclassificação médica de Atividades e Participação</strong>: ${getTraceSecondaryReferenceSentence(traceCauseCode)}`));
  } else if (m.hasAtivMed && ativMedResolved != null) {
    traceContainer.appendChild(createTraceLine(`<strong>Verificação com reclassificação médica de Atividades e Participação</strong>: tabela(Fatores Ambientais ${Q_LABELS[b.amb]}, Atividades e Participação médicas ${Q_LABELS[ativMedResolved]}, Funções do Corpo judiciais ${Q_LABELS[corpoFlow.q]}) = <strong>${triage.testeB ? 'Sim' : 'Não'}</strong>.`));
  } else if (m.hasAtivMed === false) {
    traceContainer.appendChild(createTraceLine('<strong>Verificação com reclassificação médica de Atividades e Participação</strong>: não aplicada, pois a perícia médica não trouxe elementos para reclassificação.'));
  } else {
    traceContainer.appendChild(createTraceLine('<strong>Verificação com reclassificação médica de Atividades e Participação</strong>: aguardando definição sobre existência de elementos médicos.'));
  }

  // Line 7 (Reason)
  traceContainer.appendChild(createTraceLine(triage.reason));

  // Line 8 (Route)
  if (triage.status === 'necessaria') {
    traceContainer.appendChild(createTraceLine('<strong>Rotas de reversão pela avaliação social judicial</strong>: requalificação de <strong>Fatores Ambientais</strong> e/ou <strong>Atividades e Participação</strong>.'));
  }

  if (triage.status === 'dispensa') {
    setStatusBadge('dispensa', `${iconMarkup('check-circle', 'ui-icon sm')} <strong>Avaliação social judicial dispensável</strong>`);
  } else {
    setStatusBadge('necessaria', `${iconMarkup('alert', 'ui-icon sm')} <strong>Avaliação social judicial necessária</strong>`);
  }
  setStepGuidance('triagem', {
    tone: 'done',
    text: triage.status === 'dispensa'
      ? 'Triagem concluída: avaliação social judicial dispensável.'
      : 'Triagem concluída: avaliação social judicial necessária.'
  });
  const hasDecisionText = !!document.getElementById('textoControleJudicial').value.trim();
  setStepGuidance('texto', hasDecisionText
    ? {
      tone: 'done',
      text: 'Minuta disponível. Você pode copiar o texto ou gerar novamente.'
    }
    : {
      tone: 'pending',
      text: 'Triagem concluída. Gere a minuta padronizada para finalizar a etapa 4.'
    });
  setWhyBlocked('');
  renderJudicialProgress();
  const activeStep = getActiveJudicialStep();
  if (activeStep === 1) {
    markJudicialInvalidTargets(uniquePendingTargetIds(adminPendingItems));
  } else if (activeStep === 2) {
    markJudicialInvalidTargets(uniquePendingTargetIds(medPendingItems));
  }
  const nextTargetId = activeStep === 4 && !hasDecisionText
    ? 'btnGerarControleTexto'
    : '';
  maybeAdvanceToNextPending(nextTargetId);
}

function renderJudicialControlText() {
  const output = document.getElementById('textoControleJudicial');
  output.value = buildJudicialControlText({
    adminBase: judicialControl.adminBase,
    triage: judicialControl.triage,
    med: judicialControl.med,
    corpoFlow: resolveCorpoJudFlow(),
    ativMedResolved: resolveAtivMed(),
    getItemNumber
  });
  renderJudicialControl();
}

async function copyToClipboard(area, feedback) {
  if (!area.value.trim()) {
    feedback.textContent = 'Gere o texto antes de copiar.';
    return;
  }
  try {
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      throw new Error('Clipboard API not available');
    }
    await navigator.clipboard.writeText(area.value);
    feedback.textContent = 'Texto copiado para a área de transferência.';
  } catch (err) {
    area.focus();
    area.select();
    feedback.textContent = 'Não foi possível copiar automaticamente. Use Ctrl+C.';
  }
}

async function copyJudicialControlText() {
  const feedback = document.getElementById('copyFeedbackControle');
  const area = document.getElementById('textoControleJudicial');
  await copyToClipboard(area, feedback);
}

function generateAndCopyJudicialText() {
  renderJudicialControlText();
  copyJudicialControlText();
}

function sendScenarioToJudicialDraft() {
  setUIMode('controle', { scrollToJudicial: false });
  notifyJudicialInteraction('btnLevarParaControle');
  applyCurrentQualifiersAsAdminDraft();
  document.getElementById('copyFeedbackControle').textContent = 'Rascunho preenchido. Revise os reconhecimentos do INSS e clique em "Fixar base administrativa".';
}

function handleUseCurrentAsBase() {
  notifyJudicialInteraction('btnUseCurrentAsBase');
  applyCurrentQualifiersAsAdminDraft();
  document.getElementById('copyFeedbackControle').textContent = 'Rascunho preenchido com os qualificadores atuais da Calculadora. Revise e clique em "Fixar base administrativa".';
}

function handleClearComp() {
  savedINSS = null;
  document.getElementById('compSection').classList.add('hidden');
  document.getElementById('btnClearComp').classList.add('hidden');
  resetJudicialControl();
  renderJudicialControl();
}

function getAutoQualifiedChildDomains() {
  if (!crianca) return [];
  return [...DOM_ATIV_M, ...DOM_ATIV_S].filter(d => idadeMeses < d.cut);
}

function updateChildAutoSummary() {
  const summary = document.getElementById('childAutoSummary');
  if (!crianca) {
    summary.classList.add('hidden');
    summary.textContent = '';
    return;
  }
  const forced = getAutoQualifiedChildDomains();
  if (!forced.length) {
    summary.classList.add('hidden');
    summary.textContent = '';
    return;
  }
  summary.classList.remove('hidden');
  summary.textContent = `Autoqualificados por corte etário: ${forced.map(d => d.id.toUpperCase()).join(', ')}.`;
}

function renderStandardText(amb = calcAmbiente(), ativ = calcAtividades(), corpo = calcCorpo()) {
  const yes = !impedimento && tabelaConclusiva(amb.q, ativ.q, corpo.q);
  const reason = getDecisionReason(amb.q, ativ.q, corpo.q, yes);
  const forced = getAutoQualifiedChildDomains();
  const forcedText = forced.length
    ? `Nos domínios de Atividades e Participação abaixo do ponto de corte etário, foi aplicado automaticamente o qualificador 4 (dificuldade completa), conforme Portaria Conjunta MDS/INSS nº 2/2015: ${forced.map(d => `${d.id.toUpperCase()} (${d.name}, corte ${d.cut} meses)`).join('; ')}.`
    : '';
  const idadeTexto = crianca
    ? `Foi assinalada idade inferior a 16 anos, com idade informada de ${idadeValor} ${idadeUnidade} (${idadeMeses} meses).`
    : 'Não foi assinalada idade inferior a 16 anos, de modo que se considerou a faixa etária de 16 anos ou mais.';
  const qWord = q => ['nenhum', 'leve', 'moderado', 'grave', 'completo'][q];
  const contextoEtario = `${idadeTexto}${forcedText ? ` ${forcedText}` : ''}`;

  // Textos-base incorporados do arquivo modelos_textos_decisao_bpc.md (sem dependência externa)
  let paragrafo1 = '';
  let paragrafo2 = '';

  if (yes) {
    paragrafo1 = `À luz do art. 20, §§ 2º e 10, da Lei nº 8.742/1993, e dos critérios da Portaria Conjunta MDS/INSS nº 2/2015 (Anexo IV), examina-se o enquadramento da parte autora como pessoa com deficiência para fins de BPC. ${contextoEtario} No caso concreto, os qualificadores finais apurados foram: Fatores Ambientais em grau ${qWord(amb.q)}, Atividades e Participação em grau ${qWord(ativ.q)} e Funções do Corpo em grau ${qWord(corpo.q)}, com reconhecimento de impedimento de longo prazo. A combinação desses qualificadores, confrontada com a Tabela Conclusiva da Portaria, conduz a resultado positivo para reconhecimento do requisito biopsicossocial legal.`;
    paragrafo2 = 'Diante desse quadro técnico-normativo, reputo preenchido o requisito legal, motivo pelo qual a parte autora se enquadra no conceito de pessoa com deficiência para fins do benefício assistencial.';
  } else {
    if (impedimento) {
      paragrafo1 = `A controvérsia deve ser resolvida conforme o art. 20, §§ 2º e 10, da Lei nº 8.742/1993, em conjunto com a Portaria Conjunta MDS/INSS nº 2/2015 (Anexo IV). ${contextoEtario} Na avaliação produzida, os qualificadores finais resultaram em Fatores Ambientais ${qWord(amb.q)}, Atividades e Participação ${qWord(ativ.q)} e Funções do Corpo ${qWord(corpo.q)}. Consta, ainda, indicação técnica de possibilidade de resolução das alterações em prazo inferior a 2 (dois) anos, o que afasta o requisito de impedimento de longo prazo.`;
    } else {
      const reasonFinal = /[.!?]$/.test(reason) ? reason : `${reason}.`;
      paragrafo1 = `A controvérsia deve ser resolvida conforme o art. 20, §§ 2º e 10, da Lei nº 8.742/1993, em conjunto com a Portaria Conjunta MDS/INSS nº 2/2015 (Anexo IV). ${contextoEtario} Na avaliação produzida, os qualificadores finais resultaram em Fatores Ambientais ${qWord(amb.q)}, Atividades e Participação ${qWord(ativ.q)} e Funções do Corpo ${qWord(corpo.q)}, com reconhecimento de impedimento de longo prazo. Ainda que presente limitação funcional, a combinação normativa não supera o patamar mínimo exigido pela Tabela Conclusiva. ${reasonFinal}`;
    }
    paragrafo2 = 'Assim, à luz dos parâmetros legais e regulamentares aplicáveis, não se configura, neste ponto, o enquadramento da parte autora como pessoa com deficiência para fins de BPC/LOAS.';
  }

  document.getElementById('textoPadrao').value = [paragrafo1, paragrafo2].filter(Boolean).join('\n\n');
}

async function copyStandardText() {
  const feedback = document.getElementById('copyFeedback');
  const area = document.getElementById('textoPadrao');
  await copyToClipboard(area, feedback);
}

function handleModeSwitcherClick(mode) {
  setUIMode(mode, { scrollToJudicial: mode === 'controle' });
}

bindAppEvents({
  onDomainButtonClick: handleDomainButtonClick,
  onToggleProg: handleToggleProg,
  onToggleEstr: handleToggleEstr,
  onToggleImpedimento: handleToggleImpedimento,
  onToggleDark: handleToggleDark,
  onToggleMenor16: handleToggleMenor16,
  onInputIdade: handleInputIdade,
  onChangeIdadeUnidade: handleChangeIdadeUnidade,
  onAmbTabClick: handleAmbTabClick,
  onApplyPadrao: handleApplyPadrao,
  onLimpar: handleLimpar,
  onLevarParaControle: sendScenarioToJudicialDraft,
  onUseCurrentAsBase: handleUseCurrentAsBase,
  onFixarBaseAdmin: fixAdminBaseFromDraft,
  onClearComp: handleClearComp,
  onCopiarTexto: copyStandardText,
  onModeSwitcherClick: handleModeSwitcherClick
});

bindJudicialControlEvents({
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
  notifyInteraction: notifyJudicialInteraction
});



// ============ INIT ============
// A11y & Tooltips for static buttons
initStaticRatingA11yLabels(Q_NAMES);

buildDomainRows(document.getElementById('domAmb'), DOM_AMB);
buildDomainRows(document.getElementById('domCorpo'), DOM_CORPO);
buildDomainRows(document.getElementById('domAtivM'), DOM_ATIV_M);
buildDomainRows(document.getElementById('domAtivS'), DOM_ATIV_S);
syncChildModeByControls();
applyChildRules();
resetJudicialControl();
renderJudicialControl();
setUIMode('controle', { preserveAccordionState: false });
buildTabelaGrid();

update();
