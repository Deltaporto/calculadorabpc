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
  // ⚡ Optimization: Reuse existing DOM nodes if grid is already built
  const existingCells = container.querySelectorAll('.tc[data-c]');
  if (existingCells.length > 0) {
    existingCells.forEach(cell => {
      const c = parseInt(cell.dataset.c, 10);
      const a = parseInt(cell.dataset.a, 10);
      const yes = tabelaConclusivaFn(ambTab, a, c);

      // Update text content
      const newText = yes ? 'Sim' : 'Não';
      if (cell.textContent !== newText) {
        cell.textContent = newText;
      }

      // Update classes efficiently
      cell.classList.toggle('yes', yes);
      cell.classList.toggle('no', !yes);

      // Handle sensitivity point (c=2, a=2)
      if (c === 2 && a === 2) {
        // Ensure base class exists (should be there from initial render, but safe to add)
        cell.classList.add('tc-sensitivity');
        cell.classList.toggle('tc-sensitivity-yes', yes);
        cell.classList.toggle('tc-sensitivity-no', !yes);
      }
    });
    return;
  }

  // Initial build
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
