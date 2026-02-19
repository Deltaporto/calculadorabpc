(function loadAppScript() {
  if (window.location.protocol === 'file:') {
    const warning = document.createElement('div');
    warning.setAttribute('role', 'alert');
    warning.style.cssText = [
      'position:fixed',
      'top:0',
      'left:0',
      'right:0',
      'z-index:9999',
      'padding:12px 16px',
      'background:#7a1f1f',
      'color:#fff',
      'font:600 14px/1.4 "Source Sans 3", sans-serif',
      'box-shadow:0 2px 8px rgba(0,0,0,.25)'
    ].join(';');
    warning.textContent = 'Esta aplicação usa módulos ES e não funciona via file://. Execute "npm run start" e acesse http://127.0.0.1:8000/index.html.';
    document.body.prepend(warning);
    return;
  }

  const script = document.createElement('script');
  script.type = 'module';
  script.src = 'src/js/main.js';
  document.body.appendChild(script);
})();
