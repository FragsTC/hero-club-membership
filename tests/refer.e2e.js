// Page test: the office link maker and the referral terms page.
// Run: node tests/refer.e2e.js
const assert = require('node:assert');
const { chromium } = require('playwright');
const { serve } = require('./serve');

// Fraction of dark pixels on the QR canvas; 0 when nothing is drawn.
const darkShare = (page) => page.evaluate(() => {
  const c = document.getElementById('qr');
  if (!c || !c.width) return 0;
  const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  let dark = 0;
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 0 && d[i] < 80) dark += 1;
  return dark / (d.length / 4);
});

(async () => {
  const server = await serve();
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 400, height: 850 }, serviceWorkers: 'block' });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await page.goto(server.origin + '/refer.html');
    assert.strictEqual(await page.locator('#result').isHidden(), true, 'nothing shows before a name is typed');

    await page.fill('#memberName', 'Sarah Mitchell');
    const link = server.origin + '/?ref=sarah-m';
    assert.strictEqual(await page.inputValue('#linkOut'), link);
    assert.match(await page.inputValue('#messageOut'), new RegExp(link.replace(/[.?/]/g, '\\$&')));
    assert.match(await page.inputValue('#messageOut'), /month/);
    assert.match(await page.locator('#shownAs').innerText(), /Sarah M\./);
    const share = await darkShare(page);
    assert.ok(share > 0.15 && share < 0.7, 'the QR code is drawn (dark share ' + share.toFixed(2) + ')');
    assert.match(await page.getAttribute('#btnSaveQr', 'href'), /^data:image\/png/);
    assert.strictEqual(await page.getAttribute('#btnSaveQr', 'download'), 'hero-club-referral-sarah-m.png');
    console.log('ok   link, message and QR code');

    await page.fill('#memberNumber', '2');
    assert.strictEqual(await page.inputValue('#linkOut'), server.origin + '/?ref=sarah-m2');
    console.log('ok   a number keeps two members apart');

    await page.fill('#memberNumber', '');
    await page.fill('#memberName', 'Cher');
    assert.strictEqual(await page.locator('#result').isHidden(), true);
    assert.match(await page.locator('#needName').innerText(), /first and last name/i);
    await page.fill('#memberName', '<img src=x onerror=alert(1)> Smith');
    assert.strictEqual(await page.locator('img[src="x"]').count(), 0, 'typed text is never treated as markup');
    console.log('ok   needs a first and last name');

    // The link the maker gives must be one the signup page accepts.
    await page.fill('#memberName', 'Mary Ann Keller');
    const made = await page.inputValue('#linkOut');
    const signup = await browser.newPage({ serviceWorkers: 'block' });
    await signup.goto(made);
    assert.match(await signup.locator('.ref-banner:visible').first().innerText(), /Mary Ann K\. sent you/);
    await signup.close();
    console.log('ok   a made link works on the signup page');

    await page.goto(server.origin + '/referral-terms.html');
    const terms = await page.locator('main').innerText();
    for (const needed of [/twelfth/i, /first monthly charge/i, /down payment/i, /up to one month of (their|your) own plan/i, /12 /, /no cash value/i, /never had a Hero Club membership/i]) {
      assert.match(terms, needed);
    }
    assert.strictEqual(await page.locator('meta[name="robots"]').count(), 0, 'the terms page can be found');
    // The copy kept in docs/ must say the same as the page customers see.
    const md = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', 'docs', 'referrals', 'referral-terms.md'), 'utf8');
    const flat = (t) => t.replace(/\*\*/g, '').replace(/\s+/g, ' ').toLowerCase();
    const items = await page.locator('main li').allInnerTexts();
    assert.ok(items.length >= 10, 'the terms page lists its rules');
    for (const li of items) assert.ok(flat(md).includes(flat(li)), 'docs/referrals/referral-terms.md is missing: ' + li.slice(0, 60));
    assert.match(terms, /free month either way/i);
    console.log('ok   referral terms page');
    assert.deepStrictEqual(errors, []);
  } finally {
    await browser.close();
    server.close();
  }
})().catch((err) => { console.error('FAILED: ' + err.message); process.exit(1); });
