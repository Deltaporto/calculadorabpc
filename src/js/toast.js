export function showToast(message, type = 'info', duration = 4000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-icon"></div>
    <div class="toast-message">${message}</div>
    <button class="toast-close" aria-label="Fechar notificação">×</button>
  `;

  const icon = toast.querySelector('.toast-icon');
  if (type === 'success') {
    icon.innerHTML = '<svg class="ui-icon" aria-hidden="true"><use href="#i-check-circle"></use></svg>';
  } else if (type === 'error') {
    icon.innerHTML = '<svg class="ui-icon" aria-hidden="true"><use href="#i-alert"></use></svg>';
  } else if (type === 'warning') {
    icon.innerHTML = '<svg class="ui-icon" aria-hidden="true"><use href="#i-alert"></use></svg>';
  } else {
    icon.innerHTML = '<svg class="ui-icon" aria-hidden="true"><use href="#i-document"></use></svg>';
  }

  container.appendChild(toast);

  // Force reflow to enable transition
  // eslint-disable-next-line no-unused-expressions
  toast.offsetHeight;

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  const removeToast = () => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => {
      if (toast.parentElement) toast.remove();
      if (container.children.length === 0) container.remove();
    });
  };

  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', removeToast);

  if (duration > 0) {
    setTimeout(removeToast, duration);
  }
}
