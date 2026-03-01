export function buildDomainRows(container, domains, labels, names, domainHelpKeys = {}) {
  const scale = document.createElement('div');
  scale.className = 'note-scale-row';

  const spacer = document.createElement('div');
  spacer.className = 'note-scale-spacer';
  scale.appendChild(spacer);

  const noteScale = document.createElement('div');
  noteScale.className = 'note-scale';
  labels.forEach(l => {
    const span = document.createElement('span');
    span.textContent = l;
    noteScale.appendChild(span);
  });
  scale.appendChild(noteScale);
  container.appendChild(scale);

  domains.forEach(d => {
    const row = document.createElement('div');
    row.className = 'domain-row';

    // Domain Label Section
    const labelDiv = document.createElement('div');
    labelDiv.className = 'domain-label';

    const codeSpan = document.createElement('span');
    codeSpan.className = 'domain-code';
    codeSpan.textContent = d.id;
    labelDiv.appendChild(codeSpan);

    const nameWrap = document.createElement('span');
    nameWrap.className = 'domain-name-wrap';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'domain-name';
    nameSpan.textContent = d.name;
    nameWrap.appendChild(nameSpan);

    const helpKey = domainHelpKeys[d.id];
    if (helpKey) {
      const helpBtn = document.createElement('button');
      helpBtn.type = 'button';
      helpBtn.className = 'sim-help-btn domain-help-btn';
      helpBtn.dataset.helpKey = helpKey;
      const helpLabel = `Entender ${d.id.toUpperCase()} (${d.name})`;
      helpBtn.setAttribute('aria-label', helpLabel);
      helpBtn.setAttribute('title', helpLabel);
      helpBtn.setAttribute('aria-controls', 'simHelpPopover');
      helpBtn.setAttribute('aria-expanded', 'false');
      helpBtn.textContent = 'i';
      nameWrap.appendChild(helpBtn);
    }

    labelDiv.appendChild(nameWrap);
    row.appendChild(labelDiv);

    // Note Buttons Section
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'note-buttons';
    buttonsDiv.dataset.domain = d.id;
    buttonsDiv.setAttribute('role', 'group');

    [0, 1, 2, 3, 4].forEach(v => {
      const btn = document.createElement('button');
      btn.className = `note-btn${v === 0 ? ' active' : ''}`;
      btn.dataset.value = String(v);
      const labelText = `Nota ${v}: ${names[v]}`;
      btn.setAttribute('aria-label', labelText);
      btn.title = labelText;
      btn.setAttribute('aria-pressed', v === 0 ? 'true' : 'false');
      btn.tabIndex = v === 0 ? 0 : -1;
      btn.textContent = String(v);
      buttonsDiv.appendChild(btn);
    });

    row.appendChild(buttonsDiv);
    container.appendChild(row);
  });
}

export function buildTabelaGrid(container, labels, names, ambTab, tabelaConclusivaFn) {
  // ⚡ Optimization: Reuse existing DOM nodes if grid is already built
  const existingCells = container.querySelectorAll('.tc[data-c]');
  if (existingCells.length > 0) {
    existingCells.forEach((cell, i) => {
      const c = Math.floor(i / 5);
      const a = i % 5;
      const yes = tabelaConclusivaFn(ambTab, a, c);
      const labelText = `Ambiente: ${labels[ambTab]} (${names[ambTab]}) · Atividades: ${labels[a]} (${names[a]}) · Funções do Corpo: ${labels[c]} (${names[c]}) → ${yes ? 'Deferido' : 'Indeferido'}`;

      // Update text content
      const newText = yes ? 'Sim' : 'Não';
      if (cell.textContent !== newText) {
        cell.textContent = newText;
      }
      if (cell.title !== labelText) {
        cell.title = labelText;
        cell.setAttribute('aria-label', labelText);
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
  const fragment = document.createDocumentFragment();

  const corner = document.createElement('div');
  corner.className = 'tc corner';
  fragment.appendChild(corner);

  labels.forEach(l => {
    const div = document.createElement('div');
    div.className = 'tc header';
    div.textContent = l;
    fragment.appendChild(div);
  });

  for (let c = 0; c < 5; c++) {
    const rowHeader = document.createElement('div');
    rowHeader.className = 'tc row-header';
    rowHeader.textContent = labels[c];
    fragment.appendChild(rowHeader);

    for (let a = 0; a < 5; a++) {
      const yes = tabelaConclusivaFn(ambTab, a, c);
      const isSensitivityPoint = c === 2 && a === 2;
      const sensitivityClass = isSensitivityPoint ? ` tc-sensitivity tc-sensitivity-${yes ? 'yes' : 'no'}` : '';
      const labelText = `Ambiente: ${labels[ambTab]} (${names[ambTab]}) · Atividades: ${labels[a]} (${names[a]}) · Funções do Corpo: ${labels[c]} (${names[c]}) → ${yes ? 'Deferido' : 'Indeferido'}`;

      const cell = document.createElement('div');
      cell.id = `tc-${c}-${a}`;
      cell.className = `tc ${yes ? 'yes' : 'no'}${sensitivityClass}`;
      cell.dataset.c = c;
      cell.dataset.a = a;
      cell.textContent = yes ? 'Sim' : 'Não';
      cell.title = labelText;
      cell.setAttribute('aria-label', labelText);
      cell.setAttribute('role', 'img');
      fragment.appendChild(cell);
    }
  }

  container.replaceChildren(fragment);
}
