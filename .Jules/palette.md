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
## 2026-03-01 - Hover Effects on Disabled Elements
**Learning:** Generic button components (`.btn-primary`, `.btn-outline`, `.btn-red`) retained their visual hover effects (shadows, transforms, gradient shifts) even when disabled, which conveys false interactivity and confuses users relying on visual cues.
**Action:** Always strictly scope interactive CSS states like `:hover` and `:active` with `:not(:disabled)` (e.g., `.btn-primary:not(:disabled):hover`) when defining button classes, ensuring consistency across themes.

## 2026-03-01 - Semantic role for Visual Toggle Switches
**Learning:** Visual toggle switches implemented with `<input type="checkbox">` and CSS are announced to screen readers merely as checkboxes, which breaks the expected mental model of the visual UI paradigm.
**Action:** When a checkbox is styled to look like a toggle switch (e.g., using a `.toggle-switch` visual indicator), always add `role="switch"` so screen readers correctly announce it as a switch control.

## 2026-03-01 - Explaining Disabled States
**Learning:** Disabling action buttons without explanation leaves users confused about what preconditions are missing, especially in complex forms or multi-step processes.
**Action:** When disabling a button dynamically based on application state, apply a descriptive `title` attribute explaining exactly why it is disabled (e.g., "A triagem probatória precisa ser concluída antes de gerar a minuta.") and restore the original tooltip when enabled.

## 2026-03-02 - Focus Management for Custom Non-Modal Dialogs
**Learning:** Custom DOM-appended non-modal dialogs (like `simHelpPopover`) fail to support keyboard navigation intuitively unless focus is actively shifted into them when opened and returned to the trigger element when closed.
**Action:** Always manually move focus to the dialog container (ensure it has `tabindex="-1"`) when it is opened, and return focus to the trigger button if the focus was inside the popover upon closing.

## 2026-03-03 - Active (Pressed) States for Interactive Feedback
**Learning:** Generic button components often only implement `:hover` and `:focus-visible` styles, omitting `:active` states. This results in a stiff interface lacking tactile micro-UX feedback during the "press down" action.
**Action:** Always provide a subtle `:active` state for buttons (e.g., `transform: scale(0.96)`) scoped with `:not(:disabled)` to ensure an immediate, satisfying tactile-feeling response upon clicking.

## 2023-10-25 - Semantic Required State for Conditionally Mandatory Fields
**Learning:** Textareas or inputs that become mandatory based on application state (e.g., "modo simples") often rely solely on visual text hints (like "(obrigatória)") in their labels, leaving screen reader users unaware of the strict requirement.
**Action:** When a form field is visually indicated as mandatory, always ensure it explicitly implements `aria-required="true"` so assistive technologies can correctly announce its required status.

## 2026-03-03 - Disclosure Widgets Require ARIA State
**Learning:** Disclosure widgets, such as buttons that toggle the visibility of an element (like the 'Ver base legal (trecho)' button), do not naturally announce their open/closed state to screen readers.
**Action:** Always ensure disclosure buttons implement `aria-controls="[target-id]"` and dynamically toggle `aria-expanded="true|false"` based on the visibility of the controlled content.

## 2026-03-05 - Naming Button Groups for Screen Readers
**Learning:** Groups of buttons (like rating scales 0-4) implemented with `role="group"` are announced merely as "group" by screen readers if they lack an accessible name, leaving users without context on what the group represents (e.g., the specific evaluation domain).
**Action:** When creating a component with `role="group"`, always use `aria-labelledby` or `aria-label` to give the group a descriptive accessible name, connecting it to its visible label or context.

## 2026-03-06 - Tooltips on Disabled Select Options
**Learning:** When `<option>` elements in a `<select>` dropdown are disabled without context, users are left confused about why certain choices are unavailable.
**Action:** Provide an explanatory `title` attribute for disabled `<option>` elements, enabling a tooltip that communicates the specific business rule or state preventing selection.
