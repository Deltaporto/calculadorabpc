## 2025-06-18 - Information Disclosure in Custom Dev Server
**Vulnerability:** The custom development server (`scripts/serve.js`) served all files under the root directory (`process.cwd()`), exposing sensitive files like `package.json`, source code (`scripts/`), and test files (`tests/`).
**Learning:** Naive file servers often default to serving everything in the root, relying only on hidden file checks. This pattern leads to source code disclosure.
**Prevention:** Implement a strict allowlist of serveable directories and files (e.g., `src/`, `public/`) and deny everything else by default. Do not rely on "blocklists" or simple path normalization alone.
## 2025-02-28 - [CRITICAL] Fix Null Byte DoS in Static Server
**Vulnerability:** The local dev server (`scripts/serve.js`) crashed completely when a requested path contained a null byte (`%00`). `fs.stat` synchronously throws `TypeError [ERR_INVALID_ARG_VALUE]` if the path contains a null byte, which was uncaught and killed the server process.
**Learning:** Node.js file system APIs like `fs.stat` will throw a synchronous error if passed a path containing a null byte. Even with try-catch blocks elsewhere, synchronous throws on asynchronous-looking Node APIs can lead to severe DoS.
**Prevention:** Always sanitize or explicitly reject paths containing `\0` immediately after URL decoding, before passing them to any Node.js `fs` or `path` functions.
## 2026-04-11 - [MEDIUM] Missing HTTP method restrictions
**Vulnerability:** The local development server (`scripts/serve.js`) previously lacked HTTP method restrictions, allowing it to process potentially unexpected HTTP verbs (like `POST`, `PUT`, `DELETE`). While it only served files, this deviates from security best practices where unexpected methods should be explicitly rejected.
**Learning:** Simple custom file servers often process all requests identically regardless of the HTTP method. Explicitly filtering allowed methods ensures the server only responds to intended request types.
**Prevention:** Always check and enforce allowed HTTP methods (e.g., `GET`, `HEAD`) at the entry point of request processing, returning a `405 Method Not Allowed` for unauthorized verbs.
## 2025-06-19 - [MEDIUM] Fix DoS and Slowloris vulnerability in local server
**Vulnerability:** The local development server (`scripts/serve.js`) lacked URI length limits and explicit timeout configurations, making it susceptible to Denial of Service (DoS) and Slowloris attacks.
**Learning:** Custom Node.js HTTP servers without explicit URI length limits and timeouts are vulnerable to DoS attacks by malicious clients sending excessively long URIs or keeping connections open indefinitely.
**Prevention:** Always implement active protections against DoS and Slowloris attacks, including strict URI length limits (e.g., returning a 414 URI Too Long response) and global server timeout configurations (e.g., `server.timeout`, `server.keepAliveTimeout`, `server.headersTimeout`).
## 2024-05-29 - Defense in Depth: Missing CSP Headers in Static Hosting Fallbacks
**Vulnerability:** While `scripts/serve.js` enforces a strong Content Security Policy via HTTP headers, the static HTML files (`index.html` and `docs/manual.html`) lacked fallback `<meta http-equiv="Content-Security-Policy">` tags. If the application is ever hosted statically on environments that do not automatically inject security headers (e.g., raw GitHub Pages without configuration, or simple file servers), the app would be vulnerable to XSS and framing attacks.
**Learning:** Security measures implemented exclusively in the local development server do not necessarily extend to production static hosting.
**Prevention:** Always implement defense-in-depth by embedding core CSP directives directly in the HTML `<meta>` tags as a fallback for static deployments, ensuring baseline security regardless of the hosting environment.
## 2025-06-25 - [MEDIUM] Missing input length limits on textareas
**Vulnerability:** Unbounded text inputs like `<textarea>` elements (e.g., `#jcAtivMedJustification`) lacked `maxlength` attributes, presenting a client-side Denial of Service (DoS) and memory exhaustion risk from excessively large user inputs.
**Learning:** Even entirely client-side web applications can suffer performance degradation, UI freezing, or memory exhaustion if users can paste gigabytes of text into unconstrained input fields.
**Prevention:** Always enforce reasonable bounds on client-side inputs. Ensure all unbounded text inputs like `<textarea>` have explicit `maxlength` attributes configured.
## 2025-02-18 - Fix Path Traversal in Development Server via Encoded Backslashes
**Vulnerability:** The local development server (`scripts/serve.js`) was vulnerable to path traversal because it relied solely on `path.normalize()` which does not handle backslashes on POSIX environments correctly. An attacker could bypass path restrictions using URL-encoded backslashes (e.g., `/%5c..%5c..%5cpackage.json`).
**Learning:** URL decoding occurs before path normalization. On POSIX environments, `path.normalize()` doesn't consider `\` as a path separator, meaning traversal using backslashes isn't simplified/caught, and ultimately the operating system or other underlying APIs may still interpret the raw strings leading to reading unauthorized files.
**Prevention:** Explicitly sanitize and replace backslashes (`\`) with forward slashes (`/`) immediately after URL decoding, and prior to path validation/normalization routines.
