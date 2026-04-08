## 2025-06-18 - Information Disclosure in Custom Dev Server
**Vulnerability:** The custom development server (`scripts/serve.js`) served all files under the root directory (`process.cwd()`), exposing sensitive files like `package.json`, source code (`scripts/`), and test files (`tests/`).
**Learning:** Naive file servers often default to serving everything in the root, relying only on hidden file checks. This pattern leads to source code disclosure.
**Prevention:** Implement a strict allowlist of serveable directories and files (e.g., `src/`, `public/`) and deny everything else by default. Do not rely on "blocklists" or simple path normalization alone.
## 2025-02-28 - [CRITICAL] Fix Null Byte DoS in Static Server
**Vulnerability:** The local dev server (`scripts/serve.js`) crashed completely when a requested path contained a null byte (`%00`). `fs.stat` synchronously throws `TypeError [ERR_INVALID_ARG_VALUE]` if the path contains a null byte, which was uncaught and killed the server process.
**Learning:** Node.js file system APIs like `fs.stat` will throw a synchronous error if passed a path containing a null byte. Even with try-catch blocks elsewhere, synchronous throws on asynchronous-looking Node APIs can lead to severe DoS.
**Prevention:** Always sanitize or explicitly reject paths containing `\0` immediately after URL decoding, before passing them to any Node.js `fs` or `path` functions.
## 2026-04-07 - [HIGH] HTTP Method Enforcement in Static Server
**Vulnerability:** The custom static development server (`scripts/serve.js`) handled all incoming HTTP methods indiscriminately without explicit restrictions. Requests like `POST`, `TRACE`, `PUT`, or `DELETE` would either be processed as GET requests or hit unintended file system endpoints.
**Learning:** Static file servers must explicitly default to a deny-all approach for unsupported HTTP methods to avoid leaking logic, bypassing expected security flow, or introducing potential Cross-Site Tracing (XST) via `TRACE`.
**Prevention:** Always check and enforce `req.method === 'GET' || req.method === 'HEAD'` at the absolute beginning of the server request handler. If the method is unsupported, immediately return a `405 Method Not Allowed` response to reject the request safely.
