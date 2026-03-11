export function escapeHtml(str = '') {
  return String(str).replace(/[&<>"'`=\/]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#x60;', '=': '&#x3D;', '/': '&#x2F;' }[c]));
}
