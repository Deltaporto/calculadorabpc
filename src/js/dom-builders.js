export function buildDomainRows(container, domains, labels, names, domainHelpKeys = {}) {
  const scale = document.createElement('div');
  scale.className = 'note-scale-row';
  scale.innerHTML = `<div class="note-scale-spacer"></div>
  <div class="note-scale">${labels.map(l => `<span>${l}</span>`).join('')}</div>`;
  container.appendChild(scale);

  domains.forEach(d => {
    const helpKey = domainHelpKeys[d.id];
    const helpButton = helpKey
      ? `<button type="button" class="sim-help-btn domain-help-btn" data-help-key="${helpKey}" aria-label="Entender ${d.id.toUpperCase()} (${d.name})" aria-controls="simHelpPopover" aria-expanded="false">i</button>`
      : '';
    const row = document.createElement('div');
    row.className = 'domain-row';
    row.innerHTML = `<div class="domain-label"><span class="domain-code">${d.id}</span><span class="domain-name-wrap"><span class="domain-name">${d.name}</span>${helpButton}</span></div>
  <div class="note-buttons" data-domain="${d.id}">${[0, 1, 2, 3, 4].map(v => `<button class="note-btn${v === 0 ? ' active' : ''}" data-value="${v}" aria-label="Nota ${v}: ${names[v]}" title="Nota ${v}: ${names[v]}" aria-pressed="${v === 0}">${v}</button>`).join('')}</div>`;
    container.appendChild(row);
  });
}

export function buildTabelaGrid(container, labels, ambTab, tabelaConclusivaFn) {
  let html = '';
  html += '<div class="tc corner"></div>';

  labels.forEach(l => {
    html += `<div class="tc header">${l}</div>`;
  });

  for (let c = 0; c < 5; c++) {
    html += `<div class="tc row-header">${labels[c]}</div>`;
    for (let a = 0; a < 5; a++) {
      const yes = tabelaConclusivaFn(ambTab, a, c);
      const isSensitivityPoint = c === 2 && a === 2;
      const sensitivityClass = isSensitivityPoint ? ` tc-sensitivity tc-sensitivity-${yes ? 'yes' : 'no'}` : '';
      html += `<div class="tc ${yes ? 'yes' : 'no'}${sensitivityClass}" data-c="${c}" data-a="${a}">${yes ? 'Sim' : 'Não'}</div>`;
    }
  }

  container.innerHTML = html;
}
