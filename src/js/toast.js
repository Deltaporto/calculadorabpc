export function showToast(message, type = 'info', duration = 4000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    container.setAttribute('role', 'region');
    container.setAttribute('aria-label', 'Notificações');
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status');

  const iconDiv = document.createElement('div');
  iconDiv.className = 'toast-icon';

  if (type === 'success') {
    iconDiv.innerHTML = '<svg class="ui-icon" aria-hidden="true"><use href="#i-check-circle"></use></svg>';
  } else if (type === 'error') {
    iconDiv.innerHTML = '<svg class="ui-icon" aria-hidden="true"><use href="#i-alert"></use></svg>';
  } else if (type === 'warning') {
    iconDiv.innerHTML = '<svg class="ui-icon" aria-hidden="true"><use href="#i-alert"></use></svg>';
  } else {
    iconDiv.innerHTML = '<svg class="ui-icon" aria-hidden="true"><use href="#i-document"></use></svg>';
  }

  const messageDiv = document.createElement('div');
  messageDiv.className = 'toast-message';
  messageDiv.textContent = message;

  const closeBtn = document.createElement('button');
  closeBtn.className = 'toast-close';
  closeBtn.setAttribute('aria-label', 'Fechar notificação');
  closeBtn.textContent = '×';

  toast.appendChild(iconDiv);
  toast.appendChild(messageDiv);
  toast.appendChild(closeBtn);

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

  closeBtn.addEventListener('click', removeToast);

  if (duration > 0) {
    setTimeout(removeToast, duration);
  }
}
