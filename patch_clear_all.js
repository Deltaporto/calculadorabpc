const fs = require('fs');

const path = 'src/js/main.js';
let content = fs.readFileSync(path, 'utf8');

const target = `  document.querySelectorAll('.note-btn').forEach(b => { b.classList.remove('active', 'locked'); const isZero = +b.dataset.value === 0; if (isZero) b.classList.add('active'); b.setAttribute('aria-pressed', isZero); });`;

const replacement = `  // ⚡ Optimization: Live HTMLCollection avoids memory allocation and GC pressure compared to NodeList caching
  const noteBtns = document.getElementsByClassName('note-btn');
  for (let i = 0; i < noteBtns.length; i++) {
    const b = noteBtns[i];
    b.classList.remove('active', 'locked');
    const isZero = +b.dataset.value === 0;
    if (isZero) b.classList.add('active');
    b.setAttribute('aria-pressed', isZero);
  }`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(path, content, 'utf8');
  console.log('Patched handleLimpar successfully.');
} else {
  console.log('Target not found in main.js.');
}
