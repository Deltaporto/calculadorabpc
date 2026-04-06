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
  createDomainState,
  createEmptyAdminCorpoRecognition as createEmptyAdminCorpoRecognitionState,
  createEmptyDomains as createEmptyDomainsState,
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
import { DOMAIN_HELP_KEYS, SIM_HELP_CONTENT } from './help-content.js';
import { initStaticRatingA11yLabels, initKeyboardNav } from './a11y.js';
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
import { showToast } from './toast.js';
import { initFlowchartView } from './flowchart-view.js';

// ============ STATE ============
const ALL_DOMAINS = [...DOM_AMB, ...DOM_CORPO, ...DOM_ATIV_M, ...DOM_ATIV_S];
const ATIV_DOMAINS = [...DOM_ATIV_M, ...DOM_ATIV_S];
const state = createDomainState(ALL_DOMAINS);
let progDesfav = false, estrMaior = false, impedimento = false, crianca = false, idadeMeses = CHILD_AGE_LIMIT_MONTHS, idadeValor = 15, idadeUnidade = 'anos';
let savedINSS = null;
let uiMode = 'controle';

function createEmptyAdminCorpoRecognition() {
  return createEmptyAdminCorpoRecognitionState();
}

function createEmptyCorpoReclassDomains() {
  return createEmptyDomainsState(JC_CORPO_RECLASS_DOMAINS);
}

function createEmptyAtivReclassDomains() {
  return createEmptyDomainsState(JC_ATIV_RECLASS_DOMAINS);
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
const PORTARIA_SOURCES = {
  p2_2015: {
    title: 'Portaria Conjunta MDS/INSS nº 2/2015',
    textPath: 'docs/normas/portaria-conjunta-2-2015.txt',
    pdfPath: 'docs/normas/portaria-conjunta-2-2015.pdf'
  },
  p34_2025: {
    title: 'Portaria Conjunta MDS/INSS nº 34/2025',
    textPath: 'docs/normas/portaria-mds-inss-34-2025.txt',
    pdfPath: 'docs/normas/portaria-mds-inss-34-2025.pdf'
  }
};
const DEFAULT_PORTARIA_SOURCE_KEY = 'p2_2015';
let portariaTextCache = new Map();
let openPortariaModalBySource = null;
let lastPortariaTrigger = null;
let pendingPadraoDialogContext = null;
let lastPadraoDialogTrigger = null;
let pendingConfirmDialogResolver = null;
let lastConfirmDialogTrigger = null;
let confirmDialogElements = null;
let activeSimHelpKey = null;
let activeSimHelpTrigger = null;
let simHelpPositionFrame = null;
let simHelpResizeObserver = null;
const SIM_HELP_MOBILE_QUERY = '(max-width: 940px)';
const SIM_HELP_MARGIN_PX = 12;
const SIM_HELP_OFFSET_PX = 10;

// ⚡ Optimization: Cache frequently accessed DOM nodes to avoid layout thrashing and DOM traversal overhead during high-frequency copy/render events
let textoControleJudicial = null;
let copyFeedbackControle = null;
let textoPadrao = null;
let copyFeedback = null;

// ⚡ Optimization: Avoid recreation of arrays and redundant layout checks for text output buttons
const TEXTO_BTNS_CONFIG = [
  { id: 'btnGerarControleTexto', title: 'Gera a minuta de decisão com base no controle judicial' },
  { id: 'btnGerarCopiarControleTexto', title: 'Gera e copia a minuta de decisão com base no controle judicial' },
  { id: 'btnCopiarControleTexto', title: 'Copia a minuta de decisão gerada' }
];

// ⚡ Optimization: Extract static arrays to module-level to avoid garbage collection pressure in high-frequency rendering cycles
const JC_PROGRESS_LABELS = ['Base administrativa', 'Perícia médica', 'Triagem probatória', 'Texto da decisão'];
const JC_PROGRESS_STEP_IDS = ['stepAdmin', 'stepMed', 'stepTriagem', 'stepTexto'];
const PADRAO_MEDIO_ENTRIES = Object.entries({ e1: 2, e2: 2, e3: 2, e4: 1, e5: 2, d6: 3, d7: 2, d8: 3, d9: 3 });
const Q_WORDS = ['nenhum', 'leve', 'moderado', 'grave', 'completo'];

// ⚡ Optimization: Helper to avoid redundant layout thrashing
function toggleHiddenIfChanged(elId, isHidden) {
  const el = document.getElementById(elId);
  if (el && el.classList.contains('hidden') !== isHidden) {
    el.classList.toggle('hidden', isHidden);
  }
}

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
  return getDecisionReasonFromScale(ambQ, ativQ, corpoQ, yes, Q_LABELS, Q_NAMES, Q_FULL);
}
function createIcon(name, cls = 'ui-icon') {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', cls);
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `#i-${name}`);
  svg.appendChild(use);
  return svg;
}
function setDecisionIcon(name) {
  document.getElementById('decIcon').replaceChildren(createIcon(name, 'ui-icon lg'));
}
function getItemNumber(amb, ativ, corpo) {
  // Formula derived from the loop structure (corpo 4->0, ativ 4->0, amb 4->0)
  // Index (0-based) = (4 - corpo) * 25 + (4 - ativ) * 5 + (4 - amb)
  return ((4 - corpo) * 25) + ((4 - ativ) * 5) + (4 - amb) + 1;
}

function renderSafeHTML(content) {
  const fragment = document.createDocumentFragment();
  const parts = content.split(/(<\/?strong>)/g);
  let inside = false;

  parts.forEach(part => {
    if (part === '<strong>') {
      inside = true;
    } else if (part === '</strong>') {
      inside = false;
    } else if (part) {
      if (inside) {
        const b = document.createElement('strong');
        b.textContent = part;
        fragment.appendChild(b);
      } else {
        fragment.appendChild(document.createTextNode(part));
      }
    }
  });
  return fragment;
}

function createTraceLine(html) {
  const div = document.createElement('div');
  div.className = 'jc-trace-line';
  div.appendChild(renderSafeHTML(html));
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
  buildDomainRowsView(container, domains, Q_LABELS, Q_NAMES, DOMAIN_HELP_KEYS);
}
let lastAmbTabForGrid = null;
function buildTabelaGrid() {
  if (lastAmbTabForGrid === currentAmbTab) return;
  lastAmbTabForGrid = currentAmbTab;
  buildTabelaGridView(document.getElementById('tGrid'), Q_LABELS, Q_NAMES, currentAmbTab, tabelaConclusiva);
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

function getDomainButtons(domain) {
  const group = document.querySelector(`[data-domain="${domain}"]`);
  return group ? group.getElementsByClassName('note-btn') : [];
}

function handleDomainButtonClick({ button, group, domain, value }) {
  if (!button || button.classList.contains('locked')) return;
  const btns = getDomainButtons(domain);
  for (let i = 0; i < btns.length; i++) {
    const noteButton = btns[i];
    noteButton.classList.remove('active');
    noteButton.setAttribute('aria-pressed', 'false');
  }
  button.classList.add('active');
  button.setAttribute('aria-pressed', 'true');
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
  // ⚡ Optimization: Native for-loop to prevent callback overhead, and boolean checks before DOM mutations to avoid layout thrashing
  for (let dIdx = 0; dIdx < ATIV_DOMAINS.length; dIdx++) {
    const d = ATIV_DOMAINS[dIdx];
    const btns = getDomainButtons(d.id);
    if (crianca && idadeMeses < d.cut) {
      if (!(d.id in childDomainBackup)) childDomainBackup[d.id] = state[d.id];
      state[d.id] = 4;
      for (let i = 0; i < btns.length; i++) {
        const b = btns[i];
        const isActive = +b.dataset.value === 4;
        if (b.classList.contains('active') !== isActive) {
          b.classList.toggle('active', isActive);
          b.setAttribute('aria-pressed', String(isActive));
        }
        if (!b.classList.contains('locked')) {
          b.classList.add('locked');
          b.setAttribute('aria-disabled', 'true');
        }
        b.setAttribute('title', `Não aplicável: idade informada (${idadeMeses} meses) é menor que o ponto de corte deste domínio (${d.cut} meses).`);
      }
    } else {
      if (d.id in childDomainBackup) {
        state[d.id] = childDomainBackup[d.id];
        delete childDomainBackup[d.id];
      }
      for (let i = 0; i < btns.length; i++) {
        const b = btns[i];
        if (b.classList.contains('locked')) {
          b.classList.remove('locked');
          b.removeAttribute('aria-disabled');
          const originalLabel = b.getAttribute('aria-label');
          if (originalLabel) {
            b.setAttribute('title', originalLabel);
          } else {
            b.removeAttribute('title');
          }
        }
        const isActive = +b.dataset.value === state[d.id];
        if (b.classList.contains('active') !== isActive) {
          b.classList.toggle('active', isActive);
          b.setAttribute('aria-pressed', String(isActive));
        }
      }
    }
  }
  updateChildAutoSummary();
}

function handleAmbTabClick({ tab, value }) {
  currentAmbTab = value;
  document.querySelectorAll('.amb-tab').forEach(ambTab => {
    ambTab.classList.remove('active');
    ambTab.setAttribute('aria-pressed', 'false');
  });
  tab.classList.add('active');
  tab.setAttribute('aria-pressed', 'true');
  buildTabelaGrid();
  const ativ = calcAtividades();
  const corpo = calcCorpo();
  highlightActiveCell(ativ.q, corpo.q);
}

function clearSimHelpPopoverPosition(popover) {
  if (!popover) return;
  popover.style.top = '';
  popover.style.left = '';
  popover.style.right = '';
  popover.style.bottom = '';
}

function scheduleSimHelpPopoverPosition() {
  if (simHelpPositionFrame != null) cancelAnimationFrame(simHelpPositionFrame);
  simHelpPositionFrame = requestAnimationFrame(() => {
    simHelpPositionFrame = null;
    positionSimHelpPopover();
  });
}

function closeSimHelpPopover() {
  const popover = document.getElementById('simHelpPopover');
  const excerptEl = document.getElementById('simHelpExcerpt');
  const excerptBtn = document.getElementById('simHelpExcerptBtn');
  if (simHelpPositionFrame != null) {
    cancelAnimationFrame(simHelpPositionFrame);
    simHelpPositionFrame = null;
  }
  let triggerToFocus = null;
  if (activeSimHelpTrigger) {
    activeSimHelpTrigger.setAttribute('aria-expanded', 'false');
    if (popover && popover.contains(document.activeElement)) {
      triggerToFocus = activeSimHelpTrigger;
    }
  }
  activeSimHelpKey = null;
  activeSimHelpTrigger = null;
  if (excerptEl) excerptEl.classList.add('hidden');
  if (excerptBtn) {
    excerptBtn.textContent = 'Ver base legal (trecho)';
    excerptBtn.setAttribute('aria-expanded', 'false');
    excerptBtn.removeAttribute('title');
  }
  if (!popover) return;
  popover.classList.add('hidden');
  popover.classList.remove('mobile', 'floating');
  popover.setAttribute('aria-hidden', 'true');
  clearSimHelpPopoverPosition(popover);
  if (triggerToFocus) {
    try { triggerToFocus.focus({ preventScroll: true }); } catch { triggerToFocus.focus(); }
  }
}

function positionSimHelpPopover() {
  if (!activeSimHelpKey || !activeSimHelpTrigger) return;
  const popover = document.getElementById('simHelpPopover');
  if (!popover || popover.classList.contains('hidden')) return;

  const isMobile = window.matchMedia(SIM_HELP_MOBILE_QUERY).matches;
  popover.classList.toggle('mobile', isMobile);
  popover.classList.toggle('floating', !isMobile);
  if (isMobile) {
    clearSimHelpPopoverPosition(popover);
    return;
  }

  const triggerRect = activeSimHelpTrigger.getBoundingClientRect();
  if (triggerRect.width === 0 && triggerRect.height === 0) return;
  const popRect = popover.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let left = triggerRect.left + (triggerRect.width / 2) - (popRect.width / 2);
  const minLeft = SIM_HELP_MARGIN_PX;
  const maxLeft = viewportWidth - popRect.width - SIM_HELP_MARGIN_PX;
  if (maxLeft <= minLeft) {
    left = Math.max(minLeft, (viewportWidth - popRect.width) / 2);
  } else {
    if (left < minLeft) left = minLeft;
    if (left > maxLeft) left = maxLeft;
  }

  let top = triggerRect.bottom + SIM_HELP_OFFSET_PX;
  const maxTop = viewportHeight - popRect.height - SIM_HELP_MARGIN_PX;
  if (top > maxTop) top = triggerRect.top - popRect.height - SIM_HELP_OFFSET_PX;
  if (top < SIM_HELP_MARGIN_PX) top = SIM_HELP_MARGIN_PX;

  const leftPx = `${Math.round(left)}px`;
  const topPx = `${Math.round(top)}px`;
  if (popover.style.left !== leftPx) popover.style.left = leftPx;
  if (popover.style.top !== topPx) popover.style.top = topPx;
  if (popover.style.right !== 'auto') popover.style.right = 'auto';
  if (popover.style.bottom !== 'auto') popover.style.bottom = 'auto';
}

function openSimHelpPopover(helpKey, trigger) {
  const entry = SIM_HELP_CONTENT[helpKey];
  const popover = document.getElementById('simHelpPopover');
  const titleEl = document.getElementById('simHelpTitle');
  const summaryEl = document.getElementById('simHelpSummary');
  const listEl = document.getElementById('simHelpList');
  const sourceEl = document.getElementById('simHelpSource');
  const excerptEl = document.getElementById('simHelpExcerpt');
  const excerptBtn = document.getElementById('simHelpExcerptBtn');
  const portariaBtn = document.getElementById('simHelpPortariaBtn');
  if (!entry || !popover || !titleEl || !summaryEl || !listEl || !sourceEl || !excerptEl || !excerptBtn || !portariaBtn) return;

  if (activeSimHelpTrigger && activeSimHelpTrigger !== trigger) {
    activeSimHelpTrigger.setAttribute('aria-expanded', 'false');
  }

  titleEl.textContent = entry.title;
  summaryEl.textContent = entry.summary;
  const listFragment = document.createDocumentFragment();
  entry.bullets.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    listFragment.appendChild(li);
  });
  listEl.replaceChildren(listFragment);
  sourceEl.textContent = `Base legal: ${entry.source}`;
  excerptEl.textContent = entry.legalExcerpt || '';
  excerptEl.classList.add('hidden');
  excerptBtn.textContent = 'Ver base legal (trecho)';
  excerptBtn.setAttribute('aria-expanded', 'false');
  excerptBtn.disabled = !entry.legalExcerpt;
  excerptBtn.setAttribute('aria-disabled', String(!entry.legalExcerpt));
  if (!entry.legalExcerpt) {
    excerptBtn.setAttribute('title', 'Não há trecho legal específico disponível para este item.');
  } else {
    excerptBtn.removeAttribute('title');
  }
  portariaBtn.dataset.helpKey = helpKey;
  portariaBtn.dataset.portariaSourceKey = entry.portariaSourceKey || DEFAULT_PORTARIA_SOURCE_KEY;

  activeSimHelpKey = helpKey;
  activeSimHelpTrigger = trigger;
  trigger.setAttribute('aria-expanded', 'true');

  popover.classList.remove('hidden');
  popover.setAttribute('aria-hidden', 'false');
  positionSimHelpPopover();
  scheduleSimHelpPopoverPosition();

  // UX/A11y: Move focus into the popover so keyboard users can access its content
  requestAnimationFrame(() => {
    popover.focus();
  });
}

function toggleSimHelpPopover(trigger) {
  const helpKey = trigger?.dataset?.helpKey;
  if (!helpKey) return;
  if (activeSimHelpKey === helpKey && activeSimHelpTrigger === trigger) {
    closeSimHelpPopover();
    return;
  }
  openSimHelpPopover(helpKey, trigger);
}

// Padrão Médio Social
function getPadraoApplyContext() {
  let skippedByAgeCut = 0;
  const eligibleEntries = PADRAO_MEDIO_ENTRIES.filter(([id]) => {
    if (crianca) {
      const d = ATIV_DOMAINS.find(x => x.id === id);
      if (d && idadeMeses < d.cut) { skippedByAgeCut++; return false; }
    }
    return true;
  });
  const manuallyFilledEligible = eligibleEntries.filter(([id]) => userFilledDomains.has(id));
  const entriesPreserve = eligibleEntries.filter(([id]) => !userFilledDomains.has(id));
  const entriesOverwrite = eligibleEntries;
  return { eligibleEntries, manuallyFilledEligible, entriesPreserve, entriesOverwrite, skippedByAgeCut };
}

function applyPadraoEntries(entriesToApply) {
  entriesToApply.forEach(([id, v]) => {
    state[id] = v;
    const btns = getDomainButtons(id);
    for (let i = 0; i < btns.length; i++) {
      const b = btns[i];
      b.classList.remove('active');
      if (+b.dataset.value === v) b.classList.add('active');
    }
  });
  update();
}

function showConfirmDialog({
  title = 'Confirmar ação',
  message = '',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  confirmTone = 'danger'
} = {}) {
  if (!confirmDialogElements) return Promise.resolve(false);

  const { modal, titleEl, messageEl, cancelBtn, confirmBtn } = confirmDialogElements;
  if (pendingConfirmDialogResolver) {
    pendingConfirmDialogResolver(false);
    pendingConfirmDialogResolver = null;
  }

  if (typeof modal.close === 'function' && modal.open) {
    modal.close('cancel');
  } else if (modal.hasAttribute('open')) {
    modal.removeAttribute('open');
  }

  lastConfirmDialogTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  titleEl.textContent = title;
  messageEl.textContent = message;
  cancelBtn.textContent = cancelLabel;
  confirmBtn.textContent = confirmLabel;
  confirmBtn.classList.remove('btn-red', 'btn-primary');
  confirmBtn.classList.add(confirmTone === 'danger' ? 'btn-red' : 'btn-primary');

  return new Promise(resolve => {
    pendingConfirmDialogResolver = resolve;
    if (typeof modal.showModal === 'function') {
      if (!modal.open) modal.showModal();
    } else {
      modal.setAttribute('open', '');
    }
    try {
      cancelBtn.focus({ preventScroll: true });
    } catch {
      cancelBtn.focus();
    }
  });
}

async function applyPadraoWithConfirmFallback(context) {
  const hasOnlyManual = context.entriesPreserve.length === 0;
  if (hasOnlyManual) {
    const overwrite = await showConfirmDialog({
      title: 'Aplicar padrão médio',
      message: 'Todos os domínios elegíveis já foram preenchidos manualmente. Deseja sobrescrever esses preenchimentos com o padrão?',
      confirmLabel: 'Sobrescrever preenchidos',
      cancelLabel: 'Cancelar',
      confirmTone: 'primary'
    });
    if (overwrite) applyPadraoEntries(context.entriesOverwrite);
    return;
  }
  const overwrite = await showConfirmDialog({
    title: 'Aplicar padrão médio',
    message:
      `Foram encontrados ${context.manuallyFilledEligible.length} domínios elegíveis já preenchidos manualmente.\n\n` +
      'Clique em "Sobrescrever preenchidos" para aplicar o padrão a todos os domínios elegíveis.\n' +
      'Clique em "Preservar preenchidos" para manter os domínios manuais e aplicar o padrão apenas nos domínios vazios.',
    confirmLabel: 'Sobrescrever preenchidos',
    cancelLabel: 'Preservar preenchidos',
    confirmTone: 'primary'
  });
  applyPadraoEntries(overwrite ? context.entriesOverwrite : context.entriesPreserve);
}

function openPadraoDecisionDialog(context) {
  const modal = document.getElementById('padraoModal');
  const messageEl = document.getElementById('padraoModalMessage');
  const summaryEl = document.getElementById('padraoModalSummary');
  const preserveBtn = document.getElementById('padraoPreserveBtn');
  const overwriteBtn = document.getElementById('padraoOverwriteBtn');
  if (!modal || !messageEl || !summaryEl || !preserveBtn || !overwriteBtn) {
    void applyPadraoWithConfirmFallback(context);
    return;
  }

  const hasOnlyManual = context.entriesPreserve.length === 0;
  pendingPadraoDialogContext = context;
  lastPadraoDialogTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  messageEl.textContent = hasOnlyManual
    ? 'Todos os domínios elegíveis deste padrão já foram preenchidos manualmente. Escolha se deseja sobrescrever esses preenchimentos.'
    : `Foram encontrados ${context.manuallyFilledEligible.length} domínios elegíveis já preenchidos manualmente.`;

  const summaryFragment = document.createDocumentFragment();
  const summaryLines = [
    { label: 'Atualizações preservando preenchidos: ', val: context.entriesPreserve.length },
    { label: 'Atualizações sobrescrevendo preenchidos: ', val: context.entriesOverwrite.length },
    { label: 'Domínios manuais elegíveis: ', val: context.manuallyFilledEligible.length },
    { label: 'Não aplicáveis por corte etário: ', val: context.skippedByAgeCut }
  ];
  summaryLines.forEach(line => {
    const div = document.createElement('div');
    const strong = document.createElement('strong');
    strong.textContent = line.label;
    div.appendChild(strong);
    div.appendChild(document.createTextNode(String(line.val)));
    summaryFragment.appendChild(div);
  });
  summaryEl.replaceChildren(summaryFragment);

  preserveBtn.disabled = hasOnlyManual;
  preserveBtn.setAttribute('aria-disabled', String(hasOnlyManual));
  preserveBtn.title = hasOnlyManual ? 'Não há domínios vazios elegíveis para atualização sem sobrescrita.' : '';

  if (typeof modal.showModal === 'function') {
    if (!modal.open) modal.showModal();
  } else {
    modal.setAttribute('open', '');
  }
  if (hasOnlyManual) {
    overwriteBtn.focus();
  } else {
    preserveBtn.focus();
  }
}

function handleApplyPadrao() {
  const context = getPadraoApplyContext();

  if (!context.eligibleEntries.length) {
    showToast('Padrão Médio Social não aplicado: nenhum domínio está elegível em razão dos pontos de corte etários.', 'warning');
    return;
  }

  if (!context.manuallyFilledEligible.length) {
    applyPadraoEntries(context.entriesOverwrite);
    showToast('Padrão médio social aplicado com sucesso.', 'success');
    return;
  }

  openPadraoDecisionDialog(context);
}

// Clear
async function handleLimpar() {
  const confirmed = await showConfirmDialog({
    title: 'Limpar calculadora',
    message: 'Tem certeza que deseja limpar todos os dados da calculadora?',
    confirmLabel: 'Limpar tudo',
    cancelLabel: 'Cancelar',
    confirmTone: 'danger'
  });
  if (!confirmed) return;
  Object.keys(state).forEach(k => state[k] = 0);
  Object.keys(childDomainBackup).forEach(k => delete childDomainBackup[k]);
  userFilledDomains.clear();
  progDesfav = false; estrMaior = false; impedimento = false;
  crianca = false; idadeValor = 15; idadeUnidade = 'anos'; idadeMeses = CHILD_AGE_LIMIT_MONTHS;
  document.getElementById('toggleProg').checked = false;
  document.getElementById('toggleEstr').checked = false;
  document.getElementById('toggleImpedimento').checked = false;
  document.getElementById('toggleMenor16').checked = false;
  document.getElementById('inputIdade').value = idadeValor;
  document.getElementById('inputIdadeUnidade').value = idadeUnidade;
  syncChildModeByControls();
  // ⚡ Optimization: Live HTMLCollection avoids memory allocation and GC pressure compared to NodeList caching
  const noteBtns = document.getElementsByClassName('note-btn');
  for (let i = 0; i < noteBtns.length; i++) {
    const b = noteBtns[i];
    b.classList.remove('active', 'locked');
    const isZero = +b.dataset.value === 0;
    if (isZero) b.classList.add('active');
    b.setAttribute('aria-pressed', isZero);
  }
  applyChildRules();
  update();
  showToast('Calculadora limpa com sucesso.', 'success');
}

// Save/Comparison + Judicial Control
function updateComparison(amb, ativ, corpo) {
  if (!savedINSS) return;
  const s = savedINSS;
  document.getElementById('compINSSq').textContent = `Fatores Ambientais: ${Q_LABELS[s.amb]} · Atividades e Participação: ${Q_LABELS[s.ativ]} · Funções do Corpo: ${Q_LABELS[s.corpo]}`;

  const inssrEl = document.getElementById('compINSSr');
  inssrEl.replaceChildren(createIcon(s.result ? 'check-circle' : 'x-circle', 'ui-icon sm'));
  inssrEl.appendChild(document.createTextNode(` ${s.result ? 'DEFERIDO' : 'INDEFERIDO'}`));
  inssrEl.className = 'comp-result ' + (s.result ? 'yes' : 'no');

  const curResult = impedimento ? false : tabelaConclusiva(amb.q, ativ.q, corpo.q);
  document.getElementById('compPERq').textContent = `Fatores Ambientais: ${Q_LABELS[amb.q]} · Atividades e Participação: ${Q_LABELS[ativ.q]} · Funções do Corpo: ${Q_LABELS[corpo.q]}`;

  const perrrEl = document.getElementById('compPERr');
  perrrEl.replaceChildren(createIcon(curResult ? 'check-circle' : 'x-circle', 'ui-icon sm'));
  perrrEl.appendChild(document.createTextNode(` ${curResult ? 'DEFERIDO' : 'INDEFERIDO'}`));
  perrrEl.className = 'comp-result ' + (curResult ? 'yes' : 'no');

  let changes = [];
  if (s.amb !== amb.q) changes.push(`Fatores Ambientais: ${Q_LABELS[s.amb]}→${Q_LABELS[amb.q]}`);
  if (s.ativ !== ativ.q) changes.push(`Atividades e Participação: ${Q_LABELS[s.ativ]}→${Q_LABELS[ativ.q]}`);
  if (s.corpo !== corpo.q) changes.push(`Funções do Corpo: ${Q_LABELS[s.corpo]}→${Q_LABELS[corpo.q]}`);

  const compChangeEl = document.getElementById('compChange');
  compChangeEl.replaceChildren();

  let hasReversal = false;
  if (!s.result && curResult) {
    compChangeEl.appendChild(createIcon('swap', 'ui-icon sm'));
    compChangeEl.appendChild(document.createTextNode(' Resultado REVERTIDO: Indeferido → Deferido'));
    hasReversal = true;
  } else if (s.result && !curResult) {
    compChangeEl.appendChild(createIcon('swap', 'ui-icon sm'));
    compChangeEl.appendChild(document.createTextNode(' Resultado REVERTIDO: Deferido → Indeferido'));
    hasReversal = true;
  }

  if (changes.length > 0) {
    if (hasReversal) {
      compChangeEl.appendChild(document.createTextNode(' · '));
    }
    compChangeEl.appendChild(document.createTextNode(changes.join(' · ')));
  } else if (!hasReversal) {
    compChangeEl.textContent = 'Sem alteração no resultado';
  }
}

function setStepState(id, state, text) {
  const el = document.getElementById(id);
  if (!el) return;
  const expectedClass = `jc-step-state ${state}`;
  if (el.className !== expectedClass) el.className = expectedClass;
  if (el.textContent !== text) el.textContent = text;
}

function setStatusBadge(kind, iconName, textHtml) {
  const badge = document.getElementById('jcStatusBadge');
  if (!badge) return;
  const expectedClass = `jc-status-badge ${kind}`;
  if (badge.className !== expectedClass) badge.className = expectedClass;
  badge.replaceChildren();

  if (iconName) {
    badge.appendChild(createIcon(iconName, 'ui-icon sm'));
    badge.appendChild(document.createTextNode(' '));
  }
  badge.appendChild(renderSafeHTML(textHtml));
}

function setWhyBlocked(message = '') {
  const box = document.getElementById('jcWhyBlocked');
  if (!box) return;
  const text = box.querySelector('span');
  if (!message) {
    if (!box.classList.contains('hidden')) box.classList.add('hidden');
    if (text.textContent !== '') text.textContent = '';
    return;
  }
  if (box.classList.contains('hidden')) box.classList.remove('hidden');
  if (text.textContent !== message) text.textContent = message;
}

function notifyJudicialInteraction(sourceId) {
  pendingJudicialInteraction = { sourceId, at: Date.now() };
}

// ⚡ Optimization: Track invalid elements in a Set to avoid full DOM traversal on every render
const currentInvalidElements = new Set();

function clearJudicialInvalidHighlights() {
  currentInvalidElements.forEach(el => {
    el.classList.remove('jc-invalid');
    el.removeAttribute('aria-invalid');
  });
  currentInvalidElements.clear();
}

function markJudicialInvalidTargets(items = []) {
  // ⚡ Optimization: Native for-loop to prevent array callbacks and directly extract IDs to avoid intermediate Set/Array allocations
  for (let i = 0; i < items.length; i++) {
    const id = items[i].invalidId || items[i].targetId;
    if (!id) continue;
    const el = document.getElementById(id);
    if (el && !currentInvalidElements.has(el)) {
      el.classList.add('jc-invalid');
      el.setAttribute('aria-invalid', 'true');
      currentInvalidElements.add(el);
    }
  }
}

function getGuidanceFocusElement(target) {
  if (!target) return null;
  if (target.matches('button, select, textarea, input, [tabindex]:not([tabindex="-1"])')) return target;
  return target.querySelector('button:not([disabled]), select:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])');
}

function isTextEntryElement(el) {
  if (!el || !el.tagName) return false;
  if (el.tagName === 'TEXTAREA') return true;
  if (el.tagName !== 'INPUT') return false;
  const type = (el.getAttribute('type') || 'text').toLowerCase();
  return ['text', 'search', 'email', 'url', 'tel', 'password', 'number'].includes(type);
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
  const activeEl = document.activeElement;
  if (activeEl && activeEl.id === interaction.sourceId && isTextEntryElement(activeEl)) return;
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

  const expectedClass = `jc-step-guidance ${tone}`;
  if (box.className !== expectedClass) box.className = expectedClass;
  if (textEl.textContent !== text) textEl.textContent = text;
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
    items.push({ label: 'informe se o INSS reconheceu alterações em Estruturas do Corpo mais limitantes', targetId: 'jcAdminEstruturasRecButtons' });
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
      // ⚡ Optimization: Native for-loop with early return to avoid Array.prototype.some overhead
      let hasAnyDomain = false;
      for (let i = 0; i < JC_CORPO_RECLASS_DOMAINS.length; i++) {
        if (m.corpoAdminDomains[JC_CORPO_RECLASS_DOMAINS[i]] != null) {
          hasAnyDomain = true;
          break;
        }
      }
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

function scrollToFlowchartSection() {
  const section = document.getElementById('flowchartSection');
  if (!section) return;
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      section.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      section.focus({ preventScroll: true });
    });
  });
}

function renderModeVisibility(options = {}) {
  const app = document.querySelector('.app');
  const details = document.getElementById('simuladorDetails');
  const textoSection = document.getElementById('textoSection');
  const flowchartSection = document.getElementById('flowchartSection');
  const isSimulador = uiMode === 'simulador';
  const isControle = uiMode === 'controle';
  const isFluxograma = uiMode === 'fluxograma';

  app.classList.toggle('mode-simulador', isSimulador);
  app.classList.toggle('mode-controle', isControle);
  app.classList.toggle('mode-fluxograma', isFluxograma);
  textoSection.classList.toggle('hidden', !isSimulador);
  if (flowchartSection) {
    flowchartSection.classList.toggle('hidden', !isFluxograma);
  }

  if (isSimulador) {
    details.open = true;
  } else if (!options.preserveAccordionState) {
    details.open = false;
  }
  syncModeSwitcher();
}

function setUIMode(mode, options = {}) {
  if (!['simulador', 'controle', 'fluxograma'].includes(mode)) return;
  if (uiMode === mode) {
    renderModeVisibility({ preserveAccordionState: true, ...options });
    if (mode === 'controle' && options.scrollToJudicial) scrollToJudicialControlSection();
    if (mode === 'fluxograma' && options.scrollToFlowchart) scrollToFlowchartSection();
    return;
  }
  uiMode = mode;
  renderModeVisibility(options);
  if (mode === 'simulador') renderStandardText();
  if (mode === 'controle' && options.scrollToJudicial) scrollToJudicialControlSection();
  if (mode === 'fluxograma' && options.scrollToFlowchart) scrollToFlowchartSection();
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
  const activeStep = getActiveJudicialStep();
  const progressPct = getJudicialProgressPct(activeStep);
  judicialControl.ui.activeStep = activeStep;
  judicialControl.ui.progressPct = progressPct;

  const bar = document.getElementById('jcProgressBar');
  const expectedWidth = `${progressPct}%`;
  if (bar.style.width !== expectedWidth) bar.style.width = expectedWidth;
  const expectedAriaVal = String(progressPct);
  if (bar.getAttribute('aria-valuenow') !== expectedAriaVal) bar.setAttribute('aria-valuenow', expectedAriaVal);

  const pctText = `${progressPct}%`;
  const pctEl = document.getElementById('jcProgressPct');
  if (pctEl.textContent !== pctText) pctEl.textContent = pctText;

  const labelText = `Etapa ${activeStep} de 4 · ${JC_PROGRESS_LABELS[activeStep - 1]}`;
  const labelEl = document.getElementById('jcProgressLabel');
  if (labelEl.textContent !== labelText) labelEl.textContent = labelText;

  // ⚡ Optimization: Native for-loop with inline checks instead of Array.forEach with unconditional DOM updates
  for (let i = 0; i < JC_PROGRESS_STEP_IDS.length; i++) {
    const el = document.getElementById(JC_PROGRESS_STEP_IDS[i]);
    if (!el) continue;
    const isActive = i + 1 === activeStep;
    if (el.classList.contains('active-step') !== isActive) {
      el.classList.toggle('active-step', isActive);
      if (isActive) el.setAttribute('aria-current', 'step');
      else el.removeAttribute('aria-current');
    }
  }
}

function syncQButtonGroup(groupId, value) {
  const group = document.getElementById(groupId);
  if (!group) return;
  const btns = group.getElementsByClassName('jc-q-btn');
  for (let i = 0; i < btns.length; i++) {
    const btn = btns[i];
    const isActive = value != null && +btn.dataset.value === value;
    if (btn.classList.contains('active') !== isActive) {
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive);
    }
  }
}

function syncSegmentedGroup(groupId, value) {
  const group = document.getElementById(groupId);
  if (!group) return;
  const btns = group.getElementsByClassName('jc-seg-btn');
  for (let i = 0; i < btns.length; i++) {
    const btn = btns[i];
    const isActive = value != null && btn.dataset.value === value;
    if (btn.classList.contains('active') !== isActive) {
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive);
    }
  }
}

function clearJudicialTextArea() {
  if (textoControleJudicial) textoControleJudicial.value = '';
  if (copyFeedbackControle) copyFeedbackControle.textContent = '';
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
  const reconhecimentoText = ` Reconhecimento INSS: alterações em Estruturas do Corpo mais limitantes ${b.corpoReconhecimentoInss.estruturasReconhecidas ? 'reconhecidas' : 'não reconhecidas'}, prognóstico desfavorável ${b.corpoReconhecimentoInss.prognosticoReconhecido ? 'reconhecido' : 'não reconhecido'}.`;
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
  // ⚡ Optimization: Avoid array creation and methods (every/some) for simple 3-prop checks
  const draftComplete = draft.amb != null && draft.ativ != null && draft.corpo != null;
  const draftHasAny = draft.amb != null || draft.ativ != null || draft.corpo != null;
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
    showToast('Preencha os três qualificadores finais da base administrativa e os reconhecimentos do INSS em Funções do Corpo.', 'error');
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
  showToast('Base administrativa fixada com sucesso.', 'success');
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

async function clearJudicialMedicalAndTriage() {
  const confirmed = await showConfirmDialog({
    title: 'Limpar etapa médica e triagem',
    message: 'Tem certeza que deseja limpar as etapas médica e triagem?',
    confirmLabel: 'Limpar etapa',
    cancelLabel: 'Cancelar',
    confirmTone: 'danger'
  });
  if (!confirmed) return;
  judicialControl.med = createEmptyJudicialMed();
  judicialControl.triage = { ready: false, status: 'pending', testeA: null, testeB: null, reason: '', route: null };
  clearJudicialTextArea();
  renderJudicialControl();
  if (copyFeedbackControle) {
    copyFeedbackControle.textContent = judicialControl.adminBase
      ? 'Etapa médica e triagem reiniciadas. A base administrativa foi mantida.'
      : 'Controle judicial limpo.';
  }
}

function renderJudicialControl() {
  syncQButtonGroup('jcAdminAmbButtons', judicialControl.adminDraft.amb);
  syncQButtonGroup('jcAdminAtivButtons', judicialControl.adminDraft.ativ);
  syncQButtonGroup('jcAdminCorpoButtons', judicialControl.adminDraft.corpo);
  syncSegmentedGroup('jcAdminEstruturasRecButtons', judicialControl.adminDraft.corpoReconhecimentoInss.estruturasReconhecidas == null ? null : (judicialControl.adminDraft.corpoReconhecimentoInss.estruturasReconhecidas ? 'sim' : 'nao'));
  syncSegmentedGroup('jcAdminProgRecButtons', judicialControl.adminDraft.corpoReconhecimentoInss.prognosticoReconhecido == null ? null : (judicialControl.adminDraft.corpoReconhecimentoInss.prognosticoReconhecido ? 'sim' : 'nao'));
  syncSegmentedGroup('jcCorpoKeepButtons', judicialControl.med.corpoKeepAdmin == null ? null : (judicialControl.med.corpoKeepAdmin ? 'sim' : 'nao'));
  syncQButtonGroup('jcCorpoManualButtons', judicialControl.med.corpoJudManual);
  // ⚡ Optimization: Native for-loop to avoid Array.prototype.forEach callback allocation overhead
  for (let i = 0; i < JC_CORPO_RECLASS_DOMAINS.length; i++) {
    const id = JC_CORPO_RECLASS_DOMAINS[i];
    syncQButtonGroup(`jcCorpo${id.toUpperCase()}Buttons`, judicialControl.med.corpoAdminDomains[id]);
  }
  syncQButtonGroup('jcAtivMedSimpleButtons', judicialControl.med.ativMedSimple);
  updateAdminAutofillShortcut();
  // ⚡ Optimization: Native for-loop to avoid Array.prototype.forEach callback allocation overhead
  for (let i = 0; i < JC_ATIV_RECLASS_DOMAINS.length; i++) {
    const id = JC_ATIV_RECLASS_DOMAINS[i];
    syncQButtonGroup(`jcAtiv${id.toUpperCase()}Buttons`, judicialControl.med.ativMedDomains[id]);
  }
  syncSegmentedGroup('jcImpedimentoButtons', judicialControl.med.impedimentoLP == null ? null : (judicialControl.med.impedimentoLP ? 'sim' : 'nao'));
  syncSegmentedGroup('jcAtivModeButtons', judicialControl.med.ativMode);
  let corpoFlow = resolveCorpoJudFlow();
  judicialControl.med.corpoJud = corpoFlow.q;
  const reasonSelect = document.getElementById('jcCorpoReasonSelect');
  const reasonHint = document.getElementById('jcCorpoReasonHint');
  // ⚡ Optimization: Native for-loop to prevent array spread, and boolean checks before setting properties
  for (let i = 0; i < reasonSelect.options.length; i++) {
    const opt = reasonSelect.options[i];
    if (!opt.value) continue;
    const shouldBeDisabled = isCorpoReasonBlocked(opt.value);
    if (opt.disabled !== shouldBeDisabled) opt.disabled = shouldBeDisabled;

    const expectedTitle = shouldBeDisabled ? getCorpoReasonBlockedMessage(opt.value) : '';
    if (opt.getAttribute('title') !== expectedTitle) {
      if (expectedTitle) {
        opt.setAttribute('title', expectedTitle);
      } else {
        opt.removeAttribute('title');
      }
    }
  }
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
  toggleHiddenIfChanged('jcCorpoChangeWrap', !showCorpoChange);
  toggleHiddenIfChanged('jcCorpoDomainWrap', !showCorpoDomains);
  toggleHiddenIfChanged('jcCorpoManualWrap', !showCorpoManual);
  const reductionAlert = document.getElementById('jcCorpoReductionAlert');
  const reductionConfirm = document.getElementById('jcCorpoReductionConfirm');
  const hasReduction = showCorpoChange && corpoFlow.q != null && judicialControl.adminBase && corpoFlow.q < judicialControl.adminBase.corpo;
  toggleHiddenIfChanged('jcCorpoReductionAlert', !hasReduction);
  const expectedReductionConfirm = !!judicialControl.med.corpoAlertReductionConfirmed;
  if (reductionConfirm.checked !== expectedReductionConfirm) reductionConfirm.checked = expectedReductionConfirm;
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
  toggleHiddenIfChanged('jcHasAtivMedField', !ativContext.showQuestion);
  if (ativContext.showQuestion) {
    const hintText = `${ativContext.reason} Se “Sim”, escolha o modo de requalificação abaixo.`;
    if (hasAtivHint.textContent !== hintText) hasAtivHint.textContent = hintText;
    if (!ativNotApplicableNote.classList.contains('hidden')) ativNotApplicableNote.classList.add('hidden');
    if (ativNotApplicableNote.textContent !== '') ativNotApplicableNote.textContent = '';
  } else {
    if (hasAtivHint.textContent !== 'Se “Sim”, escolha o modo de requalificação abaixo.') hasAtivHint.textContent = 'Se “Sim”, escolha o modo de requalificação abaixo.';
    const showAtivContextNote = ['sem_impedimento_lp', 'corpo_nl', 'verificacao_adm_positiva'].includes(ativContext.code);
    const noteText = showAtivContextNote ? ativContext.reason : '';
    if (ativNotApplicableNote.textContent !== noteText) ativNotApplicableNote.textContent = noteText;
    if (ativNotApplicableNote.classList.contains('hidden') === showAtivContextNote) ativNotApplicableNote.classList.toggle('hidden', !showAtivContextNote);
  }
  syncSegmentedGroup('jcHasAtivMedButtons', judicialControl.med.hasAtivMed == null ? null : (judicialControl.med.hasAtivMed ? 'sim' : 'nao'));
  const showAtivMed = ativContext.showQuestion && judicialControl.med.hasAtivMed === true;
  const isSimple = showAtivMed && judicialControl.med.ativMode === 'simples';
  const isComplete = showAtivMed && judicialControl.med.ativMode === 'completa';
  toggleHiddenIfChanged('jcAtivMedWrap', !showAtivMed);
  toggleHiddenIfChanged('jcAtivModeSimpleWrap', !isSimple);
  toggleHiddenIfChanged('jcAtivModeCompleteWrap', !isComplete);
  const justField = document.getElementById('jcAtivMedJustification');
  if (justField.value !== judicialControl.med.ativMedJustification) {
    justField.value = judicialControl.med.ativMedJustification;
  }
  const computed = updateAtivMedComputed();
  const summary = document.getElementById('jcAtivComputedSummary');
  if (!isComplete) {
    summary.textContent = 'Preencha d1–d9 para calcular o qualificador final de Atividades e Participação.';
  } else if (!computed) {
    // ⚡ Optimization: Native for-loop to count filled domains, avoiding Array.prototype.filter callback allocation and intermediate array overhead
    let filled = 0;
    for (let i = 0; i < JC_ATIV_RECLASS_DOMAINS.length; i++) {
      if (judicialControl.med.ativMedDomains[JC_ATIV_RECLASS_DOMAINS[i]] != null) filled++;
    }
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

  const disableTextoBtns = () => {
    for (let i = 0; i < TEXTO_BTNS_CONFIG.length; i++) {
      const el = document.getElementById(TEXTO_BTNS_CONFIG[i].id);
      if (el) {
        if (!el.disabled) el.disabled = true;
        const expectedTitle = 'A triagem probatória precisa ser concluída antes de gerar a minuta.';
        if (el.getAttribute('title') !== expectedTitle) el.setAttribute('title', expectedTitle);
      }
    }
  };

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
    setStatusBadge('pending', 'alert', 'Preencha as etapas 1 e 2 para liberar a conclusão probatória.');
    document.getElementById('jcTrace').replaceChildren(createTraceLine('Etapa 1: fixe a base administrativa do INSS para iniciar o controle judicial.'));
    setWhyBlocked(blockReason);
    disableTextoBtns();
    renderJudicialProgress();
    markJudicialInvalidTargets(adminPendingItems);
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
    setStatusBadge('pending', 'alert', triage.reason);
    document.getElementById('jcTrace').replaceChildren(createTraceLine(triage.reason));
    setWhyBlocked(triage.reason);
    disableTextoBtns();
    renderJudicialProgress();
    const activeStep = getActiveJudicialStep();
    if (activeStep === 1) {
      markJudicialInvalidTargets(adminPendingItems);
    } else if (activeStep === 2) {
      markJudicialInvalidTargets(medPendingItems);
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
    setStatusBadge('dispensa', 'check-circle', '<strong>Avaliação social judicial dispensável</strong>');
  } else {
    setStatusBadge('necessaria', 'alert', '<strong>Avaliação social judicial necessária</strong>');
  }
  setStepGuidance('triagem', {
    tone: 'done',
    text: triage.status === 'dispensa'
      ? 'Triagem concluída: avaliação social judicial dispensável.'
      : 'Triagem concluída: avaliação social judicial necessária.'
  });
  const hasDecisionText = !!(textoControleJudicial && textoControleJudicial.value.trim());
  setStepGuidance('texto', hasDecisionText
    ? {
      tone: 'done',
      text: 'Minuta disponível. Você pode copiar o texto ou gerar novamente.'
    }
    : {
      tone: 'pending',
      text: 'Triagem concluída. Gere a minuta padronizada para finalizar a etapa 4.'
    });

  for (let i = 0; i < TEXTO_BTNS_CONFIG.length; i++) {
    const b = TEXTO_BTNS_CONFIG[i];
    const el = document.getElementById(b.id);
    if (el) {
      const isTextoDisabled = !triage.ready;
      if (el.disabled !== isTextoDisabled) el.disabled = isTextoDisabled;
      const expectedTitle = triage.ready ? b.title : 'A triagem probatória precisa ser concluída antes de gerar a minuta.';
      if (el.getAttribute('title') !== expectedTitle) el.setAttribute('title', expectedTitle);
    }
  }

  setWhyBlocked('');
  renderJudicialProgress();
  const activeStep = getActiveJudicialStep();
  if (activeStep === 1) {
    markJudicialInvalidTargets(adminPendingItems);
  } else if (activeStep === 2) {
    markJudicialInvalidTargets(medPendingItems);
  }
  const nextTargetId = activeStep === 4 && !hasDecisionText
    ? 'btnGerarControleTexto'
    : '';
  maybeAdvanceToNextPending(nextTargetId);
}

function renderJudicialControlText() {
  if (textoControleJudicial) {
    textoControleJudicial.value = buildJudicialControlText({
      adminBase: judicialControl.adminBase,
      triage: judicialControl.triage,
      med: judicialControl.med,
      corpoFlow: resolveCorpoJudFlow(),
      ativMedResolved: resolveAtivMed(),
      getItemNumber
    });
  }
  renderJudicialControl();
}

async function copyToClipboard(area, feedback, triggerButton = null) {
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
    showToast('Texto copiado para a área de transferência.', 'success');

    if (triggerButton) {
      if (triggerButton.dataset.timerId) {
        clearTimeout(Number(triggerButton.dataset.timerId));
      } else if (!triggerButton.dataset.originalStateSaved) {
        // Clear old state but keep track that we have replaced content
        const frag = document.createDocumentFragment();
        while (triggerButton.firstChild) {
          frag.appendChild(triggerButton.firstChild);
        }
        triggerButton.dataset.originalStateSaved = "true";
        triggerButton._originalNodes = frag;

        triggerButton.replaceChildren(createIcon('check-circle', 'ui-icon sm'));
        triggerButton.appendChild(document.createTextNode('Copiado!'));
      }

      const timerId = setTimeout(() => {
        if (triggerButton.dataset.originalStateSaved && triggerButton._originalNodes) {
          triggerButton.replaceChildren(triggerButton._originalNodes);
          delete triggerButton.dataset.originalStateSaved;
          delete triggerButton._originalNodes;
          delete triggerButton.dataset.timerId;
        }
      }, 2000);
      triggerButton.dataset.timerId = String(timerId);
    }
  } catch (err) {
    area.focus();
    area.select();
    feedback.textContent = 'Não foi possível copiar automaticamente. Use Ctrl+C.';
    showToast('Não foi possível copiar automaticamente. Use Ctrl+C.', 'error');
  }
}

async function copyJudicialControlText(event) {
  const button = event?.target?.closest('button');
  await copyToClipboard(textoControleJudicial, copyFeedbackControle, button);
}

function generateAndCopyJudicialText(event) {
  renderJudicialControlText();
  copyJudicialControlText(event);
}

function sendScenarioToJudicialDraft() {
  setUIMode('controle', { scrollToJudicial: false });
  setTimeout(() => {
    const section = document.getElementById('judicialControlSection');
    if (section) section.focus();
  }, 0);
  notifyJudicialInteraction('btnLevarParaControle');
  applyCurrentQualifiersAsAdminDraft();
  showToast('Cenário copiado para o rascunho do Controle Judicial.', 'success');
}

function handleUseCurrentAsBase() {
  notifyJudicialInteraction('btnUseCurrentAsBase');
  applyCurrentQualifiersAsAdminDraft();
  showToast('Rascunho preenchido com os dados da Calculadora.', 'success');
}

async function handleClearComp() {
  const confirmed = await showConfirmDialog({
    title: 'Limpar comparação e controle judicial',
    message: 'Tem certeza que deseja limpar a comparação e o controle judicial?',
    confirmLabel: 'Limpar comparação',
    cancelLabel: 'Cancelar',
    confirmTone: 'danger'
  });
  if (!confirmed) return;
  savedINSS = null;
  document.getElementById('compSection').classList.add('hidden');
  document.getElementById('btnClearComp').classList.add('hidden');
  resetJudicialControl();
  renderJudicialControl();
  showToast('Comparação limpa com sucesso.', 'success');
}

function getAutoQualifiedChildDomains() {
  if (!crianca) return [];
  return ATIV_DOMAINS.filter(d => idadeMeses < d.cut);
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
    : '';
  const qWord = q => Q_WORDS[q];
  const contextoEtario = `${idadeTexto}${forcedText ? ` ${forcedText}` : ''}`;

  // Textos-base incorporados do arquivo modelos_textos_decisao_bpc.md (sem dependência externa)
  let paragrafo1 = '';
  let paragrafo2 = '';

  if (yes) {
    paragrafo1 = `À luz do art. 20, §§ 2º e 10, da Lei nº 8.742/1993, e dos critérios da Portaria Conjunta MDS/INSS nº 2/2015 (Anexo IV), examina-se o enquadramento da parte autora como pessoa com deficiência para fins de BPC.${contextoEtario ? ` ${contextoEtario}` : ''} No caso, os qualificadores finais apurados foram: Fatores Ambientais em grau ${qWord(amb.q)}, Atividades e Participação em grau ${qWord(ativ.q)} e Funções do Corpo em grau ${qWord(corpo.q)}, com reconhecimento de impedimento de longo prazo. A combinação desses qualificadores, confrontada com a Tabela Conclusiva da Portaria, conduz a resultado positivo para reconhecimento do requisito biopsicossocial legal.`;
    paragrafo2 = 'Diante disso, a parte autora se enquadra como pessoa com deficiência para fins de BPC/LOAS.';
  } else {
    if (impedimento) {
      paragrafo1 = `A controvérsia deve ser resolvida conforme o art. 20, §§ 2º e 10, da Lei nº 8.742/1993, em conjunto com a Portaria Conjunta MDS/INSS nº 2/2015.${contextoEtario ? ` ${contextoEtario}` : ''} Na avaliação produzida, os qualificadores finais resultaram em Fatores Ambientais em grau ${qWord(amb.q)}, Atividades e Participação em grau ${qWord(ativ.q)} e Funções do Corpo em grau ${qWord(corpo.q)}. Consta, porém, indicação técnica de possibilidade de resolução das alterações em prazo inferior a 2 (dois) anos, o que afasta o requisito de impedimento de longo prazo (art. 8º, III, da referida Portaria).`;
    } else {
      // Build a fluid justification citing art. 8º with the applicable inciso
      let justificativa;
      if (corpo.q <= 1) {
        justificativa = `O qualificador final de Funções do Corpo resultou em grau ${qWord(corpo.q)}, hipótese de indeferimento prevista no art. 8º, I, da referida Portaria.`;
      } else if (ativ.q <= 1) {
        justificativa = `O qualificador final de Atividades e Participação resultou em grau ${qWord(ativ.q)}, hipótese de indeferimento prevista no art. 8º, II, da referida Portaria.`;
      } else {
        justificativa = `A combinação moderado–moderado em Funções do Corpo e Atividades e Participação exigiria Fatores Ambientais em grau grave ou superior, porém estes ficaram em grau ${qWord(amb.q)}, de modo que a Tabela Conclusiva (Anexo IV) conduz a resultado negativo.`;
      }
      paragrafo1 = `A controvérsia deve ser resolvida conforme o art. 20, §§ 2º e 10, da Lei nº 8.742/1993, em conjunto com a Portaria Conjunta MDS/INSS nº 2/2015.${contextoEtario ? ` ${contextoEtario}` : ''} Na avaliação produzida, os qualificadores finais resultaram em Fatores Ambientais em grau ${qWord(amb.q)}, Atividades e Participação em grau ${qWord(ativ.q)} e Funções do Corpo em grau ${qWord(corpo.q)}, com reconhecimento de impedimento de longo prazo. ${justificativa}`;
    }
    paragrafo2 = 'Diante disso, não se configura o enquadramento da parte autora como pessoa com deficiência para fins de BPC/LOAS.';
  }

  if (textoPadrao) {
    textoPadrao.value = [paragrafo1, paragrafo2].filter(Boolean).join('\n\n');
  }
}

async function copyStandardText(event) {
  const button = event?.target?.closest('button');
  await copyToClipboard(textoPadrao, copyFeedback, button);
}

function handleModeSwitcherClick(mode) {
  setUIMode(mode, { scrollToJudicial: mode === 'controle', scrollToFlowchart: mode === 'fluxograma' });
}

function getPortariaSource(sourceKey = DEFAULT_PORTARIA_SOURCE_KEY) {
  return PORTARIA_SOURCES[sourceKey] || PORTARIA_SOURCES[DEFAULT_PORTARIA_SOURCE_KEY];
}

async function loadPortariaText(sourceKey = DEFAULT_PORTARIA_SOURCE_KEY) {
  const source = getPortariaSource(sourceKey);
  if (portariaTextCache.has(source.textPath)) return portariaTextCache.get(source.textPath);
  const response = await fetch(source.textPath, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Falha HTTP ${response.status}`);
  const text = await response.text();
  portariaTextCache.set(source.textPath, text);
  return text;
}

function setPortariaStatus(statusEl, message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle('error', isError);
}

function initPortariaModal() {
  const openTextBtn = document.getElementById('openPortariaTextBtn');
  const modal = document.getElementById('portariaModal');
  const titleEl = document.getElementById('portariaModalTitle');
  const closeBtn = document.getElementById('closePortariaModalBtn');
  const contentEl = document.getElementById('portariaContent');
  const statusEl = document.getElementById('portariaStatus');
  const pdfLink = document.getElementById('portariaPdfLink');
  if (!modal || !titleEl || !contentEl || !statusEl || !pdfLink) return;

  const closeModal = () => {
    if (typeof modal.close === 'function') {
      if (modal.open) modal.close();
      return;
    }
    modal.removeAttribute('open');
  };

  const openModal = async (sourceKey = DEFAULT_PORTARIA_SOURCE_KEY) => {
    const source = getPortariaSource(sourceKey);
    lastPortariaTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : openTextBtn;
    if (typeof modal.showModal === 'function') {
      if (!modal.open) modal.showModal();
    } else {
      modal.setAttribute('open', '');
    }
    titleEl.textContent = source.title;
    pdfLink.href = source.pdfPath;
    if (closeBtn) {
      try {
        closeBtn.focus({ preventScroll: true });
      } catch {
        closeBtn.focus();
      }
    }
    setPortariaStatus(statusEl, 'Carregando texto da Portaria...');
    contentEl.textContent = '';
    contentEl.setAttribute('aria-busy', 'true');
    try {
      const text = await loadPortariaText(sourceKey);
      contentEl.textContent = text;
      contentEl.scrollTop = 0;
      setPortariaStatus(statusEl, 'Texto da Portaria carregado.');
      contentEl.removeAttribute('aria-busy');
    } catch {
      contentEl.textContent = '';
      setPortariaStatus(statusEl, 'Não foi possível carregar o texto. Use o botão "Abrir PDF oficial".', true);
      contentEl.removeAttribute('aria-busy');
    }
  };

  openPortariaModalBySource = openModal;
  if (openTextBtn) {
    openTextBtn.addEventListener('click', () => openModal(DEFAULT_PORTARIA_SOURCE_KEY));
  }
  modal.querySelectorAll('[data-portaria-close]').forEach(btn => {
    btn.addEventListener('click', closeModal);
  });
  modal.addEventListener('click', event => {
    if (event.target === modal) closeModal();
  });
  modal.addEventListener('close', () => {
    if (lastPortariaTrigger && typeof lastPortariaTrigger.focus === 'function') {
      try {
        lastPortariaTrigger.focus({ preventScroll: true });
      } catch {
        lastPortariaTrigger.focus();
      }
    }
  });
}

function initPadraoModal() {
  const modal = document.getElementById('padraoModal');
  const preserveBtn = document.getElementById('padraoPreserveBtn');
  const overwriteBtn = document.getElementById('padraoOverwriteBtn');
  if (!modal || !preserveBtn || !overwriteBtn) return;

  const closeModal = () => {
    pendingPadraoDialogContext = null;
    if (typeof modal.close === 'function') {
      if (modal.open) modal.close();
      return;
    }
    modal.removeAttribute('open');
  };

  const applyChoice = (mode) => {
    if (!pendingPadraoDialogContext) {
      closeModal();
      return;
    }
    const entries = mode === 'overwrite'
      ? pendingPadraoDialogContext.entriesOverwrite
      : pendingPadraoDialogContext.entriesPreserve;
    if (entries.length) {
      applyPadraoEntries(entries);
      showToast('Padrão médio social aplicado com sucesso.', 'success');
    }
    closeModal();
  };

  preserveBtn.addEventListener('click', () => applyChoice('preserve'));
  overwriteBtn.addEventListener('click', () => applyChoice('overwrite'));
  modal.querySelectorAll('[data-padrao-close]').forEach(btn => {
    btn.addEventListener('click', closeModal);
  });
  modal.addEventListener('click', event => {
    if (event.target === modal) closeModal();
  });
  modal.addEventListener('close', () => {
    pendingPadraoDialogContext = null;
    if (lastPadraoDialogTrigger && typeof lastPadraoDialogTrigger.focus === 'function') {
      try {
        lastPadraoDialogTrigger.focus({ preventScroll: true });
      } catch {
        lastPadraoDialogTrigger.focus();
      }
    }
  });
}

function initConfirmModal() {
  const modal = document.getElementById('confirmModal');
  const titleEl = document.getElementById('confirmModalTitle');
  const messageEl = document.getElementById('confirmModalMessage');
  const cancelBtn = document.getElementById('confirmModalCancelBtn');
  const confirmBtn = document.getElementById('confirmModalConfirmBtn');
  if (!modal || !titleEl || !messageEl || !cancelBtn || !confirmBtn) return;

  confirmDialogElements = { modal, titleEl, messageEl, cancelBtn, confirmBtn };

  const closeModal = (accepted) => {
    if (typeof modal.close === 'function') {
      if (modal.open) modal.close(accepted ? 'confirm' : 'cancel');
      return;
    }
    modal.removeAttribute('open');
    if (pendingConfirmDialogResolver) {
      const resolve = pendingConfirmDialogResolver;
      pendingConfirmDialogResolver = null;
      resolve(Boolean(accepted));
    }
    if (lastConfirmDialogTrigger && typeof lastConfirmDialogTrigger.focus === 'function') {
      try {
        lastConfirmDialogTrigger.focus({ preventScroll: true });
      } catch {
        lastConfirmDialogTrigger.focus();
      }
    }
  };

  cancelBtn.addEventListener('click', () => closeModal(false));
  confirmBtn.addEventListener('click', () => closeModal(true));
  modal.querySelectorAll('[data-confirm-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(false));
  });
  modal.addEventListener('click', event => {
    if (event.target === modal) closeModal(false);
  });
  modal.addEventListener('cancel', event => {
    event.preventDefault();
    closeModal(false);
  });
  modal.addEventListener('close', () => {
    if (pendingConfirmDialogResolver) {
      const resolve = pendingConfirmDialogResolver;
      pendingConfirmDialogResolver = null;
      resolve(modal.returnValue === 'confirm');
    }
    if (lastConfirmDialogTrigger && typeof lastConfirmDialogTrigger.focus === 'function') {
      try {
        lastConfirmDialogTrigger.focus({ preventScroll: true });
      } catch {
        lastConfirmDialogTrigger.focus();
      }
    }
  });
}

function initBackToTop() {
  const btn = document.getElementById('btnBackToTop');
  if (!btn) return;

  const toggleVisibility = () => {
    btn.classList.toggle('hidden', window.scrollY < 300);
  };

  window.addEventListener('scroll', toggleVisibility, { passive: true });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const header = document.querySelector('header h1');
    if (header) {
      header.setAttribute('tabindex', '-1');
      header.focus({ preventScroll: true });
    }
  });
}

function initSimHelpPopover() {
  const popover = document.getElementById('simHelpPopover');
  const closeBtn = document.getElementById('simHelpCloseBtn');
  const excerptBtn = document.getElementById('simHelpExcerptBtn');
  const excerptEl = document.getElementById('simHelpExcerpt');
  const portariaBtn = document.getElementById('simHelpPortariaBtn');
  if (!popover || !closeBtn || !excerptBtn || !excerptEl || !portariaBtn) return;

  const handleDocumentClick = (event) => {
    const trigger = event.target.closest('.sim-help-btn');
    if (trigger) {
      event.preventDefault();
      toggleSimHelpPopover(trigger);
      return;
    }
    if (!activeSimHelpKey) return;
    if (!event.target.closest('#simHelpPopover')) closeSimHelpPopover();
  };

  document.addEventListener('click', handleDocumentClick);
  closeBtn.addEventListener('click', closeSimHelpPopover);
  excerptBtn.addEventListener('click', () => {
    const hidden = excerptEl.classList.toggle('hidden');
    excerptBtn.textContent = hidden ? 'Ver base legal (trecho)' : 'Ocultar base legal';
    excerptBtn.setAttribute('aria-expanded', String(!hidden));
    if (activeSimHelpKey) scheduleSimHelpPopoverPosition();
  });
  portariaBtn.addEventListener('click', () => {
    const sourceKey = portariaBtn.dataset.portariaSourceKey || DEFAULT_PORTARIA_SOURCE_KEY;
    if (typeof openPortariaModalBySource === 'function') {
      openPortariaModalBySource(sourceKey);
    } else {
      const openPortariaBtn = document.getElementById('openPortariaTextBtn');
      if (openPortariaBtn) openPortariaBtn.click();
    }
    closeSimHelpPopover();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && activeSimHelpKey) closeSimHelpPopover();
  });

  const syncViewportPosition = () => {
    if (activeSimHelpKey) scheduleSimHelpPopoverPosition();
  };

  window.addEventListener('resize', syncViewportPosition);
  window.addEventListener('scroll', () => {
    if (activeSimHelpKey && !window.matchMedia(SIM_HELP_MOBILE_QUERY).matches) {
      scheduleSimHelpPopoverPosition();
    }
  }, { passive: true });

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', syncViewportPosition);
    window.visualViewport.addEventListener('scroll', syncViewportPosition);
  }

  if (typeof ResizeObserver === 'function') {
    if (simHelpResizeObserver) simHelpResizeObserver.disconnect();
    simHelpResizeObserver = new ResizeObserver(() => {
      if (activeSimHelpKey) scheduleSimHelpPopoverPosition();
    });
    simHelpResizeObserver.observe(popover);
  }
}

function initCachedElements() {
  textoControleJudicial = document.getElementById('textoControleJudicial');
  copyFeedbackControle = document.getElementById('copyFeedbackControle');
  textoPadrao = document.getElementById('textoPadrao');
  copyFeedback = document.getElementById('copyFeedback');
}

// UX auto-select for readonly generated textareas
function initAutoSelectTextareas() {
  const textareas = [textoPadrao, textoControleJudicial];
  textareas.forEach(ta => {
    if (ta) {
      const handleSelect = function() {
        this.select();
      };
      ta.addEventListener('click', handleSelect);
      ta.addEventListener('focus', handleSelect);
    }
  });
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
initKeyboardNav();
initFlowchartView();
syncChildModeByControls();
applyChildRules();
resetJudicialControl();
renderJudicialControl();
setUIMode('controle', { preserveAccordionState: false });
buildTabelaGrid();
initPortariaModal();
initPadraoModal();
initConfirmModal();
initSimHelpPopover();
initBackToTop();
initCachedElements();
initAutoSelectTextareas();

update();
