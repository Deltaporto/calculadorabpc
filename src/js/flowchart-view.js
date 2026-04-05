const MOBILE_BREAKPOINT = 940;
const STEP_PATTERN = /^#etapa-([1-6])$/;

function getStepFromHash(hash = window.location.hash) {
  const match = hash.match(STEP_PATTERN);
  return match ? match[1] : null;
}

function isMobileViewport() {
  return window.innerWidth <= MOBILE_BREAKPOINT;
}

function getDefaultStep() {
  return isMobileViewport() ? '1' : 'all';
}

function removeHash() {
  history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
}

function updateHash(step) {
  if (step === 'all') {
    removeHash();
    return;
  }
  history.replaceState(null, '', `#etapa-${step}`);
}

export function initFlowchartView() {
  const section = document.getElementById('flowchartSection');
  const nav = document.getElementById('flowchartStepNav');
  if (!section || !nav) return;

  // ⚡ Optimization: Keep as live NodeLists and use native loop iterations instead of array allocation overhead (Array.prototype.slice.call)
  const buttons = nav.querySelectorAll('button[data-flow-step-target]');
  const cards = section.querySelectorAll('.flow-step-card[data-flow-step]');
  if (buttons.length === 0 || cards.length === 0) return;

  const reduceMotionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  let prefersReducedMotion = reduceMotionQuery ? reduceMotionQuery.matches : false;

  const setActiveStep = (step, options = {}) => {
    const { syncHash = false, focusCard = false } = options;
    const nextStep = ['all', '1', '2', '3', '4', '5', '6'].includes(step) ? step : getDefaultStep();
    const focusMode = nextStep !== 'all';

    section.classList.toggle('flowchart-has-focus', focusMode);
    section.dataset.activeFlowStep = nextStep;

    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const buttonStep = button.dataset.flowStepTarget;
      const active = buttonStep === nextStep;
      if (button.classList.contains('is-active') !== active) button.classList.toggle('is-active', active);
      if (button.getAttribute('aria-pressed') !== String(active)) button.setAttribute('aria-pressed', active ? 'true' : 'false');
    }

    let target = null;
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const cardStep = card.dataset.flowStep;
      const active = cardStep === nextStep;
      if (card.classList.contains('is-active') !== active) card.classList.toggle('is-active', active);
      if (card.hasAttribute('data-active-step') !== active) card.toggleAttribute('data-active-step', active);
      if (active) target = card;
    }

    if (syncHash) updateHash(nextStep);

    if (focusCard && focusMode) {
      if (target) {
        target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'nearest' });
        try {
          target.focus({ preventScroll: true });
        } catch {
          target.focus();
        }
      }
    }
  };

  const syncFromHash = () => {
    const stepFromHash = getStepFromHash();
    setActiveStep(stepFromHash || getDefaultStep(), { syncHash: false, focusCard: false });
  };

  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    button.addEventListener('click', () => {
      setActiveStep(button.dataset.flowStepTarget, { syncHash: true, focusCard: true });
    });
  }

  window.addEventListener('hashchange', syncFromHash);
  if (reduceMotionQuery && typeof reduceMotionQuery.addEventListener === 'function') {
    reduceMotionQuery.addEventListener('change', event => {
      prefersReducedMotion = event.matches;
    });
  }

  syncFromHash();
}
