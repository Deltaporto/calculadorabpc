export function bindAppEvents({
  onDomainButtonClick,
  onToggleProg,
  onToggleEstr,
  onToggleImpedimento,
  onToggleDark,
  onToggleMenor16,
  onInputIdade,
  onChangeIdadeUnidade,
  onAmbTabClick,
  onApplyPadrao,
  onLimpar,
  onLevarParaControle,
  onUseCurrentAsBase,
  onFixarBaseAdmin,
  onClearComp,
  onCopiarTexto,
  onModeSwitcherClick
}) {
  document.addEventListener('click', e => {
    const button = e.target.closest('.note-btn');
    if (!button) return;

    const group = button.parentElement;
    const domain = group.dataset.domain;
    const value = +button.dataset.value;
    onDomainButtonClick({ button, group, domain, value });
  });

  document.getElementById('toggleProg').addEventListener('change', e => {
    onToggleProg(e.target.checked);
  });
  document.getElementById('toggleEstr').addEventListener('change', e => {
    onToggleEstr(e.target.checked);
  });
  document.getElementById('toggleImpedimento').addEventListener('change', e => {
    onToggleImpedimento(e.target.checked);
  });

  document.getElementById('toggleDark').addEventListener('change', e => {
    onToggleDark(e.target.checked);
  });

  document.getElementById('toggleMenor16').addEventListener('change', e => {
    onToggleMenor16(e.target.checked);
  });
  document.getElementById('inputIdade').addEventListener('input', () => {
    onInputIdade();
  });
  document.getElementById('inputIdadeUnidade').addEventListener('change', e => {
    onChangeIdadeUnidade(e.target.value);
  });

  document.querySelectorAll('.amb-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      onAmbTabClick({ tab, value: +tab.dataset.a });
    });
  });

  document.getElementById('btnPadrao').addEventListener('click', () => {
    onApplyPadrao();
  });

  document.getElementById('btnLimpar').addEventListener('click', () => {
    onLimpar();
  });

  document.getElementById('btnLevarParaControle').addEventListener('click', onLevarParaControle);
  document.getElementById('btnUseCurrentAsBase').addEventListener('click', onUseCurrentAsBase);
  document.getElementById('btnFixarBaseAdmin').addEventListener('click', onFixarBaseAdmin);
  document.getElementById('btnClearComp').addEventListener('click', onClearComp);

  document.getElementById('btnCopiarTexto').addEventListener('click', onCopiarTexto);
  document.getElementById('modeSwitcher').addEventListener('click', e => {
    const btn = e.target.closest('.mode-btn');
    if (!btn) return;
    onModeSwitcherClick(btn.dataset.mode);
  });
}
