// Quick look without a full render: saves stills at given times.
//   node render/stills.js <video> [t1 t2 ...]   (default: middle and end of each scene)
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { serve, ROOT } = require('./server');

(async () => {
  const name = process.argv[2] || 'first-test';
  const story = JSON.parse(fs.readFileSync(path.join(ROOT, 'videos', name, 'story.json'), 'utf8'));
  const brand = JSON.parse(fs.readFileSync(path.join(ROOT, 'brand', 'brand.json'), 'utf8'));
  const { server, port } = await serve();
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', (e) => console.error('page error:', e.message));
  page.on('console', (m) => m.type() === 'error' && console.error('console:', m.text()));
  await page.goto(`http://127.0.0.1:${port}/engine/player.html?render`);
  const info = await page.evaluate(([s, b]) => window.__init(s, { brand: b, bpm: s.bpm || 120, fps: 30 }), [story, brand]);
  const filmed = process.argv.includes('--filmed');
  let times = process.argv.slice(3).filter((a) => !a.startsWith('--')).map(Number);
  let fpage = null;
  if (filmed) {
    fpage = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
    fpage.on('pageerror', (e) => console.error('filmed error:', e.message));
    await fpage.goto(`http://127.0.0.1:${port}/engine/filmed.html`);
    await fpage.evaluate((d) => window.__initFilmed({ duration: d }), info.duration);
  }
  if (!times.length) times = info.scenes.flatMap((s) => [(s.start + s.end) / 2, s.end - 0.05]);
  const dir = path.join(ROOT, 'out', name, 'stills');
  fs.mkdirSync(dir, { recursive: true });
  for (const t of times) {
    await page.evaluate((t) => window.__seek(t), t);
    const f = path.join(dir, `t${t.toFixed(2).padStart(6, '0')}.png`);
    const png = await page.screenshot({ path: f });
    console.log(f);
    if (fpage) {
      await fpage.evaluate(([b, x]) => window.__frame(b, x), [png.toString('base64'), t]);
      await fpage.screenshot({ path: f.replace('.png', '-filmed.png') });
    }
  }
  await browser.close();
  server.close();
})();
