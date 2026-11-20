// Page test: the offline copy of the signup page is not replaced by other pages.
// Run: node tests/sw.e2e.js
const assert = require('node:assert');
const { chromium } = require('playwright');
const { serve } = require('./serve');

(async () => {
  const server = await serve();
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({ viewport: { width: 400, height: 850 } });
    const page = await ctx.newPage();
    await page.goto(server.origin + '/?ref=sarah-m');
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null, null, { timeout: 15000 }).catch(() => page.reload());
    await page.evaluate(() => navigator.serviceWorker.ready);
    // Online visits to the signup page, then to the two other pages.
    await page.goto(server.origin + '/');
    await page.goto(server.origin + '/refer.html');
    await page.goto(server.origin + '/referral-terms.html');
    await page.waitForTimeout(500);

    await ctx.setOffline(true);
    await page.goto(server.origin + '/');
    assert.strictEqual(await page.locator('#leadForm').count(), 1, 'offline, the signup page is still the signup page');
    assert.strictEqual(await page.locator('#memberName').count(), 0);
    await page.goto(server.origin + '/?ref=sarah-m');
    assert.strictEqual(await page.locator('#leadForm').count(), 1, 'offline, a referral link opens the signup page');
    assert.match(await page.locator('.ref-banner:visible').first().innerText(), /Sarah M\. sent you/, 'and the referral script was cached');
    console.log('ok   offline copy of the signup page survives visits to other pages');
  } finally {
    await browser.close();
    server.close();
  }
})().catch((err) => { console.error('FAILED: ' + err.message); process.exit(1); });
