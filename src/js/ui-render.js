export function setQBadge(id, q, labels) {
  const el = document.getElementById(id);
  el.textContent = labels[q];
  el.dataset.q = labels[q];
}

let activeCell = null;

export function highlightActiveCell(ativQ, corpoQ) {
  const targetId = `tc-${corpoQ}-${ativQ}`;
  const target = document.getElementById(targetId);

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
  const amb = calcAmbiente();
  const ativ = calcAtividades();
  const corpo = calcCorpo();

  document.getElementById('fAmb').innerHTML = `(<span class="val">${amb.sum}</span> × 5) − 0,1 = <span class="val">${amb.pct}%</span>`;
  const barAmb = document.getElementById('barAmb');
  barAmb.style.width = Math.min(100, amb.pct) + '%';
  barAmb.style.background = `var(--q${qLabels[amb.q]})`;
  setQBadge('qAmb', amb.q, qLabels);
  document.getElementById('nameAmb').textContent = qFull.amb[amb.q];

  const majoracaoInfo = corpo.majorado ? ` → <span class="val">${corpo.final}</span> (majoração +1)` : '';
  document.getElementById('fCorpo').innerHTML = `Máximo dos domínios: <span class="val">${corpo.max}</span>${majoracaoInfo}`;
  setQBadge('qCorpo', corpo.q, qLabels);
  document.getElementById('nameCorpo').textContent = qFull.corpo[corpo.q];

  document.getElementById('fAtiv').innerHTML = `(<span class="val">${ativ.sum}</span> × 2,778) − 0,1 = <span class="val">${ativ.pct}%</span>`;
  const barAtiv = document.getElementById('barAtiv');
  barAtiv.style.width = Math.min(100, ativ.pct) + '%';
  barAtiv.style.background = `var(--q${qLabels[ativ.q]})`;
  setQBadge('qAtiv', ativ.q, qLabels);
  document.getElementById('nameAtiv').textContent = qFull.ativ[ativ.q];

  setQBadge('rAmb', amb.q, qLabels);
  setQBadge('rAtiv', ativ.q, qLabels);
  setQBadge('rCorpo', corpo.q, qLabels);
  document.getElementById('dAmb').textContent = qNames[amb.q];
  document.getElementById('dAtiv').textContent = qNames[ativ.q];
  document.getElementById('dCorpo').textContent = qNames[corpo.q];

  setCurrentAmbTab(amb.q);
  document.querySelectorAll('.amb-tab').forEach(tab => {
    tab.classList.toggle('active', +tab.dataset.a === amb.q);
  });
  buildTabelaGrid();
  highlightActiveCell(ativ.q, corpo.q);

  const decision = document.getElementById('decision');
  const item = getItemNumber(amb.q, ativ.q, corpo.q);
  if (impedimento) {
    decision.className = 'decision impedimento';
    setDecisionIcon('alert');
    document.getElementById('decLabel').textContent = 'INDEFERIDO';
    document.getElementById('decReason').textContent = 'Impedimento inferior a 2 anos — requisito não satisfeito';
    document.getElementById('decItem').textContent = 'Art. 20, §§ 2º e 10, Lei 8.742/93';
  } else {
    const yes = tabelaConclusiva(amb.q, ativ.q, corpo.q);
    decision.className = `decision ${yes ? 'deferido' : 'indeferido'}`;
    setDecisionIcon(yes ? 'check-circle' : 'x-circle');
    document.getElementById('decLabel').textContent = yes ? 'DEFERIDO' : 'INDEFERIDO';
    document.getElementById('decReason').textContent = getDecisionReason(amb.q, ativ.q, corpo.q, yes);
    document.getElementById('decItem').textContent = `Item ${item} da Tabela Conclusiva`;
  }
  decision.classList.add('pop');
  setTimeout(() => decision.classList.remove('pop'), 300);

  if (savedINSS) updateComparison(amb, ativ, corpo);
  if (!document.getElementById('textoSection').classList.contains('hidden')) {
    renderStandardText(amb, ativ, corpo);
  }
  if (uiMode === 'controle') updateAdminAutofillShortcut();

  return { amb, ativ, corpo };
}
