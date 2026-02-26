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

function getCards(nodes) {
  return Array.prototype.slice.call(nodes || []);
}

export function initFlowchartView() {
  const section = document.getElementById('flowchartSection');
  const nav = document.getElementById('flowchartStepNav');
  if (!section || !nav) return;

  const buttons = getCards(nav.querySelectorAll('button[data-flow-step-target]'));
  const cards = getCards(section.querySelectorAll('.flow-step-card[data-flow-step]'));
  if (!buttons.length || !cards.length) return;

  const reduceMotionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  let prefersReducedMotion = reduceMotionQuery ? reduceMotionQuery.matches : false;

  const setActiveStep = (step, options = {}) => {
    const { syncHash = false, focusCard = false } = options;
    const nextStep = ['all', '1', '2', '3', '4', '5', '6'].includes(step) ? step : getDefaultStep();
    const focusMode = nextStep !== 'all';

    section.classList.toggle('flowchart-has-focus', focusMode);
    section.dataset.activeFlowStep = nextStep;

    buttons.forEach(button => {
      const buttonStep = button.dataset.flowStepTarget;
      const active = buttonStep === nextStep;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    cards.forEach(card => {
      const cardStep = card.dataset.flowStep;
      const active = cardStep === nextStep;
      card.classList.toggle('is-active', active);
      card.toggleAttribute('data-active-step', active);
    });

    if (syncHash) updateHash(nextStep);

    if (focusCard && focusMode) {
      const target = cards.find(card => card.dataset.flowStep === nextStep);
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

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      setActiveStep(button.dataset.flowStepTarget, { syncHash: true, focusCard: true });
    });
  });

  window.addEventListener('hashchange', syncFromHash);
  if (reduceMotionQuery && typeof reduceMotionQuery.addEventListener === 'function') {
    reduceMotionQuery.addEventListener('change', event => {
      prefersReducedMotion = event.matches;
    });
  }

  syncFromHash();
}
