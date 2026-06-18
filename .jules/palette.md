## 2024-05-24 - Accessibility of Dynamic Evaluation Containers
**Learning:** Screen readers might miss crucial dynamic updates like the final evaluation result or changes in the evaluation state if the dynamic containers holding this text do not explicitly specify ARIA live regions. In this app, the final decision (`#decision`), status badges (`#jcStatusBadge`), and comparison blocks (`#compChange`) needed `role="status"` and `aria-live="polite"` to correctly announce their contents without stealing immediate focus, which significantly improves the non-visual UX of evaluating eligibility criteria.
**Action:** Always ensure that dynamic text components summarizing final states, steps status, or complex logic evaluations have explicit ARIA live roles (e.g., `role="status" aria-live="polite"`) applied to their root container.

## 2025-03-05 - Adding :hover states to button types
**Learning:** Certain button types like `.btn-red` and `.sim-help-close` were missing a distinct `:hover` state, unlike `.btn-primary` and `.btn-outline`. This makes them feel unresponsive to mouse users. Dark mode themes specifically need their own customized hover states for contrast.
**Action:** When creating or maintaining button variants in a design system (like `.btn-red`), ensure that all interactive states (`:hover`, `:focus-visible`, `:active`, `:disabled`) are defined for both light and dark themes to provide consistent interaction feedback.

## 2026-03-04 - Disabled States for Generic Button Classes
**Learning:** Global button classes like `.btn` often lack explicit `:disabled` styling in custom design systems, leaving users without visual feedback when actions are blocked or unavailable. Generic disabled state rules (like opacity reduction and `cursor: not-allowed`) can solve this robustly without needing variant-specific disabled colors.
**Action:** When creating or maintaining generic button classes (like `.btn`), establish a baseline `:disabled` state using visual indicators like `opacity`, `filter: grayscale()` and `cursor: not-allowed` to ensure clear visual communication across all button variants.

## 2025-03-05 - Auto-select readonly generated textareas
**Learning:** For sections presenting large blocks of generated text meant for copying (like `#textoPadrao` and `#textoControleJudicial`), providing a dedicated "Copy" button is great, but many users default to keyboard shortcuts (Ctrl+C / Cmd+C). When the text is in a `readonly` textarea, clicking to focus usually places the caret, requiring the user to manually drag-select or press Ctrl+A. Automatically calling `.select()` when the user clicks inside significantly reduces friction and provides a clear visual selection state.
**Action:** Whenever implementing a read-only textarea explicitly designed for content extraction, bind a `click` event listener to trigger `this.select()` to support fast keyboard-driven copying.

## 2023-10-27 - Disabled Element Accessibility
**Learning:** `pointer-events: none` on disabled buttons hides both the `not-allowed` cursor and any native `title` tooltips, breaking accessibility and user context for why an element is inactive.
**Action:** Instead of disabling pointer events, use CSS `:not(.locked)` to scope out `:hover` and `:active` visual states. Use `cursor: not-allowed`, add `aria-disabled="true"`, and set a descriptive `title` to explain the locked state.

## 2025-03-05 - Roving Tabindex on Custom Button Groups
**Learning:** Components grouped semantically with `role="group"` (like the application mode switcher `.app-mode-switch`) can cause unnecessary tab stops for keyboard users if they are not explicitly hooked into the application's roving tabindex logic. While standard form widgets might handle their own focus, custom grouping patterns require manual application.
**Action:** When creating a new button group or `role="group"` structure, ensure its parent container class is added to the application's global `groupSelector` (e.g., in `a11y.js`) to inherit keyboard navigation patterns (arrow keys) and reduce tab clutter.

## 2024-03-15 - Full-Label Focus Rings for Custom Toggles
**Learning:** When building custom toggle switches where the native checkbox (`input[type="checkbox"]`) is visually hidden and its visual representation is styled via a sibling element inside a `<label>`, placing the focus ring only on the small toggle element (the "pill") instead of the entire label makes it harder for keyboard users to see what they are focusing on, especially on labels with long text. Using the `:has()` CSS pseudo-class (`label:has(input:focus-visible)`) allows the focus ring to encompass the entire interactive area (the whole label), providing a much clearer and more accessible focus indicator.
**Action:** When styling visually hidden native inputs wrapped in labels (like custom toggles or stylized checkboxes), always apply `:focus-visible` outlines to the parent `<label>` using the `:has()` selector rather than just the visual pseudo-element or sibling, to ensure the entire click target is clearly highlighted for keyboard users.

## 2024-05-05 - Auto-select readonly generated textareas
**Learning:** For sections presenting large blocks of generated text meant for copying (like `#textoPadrao` and `#textoControleJudicial`), providing a dedicated "Copy" button is great, but many users default to keyboard shortcuts (Ctrl+C / Cmd+C). When the text is in a `readonly` textarea, clicking to focus usually places the caret, requiring the user to manually drag-select or press Ctrl+A. Automatically calling `.select()` when the user clicks inside significantly reduces friction and provides a clear visual selection state.
**Action:** Whenever implementing a read-only textarea explicitly designed for content extraction, bind a `click` event listener to trigger `this.select()` to support fast keyboard-driven copying.

## 2025-05-17 - Programmatically Focused Dialog Outlines
**Learning:** Native `<dialog>` elements and custom popovers that receive programmatic focus (`tabindex="-1"`) may lack consistent browser-default `:focus-visible` outlines. Always explicitly style `:focus-visible` for these container elements (e.g., `.portaria-modal:focus-visible`) to ensure accessibility during keyboard navigation.
**Action:** When creating native `<dialog>` elements or programmatic modal containers, always append them to the global `:focus-visible` outline styles list (e.g. alongside `.btn:focus-visible`) to ensure keyboard users have visual feedback that focus has successfully moved to the modal.

## 2025-05-17 - Programmatically Focused Native Elements
**Learning:** Certain standard block elements used as wrappers (like `.simulador-details`, `.judicial-control`, `.flowchart-view`, `.sim-help-popover`) that receive programmatic focus via `tabindex="-1"` may lack consistent browser-default `:focus-visible` outlines just like `<dialog>` elements. Always explicitly style `:focus-visible` for these programmatic containers to ensure accessibility during keyboard navigation.
**Action:** When creating programmatic focus targets for routing or focus-management (e.g. for skip links or modal-like popovers), always append them to the global `:focus-visible` outline styles list to ensure keyboard users have visual feedback that focus has successfully moved.

## 2026-03-09 - Navigation Landmark Roving Tabindex
**Learning:** Components functioning as semantic step navigations using native elements like `<nav>` inherently represent a structured group of links or buttons. Even when they lack an explicit `role="group"` due to their existing landmark role, they still require roving tabindex implementations if their children function as mutually exclusive toggle steps or tabs, as they will otherwise create a bloated tab order.
**Action:** Always include step navigation containers (like `.flowchart-step-nav`) in the centralized roving tabindex logic (e.g., `groupSelector`) to ensure keyboard users can navigate their children efficiently using arrow keys instead of forcing sequential tab stops.

## 2024-06-12 - Aria-Disabled Styles on Buttons
**Learning:** When using `aria-disabled="true"` on interactive components like `.btn` to maintain keyboard focusability while acting disabled, the visual disabled styling is often missed because it was only bound to `:disabled`. This leaves users confused about the button's state.
**Action:** Explicitly pair visual disabled selectors (like `.btn:disabled, .btn[aria-disabled="true"]`) to keep visual and semantic states aligned.

## 2025-05-17 - Consistent Icon System for Dynamic Elements
**Learning:** Using plain text characters (like "×") for close buttons in dynamically generated components (like toasts) causes alignment quirks and visual inconsistencies with the rest of the interface, which uses an SVG sprite system.
**Action:** Consistently use the application's established SVG sprite system and `document.createElementNS` when dynamically creating DOM elements with icons to maintain visual harmony.
