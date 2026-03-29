The memory says:
"To avoid intermediate array allocation and garbage collection pressure in high-frequency rendering paths (e.g., renderJudicialControl), avoid using Array.prototype.filter(...).length merely to count matching items. Instead, use a native for loop with an integer counter to completely bypass callback overhead and array creation."

Wait, `renderJudicialControl` does this?
Let's check `renderJudicialControl` in `src/js/main.js`.
Oh, that one is already done! `// ⚡ Optimization: Native for-loop to count filled domains, avoiding Array.prototype.filter callback allocation and intermediate array overhead`

Let's check the memory:
"To optimize the extraction of unique IDs from object arrays in performance-sensitive paths (e.g., uniquePendingTargetIds), avoid chaining .map() and .filter() before spreading into a Set. Instead, use a single for loop that populates a Set directly to eliminate intermediate array allocations and multiple iterations."

Is `uniquePendingTargetIds` in the code?
Oh! `new Map(ambTabs.map(...))` in `ui-render.js` line 118:
`refs.ambTabMap = new Map(ambTabs.map(tab => [+tab.dataset.a, tab]));`
This allocates an intermediate array!
Wait, the memory specifically said:
"To optimize the extraction of unique IDs from object arrays in performance-sensitive paths (e.g., uniquePendingTargetIds), avoid chaining .map() and .filter() before spreading into a Set. Instead, use a single for loop that populates a Set directly to eliminate intermediate array allocations and multiple iterations."
But `uniquePendingTargetIds` is not in the codebase, let me check `src/js/main.js` for `uniquePendingTargetIds` again.
Is there any place using a Set like that?

Let's check where `uniquePendingTargetIds` could be related. Maybe it's not exactly that name.
What about `getAdminPendingItems()` in `main.js`? It pushes to `items` array.
Okay, there is no `uniquePendingTargetIds` anywhere. Maybe it was an old memory from a previous step that got overwritten.

Let's look at another memory:
"To avoid garbage collection pressure and layout thrashing in high-frequency rendering loops, extract static inline arrays or object configurations (such as button configuration lists) to module-level constants instead of allocating them dynamically within the render path."

What about `renderJudicialProgress()` in `main.js`?
In `renderJudicialProgress`:
```javascript
  const labels = ['Base administrativa', 'Perícia médica', 'Triagem probatória', 'Texto da decisão'];
  const stepIds = ['stepAdmin', 'stepMed', 'stepTriagem', 'stepTexto'];
```
These arrays are allocated inside the function on every call!
This violates the memory point:
"To avoid garbage collection pressure and layout thrashing in high-frequency rendering loops, extract static inline arrays or object configurations (such as button configuration lists) to module-level constants instead of allocating them dynamically within the render path."

`renderJudicialProgress` is called within `renderJudicialControl` and other places.
This is a good candidate for optimization! We just move `labels` and `stepIds` to file-level constants!
Is there any other inline array or configuration?
Let's check `getPadraoApplyContext()`:
`const padrao = { e1: 2, e2: 2, e3: 2, e4: 1, e5: 2, d6: 3, d7: 2, d8: 3, d9: 3 };`
This could be moved to module-level as well! But wait, `Object.entries(padrao)` is what is computed. We could store `const padraoEntries = Object.entries({ e1: 2, e2: 2, e3: 2, e4: 1, e5: 2, d6: 3, d7: 2, d8: 3, d9: 3 });`

Wait, `main.js` has `TEXTO_BTNS_CONFIG` defined at module level already! (⚡ Optimization: Avoid recreation of arrays and redundant layout checks for text output buttons)

What about `renderStandardText()`?
```javascript
  const qWord = q => ['nenhum', 'leve', 'moderado', 'grave', 'completo'][q];
```
This is a lambda returning an inline array!
`['nenhum', 'leve', 'moderado', 'grave', 'completo']` is allocated inside `renderStandardText`!
We could extract this to a module-level constant like `const Q_WORDS = ['nenhum', 'leve', 'moderado', 'grave', 'completo'];`

Wait, what else?

Let's check `buildDomainRows()` in `src/js/dom-builders.js`.
`[0, 1, 2, 3, 4].forEach(v => {`
This is an inline array! But it's only called on initialization.
The optimization is to extract `labels` and `stepIds` in `renderJudicialProgress()` to be module-level constants. This satisfies "To avoid garbage collection pressure and layout thrashing in high-frequency rendering loops, extract static inline arrays or object configurations (such as button configuration lists) to module-level constants instead of allocating them dynamically within the render path."

Is `renderJudicialProgress` called in high-frequency loops? It is called 4 times in `renderJudicialControl`, which gets debounced on some input, but it's called on every update to the judicial control state. So yes, it is part of the rendering cycle.

Wait, the prompt says "ONE small performance improvement that makes the application measurably faster or more efficient."
Extracting an inline array is exactly what the memory says:
`To avoid garbage collection pressure and layout thrashing in high-frequency rendering loops, extract static inline arrays or object configurations (such as button configuration lists) to module-level constants instead of allocating them dynamically within the render path.`
Let's see if there are other inline arrays.
`src/js/main.js`:
```javascript
const JC_PROGRESS_LABELS = ['Base administrativa', 'Perícia médica', 'Triagem probatória', 'Texto da decisão'];
const JC_PROGRESS_STEP_IDS = ['stepAdmin', 'stepMed', 'stepTriagem', 'stepTexto'];
```
Test failing because `padrao` was moved to a constant `PADRAO_MEDIO_ENTRIES`.
The test `tests/padrao-medio.portaria.test.js` attempts to extract `padrao` dynamically from `getPadraoApplyContext()`:
`const match = extracted.body.match(/const padrao = (\{[\s\S]*?\});/);`
Because I removed `const padrao = { ... };` inside the function, the regex in the test fails.

I should put the `PADRAO_MEDIO_ENTRIES` back as `PADRAO_MEDIO` in `main.js` and extract entries. Wait, `main.js` doesn't export it. The test extracts it via regex from the file content!
Let me modify the test to extract `PADRAO_MEDIO_ENTRIES` or I can just leave `const padrao = ...` in the file. But the goal of the optimization is to move it to module level!
Let's modify `tests/padrao-medio.portaria.test.js`.
