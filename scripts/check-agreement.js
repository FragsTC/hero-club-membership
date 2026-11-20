// Checks that the Hero Club documents in docs/agreement/ match the signup page.
// Run: node scripts/check-agreement.js
//
// The prices and services live in TIERS in public/index.html and must match
// the door hanger. This fails, naming the problem, when:
//   - a price table row does not show that plan's deposit, monthly charge and
//     year total (deposit + 12 monthly charges);
//   - any document quotes a dollar figure that does not come from TIERS;
//   - the agreement is missing one of a plan's included services;
//   - the worked cancellation examples no longer add up.

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const DOCS = path.join(root, 'docs', 'agreement');
const AGREEMENT = 'hero-club-membership-agreement.md';
const ROUTINE = 'office-routine.md';
const MONTHS = 12;
const SIZE_LABEL = { s: 'up to 2,500 sq ft', m: '2,501 to 3,500 sq ft' };

// Made-up one-time prices used only in the worked cancellation examples.
const EXAMPLE_HOUSE_WASH = 400;
const EXAMPLE_GUTTER = 150;

function readTiers() {
  const html = fs.readFileSync(path.join(root, 'public', 'index.html'), 'utf8');
  const start = html.indexOf('var TIERS = {');
  assert(start !== -1, 'Could not find "var TIERS" in public/index.html');
  const end = html.indexOf('\n};', start);
  assert(end !== -1, 'Could not find the end of TIERS in public/index.html');
  const literal = html.slice(html.indexOf('{', start), end + 2);
  return new Function('return (' + literal + ');')();
}

const money = (n) => '$' + n.toLocaleString('en-US');

// Every dollar figure in a text, as numbers. "$1,428" -> 1428, "$70.50" -> 70.5.
function amountsIn(text) {
  return (text.match(/\$\d[\d,]*(\.\d+)?/g) || []).map((m) => Number(m.slice(1).replace(/,/g, '')));
}

function planRows(tiers) {
  const rows = [];
  for (const id of Object.keys(tiers)) {
    for (const size of Object.keys(SIZE_LABEL)) {
      const pair = tiers[id].price[size];
      assert(Array.isArray(pair) && pair.length === 2, `${id}/${size} has no [monthly, deposit] price`);
      const [monthly, deposit] = pair;
      rows.push({ name: tiers[id].name, size, deposit, monthly, total: deposit + MONTHS * monthly });
    }
  }
  return rows;
}

// The figures the worked examples in the office routine must show, worked out
// from the Bronze small-home price so they fail if that price changes.
function exampleFigures(tiers) {
  const [monthly, deposit] = tiers.bronze.price.s;
  const paidA = deposit + monthly;
  const receivedB = EXAMPLE_HOUSE_WASH + EXAMPLE_GUTTER;
  const paidB = deposit + 9 * monthly;
  assert(EXAMPLE_HOUSE_WASH - paidA > 0 && EXAMPLE_HOUSE_WASH - paidA <= 11 * monthly,
    'Example A no longer works: the balance must be positive and under the cap. Rewrite the examples.');
  assert(paidB > receivedB, 'Example B no longer works: the member must have paid more than they received. Rewrite the examples.');
  return [EXAMPLE_HOUSE_WASH, EXAMPLE_GUTTER, deposit, monthly, paidA, 11 * monthly, EXAMPLE_HOUSE_WASH - paidA, receivedB, paidB];
}

function checkPriceTable(file, text, rows) {
  const lines = text.split('\n').filter((l) => l.trim().startsWith('|'));
  for (const r of rows) {
    const line = lines.find((l) => l.includes(`| ${r.name} |`) && l.includes(SIZE_LABEL[r.size]));
    assert(line, `${file}: no price table row for ${r.name}, ${SIZE_LABEL[r.size]}`);
    const found = amountsIn(line);
    for (const [label, value] of [['deposit', r.deposit], ['monthly charge', r.monthly], ['year total', r.total]]) {
      assert(found.includes(value), `${file}: the ${r.name}, ${SIZE_LABEL[r.size]} row is missing its ${label} ${money(value)}`);
    }
  }
}

function main() {
  assert(fs.existsSync(DOCS), 'docs/agreement/ does not exist');
  const tiers = readTiers();
  const rows = planRows(tiers);
  const examples = exampleFigures(tiers);
  const files = fs.readdirSync(DOCS).filter((f) => f.endsWith('.md')).sort();
  for (const needed of [AGREEMENT, ROUTINE]) assert(files.includes(needed), `docs/agreement/${needed} is missing`);

  // Figures any document may quote: plan prices, what is left after the
  // deposit, zero, and (in the office routine only) the worked examples.
  const allowed = new Set([0]);
  for (const r of rows) [r.deposit, r.monthly, r.total, r.total - r.deposit].forEach((n) => allowed.add(n));

  let tables = 0;
  for (const file of files) {
    const text = fs.readFileSync(path.join(DOCS, file), 'utf8');
    const ok = file === ROUTINE ? new Set([...allowed, ...examples]) : allowed;
    for (const n of amountsIn(text)) {
      assert(ok.has(n), `${file}: quotes ${money(n)}, which is not a Hero Club price in public/index.html`);
    }
    if (/\|\s*Deposit\s*\|/i.test(text)) {
      checkPriceTable(file, text, rows);
      tables += 1;
    }
    console.log(`ok   ${file}`);
  }
  assert(tables >= 1, 'No document in docs/agreement/ has a price table');

  const agreement = fs.readFileSync(path.join(DOCS, AGREEMENT), 'utf8');
  for (const id of Object.keys(tiers)) {
    for (const service of tiers[id].services) {
      assert(agreement.includes(service), `${AGREEMENT}: ${tiers[id].name} is missing "${service}"`);
    }
  }
  console.log('ok   included services match');

  const routine = fs.readFileSync(path.join(DOCS, ROUTINE), 'utf8');
  const shown = amountsIn(routine);
  for (const n of examples) {
    assert(shown.includes(n), `${ROUTINE}: the worked examples should show ${money(n)}`);
  }
  console.log('ok   worked examples add up');
}

try {
  main();
} catch (err) {
  console.error('FAILED: ' + err.message);
  process.exit(1);
}
