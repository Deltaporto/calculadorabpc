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

export function getDecisionReason(ambQ, ativQ, corpoQ, yes, labels, names) {
  if (!yes) {
    if (corpoQ <= 1) return `Funções do Corpo = ${labels[corpoQ]} (${names[corpoQ]}) — exige-se ≥ Moderada`;
    if (ativQ <= 1) return `Atividades e Participação = ${labels[ativQ]} (${names[ativQ]}) — exige-se ≥ Moderada`;
    return `Combinação M-M com Fatores Ambientais ${labels[ambQ]} — exige-se Fatores Ambientais ≥ Grave`;
  }
  if (corpoQ >= 3 && ativQ >= 2) {
    return `Funções do Corpo ${labels[corpoQ]} + Atividades e Participação ${labels[ativQ]} — deferimento independente de Fatores Ambientais`;
  }
  if (ativQ >= 3 && corpoQ >= 2) {
    return `Atividades e Participação ${labels[ativQ]} + Funções do Corpo ${labels[corpoQ]} — deferimento independente de Fatores Ambientais`;
  }
  return `Funções do Corpo M + Atividades e Participação M + Fatores Ambientais ${labels[ambQ]} (≥ G) — combinação deferida`;
}

export function computeAtivFromDomains(domains, ativDomainIds, pctToQFn = pctToQ) {
  if (!domains) return null;
  const missing = ativDomainIds.some(id => domains[id] == null);
  if (missing) return null;
  const sum = ativDomainIds.reduce((acc, id) => acc + domains[id], 0);
  const pctRaw = Math.max(0, (sum * 2.77777777777778) - 0.1);
  return { sum, pct: +pctRaw.toFixed(1), q: pctToQFn(pctRaw) };
}
