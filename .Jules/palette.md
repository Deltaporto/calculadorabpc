## 2026-02-17 - Accessibility of Rating Scales
**Learning:** The application uses 0-4 numeric buttons and N-C letter buttons for ratings without semantic labels, making them opaque to screen readers ("0", "N").
**Action:** Always verify that scale/rating buttons have `aria-label` with the full semantic meaning (e.g., "Nenhuma", "Grave") to ensure accessibility and clarity.

## 2026-02-17 - Keyboard Focus on Hidden Inputs
**Learning:** Custom toggle switches implemented with hidden checkboxes (`opacity: 0`) were completely invisible to keyboard users when focused, as the visual replacement (`.toggle-switch`) lacked focus styles.
**Action:** When styling custom form controls, ensure the visual replacement element receives a visible focus indicator (e.g., using `:focus-visible + .visual-element`) to support keyboard navigation.

## 2026-02-18 - Missing Live Regions for Dynamic Updates
**Learning:** User interactions like copying text or automatic calculations (e.g., age-based qualification) update content but are silent to screen readers without `role="status"` or `aria-live` attributes.
**Action:** Always wrap dynamic feedback or status messages in a container with `role="status"` and `aria-live="polite"` to ensure they are announced.

## 2026-02-19 - Context-Aware Skip Links
**Learning:** Static skip links (e.g., "Skip to Judicial Control") can point to hidden or irrelevant sections depending on the application state/mode (Simulator vs. Control), leading to a confusing navigation experience.
**Action:** When using application modes that toggle section visibility, ensure skip links are also toggled (e.g., via CSS) or updated dynamically to point to relevant, visible content.

## 2025-02-19 - Entry Animations for Popovers
**Learning:** Adding entry animations (fade+scale for popovers, fade+slide for dialogs) significantly improves the perceived responsiveness and polish of the interface without adding JavaScript overhead.
**Action:** Use CSS keyframe animations for entry states of interactive overlays, ensuring they respect `prefers-reduced-motion`.

## 2025-05-23 - Accessibility for Dynamic Progress Indicators
**Learning:** Progress bars implemented with `div` elements and CSS width updates are not perceivable by screen readers unless they have the appropriate `role="progressbar"` and `aria-valuenow` attributes.
**Action:** When creating or updating custom progress bars, always ensure the element has `role="progressbar"`, `aria-valuemin`, `aria-valuemax`, and update `aria-valuenow` in sync with the visual change.

## 2026-02-27 - Keyboard Focus on Checkbox Labels
**Learning:** Custom toggle buttons implemented as a `label` containing a visually hidden or accent-colored `input[type="checkbox"]` may not show a clear focus outline when navigating via keyboard, rendering them inaccessible to keyboard users.
**Action:** Use the CSS `:has()` pseudo-class (e.g., `label:has(input:focus-visible)`) to apply a visible outline to the entire label container when its child input receives focus.

## 2025-05-24 - Focus Visibility on Dynamically Injected Interactive Elements
**Learning:** Dynamically injected transient UI components, such as toast notification close buttons (`.toast-close`), are often missed during static DOM a11y audits and may lack `:focus-visible` styles, rendering them invisible to keyboard navigation.
**Action:** When adding transient or dynamic interactive components, ensure they explicitly receive `:focus-visible` outline rules in the global accessibility stylesheet section.
