## 2024-05-18 - Avoid redundant title attributes on options
**Learning:** Mirroring fully visible text into `title` attributes on `<option>` elements (e.g. `<option value="x" title="x">x</option>`) causes screen readers to announce the text twice, creating a verbose and frustrating experience.
**Action:** Only apply `title` attributes (tooltips) to native `<option>` elements when they provide additional context, explain a disabled state, or reveal intentionally truncated text. Ensure dynamic Javascript removes the title when not needed.
