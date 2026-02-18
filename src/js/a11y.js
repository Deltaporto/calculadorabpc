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
}
