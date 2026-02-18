# Refatoração do Monólito index.html

## Objetivo
Reduzir acoplamento e risco de regressão do front-end da calculadora, saindo do monólito HTML/CSS/JS inline para uma estrutura modular sem build inicialmente.

## Escopo
- Extrair CSS inline para arquivo dedicado.
- Extrair JS inline para arquivo dedicado.
- Introduzir módulos ES por responsabilidade (`constants`, `state`, `calculations`, `dom-builders`, `a11y`, `ui-render`, `events`, `judicial-flow`).
- Manter comportamento funcional e seletores existentes.
- Atualizar testes para refletir a nova estrutura.

## Decisões Técnicas
- Estratégia sem build tool nesta fase (ES Modules nativos no navegador).
- `index.html` permanece como shell estático.
- Regras de negócio foram extraídas para `src/js/calculations.js`.
- Estado e fábricas de estado foram extraídos para `src/js/state.js`.
- Constantes de domínio e escala foram extraídas para `src/js/constants.js`.
- Builders de DOM foram extraídos para `src/js/dom-builders.js`.
- Inicialização de labels estáticos de acessibilidade foi extraída para `src/js/a11y.js`.
- Ciclo principal de atualização de UI foi extraído para `src/js/ui-render.js`.
- Bindings da etapa de controle judicial foram extraídos para `src/js/events.js`.
- Núcleo decisório do fluxo judicial foi extraído para `src/js/judicial-flow.js`.

## Plano Faseado
### Fase 1 (implementada)
- [x] Criar `src/styles/main.css` e mover estilos inline.
- [x] Criar `src/js/main.js` e mover script inline.
- [x] Atualizar `index.html` para usar `<link rel="stylesheet" href="src/styles/main.css">`.
- [x] Atualizar `index.html` para usar `<script type="module" src="src/js/main.js"></script>`.
- [x] Criar módulos:
  - [x] `src/js/constants.js`
  - [x] `src/js/state.js`
  - [x] `src/js/calculations.js`
  - [x] `src/js/dom-builders.js`
  - [x] `src/js/a11y.js`
- [x] Adaptar `src/js/main.js` para imports de módulos.
- [x] Atualizar teste unitário de `pctToQ` para novo local.

### Fase 2 (concluída)
- [x] Separar renderização em módulo dedicado (`ui-render.js`).
- [x] Separar bindings/listeners em módulo dedicado (`events.js`).
- [x] Extrair listeners gerais da Calculadora para módulo dedicado (`app-events.js`) e remover `addEventListener` direto do `main.js`.
- [x] Reduzir acesso direto ao DOM no bootstrap, preservando handlers nomeados por responsabilidade.

### Fase 3 (concluída)
- [x] Modularização final do fluxo de controle judicial em submódulos.
- [x] Extrair núcleo decisório do controle judicial para módulo dedicado (`judicial-flow.js`).
- [x] Extrair construção das linhas de rastreabilidade para `judicial-trace.js`.
- [x] Extrair geração da minuta de texto do controle judicial para `judicial-text.js`.
- [x] Expandir cobertura de testes unitários para `tabelaConclusiva` e cálculo por domínio.

### Fase 4 (concluída)
- [x] Redesign visual institucional premium (camada de override em `src/styles/main.css`) sem alterar regras de negócio.
- [x] Revisão de tipografia, espaçamento, hierarquia e contraste para reduzir aparência genérica/amadora.
- [x] Refinos responsivos desktop/mobile para painéis, toolbar, ações e fluxo de Controle Judicial.
- [x] Inclusão de microinterações visuais discretas respeitando `prefers-reduced-motion`.

## Critérios de Aceite
- A aplicação carrega com CSS e JS externos.
- Fluxos principais continuam operacionais sem quebra funcional.
- Testes unitários passam.
- A organização de código permite evolução incremental sem editar um único arquivo gigante.

## Riscos e Mitigações
- Risco: regressão por ordem de inicialização.
  - Mitigação: manter sequência de init existente em `main.js`.
- Risco: regressão por mudança de seletores.
  - Mitigação: preservar IDs/classes e contratos de DOM.
- Risco: baixa cobertura automatizada no fluxo UI completo.
  - Mitigação: manter validações manuais e evoluir testes E2E na próxima fase.

## Registro de Mudanças (Changelog)
- 2026-02-18 10:08 -03 — Codex — [Plano Inicial] — Documento criado com escopo, fases e critérios — Necessidade de rastreabilidade.
- 2026-02-18 10:08 -03 — Codex — [Fase 1] — Extração de CSS/JS inline para `src/styles/main.css` e `src/js/main.js` concluída — Quebrar o monólito HTML.
- 2026-02-18 10:08 -03 — Codex — [Módulos] — Criação de `constants.js`, `state.js`, `calculations.js`, `a11y.js` e adaptação do `main.js` — Reduzir acoplamento e preparar separação por responsabilidade.
- 2026-02-18 10:08 -03 — Codex — [Módulos] — Criação de `dom-builders.js` e extração dos construtores de grade/domínios do `main.js` — Isolar geração de HTML dinâmico em módulo próprio.
- 2026-02-18 10:08 -03 — Codex — [Testes] — `tests/pctToQ.test.js` atualizado para novo local da função — Manter validação após refatoração estrutural.
- 2026-02-18 10:20 -03 — Codex — [Fase 2] — Criação de `ui-render.js` com ciclo principal de update e badges/célula ativa — Separar responsabilidades de renderização.
- 2026-02-18 10:20 -03 — Codex — [Fase 2] — Criação de `events.js` com bindings do controle judicial — Isolar listeners e reduzir acoplamento do `main.js`.
- 2026-02-18 10:20 -03 — Codex — [Testes] — Instalação de dependências Playwright + browser Chromium e ajuste do E2E para servidor HTTP local — Permitir execução de módulos ES em teste automatizado.
- 2026-02-18 10:28 -03 — Codex — [Fase 3] — Criação de `judicial-flow.js` e extração da lógica de triagem/bloqueios/fluxo de reclassificação — Desacoplar regra de negócio judicial da camada de UI.
- 2026-02-18 10:28 -03 — Codex — [Testes] — Nova suíte `tests/calculations.test.js` para `tabelaConclusiva`, `calcAmbienteFromState`, `calcAtividadesFromState`, `calcCorpoFromState` e `computeAtivFromDomains` — Cobrir regras críticas de cálculo após modularização.
- 2026-02-18 10:37 -03 — Codex — [Fase 2] — Criação de `app-events.js` e migração dos listeners gerais (domínios, toggles, abas, padrão, limpar, comparação, cópia e troca de modo) para `bindAppEvents` — Remover listeners inline do `main.js` e melhorar separação por camada.
- 2026-02-18 10:37 -03 — Codex — [Fase 3] — Criação de `judicial-trace.js` e `judicial-text.js`, com delegação no `main.js` — Concluir extração de rastreabilidade e geração textual do controle judicial.
- 2026-02-18 10:37 -03 — Codex — [Validação] — Execução de `npm test` e `npx playwright test tests/verify_trace.spec.js --reporter=line` com sucesso — Confirmar ausência de regressão funcional após refatoração final.
- 2026-02-18 10:46 -03 — Codex — [Execução local] — Adicionado `scripts/serve.js` + `npm run start` e orientação explícita contra `file://`; `index.html` agora mostra alerta em `file://` e só injeta `main.js` em contexto HTTP(S) — Evitar erro CORS de módulos ES e melhorar diagnósticos de execução.
- 2026-02-18 11:01 -03 — Codex — [Correção de regressão] — Ajustado `setUIMode`/`renderModeVisibility` para exibir `#textoSection` no modo Simulador e renderizar a minuta padrão ao alternar de modo — Restaurar fluxo “texto padrão + copiar” no simulador.
- 2026-02-18 11:01 -03 — Codex — [Qualidade de logs] — Ajustado `scripts/serve.js` para responder `/favicon.ico` com `204` e reduzido ruído de console no smoke local — Melhorar legibilidade de diagnóstico.
- 2026-02-18 11:01 -03 — Codex — [Smoke test] — Validação com Playwright CLI (fluxo Simulador + Controle Judicial), `npm test` e `tests/verify_trace.spec.js` — Confirmar comportamento após ajustes de execução/local UI.
- 2026-02-18 12:43 -03 — Codex — [Fase 4] — Implementado redesign visual premium em camada de override CSS (tokens, header, cards, tabela, decisão, controle judicial e responsividade) — Elevar qualidade visual preservando compatibilidade funcional.
- 2026-02-18 12:43 -03 — Codex — [Validação] — Reexecução de `npm test`, `npx playwright test tests/verify_trace.spec.js --reporter=line` e capturas desktop/mobile pós-redesign — Confirmar ausência de regressão com novo visual.
