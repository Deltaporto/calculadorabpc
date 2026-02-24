(function loadAppScript() {
  if (window.location.protocol === 'file:') {
    const warning = document.createElement('div');
    warning.setAttribute('role', 'alert');
    warning.style.position = 'fixed';
    warning.style.top = '0';
    warning.style.left = '0';
    warning.style.right = '0';
    warning.style.zIndex = '9999';
    warning.style.padding = '12px 16px';
    warning.style.background = '#7a1f1f';
    warning.style.color = '#fff';
    warning.style.font = '600 14px/1.4 "Source Sans 3", sans-serif';
    warning.style.boxShadow = '0 2px 8px rgba(0,0,0,.25)';
    warning.textContent = 'Esta aplicação usa módulos ES e não funciona via file://. Execute "npm run start" e acesse http://127.0.0.1:8000/index.html.';
    document.body.prepend(warning);
    return;
  }

  const script = document.createElement('script');
  script.type = 'module';
  script.src = 'src/js/main.js';
  document.body.appendChild(script);
})();
