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
