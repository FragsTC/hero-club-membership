const test = require('node:test');
const assert = require('node:assert');
const { buildColumnValues } = require('../netlify/functions/submission-created.js');

const REFERRED_BY = 'text_mm99kje9';
const SAMPLE = {
  name: 'Pat Example', tier: 'Silver (3 visits/year)', 'home-size': 'up to 2,500 sq ft', price: '$80/month after $108 deposit',
  addons: '', phone: '919 555 0100', email: 'pat@example.com', address: '1 Test Lane', city: 'Raleigh', state: 'nc', zip: '27601', notes: 'Gate code 12',
};

test('the referrer goes to the Referred by column', () => {
  const v = buildColumnValues({ ...SAMPLE, 'referred-by': '  Sarah M.   (link: sarah-m) ' });
  assert.strictEqual(v[REFERRED_BY], 'Sarah M. (link: sarah-m)');
});

test('no referrer leaves the column out', () => {
  assert.ok(!(REFERRED_BY in buildColumnValues(SAMPLE)));
  assert.ok(!(REFERRED_BY in buildColumnValues({ ...SAMPLE, 'referred-by': '   ' })));
});

test('a very long referrer is cut to a sensible length', () => {
  const v = buildColumnValues({ ...SAMPLE, 'referred-by': 'x'.repeat(500) });
  assert.ok(v[REFERRED_BY].length <= 120);
});

test('the rest of a request is unchanged', () => {
  const v = buildColumnValues(SAMPLE);
  assert.deepStrictEqual(v.color_mm99q891, { label: 'New' });
  assert.strictEqual(v.text_mm99xq3t, 'Silver (3 visits/year)');
  assert.strictEqual(v.text_mm99g3m5, 'None');
  assert.strictEqual(v.text_mm99zyjk, 'NC');
  assert.deepStrictEqual(v.phone_mm99jstd, { phone: '+19195550100', countryShortName: 'US' });
  assert.deepStrictEqual(v.email_mm99vr8c, { email: 'pat@example.com', text: 'pat@example.com' });
  assert.deepStrictEqual(v.long_text_mm99wj3g, { text: 'Gate code 12' });
});
