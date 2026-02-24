## 2025-06-18 - Information Disclosure in Custom Dev Server
**Vulnerability:** The custom development server (`scripts/serve.js`) served all files under the root directory (`process.cwd()`), exposing sensitive files like `package.json`, source code (`scripts/`), and test files (`tests/`).
**Learning:** Naive file servers often default to serving everything in the root, relying only on hidden file checks. This pattern leads to source code disclosure.
**Prevention:** Implement a strict allowlist of serveable directories and files (e.g., `src/`, `public/`) and deny everything else by default. Do not rely on "blocklists" or simple path normalization alone.
