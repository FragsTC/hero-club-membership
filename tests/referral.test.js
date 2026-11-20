const test = require('node:test');
const assert = require('node:assert');
const R = require('../public/referral.js');

test('nameFromCode turns a code into a display name', () => {
  assert.strictEqual(R.nameFromCode('sarah-m'), 'Sarah M.');
  assert.strictEqual(R.nameFromCode('mary-ann-k2'), 'Mary Ann K.');
  assert.strictEqual(R.nameFromCode('SARAH-M'), 'Sarah M.');
  assert.strictEqual(R.nameFromCode('  sarah-m  '), 'Sarah M.');
});

test('nameFromCode rejects anything that is not a code', () => {
  const bad = ['', null, undefined, 'sarah', '-m', 'sarah-', '<script>-x', 'sarah m', 'sarah-mm', 'a'.repeat(58) + '-m', 'sarah-m12345', 'sarah--m', 42, 'sárah-m'];
  for (const code of bad) assert.strictEqual(R.nameFromCode(code), '', JSON.stringify(code));
});

test('codeFromName builds a code from a full name', () => {
  assert.strictEqual(R.codeFromName('Sarah Mitchell'), 'sarah-m');
  assert.strictEqual(R.codeFromName('  mary ann   Keller ', 2), 'mary-ann-k2');
  assert.strictEqual(R.codeFromName("Seán O'Brien"), 'sean-o');
  assert.strictEqual(R.codeFromName('Sarah Mitchell', 1), 'sarah-m');
  assert.strictEqual(R.codeFromName('Cher'), '');
  assert.strictEqual(R.codeFromName(''), '');
  assert.strictEqual(R.codeFromName(null), '');
  assert.strictEqual(R.codeFromName('123 456'), '');
});

test('a made code always reads back', () => {
  assert.strictEqual(R.nameFromCode(R.codeFromName('Sarah Mitchell', 3)), 'Sarah M.');
  assert.strictEqual(R.nameFromCode(R.codeFromName('Jean-Luc van der Berg')), 'Jean Luc Van Der B.');
  const long = R.codeFromName('Bartholomew Maximilian Christopher Alexander Montgomery Smith');
  assert.ok(long === '' || R.nameFromCode(long) !== '', long);
});

test('linkFor builds the signup link', () => {
  assert.strictEqual(R.linkFor('https://x.test', 'sarah-m'), 'https://x.test/?ref=sarah-m');
  assert.strictEqual(R.linkFor('https://x.test/', 'sarah-m'), 'https://x.test/?ref=sarah-m');
});
