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
  // ⚡ Optimization: Direct querySelectorAll (NodeList) instead of Array.from to avoid array allocation on every interaction
  const getGroupButtons = (group) => group.querySelectorAll('button:not([disabled])');
  const groupSelector = '.note-buttons, .jc-q-buttons, .jc-segmented, .amb-tabs, .jc-segmented-wide, .app-mode-switch';

  // Initialize static groups
  document.querySelectorAll(groupSelector).forEach(group => {
    // ⚡ Optimization: Fast path using single DOM query instead of array creation
    if (group.querySelector('button[tabindex="0"]')) return;

    const buttons = group.querySelectorAll('button:not([disabled])');
    if (buttons.length === 0) return;

    let activeBtn = group.querySelector('button.active, button[aria-pressed="true"]');
    if (!activeBtn || activeBtn.disabled) {
      activeBtn = buttons[0];
    }

    buttons.forEach(btn => {
      btn.setAttribute('tabindex', btn === activeBtn ? '0' : '-1');
    });
  });

  // Handle Arrow Keys (Roving Tabindex)
  document.addEventListener('keydown', (e) => {
    // ⚡ Optimization: Fast inline boolean check avoids array allocation and .includes() dispatch on every single keydown
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;

    const btn = e.target.closest('button');
    if (!btn) return;

    const group = btn.closest(groupSelector);
    if (!group) return;

    const buttons = getGroupButtons(group);
    // ⚡ Optimization: Borrow indexOf from Array to use directly on the NodeList without converting to an Array
    const index = Array.prototype.indexOf.call(buttons, btn);
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

    buttons.forEach(b => b.setAttribute('tabindex', '-1'));
    nextBtn.setAttribute('tabindex', '0');
    nextBtn.focus();
  });

  // Update tabindex on focus (e.g. click)
  document.addEventListener('focusin', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const group = btn.closest(groupSelector);
    if (!group) return;

    const buttons = getGroupButtons(group);
    // Only update if this button is part of the group
    // ⚡ Optimization: Borrow includes from Array to use directly on the NodeList
    if (Array.prototype.includes.call(buttons, btn)) {
        buttons.forEach(b => b.setAttribute('tabindex', b === btn ? '0' : '-1'));
    }
  });
}
