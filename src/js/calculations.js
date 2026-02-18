export function pctToQ(pct) {
  let normalized = pct;
  if (normalized < 0) normalized = 0;
  if (normalized <= 4) return 0;
  if (normalized <= 24) return 1;
  if (normalized <= 49) return 2;
  if (normalized <= 95) return 3;
  return 4;
}

export function calcAmbienteFromState(state, domains, pctToQFn = pctToQ) {
  const sum = domains.reduce((acc, d) => acc + state[d.id], 0);
  const pct = Math.max(0, (sum * 5) - 0.1);
  return { sum, pct: +pct.toFixed(1), q: pctToQFn(pct) };
}

export function calcAtividadesFromState(state, domains, pctToQFn = pctToQ) {
  const sum = domains.reduce((acc, d) => acc + state[d.id], 0);
  const pct = Math.max(0, (sum * 2.77777777777778) - 0.1);
  return { sum, pct: +pct.toFixed(1), q: pctToQFn(pct) };
}

export function calcCorpoFromState(state, domains, options = {}) {
  const { progDesfav = false, estrMaior = false } = options;
  let max = domains.reduce((acc, d) => Math.max(acc, state[d.id]), 0);
  const base = max;
  if ((progDesfav || estrMaior) && max < 4) {
    max += 1;
  }
  return { max: base, final: max, majorado: max > base, q: max };
}

export function tabelaConclusiva(amb, ativ, corpo) {
  if (corpo <= 1) return false;
  if (ativ <= 1) return false;
  if (corpo >= 3) return true;
  if (ativ >= 3) return true;
  return amb >= 3;
}

export function getDecisionReason(ambQ, ativQ, corpoQ, yes, labels, names, qFull) {
  const fAmb = qFull ? qFull.amb[ambQ] : `${labels[ambQ]} (${names[ambQ]})`;
  const fCorpo = qFull ? qFull.corpo[corpoQ] : `${labels[corpoQ]} (${names[corpoQ]})`;
  const fAtiv = qFull ? qFull.ativ[ativQ] : `${labels[ativQ]} (${names[ativQ]})`;
  if (!yes) {
    if (corpoQ <= 1) return `Funções do Corpo com ${fCorpo.toLowerCase()} — exige-se alteração ≥ moderada`;
    if (ativQ <= 1) return `Atividades e Participação com ${fAtiv.toLowerCase()} — exige-se dificuldade ≥ moderada`;
    return `Combinação M-M com Fatores Ambientais com ${fAmb.toLowerCase()} — exige-se barreira ≥ grave`;
  }
  if (corpoQ >= 3 && ativQ >= 2) {
    return `Funções do Corpo com ${fCorpo.toLowerCase()} + Atividades e Participação com ${fAtiv.toLowerCase()} — deferimento independente de Fatores Ambientais`;
  }
  if (ativQ >= 3 && corpoQ >= 2) {
    return `Atividades e Participação com ${fAtiv.toLowerCase()} + Funções do Corpo com ${fCorpo.toLowerCase()} — deferimento independente de Fatores Ambientais`;
  }
  return `Funções do Corpo com alteração moderada + Atividades e Participação com dificuldade moderada + Fatores Ambientais com ${fAmb.toLowerCase()} (≥ grave) — combinação deferida`;
}

export function computeAtivFromDomains(domains, ativDomainIds, pctToQFn = pctToQ) {
  if (!domains) return null;
  const missing = ativDomainIds.some(id => domains[id] == null);
  if (missing) return null;
  const sum = ativDomainIds.reduce((acc, id) => acc + domains[id], 0);
  const pctRaw = Math.max(0, (sum * 2.77777777777778) - 0.1);
  return { sum, pct: +pctRaw.toFixed(1), q: pctToQFn(pctRaw) };
}
