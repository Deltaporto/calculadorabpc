# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install                  # Install dependencies (Playwright)
npm run start                # Start local server at http://127.0.0.1:8000/index.html
npm test                     # Unit tests (Node built-in runner, tests/*.test.js)
npx playwright test          # All E2E tests (tests/*.spec.js)
npx playwright test tests/verify_trace.spec.js --reporter=line  # Single E2E spec
PORT=9000 npm run start      # Custom port
```

**Important:** The app uses ES modules and must be served over HTTP — `file://` won't work.

## Architecture

Vanilla JS SPA (no framework). `index.html` is the shell; all logic is in `src/js/` as ES modules loaded via `<script type="module" src="src/js/main.js">`. One CSS file: `src/styles/main.css`.

### Two UI modes

1. **Simulador:** Interactive 0–4 domain entry with automatic calculation and Conclusive Table visualization.
2. **Controle Judicial:** 4-stage guided judicial review flow.

### Module responsibilities (`src/js/`)

| Module | Responsibility |
|--------|---------------|
| `main.js` | Bootstrap, global state, orchestration, `update()` loop |
| `state.js` | State factory functions |
| `constants.js` | Domain definitions (E1–E5, B1–B8, D1–D9), qualifier labels, age cutoffs |
| `calculations.js` | Core math: `pctToQ`, `calcAmbiente`, `calcAtividades`, `calcCorpo`, `tabelaConclusiva` |
| `judicial-flow.js` | Judicial decision logic: corpo reclassification, ativ context, triage computation |
| `judicial-text.js` | Generates standardized decision text (minuta) from triage outcome |
| `judicial-trace.js` | Renders step-by-step audit trail for judicial reasoning |
| `events.js` | Event bindings for judicial control step fields |
| `app-events.js` | General event bindings (domain buttons, mode switching, Portaria modal) |
| `ui-render.js` | Main update loop: badges, table highlighting, comparison display |
| `dom-builders.js` | DOM constructors for domain rows and Conclusive Table grid |
| `a11y.js` | Accessibility labels for rating buttons |

### Global state (in `main.js`)

- `state` — domain qualifiers (e1–e5, b1–b8, d1–d9, each 0–4) + flags: `progDesfav`, `estrMaior`, `impedimento`, `crianca`, `idadeMeses`
- `savedINSS` — cached administrative evaluation for comparison
- `judicialControl` — nested object with `adminDraft`, `adminBase`, `med`, `triage`, `ui`

Data flow: user input → event handler → mutate state → `update()` / `renderJudicialControl()` → recalculate → sync UI.

### Core calculation rules

- **Ambiente (E1–E5):** `pct = (Σ × 5) − 0.1` → qualifier (N/L/M/G/C)
- **Atividades (D1–D9):** `pct = (Σ × 2.777…) − 0.1` → qualifier
- **Corpo (B1–B8):** max domain value, with optional majorization (+1) if unfavorable prognosis or body structure alteration is recognized
- **Tabela Conclusiva:** Corpo ≤ L → denied; Atividades ≤ L → denied; Corpo ≥ G → approved; Atividades ≥ G → approved; Corpo = M AND Atividades = M → approved only if Ambiente ≥ G or C

### Judicial Control flow (4 stages)

1. **Base Administrativa** — set Ambiente/Atividades/Corpo qualifiers + INSS recognitions; lock with "Fixar base"
2. **Perícia Médica Judicial** — confirm long-term impediment; optionally reclassify Corpo (reasons: `estruturas`, `prognostico`, `dominio_max`, `rebaixamento`) and Atividades
3. **Triagem Probatória** — run tabelaConclusiva with Test A (admin ativ) and Test B (medical ativ); determine if social evaluation is dispensable
4. **Texto da Decisão** — generate and copy standardized 2-paragraph decision text

## Coding Style

- ES Modules in `src/js/` (despite `"type": "commonjs"` in `package.json`, which is for tooling only)
- 2-space indentation, semicolons, single quotes
- `camelCase` for functions/variables, `UPPER_SNAKE_CASE` for constants
- `jc-` prefix for judicial UI element IDs/classes
- Keep business rules in `calculations.js` / `judicial-flow.js`; keep copy/text in `judicial-text.js`
- Conventional Commits: `feat:`, `fix:`, `refactor:`, `style:`

## Testing

- Unit tests target `calculations.js` functions via a custom function extractor
- E2E tests cover judicial copy deduplication, guidance flow, Portaria modal, trace verification
- For any UI or copy change in Judicial Control, add or update Playwright coverage
- Before a PR: run both `npm test` and `npx playwright test`

## Key Domain Knowledge

Governed by **Portaria Conjunta MDS/INSS nº 2/2015** (full text at `docs/normas/portaria-conjunta-2-2015.txt`). Domains follow the ICF (International Classification of Functioning) model. Age-based auto-locking applies to activity domains for children under 16 (cutoffs per domain in `constants.js`).
