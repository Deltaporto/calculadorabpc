
## 2025-05-19 - [DOM Query Set Tracking Optimization]
**Learning:** Attempting to cache global `document.querySelectorAll` NodeLists directly (like caching `.jc-q-btn` arrays) leads to memory leaks from strong references and stale arrays if DOM elements detach.
Instead, a significantly safer optimization is removing global queries like `document.querySelectorAll('.jc-invalid')` used in `clearJudicialInvalidHighlights()` which are called continuously during frequent re-renders.
**Action:** Replaced the global selector query with a local trackable `Set` (`currentInvalidElements`) inside `src/js/main.js` that explicitly adds and removes targeted DOM elements. This eliminates an O(N) DOM crawl per render while preventing leak vulnerabilities.

## 2026-02-28 - [DOM Query Optimization in a11y.js]
**Learning:** In highly repeated initialization routines (like `initKeyboardNav` running over many button groups), using `Array.from(nodeList)` and array iterators (`.some`, `.findIndex`) causes unnecessary object allocations and slow iterations. A single `querySelector` for specific attributes (e.g., `button[tabindex="0"]`) is exponentially faster because it offloads the search to the browser's native C++ engine.
**Action:** Replaced `Array.from()` conversions and `.some()`/`.findIndex()` array loops with targeted `querySelector()` calls. This creates a fast exit path and removes array allocation overhead during frequent dynamic DOM updates.

## 2025-03-01 - Avoid Array Conversions and Callbacks in Hot Paths
**Learning:** In highly repeated DOM initialization and dynamic interactions (e.g. keyboard navigation via `keydown`), converting `NodeList` to `Array` via `Array.from` incurs significant allocation overhead. Similarly, utilizing `Array.prototype.reduce` within object initialization sequences (`createEmptyDomains`, `createDomainNameById`) adds callback dispatch overhead compared to native C++ backed standard loops.
**Action:** Always prefer native `for` loops or directly invoke methods via `Array.prototype.call` on `NodeList` collections to avoid allocation and dispatch taxes in performance-sensitive contexts.

## 2025-05-20 - Avoid Array Methods and Callbacks in Hot Paths
**Learning:** In highly repeated DOM initialization and dynamic interactions, utilizing `Array.prototype.reduce`, `Array.prototype.some`, and `Array.prototype.every` within hot path computations adds callback dispatch overhead compared to native C++ backed standard loops.
**Action:** Replaced these array methods with standard native `for` loops and early returns to avoid allocation and dispatch taxes in performance-sensitive calculations. Also, for tiny arrays (like the 3-element `draftValues`), simple inline object checks (`&&` or `||`) are faster than allocating an array to run `every` or `some`.

## 2023-10-24 - Pre-building Static TextNodes to Avoid DocumentFragment Thrashing
**Learning:** In highly active rendering loops like `runMainUpdate`, dynamically reconstructing structural `span` and `TextNode` objects inside a `DocumentFragment` causes continuous allocation and GC pressure. Caching these static structure nodes once during initialization and only mutating their properties (`textContent`, `style`) is much faster. However, attempting to apply CSS changes (like `.style.display`) to a `TextNode` will crash the application as `Text` nodes do not have a style property.
**Action:** When pre-building and caching DOM nodes (Elements and TextNodes) to prevent layout thrashing, limit `.style` property mutations strictly to `HTMLElement`s. Text nodes can simply be hidden by setting their text content to an empty string.

## 2023-10-24 - Avoid Throttling RequestAnimationFrame Callbacks
**Learning:** Adding a generic JavaScript `throttle` (e.g., 50ms) wrapper to `scroll` or `resize` events that already delegate their layout updates optimally to `requestAnimationFrame` introduces redundant visual lag and degrades performance rather than improving it.
**Action:** Before applying debouncing or throttling to events, verify if the underlying handler function already utilizes native browser optimizations like `requestAnimationFrame`. If it does, do not add arbitrary JS throttling on top.

## 2025-10-26 - Inline Boolean Checks in Global Event Listeners
**Learning:** High-frequency global event listeners (such as `keydown` handlers for application-wide keyboard navigation) run on every keystroke. Allocating arrays inside these listeners just to perform a membership check (e.g., `['key1', 'key2'].includes(e.key)`) creates unnecessary memory pressure and triggers garbage collection.
**Action:** Replace array allocations and method dispatches in high-frequency event listeners with explicit inline boolean checks (e.g., `e.key === 'key1' || e.key === 'key2'`) to significantly reduce processing overhead and allocations on every keystroke.

## 2026-03-02 - Replace NodeList Caching with Live HTMLCollections
**Learning:** While attempting to fix DOM query performance, developers often cache the results of `querySelectorAll` into a global `Map` or array. This is an anti-pattern that creates strong references to static `NodeList`s, causing severe memory leaks if elements detach, and failing to reflect DOM updates.
**Action:** Do not cache `querySelectorAll`. Instead, for repeated queries of the same class within a specific component, use `parentElement.getElementsByClassName('class-name')` locally. It returns a live `HTMLCollection` which is extremely fast, avoids memory allocation overhead entirely, and prevents memory leaks.

## 2025-05-21 - Avoid Redundant DOM Mutations in Render Loops
**Learning:** During frequent UI rendering cycles (e.g., `renderJudicialControl()`), iterating over large collections of DOM elements (like button groups) and unconditionally calling `.classList.toggle()` and `.setAttribute()` causes substantial performance overhead. Even if the resulting state equals the current state, these browser APIs trigger synchronous style recalculations and layout thrashing.
**Action:** Always wrap DOM mutations inside rendering loops with a strict inline boolean check of the current state (e.g., `if (el.classList.contains('active') !== isActive) { ... }`). This guarantees writes only occur when the state actually changes, bypassing redundant C++ engine overhead.
## 2026-03-23 - Array Spread in Hot Paths
**Learning:** In Vanilla JS state machines, applying array spreading `[...arr1, ...arr2]` directly inside loops or functional array methods (like `.filter` or `.find`) allocates a new array on every iteration. This creates measurable GC pressure on hot paths.
**Action:** Always pre-calculate and cache combined arrays (like `ATIV_DOMAINS`) at the module level and use the reference inside iterative functions.

## 2025-05-22 - Avoid Unconditional DOM Updates and Array Allocations in Render Loops
**Learning:** High-frequency rendering functions (like `renderJudicialControl` and `buildTabelaGrid`) suffer significant layout thrashing when unconditionally mutating the DOM (`className`, `textContent`, `disabled`, `classList.toggle`). Furthermore, recreating arrays (e.g. `[...HTMLCollection]` or `[{id: 'btn1'}, ...]`) per render cycle creates severe GC pressure.
**Action:** Extract static arrays to module-level constants. Replace array methods (`forEach`) with native `for` loops. Crucially, always wrap property assignments and `classList` mutations in explicit inline boolean checks comparing against the current DOM state, skipping the C++ engine overhead when values haven't changed.
