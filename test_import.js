const test = require('node:test');
test('dynamic import', async () => {
  const { createDomainNameById } = await import('./src/js/state.js');
  console.log(createDomainNameById([]));
});
