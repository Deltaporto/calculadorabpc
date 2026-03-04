
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

## 2025-03-02 - Optimize Array Callbacks with Native For-Loops and Early Returns
**Learning:** High-frequency calculation functions (`calcCorpoFromState`, `calculateScore`, `computeAtivFromDomains`) were using `Array.prototype.reduce` and `Array.prototype.some`, which cause array iteration with an extra function allocation cost. Moreover, using `.some` followed by `.reduce` iterated over the array twice unnecessarily.
**Action:** Replaced these higher-order array methods with native `for` loops. Included early returns to skip processing entirely upon invalid conditions (e.g., null value checks), which avoids both callback allocation overhead and double-iteration.
