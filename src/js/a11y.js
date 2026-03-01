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
  const getGroupButtons = (group) => Array.from(group.querySelectorAll('button:not([disabled])'));
  const groupSelector = '.note-buttons, .jc-q-buttons, .jc-segmented, .amb-tabs, .jc-segmented-wide';

  // Initialize static groups
  document.querySelectorAll(groupSelector).forEach(group => {
    const buttons = getGroupButtons(group);
    if (buttons.length === 0) return;

    // Check if any is already active/checked (tabindex="0" might already be set by builders)
    const hasTabindex0 = buttons.some(b => b.getAttribute('tabindex') === '0');
    if (hasTabindex0) return;

    let activeIndex = buttons.findIndex(b => b.classList.contains('active') || b.getAttribute('aria-pressed') === 'true');
    if (activeIndex === -1) activeIndex = 0;

    buttons.forEach((btn, index) => {
      btn.setAttribute('tabindex', index === activeIndex ? '0' : '-1');
    });
  });

  // Handle Arrow Keys (Roving Tabindex)
  document.addEventListener('keydown', (e) => {
    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    if (!keys.includes(e.key)) return;

    const btn = e.target.closest('button');
    if (!btn) return;

    const group = btn.closest(groupSelector);
    if (!group) return;

    const buttons = getGroupButtons(group);
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
    if (buttons.includes(btn)) {
        buttons.forEach(b => b.setAttribute('tabindex', b === btn ? '0' : '-1'));
    }
  });
}
