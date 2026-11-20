// Builds the one-page referral handout as a PDF.
// Run: node scripts/make-referral-handout.js   (needs Playwright)
// Output: docs/hero-club-documents/10-referral-handout.pdf
//
// The credit amounts are read from TIERS in public/index.html, so the sheet
// cannot drift from the signup page. The wording follows
// docs/referrals/referral-terms.md; change both together.

const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.join(__dirname, '..');
const OUT = path.join(root, 'docs', 'hero-club-documents', '10-referral-handout.pdf');
const SIGNUP = 'heroclub-membership.netlify.app';
const PHONE = '919-746-4485';

function readTiers() {
  const html = fs.readFileSync(path.join(root, 'public', 'index.html'), 'utf8');
  const start = html.indexOf('var TIERS = {');
  const end = html.indexOf('\n};', start);
  return JSON.parse(html.slice(html.indexOf('{', start), end + 2));
}
const file = (p) => 'file://' + path.join(root, p);
const dataUri = (p, mime) => 'data:' + mime + ';base64,' + fs.readFileSync(path.join(root, p)).toString('base64');

function page() {
  const tiers = readTiers();
  const rows = ['bronze', 'silver', 'gold'].map((id) => {
    const t = tiers[id];
    return `<tr><th scope="row">${t.name}</th><td>$${t.price.s[0]}</td><td>$${t.price.m[0]}</td></tr>`;
  }).join('');
  const font = (family, weight, style, name) =>
    `@font-face { font-family:'${family}'; src:url('${file('public/fonts/' + name)}') format('woff2'); font-weight:${weight}; font-style:${style}; }`;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Hero Club: refer a neighbor, get a month</title><style>
${font('Barlow', 500, 'italic', 'barlow-latin-500-italic.woff2')}
${font('Barlow', 600, 'normal', 'barlow-latin-600-normal.woff2')}
${font('Barlow', 700, 'normal', 'barlow-latin-700-normal.woff2')}
${font('Noto Sans', 400, 'normal', 'noto-sans-latin-400-normal.woff2')}
${font('Noto Sans', 600, 'normal', 'noto-sans-latin-600-normal.woff2')}
@page { size: Letter; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; }
body { width: 8.5in; height: 11in; font: 11pt/1.45 'Noto Sans', Tahoma, sans-serif; color: #003b64; display: flex; flex-direction: column; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
h1, h2, .num, th, .amount, .big { font-family: 'Barlow', Tahoma, sans-serif; }
header { background: #003b64; color: #fff; padding: 0.3in 0.6in 0.22in; display: flex; align-items: center; justify-content: space-between; gap: 0.3in; }
header img { width: 1.7in; height: auto; display: block; }
header .club { font-family: 'Barlow', Tahoma, sans-serif; font-weight: 700; font-size: 13pt; letter-spacing: 0.14em; color: #fcaf17; text-transform: uppercase; }
.hero { background: #003b64; color: #fff; padding: 0 0.6in 0.28in; }
h1 { margin: 0; font-size: 36pt; line-height: 1; font-weight: 700; text-transform: uppercase; }
h1 em { display: block; font-weight: 500; font-style: italic; text-transform: none; font-size: 21pt; margin-bottom: 2pt; }
h1 span { color: #fcaf17; }
.lead { margin: 9pt 0 0; font-size: 12.5pt; line-height: 1.4; max-width: 6.3in; }
main { flex: 1; padding: 0.22in 0.6in 0; display: flex; flex-direction: column; gap: 0.18in; }
h2 { margin: 0 0 6pt; font-size: 14pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.02em; }
.steps { display: flex; gap: 0.22in; }
.step { flex: 1; display: flex; gap: 9pt; align-items: flex-start; }
.num { flex: none; width: 26pt; height: 26pt; border-radius: 13pt; background: #fcaf17; color: #00263f; font-weight: 700; font-size: 14pt; display: flex; align-items: center; justify-content: center; }
.step p { margin: 2pt 0 0; font-size: 10.5pt; line-height: 1.4; }
.cols { display: flex; gap: 0.3in; align-items: flex-start; }
.earn { flex: 0 0 3.25in; }
.rules { flex: 1; }
table { border-collapse: collapse; width: 100%; }
th, td { padding: 4.5pt 8pt; text-align: right; border-bottom: 1px solid #cfd8e3; font-variant-numeric: tabular-nums; }
thead th { font-weight: 600; font-size: 9pt; line-height: 1.25; vertical-align: bottom; color: #0075aa; border-bottom: 2px solid #003b64; }
th[scope=row], thead th:first-child { text-align: left; }
th[scope=row] { font-weight: 700; font-size: 12pt; }
td { font-family: 'Barlow', Tahoma, sans-serif; font-weight: 700; font-size: 15pt; }
.small { font-size: 9pt; line-height: 1.4; margin: 7pt 0 0; }
ul { margin: 0; padding-left: 13pt; }
li { font-size: 9.2pt; line-height: 1.35; margin-bottom: 2.5pt; }
.strip { margin-top: auto; border-top: 1.5pt dashed #003b64; background: #dfe5ee; padding: 0.16in 0.6in 0.18in; display: flex; gap: 0.3in; align-items: center; }
.strip img { width: 1.05in; height: 1.05in; flex: none; display: block; }
.strip .big { font-weight: 700; font-size: 15pt; text-transform: uppercase; margin: 0 0 3pt; }
.strip p { margin: 0 0 6pt; font-size: 10pt; line-height: 1.35; }
.line { display: flex; gap: 6pt; align-items: flex-end; font-weight: 600; font-size: 10pt; margin-top: 7pt; }
.line span { flex: 1; border-bottom: 1pt solid #003b64; height: 13pt; }
footer { background: #003b64; color: #fff; padding: 8pt 0.6in; font-size: 8.5pt; display: flex; justify-content: space-between; gap: 12pt; }
footer b { color: #fcaf17; font-weight: 600; }
</style></head><body>
<header><img src="${dataUri('email-templates/preview-assets/141668-WH_Logo_WH_Logo_White.png', 'image/png')}" alt="Window Hero"><span class="club">Hero Club members</span></header>
<div class="hero">
  <h1><em>Refer a neighbor,</em> Get a <span>month</span></h1>
  <p class="lead">When a neighbor you refer joins the Hero Club, you get a credit on your bill equal to their first monthly charge.</p>
</div>
<main>
  <section>
    <h2>How it works</h2>
    <div class="steps">
      <div class="step"><span class="num">1</span><p><strong>Tell a neighbor</strong> about the Hero Club. Hand them the strip at the bottom of this sheet.</p></div>
      <div class="step"><span class="num">2</span><p><strong>They join</strong> and give us your name and street address before they sign.</p></div>
      <div class="step"><span class="num">3</span><p><strong>You get your credit</strong> once they have paid their down payment and first monthly charge.</p></div>
    </div>
  </section>
  <div class="cols">
    <section class="earn">
      <h2>What you earn</h2>
      <table>
        <thead><tr><th>Plan your<br>neighbor picks</th><th>Home up to<br>2,500 sq ft</th><th>Home 2,501 to<br>3,500 sq ft</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="small">Your credit is the first monthly charge of their plan, whatever your own plan costs. For a home over 3,500 sq ft, it is the monthly charge we quote them.</p>
    </section>
    <section class="rules">
      <h2>Good to know</h2>
      <ul>
        <li>Your credit comes off your next monthly charge. If it is more than one charge, the rest comes off the charges that follow.</li>
        <li>Your membership must be active when your neighbor's first monthly charge is paid.</li>
        <li>Your neighbor must be new to the Hero Club. Past one-time Window Hero customers count as new. Your own address does not.</li>
        <li>You can earn up to 12 credits in each membership year.</li>
        <li>Unused credit carries into your renewal year and is lost if your membership ends.</li>
        <li>Credit comes off monthly charges only, not a down payment. It has no cash value and cannot be transferred.</li>
        <li>The credit goes to the membership at the address your neighbor gives us.</li>
        <li>Window Hero can change or end this offer at any time. Credit already earned is honored.</li>
      </ul>
    </section>
  </div>
</main>
<div class="strip">
  <img src="${dataUri('docs/referrals/handout/signup-qr.svg', 'image/svg+xml')}" alt="QR code for the Hero Club plans">
  <div style="flex:1">
    <p class="big">For your neighbor</p>
    <p>Scan to see the Hero Club plans, or go to <strong>${SIGNUP}</strong>. When we call to confirm your plan, tell us who referred you.</p>
    <div class="line">Referred by <span></span></div>
    <div class="line">Their street address <span></span></div>
  </div>
</div>
<footer><span>Window Hero &middot; Call or text <b>${PHONE}</b></span><span>Ask us for the full referral terms.</span></footer>
</body></html>`;
}

(async () => {
  const html = page();
  const tmp = path.join(require('node:os').tmpdir(), 'hero-club-referral-handout.html');
  fs.writeFileSync(tmp, html);
  const browser = await chromium.launch();
  const p = await browser.newPage({ viewport: { width: 816, height: 1056 } });
  await p.goto('file://' + tmp);
  await p.evaluate(() => document.fonts.ready);
  const overflow = await p.evaluate(() => document.documentElement.scrollHeight - Math.round(11 * 96));
  if (overflow > 1) throw new Error('The handout no longer fits on one page (over by ' + overflow + 'px). Shorten the text.');
  await p.pdf({ path: OUT, format: 'Letter', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  if (process.argv[2]) await p.screenshot({ path: process.argv[2], fullPage: true });
  await browser.close();
  console.log('wrote ' + path.relative(root, OUT));
})().catch((err) => { console.error('FAILED: ' + err.message); process.exit(1); });
