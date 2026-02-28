## 2025-06-18 - Information Disclosure in Custom Dev Server
**Vulnerability:** The custom development server (`scripts/serve.js`) served all files under the root directory (`process.cwd()`), exposing sensitive files like `package.json`, source code (`scripts/`), and test files (`tests/`).
**Learning:** Naive file servers often default to serving everything in the root, relying only on hidden file checks. This pattern leads to source code disclosure.
**Prevention:** Implement a strict allowlist of serveable directories and files (e.g., `src/`, `public/`) and deny everything else by default. Do not rely on "blocklists" or simple path normalization alone.
## 2025-02-28 - [CRITICAL] Fix Null Byte DoS in Static Server
**Vulnerability:** The local dev server (`scripts/serve.js`) crashed completely when a requested path contained a null byte (`%00`). `fs.stat` synchronously throws `TypeError [ERR_INVALID_ARG_VALUE]` if the path contains a null byte, which was uncaught and killed the server process.
**Learning:** Node.js file system APIs like `fs.stat` will throw a synchronous error if passed a path containing a null byte. Even with try-catch blocks elsewhere, synchronous throws on asynchronous-looking Node APIs can lead to severe DoS.
**Prevention:** Always sanitize or explicitly reject paths containing `\0` immediately after URL decoding, before passing them to any Node.js `fs` or `path` functions.
