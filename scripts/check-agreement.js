// Checks that every Hero Club price in docs/agreement/ matches the signup page.
// Run: node scripts/check-agreement.js
//
// The prices live in TIERS in public/index.html and must match the door
// hanger. Each document here that quotes a price has to show every plan's
// deposit, monthly charge and year total (deposit + 12 monthly charges).

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const DOCS = path.join(root, 'docs', 'agreement');
const MONTHS = 12;

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

// A figure counts only as a whole amount: "$70" must not match inside "$700".
function has(text, amount) {
  const escaped = amount.replace(/[$]/g, '\\$');
  return new RegExp(escaped + '(?![\\d,]*\\d)').test(text);
}

function expectedFigures(tiers) {
  const out = [];
  for (const id of Object.keys(tiers)) {
    for (const size of ['s', 'm']) {
      const pair = tiers[id].price[size];
      assert(Array.isArray(pair) && pair.length === 2, `${id}/${size} has no [monthly, deposit] price`);
      const [monthly, deposit] = pair;
      out.push({ plan: `${tiers[id].name} ${size.toUpperCase()}`, deposit, monthly, total: deposit + MONTHS * monthly });
    }
  }
  return out;
}

function main() {
  assert(fs.existsSync(DOCS), 'docs/agreement/ does not exist');
  const figures = expectedFigures(readTiers());
  const files = fs.readdirSync(DOCS).filter((f) => f.endsWith('.md')).sort();
  assert(files.length > 0, 'docs/agreement/ has no Markdown files');

  let checked = 0;
  for (const file of files) {
    const text = fs.readFileSync(path.join(DOCS, file), 'utf8');
    // A document that quotes the plan prices shows the price table. One that
    // only uses a single price in an example is not held to the full table.
    if (!/\|\s*Deposit\s*\|/i.test(text)) {
      console.log(`skip ${file} (no price table)`);
      continue;
    }
    for (const f of figures) {
      for (const [label, value] of [['deposit', f.deposit], ['monthly charge', f.monthly], ['year total', f.total]]) {
        assert(has(text, money(value)), `${file}: missing ${f.plan} ${label} ${money(value)}`);
      }
    }
    console.log(`ok   ${file}`);
    checked += 1;
  }
  assert(checked > 0, 'No document in docs/agreement/ has a price table');
}

try {
  main();
} catch (err) {
  console.error('FAILED: ' + err.message);
  process.exit(1);
}
