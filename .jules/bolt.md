
## 2025-05-19 - [DOM Query Set Tracking Optimization]
**Learning:** Attempting to cache global `document.querySelectorAll` NodeLists directly (like caching `.jc-q-btn` arrays) leads to memory leaks from strong references and stale arrays if DOM elements detach.
Instead, a significantly safer optimization is removing global queries like `document.querySelectorAll('.jc-invalid')` used in `clearJudicialInvalidHighlights()` which are called continuously during frequent re-renders.
**Action:** Replaced the global selector query with a local trackable `Set` (`currentInvalidElements`) inside `src/js/main.js` that explicitly adds and removes targeted DOM elements. This eliminates an O(N) DOM crawl per render while preventing leak vulnerabilities.
