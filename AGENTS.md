# Repository Guidelines

## Project Structure & Module Organization
- `index.html`: app shell and DOM structure. Load via HTTP (`file://` is not supported for ES modules).
- `src/js/`: application logic split by responsibility:
  - `main.js` (bootstrap/orchestration),
  - `calculations.js`, `judicial-flow.js`, `judicial-text.js`, `judicial-trace.js`,
  - `events.js`, `app-events.js`, `ui-render.js`, `state.js`, `constants.js`.
- `src/styles/main.css`: global and component styles.
- `tests/`: automated tests (`*.test.js` for Node unit tests, `*.spec.js` for Playwright E2E).
- `scripts/serve.js`: local static server.
- `docs/`: refactor decisions and functional documentation.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run start`: starts local server at `http://127.0.0.1:8000/index.html`.
- `npm test`: runs unit tests with Node test runner (`tests/*.test.js`).
- `npx playwright test`: runs all E2E browser tests.
- Useful targeted run:
  - `npx playwright test tests/verify_trace.spec.js --reporter=line`

## Coding Style & Naming Conventions
- JavaScript uses ES modules in `src/js` (even with `"type": "commonjs"` in `package.json` for tooling).
- Follow existing style: 2-space indentation, semicolons, single quotes, concise helper functions.
- Naming:
  - `camelCase` for functions/variables,
  - `UPPER_SNAKE_CASE` for constants,
  - descriptive IDs/classes in HTML/CSS with `jc-` prefix for judicial UI elements.
- Keep business rules deterministic; separate copy/text concerns from decision logic.

## Testing Guidelines
- Unit tests: Node built-in test runner, file pattern `tests/*.test.js`.
- E2E tests: Playwright, file pattern `tests/*.spec.js`.
- For UI/copy changes in Judicial Control, add or update Playwright coverage.
- Before opening a PR, run:
  - `npm test`
  - `npx playwright test`

## Commit & Pull Request Guidelines
- Prefer Conventional Commit style seen in history: `feat:`, `fix:`, `refactor:`, `style:`.
- Keep subject line imperative and scoped (e.g., `fix: deduplicate judicial trace wording`).
- PR should include:
  - clear summary of behavior changes,
  - impacted files/modules,
  - test commands executed and results,
  - screenshots for UI changes (desktop + mobile when relevant).
- Do not include transient artifacts (`output/`, temporary logs, local screenshots) unless explicitly required.
