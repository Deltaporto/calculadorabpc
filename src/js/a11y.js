export function initStaticRatingA11yLabels(labels) {
  document.querySelectorAll('.jc-q-btn, .amb-tab').forEach(btn => {
    const value = +(btn.dataset.value ?? btn.dataset.a);
    if (labels[value]) {
      btn.setAttribute('aria-label', labels[value]);
      btn.setAttribute('title', labels[value]);
    }
  });
}
