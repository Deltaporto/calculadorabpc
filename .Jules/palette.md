## 2026-02-17 - Accessibility of Rating Scales
**Learning:** The application uses 0-4 numeric buttons and N-C letter buttons for ratings without semantic labels, making them opaque to screen readers ("0", "N").
**Action:** Always verify that scale/rating buttons have `aria-label` with the full semantic meaning (e.g., "Nenhuma", "Grave") to ensure accessibility and clarity.

## 2026-02-17 - Keyboard Focus on Hidden Inputs
**Learning:** Custom toggle switches implemented with hidden checkboxes (`opacity: 0`) were completely invisible to keyboard users when focused, as the visual replacement (`.toggle-switch`) lacked focus styles.
**Action:** When styling custom form controls, ensure the visual replacement element receives a visible focus indicator (e.g., using `:focus-visible + .visual-element`) to support keyboard navigation.

## 2026-02-18 - Missing Live Regions for Dynamic Updates
**Learning:** User interactions like copying text or automatic calculations (e.g., age-based qualification) update content but are silent to screen readers without `role="status"` or `aria-live` attributes.
**Action:** Always wrap dynamic feedback or status messages in a container with `role="status"` and `aria-live="polite"` to ensure they are announced.
