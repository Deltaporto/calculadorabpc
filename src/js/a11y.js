export function initStaticRatingA11yLabels(labels) {
  document.querySelectorAll('.jc-q-btn, .amb-tab').forEach(btn => {
    const value = +(btn.dataset.value ?? btn.dataset.a);
    if (labels[value]) {
      btn.setAttribute('aria-label', labels[value]);
      btn.setAttribute('title', labels[value]);
    }
    btn.setAttribute('aria-pressed', btn.classList.contains('active'));
  });
  document.querySelectorAll('.jc-seg-btn').forEach(btn => {
    btn.setAttribute('aria-pressed', btn.classList.contains('active'));
  });
  document.querySelectorAll('.sim-help-btn, .sim-help-close, .portaria-close-btn').forEach(btn => {
    const ariaLabel = btn.getAttribute('aria-label');
    if (ariaLabel && !btn.hasAttribute('title')) {
      btn.setAttribute('title', ariaLabel);
    }
  });
}

export function initKeyboardNav() {
  // ⚡ Optimization: Avoid allocating NodeLists on every keystroke by iterating HTMLCollection directly
  const getEnabledButtons = (group) => {
    const allBtns = group.getElementsByTagName('button');
    const enabled = [];
    for (let i = 0; i < allBtns.length; i++) {
      if (!allBtns[i].disabled) enabled.push(allBtns[i]);
    }
    return enabled;
  };

  const groupSelector = '.note-buttons, .jc-q-buttons, .jc-segmented, .amb-tabs, .jc-segmented-wide, .app-mode-switch, .flowchart-step-nav';

  // Initialize static groups
  const groups = document.querySelectorAll(groupSelector);
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    // ⚡ Optimization: Fast path using single DOM query instead of array creation
    if (group.querySelector('button[tabindex="0"]')) continue;

    const buttons = getEnabledButtons(group);
    if (buttons.length === 0) continue;

    let activeBtn = group.querySelector('button.active, button[aria-pressed="true"]');
    if (!activeBtn || activeBtn.disabled) {
      activeBtn = buttons[0];
    }

    for (let j = 0; j < buttons.length; j++) {
      buttons[j].setAttribute('tabindex', buttons[j] === activeBtn ? '0' : '-1');
    }
  }

  // Handle Arrow Keys (Roving Tabindex)
  document.addEventListener('keydown', (e) => {
    // ⚡ Optimization: Fast inline boolean check avoids array allocation and .includes() dispatch on every single keydown
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;

    const btn = e.target.closest('button');
    if (!btn) return;

    const group = btn.closest(groupSelector);
    if (!group) return;

    const buttons = getEnabledButtons(group);
    const index = buttons.indexOf(btn);
    if (index === -1) return;

    e.preventDefault();
    let nextIndex;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIndex = index + 1;
      if (nextIndex >= buttons.length) nextIndex = 0; // Loop
    } else {
      nextIndex = index - 1;
      if (nextIndex < 0) nextIndex = buttons.length - 1; // Loop
    }

    const nextBtn = buttons[nextIndex];

    for (let i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute('tabindex', '-1');
    }
    nextBtn.setAttribute('tabindex', '0');
    nextBtn.focus();
  });

  // Update tabindex on focus (e.g. click)
  document.addEventListener('focusin', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const group = btn.closest(groupSelector);
    if (!group) return;

    const buttons = getEnabledButtons(group);

    // Only update if this button is part of the group
    if (buttons.includes(btn)) {
      for (let i = 0; i < buttons.length; i++) {
        buttons[i].setAttribute('tabindex', buttons[i] === btn ? '0' : '-1');
      }
    }
  });
}
