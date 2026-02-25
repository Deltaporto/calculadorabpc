## 2025-05-24 - [DOM Optimization: DocumentFragment for Row Building]
**Learning:** Using `DocumentFragment` instead of appending directly to a container (which is attached to the DOM) significantly reduces layout thrashing and improves performance.
**Action:** Always use `DocumentFragment` when creating multiple DOM elements in a loop before appending them to the live DOM.

Benchmark Results:
- Original: ~1095ms
- Optimized: ~617ms
- Improvement: ~43%
