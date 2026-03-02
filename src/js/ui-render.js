const elementCache = new Map();

function getById(id) {
  const cached = elementCache.get(id);
  if (cached && cached.isConnected) return cached;
  const el = document.getElementById(id);
  if (el) elementCache.set(id, el);
  return el;
}

function setTextIfChanged(el, value) {
  if (el && el.textContent !== value) el.textContent = value;
}

function setStyleIfChanged(el, property, value) {
  if (!el) return;
  if (el.style[property] !== value) el.style[property] = value;
}

function setDataQIfChanged(el, value) {
  if (!el) return;
  if (el.dataset.q !== value) el.dataset.q = value;
}

let activeCell = null;
let activeAmbTab = null;
let lastAmbTabValue = null;
let lastDecisionTone = null;
let lastDecisionIcon = null;
let lastDecisionSignature = null;
let decisionPopTimer = null;
let cachedRefs = null;

function setQBadgeElement(el, q, labels) {
  if (!el) return;
  const label = labels[q];
  setTextIfChanged(el, label);
  setDataQIfChanged(el, label);
}

function ensureRefs() {
  if (cachedRefs && cachedRefs.fAmb && cachedRefs.fAmb.isConnected) return cachedRefs;
  const refs = {
    fAmb: getById('fAmb'),
    barAmb: getById('barAmb'),
    qAmb: getById('qAmb'),
    nameAmb: getById('nameAmb'),
    fCorpo: getById('fCorpo'),
    qCorpo: getById('qCorpo'),
    nameCorpo: getById('nameCorpo'),
    fAtiv: getById('fAtiv'),
    barAtiv: getById('barAtiv'),
    qAtiv: getById('qAtiv'),
    nameAtiv: getById('nameAtiv'),
    rAmb: getById('rAmb'),
    rAtiv: getById('rAtiv'),
    rCorpo: getById('rCorpo'),
    dAmb: getById('dAmb'),
    dAtiv: getById('dAtiv'),
    dCorpo: getById('dCorpo'),
    decision: getById('decision'),
    decLabel: getById('decLabel'),
    decReason: getById('decReason'),
    decItem: getById('decItem'),
    textoSection: getById('textoSection')
  };
  const ambTabs = [...document.querySelectorAll('.amb-tab')];
  refs.ambTabMap = new Map(ambTabs.map(tab => [+tab.dataset.a, tab]));
  cachedRefs = refs;
  return refs;
}

function syncAmbTab(ambValue, refs) {
  const next = refs.ambTabMap.get(ambValue) || null;
  if (activeAmbTab === next) return;

  if (activeAmbTab) {
    activeAmbTab.classList.remove('active');
    activeAmbTab.setAttribute('aria-pressed', 'false');
  }
  if (next) {
    next.classList.add('active');
    next.setAttribute('aria-pressed', 'true');
  }
  activeAmbTab = next;
}

function triggerDecisionPop(decisionEl) {
  if (!decisionEl) return;
  decisionEl.classList.add('pop');
  if (decisionPopTimer) clearTimeout(decisionPopTimer);
  decisionPopTimer = setTimeout(() => {
    decisionEl.classList.remove('pop');
    decisionPopTimer = null;
  }, 300);
}

export function setQBadge(id, q, labels) {
  const el = getById(id);
  setQBadgeElement(el, q, labels);
}

export function highlightActiveCell(ativQ, corpoQ) {
  const targetId = `tc-${corpoQ}-${ativQ}`;
  const target = getById(targetId);

  if (activeCell === target) return;

  if (activeCell) {
    activeCell.classList.remove('active-cell');
  }

  if (target) {
    target.classList.add('active-cell');
    activeCell = target;
  } else {
    activeCell = null;
  }
}

export function runMainUpdate({
  calcAmbiente,
  calcAtividades,
  calcCorpo,
  qLabels,
  qNames,
  qFull,
  impedimento,
  tabelaConclusiva,
  getDecisionReason,
  getItemNumber,
  setDecisionIcon,
  setCurrentAmbTab,
  buildTabelaGrid,
  savedINSS,
  updateComparison,
  renderStandardText,
  uiMode,
  updateAdminAutofillShortcut
}) {
  const refs = ensureRefs();
  const amb = calcAmbiente();
  const ativ = calcAtividades();
  const corpo = calcCorpo();

  const fAmbFrag = document.createDocumentFragment();
  fAmbFrag.appendChild(document.createTextNode('('));
  const fAmbSpan1 = document.createElement('span');
  fAmbSpan1.className = 'val';
  fAmbSpan1.textContent = String(amb.sum);
  fAmbFrag.appendChild(fAmbSpan1);
  fAmbFrag.appendChild(document.createTextNode(' × 5) − 0,1 = '));
  const fAmbSpan2 = document.createElement('span');
  fAmbSpan2.className = 'val';
  fAmbSpan2.textContent = `${amb.pct}%`;
  fAmbFrag.appendChild(fAmbSpan2);
  refs.fAmb.replaceChildren(fAmbFrag);

  setStyleIfChanged(refs.barAmb, 'width', `${Math.min(100, amb.pct)}%`);
  setStyleIfChanged(refs.barAmb, 'background', `var(--q${qLabels[amb.q]})`);
  setQBadgeElement(refs.qAmb, amb.q, qLabels);
  setTextIfChanged(refs.nameAmb, qFull.amb[amb.q]);

  const fCorpoFrag = document.createDocumentFragment();
  fCorpoFrag.appendChild(document.createTextNode('Máximo dos domínios: '));
  const fCorpoSpan1 = document.createElement('span');
  fCorpoSpan1.className = 'val';
  fCorpoSpan1.textContent = String(corpo.max);
  fCorpoFrag.appendChild(fCorpoSpan1);
  if (corpo.majorado) {
    fCorpoFrag.appendChild(document.createTextNode(' → '));
    const fCorpoSpan2 = document.createElement('span');
    fCorpoSpan2.className = 'val';
    fCorpoSpan2.textContent = String(corpo.final);
    fCorpoFrag.appendChild(fCorpoSpan2);
    fCorpoFrag.appendChild(document.createTextNode(' (majoração +1)'));
  }
  refs.fCorpo.replaceChildren(fCorpoFrag);

  setQBadgeElement(refs.qCorpo, corpo.q, qLabels);
  setTextIfChanged(refs.nameCorpo, qFull.corpo[corpo.q]);

  const fAtivFrag = document.createDocumentFragment();
  fAtivFrag.appendChild(document.createTextNode('('));
  const fAtivSpan1 = document.createElement('span');
  fAtivSpan1.className = 'val';
  fAtivSpan1.textContent = String(ativ.sum);
  fAtivFrag.appendChild(fAtivSpan1);
  fAtivFrag.appendChild(document.createTextNode(' × 2,778) − 0,1 = '));
  const fAtivSpan2 = document.createElement('span');
  fAtivSpan2.className = 'val';
  fAtivSpan2.textContent = `${ativ.pct}%`;
  fAtivFrag.appendChild(fAtivSpan2);
  refs.fAtiv.replaceChildren(fAtivFrag);
  setStyleIfChanged(refs.barAtiv, 'width', `${Math.min(100, ativ.pct)}%`);
  setStyleIfChanged(refs.barAtiv, 'background', `var(--q${qLabels[ativ.q]})`);
  setQBadgeElement(refs.qAtiv, ativ.q, qLabels);
  setTextIfChanged(refs.nameAtiv, qFull.ativ[ativ.q]);

  setQBadgeElement(refs.rAmb, amb.q, qLabels);
  setQBadgeElement(refs.rAtiv, ativ.q, qLabels);
  setQBadgeElement(refs.rCorpo, corpo.q, qLabels);
  setTextIfChanged(refs.dAmb, qNames[amb.q]);
  setTextIfChanged(refs.dAtiv, qNames[ativ.q]);
  setTextIfChanged(refs.dCorpo, qNames[corpo.q]);

  if (lastAmbTabValue !== amb.q) {
    setCurrentAmbTab(amb.q);
    syncAmbTab(amb.q, refs);
    buildTabelaGrid();
    lastAmbTabValue = amb.q;
  }
  highlightActiveCell(ativ.q, corpo.q);

  const decision = refs.decision;
  const item = getItemNumber(amb.q, ativ.q, corpo.q);
  let tone;
  let iconName;
  let label;
  let reason;
  let itemText;
  if (impedimento) {
    tone = 'impedimento';
    iconName = 'alert';
    label = 'INDEFERIDO';
    reason = 'Impedimento inferior a 2 anos — requisito não satisfeito';
    itemText = 'Art. 20, §§ 2º e 10, Lei 8.742/93';
  } else {
    const yes = tabelaConclusiva(amb.q, ativ.q, corpo.q);
    tone = yes ? 'deferido' : 'indeferido';
    iconName = yes ? 'check-circle' : 'x-circle';
    label = yes ? 'DEFERIDO' : 'INDEFERIDO';
    reason = getDecisionReason(amb.q, ativ.q, corpo.q, yes);
    itemText = `Item ${item} da Tabela Conclusiva`;
  }

  if (decision && lastDecisionTone !== tone) {
    decision.classList.remove('deferido', 'indeferido', 'impedimento');
    decision.classList.add(tone);
    lastDecisionTone = tone;
  }
  if (iconName !== lastDecisionIcon) {
    setDecisionIcon(iconName);
    lastDecisionIcon = iconName;
  }

  setTextIfChanged(refs.decLabel, label);
  setTextIfChanged(refs.decReason, reason);
  setTextIfChanged(refs.decItem, itemText);

  const decisionSignature = `${tone}|${iconName}|${label}|${reason}|${itemText}`;
  if (decisionSignature !== lastDecisionSignature) {
    triggerDecisionPop(decision);
    lastDecisionSignature = decisionSignature;
  }

  if (savedINSS) updateComparison(amb, ativ, corpo);
  if (refs.textoSection && !refs.textoSection.classList.contains('hidden')) {
    renderStandardText(amb, ativ, corpo);
  }
  if (uiMode === 'controle') updateAdminAutofillShortcut();

  return { amb, ativ, corpo };
}
