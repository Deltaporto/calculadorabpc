## 2026-02-17 - Accessibility of Rating Scales
**Learning:** The application uses 0-4 numeric buttons and N-C letter buttons for ratings without semantic labels, making them opaque to screen readers ("0", "N").
**Action:** Always verify that scale/rating buttons have `aria-label` with the full semantic meaning (e.g., "Nenhuma", "Grave") to ensure accessibility and clarity.
