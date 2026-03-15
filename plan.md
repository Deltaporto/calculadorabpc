1. **Understand the Goal**: As the "Palette" persona, I need to find and implement ONE micro-UX improvement that makes the interface more intuitive, accessible, or pleasant to use. The change should be small (under 50 lines), use existing design patterns, and ensure keyboard accessibility.
2. **Identify Opportunities**:
    - The `toolbar` has a `.toggle-label` wrapping a custom toggle switch. In `index.html`, there is also `#toggleProg` and `#toggleEstr` inside `<div class="majoracao-toggles">` that use `.toggle-label`.
    - In CSS, `.toggle-label input[type=checkbox]:focus-visible + .toggle-switch` applies an outline to the `.toggle-switch` when the visually hidden native checkbox is focused via keyboard.
    - However, looking at the memory guidelines: "To provide visible keyboard focus indicators for custom toggle switches wrapped in labels (e.g., `.header-row label`), use the `:has(input:focus-visible)` CSS pseudo-class on the parent label to render an outline when the inner native checkbox is focused."
    - `.header-row label` implements this: `.header-row label:has(input[type=checkbox]:focus-visible) { outline: 2px solid rgba(255, 255, 255, .82); outline-offset: 2px; }`
    - But `.toggle-label` uses: `.toggle-label input[type=checkbox]:focus-visible+.toggle-switch { outline: 2px solid var(--blue); outline-offset: 2px; }`. This only outlines the inner `.toggle-switch` span, not the whole label. It might be better to outline the whole label for consistency and better visibility, just like in `.header-row label`.
    - Let's look for other accessibility issues or interactions.
    - Another one: In `src/styles/main.css` line 4317, we have `.note-btn:focus-visible, .amb-tab:focus-visible, .mode-btn:focus-visible, .btn:focus-visible, ... { outline: 2px solid transparent; box-shadow: 0 0 0 2px color-mix(in srgb, var(--blue) 72%, #fff 28%); }` which handles focus visibility globally.
    - In `index.html`, there is `<label class="toggle-label"><input type="checkbox" id="toggleProg"><span class="toggle-switch"></span>Prognóstico desfavorável</label>`.
    - Is there any missing `aria-live` or focus feedback?
    - Let's check `#jcCorpoReductionConfirm`. It's `<label><input type="checkbox" id="jcCorpoReductionConfirm"> Confirmo a redução com base na prova superveniente</label>`. It is inside `.jc-reduction-alert`. It lacks focus-visible on the label.
    - There is also `aria-label` or `title` missing on icon-only buttons? Let's check `btnLimpar`. It has `title` but inside it has text. It is `<button class="btn btn-outline" id="btnLimpar" title="Limpa todos os domínios e redefine as opções da simulação."><svg class="ui-icon sm" aria-hidden="true"><use href="#i-trash"></use></svg>Limpar tudo</button>`. This is not icon-only.
    - How about `.back-to-top`? It is `<button id="btnBackToTop" class="back-to-top hidden" aria-label="Voltar ao topo" title="Voltar ao topo"><svg class="ui-icon" aria-hidden="true"><use href="#i-arrow-up"></use></svg></button>`. It has `aria-label`.
    - How about `<button type="button" class="sim-help-close" id="simHelpCloseBtn" aria-label="Fechar ajuda">`? It has `aria-label`.
    - How about `<button class="btn btn-red portaria-close-btn" id="closePortariaModalBtn" type="button" data-portaria-close>`? It has text "Fechar".
    - Are there any forms without proper labels? The `.idade-input` has `<label for="inputIdade">Idade:</label>` and `<select id="inputIdadeUnidade" aria-label="Unidade de tempo">`.
    - What if I apply the `:has(input:focus-visible)` outline to `.toggle-label`? Memory says: "To provide visible keyboard focus indicators for custom toggle switches wrapped in labels (e.g., `.header-row label`), use the `:has(input:focus-visible)` CSS pseudo-class on the parent label to render an outline when the inner native checkbox is focused."
    - Wait, there's another thing: `.toggle-label` already uses `input[type=checkbox]:focus-visible + .toggle-switch { outline: ... }`. Applying `:has()` to the parent label instead would provide a larger, clearer focus ring encompassing both the text and the switch, exactly matching `.header-row label`.
    - Let's update `src/styles/main.css` for `.toggle-label` to use `:has()`.
    - Are there other toggle switches? Let's check `.jc-reduction-alert label`. It is a simple checkbox, not a toggle switch. Maybe we can add focus ring to it as well.
    - Let's check for any missing disabled states. "Generic button classes like `.btn` must define explicit `:disabled` states...". I can see `.btn:disabled` in `main.css`: `.btn:disabled { cursor: not-allowed; opacity: 0.6; filter: grayscale(0.5); }`. It's already there!
    - "When styling disabled or locked interactive elements (like `.note-btn.locked`), do not use `pointer-events: none` as it prevents native tooltips...". Looking at `main.css` `.note-btn.locked { opacity: .7; cursor: not-allowed; }` - it is also there!
    - "Dynamically injected transient UI components (like toast notifications and their close buttons) must include explicit `:focus-visible` CSS rules...". `main.css` has `.toast-close:focus-visible`.
    - "Visually-hidden interactive elements that become visible on focus (such as `.skip-link` accessibility elements) must include explicit `:focus-visible` styles...". `.skip-link:focus-visible` is present.
    - Let's look for: "To provide visible keyboard focus indicators for custom toggle switches wrapped in labels (e.g., `.header-row label`), use the `:has(input:focus-visible)` CSS pseudo-class on the parent label to render an outline when the inner native checkbox is focused." I see `.header-row label:has(input[type=checkbox]:focus-visible)` exists. What about `.toggle-label`? It doesn't use `:has()`. It uses `input:focus-visible + .toggle-switch`.
    - Changing `.toggle-label input[type=checkbox]:focus-visible+.toggle-switch` to `.toggle-label:has(input[type=checkbox]:focus-visible)` would improve UX by highlighting the entire interactive area (the label text AND the switch), not just the tiny switch. This makes it much clearer to keyboard users what is focused.
    - Is there another toggle switch? "Prognóstico desfavorável", "Estrutura do Corpo > Função", "Impedimento < 2 anos". These use `.toggle-label`.

    Let's implement the `:has(input[type=checkbox]:focus-visible)` focus ring on `.toggle-label` instead of just `.toggle-switch`.

    Old CSS:
    ```css
    .toggle-label input[type=checkbox]:focus-visible+.toggle-switch {
      outline: 2px solid var(--blue);
      outline-offset: 2px
    }
    ```

    New CSS:
    ```css
    .toggle-label:has(input[type=checkbox]:focus-visible) {
      outline: 2px solid var(--blue);
      outline-offset: 2px;
    }
    ```
    Wait, in the redesign layer (bottom of main.css):
    ```css
    .toggle-label {
      border-radius: 10px;
      padding: 6px 8px;
    }
    ```
    This means the label has a padding and border-radius, making it a perfect candidate for an outline around the whole label!
    Also, what about `.toggle-label input[type=checkbox]:focus-visible+.toggle-switch` in the old section? Should we remove it? Yes.
    And I should add `.toggle-label:has(input[type=checkbox]:focus-visible) { outline: 2px solid color-mix(in srgb, var(--blue) 72%, #fff 28%); outline-offset: 2px; }` to match the global focus styles or just keep `var(--blue)`. The existing code has `outline: 2px solid var(--blue);`. Wait, global focus styles use `outline: 2px solid transparent; box-shadow: 0 0 0 2px color-mix(in srgb, var(--blue) 72%, #fff 28%);`. Maybe `outline: 2px solid color-mix(in srgb, var(--blue) 72%, #fff 28%);` or use the global focus styles.
    Let's add `.toggle-label:has(input:focus-visible)` to the big block of focus styles at the bottom of `main.css`:
    ```css
    .note-btn:focus-visible,
    .amb-tab:focus-visible,
    .mode-btn:focus-visible,
    .btn:focus-visible,
    .simulador-summary:focus-visible,
    .idade-input input:focus-visible,
    .idade-input select:focus-visible,
    .jc-textarea:focus-visible,
    .jc-mini-textarea:focus-visible,
    .jc-select:focus-visible,
    .standard-text textarea:focus-visible,
    .toast-close:focus-visible,
    .toggle-label:has(input:focus-visible) {
      outline: 2px solid transparent;
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--blue) 72%, #fff 28%);
    }
    ```
    If I add `.toggle-label:has(input:focus-visible)` there, then I should remove the old `.toggle-label input[type=checkbox]:focus-visible+.toggle-switch` rule entirely.

    Let's check `main.css` for `.toggle-label`:
    ```css
    908:.toggle-label {
    909:  display: flex;
    910:  align-items: center;
    911:  gap: 8px;
    912:  font-size: .8rem;
    913:  color: var(--text2);
    914:  cursor: pointer;
    915:  user-select: none
    916:}

    928:.toggle-label input[type=checkbox]:focus-visible+.toggle-switch {
    929:  outline: 2px solid var(--blue);
    930:  outline-offset: 2px
    931:}
    ```
    If I change lines 928-931 to:
    ```css
    .toggle-label:has(input[type=checkbox]:focus-visible) {
      outline: 2px solid var(--blue);
      outline-offset: 2px
    }
    ```
    Wait, if I use the global `box-shadow`, it might look better, but the `.header-row label` uses `outline: 2px solid rgba(255, 255, 255, .82); outline-offset: 2px;`.
    Let's see what `.toggle-label` uses inside the A11Y focus styles block at the end of the file. It's not there.
    Let's just change lines 928-931 to:
    ```css
    .toggle-label:has(input[type=checkbox]:focus-visible) {
      outline: 2px solid var(--blue);
      outline-offset: 2px
    }
    ```
    And at line 4317:
    ```css
    .note-btn:focus-visible,
    .amb-tab:focus-visible,
    .mode-btn:focus-visible,
    .btn:focus-visible,
    .simulador-summary:focus-visible,
    .idade-input input:focus-visible,
    .idade-input select:focus-visible,
    .jc-textarea:focus-visible,
    .jc-mini-textarea:focus-visible,
    .jc-select:focus-visible,
    .standard-text textarea:focus-visible,
    .toast-close:focus-visible,
    .toggle-label:has(input[type=checkbox]:focus-visible) {
      outline: 2px solid transparent;
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--blue) 72%, #fff 28%);
    }
    ```
    Actually, if I add it to the global block, I should just delete the lines 928-931 to avoid conflict.
    Wait, if I delete the lines 928-931, the focus ring will just use the box-shadow. Let's see if that's what we want.
    If I look at `.toggle-label` block:
    ```css
    .toggle-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: .8rem;
      color: var(--text2);
      cursor: pointer;
      user-select: none
    }
    ```
    And inside redesign block (from 2026-02):
    ```css
    .toggle-label {
      border-radius: 10px;
      padding: 6px 8px;
    }
    ```
    So it has a border-radius. A `box-shadow` or `outline` would look great on it.
    Let's add it to the global A11Y FOCUS STYLES block at line 4317.

    ```css
    /* A11Y FOCUS STYLES (Palette) */
    .note-btn:focus-visible,
    .amb-tab:focus-visible,
    .mode-btn:focus-visible,
    .btn:focus-visible,
    .simulador-summary:focus-visible,
    .idade-input input:focus-visible,
    .idade-input select:focus-visible,
    .jc-textarea:focus-visible,
    .jc-mini-textarea:focus-visible,
    .jc-select:focus-visible,
    .standard-text textarea:focus-visible,
    .toast-close:focus-visible,
    .toggle-label:has(input:focus-visible) {
      outline: 2px solid transparent;
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--blue) 72%, #fff 28%);
    }
    ```
    And delete the `.toggle-label input[type=checkbox]:focus-visible+.toggle-switch` rule completely.

    Let's check if there are other form elements like checkboxes wrapped in labels that need focus-visible.
    `#jcCorpoReductionConfirm` is wrapped in a `<label>`.
    `<label><input type="checkbox" id="jcCorpoReductionConfirm"> Confirmo a redução com base na prova superveniente</label>`
    It is inside `.jc-reduction-alert`.
    In CSS:
    ```css
    .jc-reduction-alert label {
      display: inline-flex;
      align-items: center;
      gap: 6px
    }
    ```
    We can add `.jc-reduction-alert label:has(input:focus-visible)` to the big list of focus-visible styles too!
    That provides a nice consistent focus ring for that checkbox label as well.

    ```css
    .note-btn:focus-visible,
    .amb-tab:focus-visible,
    .mode-btn:focus-visible,
    .btn:focus-visible,
    .simulador-summary:focus-visible,
    .idade-input input:focus-visible,
    .idade-input select:focus-visible,
    .jc-textarea:focus-visible,
    .jc-mini-textarea:focus-visible,
    .jc-select:focus-visible,
    .standard-text textarea:focus-visible,
    .toast-close:focus-visible,
    .toggle-label:has(input[type=checkbox]:focus-visible),
    .jc-reduction-alert label:has(input[type=checkbox]:focus-visible) {
    ```

    Is there any other missing `:focus-visible`?
    What about the `.flowchart-step-nav button`? It has its own:
    ```css
    .flowchart-step-nav button:focus-visible {
      outline: 2px solid color-mix(in srgb, var(--blue) 70%, #fff);
      outline-offset: 2px
    }
    ```
    What about `.flow-step-card`?
    ```css
    .flow-step-card:focus-visible {
      outline: 2px solid color-mix(in srgb, var(--blue) 72%, #fff);
      outline-offset: 2px
    }
    ```

    The change to `.toggle-label:has(input[type=checkbox]:focus-visible)` perfectly aligns with the memory: "To provide visible keyboard focus indicators for custom toggle switches wrapped in labels (e.g., `.header-row label`), use the `:has(input:focus-visible)` CSS pseudo-class on the parent label to render an outline when the inner native checkbox is focused."

    Let's test this change.
    I will update `src/styles/main.css`.

3. **Verify the change:**
   Run `pnpm format` (or equivalent) to make sure everything is formatted, then run `pnpm test`.

4. **Update `.jules/palette.md`:**
   Since this is a specific application of `:has(input:focus-visible)` for custom toggle switches which the system already knows about from the memory, should I add an entry?
   Wait, the memory already says:
   "To provide visible keyboard focus indicators for custom toggle switches wrapped in labels (e.g., `.header-row label`), use the `:has(input:focus-visible)` CSS pseudo-class on the parent label to render an outline when the inner native checkbox is focused."
   Since this memory already exists, I might not need to add a new journal entry unless it's a NEW insight. But I can add one about `.toggle-label` specifically or just rely on the existing one. "ONLY add journal entries when you discover: A reusable UX pattern for this design system". The pattern `:has(input:focus-visible)` on label is already in the design system. I don't need to add a new journal entry.

5. **PR Creation:**
   Title: "🎨 Palette: Melhoria no foco de teclado dos botões de alternância (toggle)"
   Description:
   💡 **What**: Atualização do indicador de foco do teclado (`:focus-visible`) para os botões de alternância (toggles) como "Prognóstico desfavorável" e "Impedimento < 2 anos". Agora, o contorno de foco engloba todo o rótulo (`.toggle-label`), em vez de apenas a pequena chave (`.toggle-switch`). O mesmo foi aplicado ao checkbox de confirmação de redução.
   🎯 **Why**: Usuários que navegam por teclado precisam de um feedback visual claro e consistente. Destacar todo o rótulo clicável aumenta a área visível do foco e segue o padrão já existente no cabeçalho do aplicativo, melhorando a previsibilidade e a usabilidade não-visual (A11y).
   📸 **Before/After**: (Visual change)
   ♿ **Accessibility**: Melhora os anéis de foco para os componentes de toggle e checkbox, expandindo a área destacada e usando o pseudo-class `:has()` para focar o contêiner parent.
