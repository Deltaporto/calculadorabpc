1. **Optimize unconditional DOM mutations and array allocations in `main.js` and `dom-builders.js` hot paths**:
    * Create a helper `toggleHiddenIfChanged` in `main.js`.
    * Apply strict boolean checks to `setStepState`, `setWhyBlocked`, `setStepGuidance`, `renderJudicialProgress`, `disableTextoBtns`.
    * Replace `[...reasonSelect.options].forEach(...)` with a `for` loop that avoids array spreading and uses boolean checks for the `disabled` attribute.
    * Replace inline array allocation of `textoBtns` with a module-level constant and apply boolean checks to its DOM updates.
    * Optimize `markJudicialInvalidTargets` to use a native `for` loop and check the `currentInvalidElements` Set before mutating.
    * Fix unconditional `classList.toggle` calls in `buildTabelaGrid` (in `dom-builders.js`).
    * Add a journal entry to `.jules/bolt.md` documenting the optimization.
    * Run format/lint checks and `pnpm test`.
2. **Submit PR**: Title `⚡ Bolt: Optimize unconditional DOM mutations and array allocations in render loops`.
