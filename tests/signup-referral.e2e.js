// Page test: a referral link puts the member's name on the signup request.
// Run: node tests/signup-referral.e2e.js
const assert = require('node:assert');
const { chromium } = require('playwright');
const { serve } = require('./serve');

const BANNER = '.ref-banner:visible';

async function toDetails(page) {
  await page.click('#btnNext');                                   // landing -> home size
  await page.check('input[name="size-choice"][value="s"]', { force: true });
  await page.click('#btnNext');                                   // -> plans
  await page.click('#btnNext');                                   // -> add-ons
  await page.click('#btnNext');                                   // -> details
  await page.waitForSelector('#screen-details:not([hidden])');
}

async function fillDetails(page) {
  await page.fill('#custName', 'Pat Example');
  await page.fill('#custPhone', '919 555 0100');
  await page.fill('#custEmail', 'pat@example.com');
  await page.fill('#custAddress', '1 Test Lane');
  await page.fill('#custCity', 'Raleigh');
  await page.fill('#custState', 'NC');
}

// Opens a fresh browser context, sends a request and returns what was posted.
async function run(browser, origin, query, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 400, height: 850 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  let posted = null;
  await page.route('**/*', (route) => {
    const req = route.request();
    if (req.method() !== 'POST') return route.continue();
    posted = new URLSearchParams(req.postData());
    return opts.failPost ? route.abort() : route.fulfill({ status: 200, body: 'ok' });
  });
  await page.goto(origin + '/' + query);
  if (opts.thenReloadPlain) await page.goto(origin + '/');
  const landingBanner = await page.locator(BANNER).count() ? await page.locator(BANNER).first().innerText() : '';
  await toDetails(page);
  const detailsBanner = await page.locator(BANNER).count() ? await page.locator(BANNER).first().innerText() : '';
  const typedVisible = await page.locator('#custReferrer').isVisible();
  await fillDetails(page);
  if (opts.typed) await page.fill('#custReferrer', opts.typed);
  await page.click('#btnNext');
  await page.waitForFunction(() => !document.getElementById('screen-sent').hidden || document.getElementById('emailFallback').open);
  const fallback = await page.inputValue('#fallbackBody').catch(() => '');
  const sent = !(await page.locator('#screen-sent').isHidden());
  await ctx.close();
  return { landingBanner, detailsBanner, typedVisible, posted, fallback, sent, errors };
}

(async () => {
  const server = await serve();
  const browser = await chromium.launch();
  try {
    let r = await run(browser, server.origin, '');
    assert.strictEqual(r.landingBanner, '', 'no banner without a referral');
    assert.strictEqual(r.detailsBanner, '');
    assert.strictEqual(r.typedVisible, true, 'the "did a member refer you" field shows');
    assert.strictEqual(r.posted.get('referred-by'), '', 'referred-by is sent empty');
    assert.strictEqual(r.posted.get('name'), 'Pat Example', 'an ordinary signup still posts');
    assert.strictEqual(r.sent, true);
    assert.deepStrictEqual(r.errors, []);
    console.log('ok   no referral');

    r = await run(browser, server.origin, '?ref=sarah-m');
    for (const b of [r.landingBanner, r.detailsBanner]) {
      assert.match(b, /Sarah M\. sent you/);
      assert.match(b, /You each get a month free/i);
    }
    assert.strictEqual(r.typedVisible, false, 'the typed field is hidden when the link names a member');
    assert.strictEqual(r.posted.get('referred-by'), 'Sarah M. (link: sarah-m)');
    assert.deepStrictEqual(r.errors, []);
    console.log('ok   referral link');

    for (const q of ['?ref=%3Cscript%3Ealert(1)%3C%2Fscript%3E', '?ref=', '?ref=' + 'a'.repeat(300), '?ref=s%C3%A1rah-m']) {
      r = await run(browser, server.origin, q);
      assert.strictEqual(r.landingBanner, '', 'no banner for ' + q.slice(0, 30));
      assert.strictEqual(r.posted.get('referred-by'), '');
      assert.strictEqual(r.sent, true);
      assert.deepStrictEqual(r.errors, []);
    }
    console.log('ok   bad codes are ignored');

    r = await run(browser, server.origin, '', { typed: '  Jane   Doe ' });
    assert.strictEqual(r.posted.get('referred-by'), 'Jane Doe (typed)');
    console.log('ok   typed referrer');

    r = await run(browser, server.origin, '?ref=sarah-m', { thenReloadPlain: true });
    assert.match(r.landingBanner, /Sarah M\. sent you/, 'the referral survives a reload without the query');
    assert.strictEqual(r.posted.get('referred-by'), 'Sarah M. (link: sarah-m)');
    console.log('ok   referral survives a reload');

    r = await run(browser, server.origin, '?ref=sarah-m', { failPost: true });
    assert.strictEqual(r.sent, false);
    assert.match(r.fallback, /Referred by: Sarah M\. \(link: sarah-m\)/, 'the email fallback names the referrer');
    r = await run(browser, server.origin, '', { failPost: true });
    assert.doesNotMatch(r.fallback, /Referred by/, 'no referrer line without a referral');
    console.log('ok   email fallback');
  } finally {
    await browser.close();
    server.close();
  }
})().catch((err) => { console.error('FAILED: ' + err.message); process.exit(1); });
